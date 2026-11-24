"""progress rules for the course portal: steps reached, percent, quiz result"""

from database import get_connection
import error_messages as messages
from quiz_answers import check_answers, is_complete


def get_course(connection, slug):
    """return the course row for a slug, or None"""
    return connection.execute(
        "SELECT id, slug, title FROM courses WHERE slug = ?", (slug,)
    ).fetchone()


def get_status(user_id, slug):
    """return percent, passed, attempts and the reached step for a user, or None if the course is unknown"""

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
            "SELECT MAX(s.percent), MAX(s.position) FROM progress p "
            "JOIN steps s ON s.id = p.step_id "
            "WHERE p.user_id = ? AND s.course_id = ?",
            (user_id, course["id"]),
        ).fetchone()

        percent = 100 if passed else (reached[0] or 0)
        return {
            "percent": percent,
            "passed": passed,
            "attempts": attempts,
            "step": reached[1] or 0,
        }
    finally:
        connection.close()


def record_step(user_id, slug, position):
    """save that a user reached a step, Return (ok, message, status code)"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return False, messages.COURSE_NOT_FOUND, 404

        steps = connection.execute(
            "SELECT id, position FROM steps WHERE course_id = ? ORDER BY position",
            (course["id"],),
        ).fetchall()
        step = next((s for s in steps if s["position"] == position), None)
        if step is None:
            return False, messages.STEP_NOT_FOUND, 404

        reached_ids = {
            row["step_id"]
            for row in connection.execute(
                "SELECT step_id FROM progress WHERE user_id = ?", (user_id,)
            )
        }
        if any(s["id"] not in reached_ids for s in steps if s["position"] < position):
            return False, messages.EARLIER_STEPS_FIRST, 409

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
            return None, messages.COURSE_NOT_FOUND, 404

        if not is_complete(submitted):
            return None, messages.ANSWER_ALL_QUESTIONS, 400

        quiz_step = connection.execute(
            "SELECT id FROM steps WHERE course_id = ? ORDER BY position DESC LIMIT 1",
            (course["id"],),
        ).fetchone()
        if quiz_step is None:
            return None, messages.QUIZ_NOT_FOUND, 404

        reached_quiz = connection.execute(
            "SELECT COUNT(*) FROM progress WHERE user_id = ? AND step_id = ?",
            (user_id, quiz_step["id"]),
        ).fetchone()[0]
        if not reached_quiz:
            return None, messages.FINISH_TASKS_FIRST, 409

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

        if not already_passed and attempts >= 3:
            return None, messages.ATTEMPTS_USED_UP, 409

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


def reset_course(user_id, slug):
    """delete progress and quiz attempts of a user for a course, return ok, message, code"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return False, messages.COURSE_NOT_FOUND, 404

        connection.execute(
            "DELETE FROM progress WHERE user_id = ? AND step_id IN "
            "(SELECT id FROM steps WHERE course_id = ?)",
            (user_id, course["id"]),
        )
        connection.execute(
            "DELETE FROM quiz_attempts WHERE user_id = ? AND course_id = ?",
            (user_id, course["id"]),
        )
        connection.commit()
        return True, "Course reset.", 200
    finally:
        connection.close()


def admin_insights(slug):
    """return the overview of all students for a course, or None if the course is unknown"""
    connection = get_connection()
    try:
        course = get_course(connection, slug)
        if course is None:
            return None

        students = connection.execute(
            "SELECT id, name FROM users WHERE role = 'student' ORDER BY name"
        ).fetchall()

        rows = []
        for student in students:
            status = get_status(student["id"], slug)
            last_attempt = connection.execute(
                "SELECT correct_count FROM quiz_attempts "
                "WHERE user_id = ? AND course_id = ? ORDER BY id DESC LIMIT 1",
                (student["id"], course["id"]),
            ).fetchone()
            passed_attempt = connection.execute(
                "SELECT submitted_at FROM quiz_attempts "
                "WHERE user_id = ? AND course_id = ? AND passed = 1 ORDER BY id LIMIT 1",
                (student["id"], course["id"]),
            ).fetchone()
            rows.append(
                {
                    "name": student["name"],
                    "percent": status["percent"],
                    "step": status["step"],
                    "passed": status["passed"],
                    "attempts": status["attempts"],
                    "last_score": (
                        last_attempt["correct_count"] if last_attempt else None
                    ),
                    "passed_at": (
                        passed_attempt["submitted_at"] if passed_attempt else None
                    ),
                }
            )

        return {
            "course": course["title"],
            "student_count": len(rows),
            "passed_count": sum(1 for row in rows if row["passed"]),
            "students": rows,
        }
    finally:
        connection.close()
