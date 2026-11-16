"""progress rules for the course portal: steps reached, percent, quiz result"""

from database import get_connection
from quiz_answers import check_answers, is_complete


def get_course(connection, slug):
    """return the course row for a slug, or None"""
    return connection.execute(
        "SELECT id, slug, title FROM courses WHERE slug = ?", (slug,)
    ).fetchone()


def get_status(user_id, slug):
    """return percent, passed and attempts for a user, or None if the course is unknown"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return None

        attempts = connection.execute(
            "SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND course_id = ?",
            (user_id, course["id"]),
        ).fetchone()[0]

        passed = (
            connection.execute(
                "SELECT COUNT(*) FROM quiz_attempts "
                "WHERE user_id = ? AND course_id = ? AND passed = 1",
                (user_id, course["id"]),
            ).fetchone()[0]
            > 0
        )

        reached = connection.execute(
            "SELECT MAX(s.percent) FROM progress p "
            "JOIN steps s ON s.id = p.step_id "
            "WHERE p.user_id = ? AND s.course_id = ?",
            (user_id, course["id"]),
        ).fetchone()[0]

        percent = 100 if passed else (reached or 0)
        return {"percent": percent, "passed": passed, "attempts": attempts}
    finally:
        connection.close()


def record_step(user_id, slug, position):
    """save that a user reached a step, Return (ok, message, status code)"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return False, "Course not found.", 404

        steps = connection.execute(
            "SELECT id, position FROM steps WHERE course_id = ? ORDER BY position",
            (course["id"],),
        ).fetchall()
        step = next((s for s in steps if s["position"] == position), None)
        if step is None:
            return False, "Step not found.", 404

        reached_ids = {
            row["step_id"]
            for row in connection.execute(
                "SELECT step_id FROM progress WHERE user_id = ?", (user_id,)
            )
        }
        if any(s["id"] not in reached_ids for s in steps if s["position"] < position):
            return False, "Please finish the earlier steps first.", 409

        connection.execute(
            "INSERT OR IGNORE INTO progress (user_id, step_id) VALUES (?, ?)",
            (user_id, step["id"]),
        )
        connection.commit()
        return True, "Step saved.", 200
    finally:
        connection.close()


def submit_quiz(user_id, slug, submitted):
    """check a quiz submission and count the attempt, return result, message, code"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return None, "Course not found.", 404

        if not is_complete(submitted):
            return None, "Please answer all questions.", 400

        quiz_step = connection.execute(
            "SELECT id FROM steps WHERE course_id = ? ORDER BY position DESC LIMIT 1",
            (course["id"],),
        ).fetchone()
        if quiz_step is None:
            return None, "Quiz not found.", 404

        reached_quiz = connection.execute(
            "SELECT COUNT(*) FROM progress WHERE user_id = ? AND step_id = ?",
            (user_id, quiz_step["id"]),
        ).fetchone()[0]
        if not reached_quiz:
            return None, "Please reach the quiz first.", 409

        attempts = connection.execute(
            "SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND course_id = ?",
            (user_id, course["id"]),
        ).fetchone()[0]
        already_passed = (
            connection.execute(
                "SELECT COUNT(*) FROM quiz_attempts "
                "WHERE user_id = ? AND course_id = ? AND passed = 1",
                (user_id, course["id"]),
            ).fetchone()[0]
            > 0
        )

        result = check_answers(submitted)
        if not already_passed:
            connection.execute(
                "INSERT INTO quiz_attempts (user_id, course_id, correct_count, passed) "
                "VALUES (?, ?, ?, ?)",
                (user_id, course["id"], result["score"], int(result["passed"])),
            )
            connection.commit()
            attempts += 1

        result["attempt"] = attempts
        result["already_passed"] = already_passed
        result["percent"] = get_status(user_id, slug)["percent"]
        return result, "Quiz checked.", 200
    finally:
        connection.close()
