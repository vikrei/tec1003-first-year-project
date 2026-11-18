"""Tests of mock login and progress rules (temporary database only)"""

import unittest

import database
from test_helpers import SLUG, flask_app, login, progress, reset_database

class ProgressTests(unittest.TestCase):
    """rules for steps, percent and the quiz result"""

    def setUp(self):
        """create a fresh database for each test"""
        reset_database()

    def test_new_user_starts_at_zero(self):
        """a user without progress has 0 percent, no pass and no attempts"""
        status = progress.get_status(1, SLUG)
        self.assertEqual(status, {"percent": 0, "passed": False, "attempts": 0, "step": 0})

    def test_step_two_needs_step_one(self):
        """a step is refused if an earlier step is missing"""
        ok, _message, code = progress.record_step(1, SLUG, 2)
        self.assertFalse(ok)
        self.assertEqual(code, 409)

    def test_steps_in_order_set_percent(self):
        """reaching steps 1, 2 and 3 in order gives 50 percent"""
        for position in (1, 2, 3):
            ok, _message, code = progress.record_step(1, SLUG, position)
            self.assertTrue(ok)
            self.assertEqual(code, 200)
        self.assertEqual(progress.get_status(1, SLUG)["percent"], 50)

    def test_status_reports_the_reached_step(self):
        """the status names the highest step that was reached"""
        for position in (1, 2, 3):
            progress.record_step(1, SLUG, position)
        self.assertEqual(progress.get_status(1, SLUG)["step"], 3)

    def test_same_step_twice_is_safe(self):
        """saving the same step twice does not break anything"""
        progress.record_step(1, SLUG, 1)
        ok, _message, _code = progress.record_step(1, SLUG, 1)
        self.assertTrue(ok)
        self.assertEqual(progress.get_status(1, SLUG)["percent"], 1)

    def test_unknown_course(self):
        """an unknown course gives no status and a 404 when saving"""
        self.assertIsNone(progress.get_status(1, "no-such-course"))
        _ok, _message, code = progress.record_step(1, "no-such-course", 1)
        self.assertEqual(code, 404)

    def test_unknown_step(self):
        """an unknown step number gives a 404"""
        _ok, _message, code = progress.record_step(1, SLUG, 9)
        self.assertEqual(code, 404)

    def test_passed_quiz_gives_100_percent(self):
        """a passed quiz attempt gives 100 percent, passed and one attempt"""
        connection = database.get_connection()
        try:
            connection.execute(
                "INSERT INTO quiz_attempts (user_id, course_id, correct_count, passed) "
                "VALUES (1, 1, 4, 1)"
            )
            connection.commit()
        finally:
            connection.close()
        status = progress.get_status(1, SLUG)
        self.assertEqual(status, {"percent": 100, "passed": True, "attempts": 1, "step": 0})


class LoginTests(unittest.TestCase):
    """the mock login with the Flask session"""

    def setUp(self):
        """create a fresh database and a test browser for each test"""
        reset_database()
        self.client = flask_app.test_client()

    def test_login_as_student(self):
        """choosing student logs in Alex Liland"""
        response = self.client.post("/api/login", json={"role": "student"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Alex Liland")

    def test_login_as_admin(self):
        """choosing admin logs in Per Håland"""
        response = self.client.post("/api/login", json={"role": "admin"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Per Håland")

    def test_invalid_role_is_refused(self):
        """any other role gives a 400"""
        response = self.client.post("/api/login", json={"role": "teacher"})
        self.assertEqual(response.status_code, 400)

    def test_me_without_login(self):
        """without a cookie, /api/me asks the visitor to log in"""
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 401)

    def test_me_after_login(self):
        """after the login, /api/me returns the same user"""
        self.client.post("/api/login", json={"role": "student"})
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["role"], "student")


class ProgressEndpointTests(unittest.TestCase):
    """the progress endpoints with the Flask test client"""

    def setUp(self):
        """create a fresh database and a test browser for each test"""
        reset_database()
        self.client = flask_app.test_client()
        self.url = f"/api/progress/{SLUG}"

    def test_status_needs_login(self):
        """a visitor without a cookie gets a 401"""
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_save_needs_login(self):
        """saving a step without a cookie gets a 401"""
        response = self.client.post(self.url, json={"position": 1})
        self.assertEqual(response.status_code, 401)

    def test_status_starts_at_zero(self):
        """a new student has 0 percent and no attempts"""
        login(self.client, "student")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(), {"attempts": 0, "passed": False, "percent": 0, "step": 0}
        )

    def test_step_two_first_is_refused(self):
        """step 2 without step 1 gets a 409"""
        login(self.client, "student")
        response = self.client.post(self.url, json={"position": 2})
        self.assertEqual(response.status_code, 409)

    def test_steps_in_order_set_percent(self):
        """step 1 gives 1 percent and step 2 gives 25 percent"""
        login(self.client, "student")
        first = self.client.post(self.url, json={"position": 1})
        second = self.client.post(self.url, json={"position": 2})
        self.assertEqual(first.get_json()["percent"], 1)
        self.assertEqual(second.get_json()["percent"], 25)

    def test_step_must_be_a_number(self):
        """a step sent as text gets a 400"""
        login(self.client, "student")
        response = self.client.post(self.url, json={"position": "2"})
        self.assertEqual(response.status_code, 400)

    def test_unknown_course(self):
        """an unknown course gets a 404"""
        login(self.client, "student")
        response = self.client.get("/api/progress/no-such-course")
        self.assertEqual(response.status_code, 404)

    def test_progress_belongs_to_the_user(self):
        """the admin does not see the progress of the student"""
        login(self.client, "student")
        self.client.post(self.url, json={"position": 1})
        admin_client = flask_app.test_client()
        login(admin_client, "admin")
        self.assertEqual(admin_client.get(self.url).get_json()["percent"], 0)


class QuizEndpointTests(unittest.TestCase):
    """the quiz endpoint with the Flask test client"""

    RIGHT = {
        "platform": "highcharts",
        "charts": "yes",
        "lesson-flow": "yes",
        "application": "yes",
    }
    WRONG = {**RIGHT, "lesson-flow": "no"}

    def setUp(self):
        """create a fresh database and a test browser for each test"""
        reset_database()
        self.client = flask_app.test_client()
        self.url = f"/api/quiz/{SLUG}"
        self.progress_url = f"/api/progress/{SLUG}"

    def reach_quiz(self):
        """log in as student and reach all five steps"""
        login(self.client, "student")
        for position in range(1, 6):
            self.client.post(self.progress_url, json={"position": position})

    def test_quiz_needs_login(self):
        """a visitor without a cookie gets a 401"""
        response = self.client.post(self.url, json=self.RIGHT)
        self.assertEqual(response.status_code, 401)

    def test_quiz_needs_the_steps_before(self):
        """a student who has not reached the quiz gets a 409"""
        login(self.client, "student")
        response = self.client.post(self.url, json=self.RIGHT)
        self.assertEqual(response.status_code, 409)

    def test_incomplete_answers(self):
        """a submission with missing answers gets a 400"""
        self.reach_quiz()
        response = self.client.post(self.url, json={"platform": "highcharts"})
        self.assertEqual(response.status_code, 400)

    def test_wrong_answers_count_an_attempt(self):
        """a wrong attempt gives 3 of 4, the correct answer and 90 percent"""
        self.reach_quiz()
        result = self.client.post(self.url, json=self.WRONG).get_json()
        self.assertFalse(result["passed"])
        self.assertEqual(result["score"], 3)
        self.assertEqual(result["attempt"], 1)
        self.assertEqual(result["percent"], 90)
        self.assertEqual(result["questions"]["lesson-flow"]["correct_value"], "yes")

    def test_right_answers_pass_the_course(self):
        """a right attempt passes the quiz and gives 100 percent"""
        self.reach_quiz()
        result = self.client.post(self.url, json=self.RIGHT).get_json()
        self.assertTrue(result["passed"])
        self.assertEqual(result["percent"], 100)

    def test_passed_quiz_counts_no_new_attempt(self):
        """after a pass, another submission does not count as an attempt"""
        self.reach_quiz()
        self.client.post(self.url, json=self.WRONG)
        self.client.post(self.url, json=self.RIGHT)
        result = self.client.post(self.url, json=self.RIGHT).get_json()
        self.assertTrue(result["already_passed"])
        self.assertEqual(result["attempt"], 2)

    def test_fourth_attempt_is_blocked(self):
        """after three wrong attempts the fourth gets a 409 and does not count"""
        self.reach_quiz()
        for _ in range(3):
            self.client.post(self.url, json=self.WRONG)
        response = self.client.post(self.url, json=self.WRONG)
        self.assertEqual(response.status_code, 409)
        status = self.client.get(self.progress_url).get_json()
        self.assertEqual(status["attempts"], 3)

    def test_third_attempt_can_still_pass(self):
        """two wrong attempts and a right third one pass the quiz"""
        self.reach_quiz()
        for _ in range(2):
            self.client.post(self.url, json=self.WRONG)
        result = self.client.post(self.url, json=self.RIGHT).get_json()
        self.assertTrue(result["passed"])
        self.assertEqual(result["attempt"], 3)

    def test_reset_gives_new_attempts(self):
        """after a reset the student can try the quiz again"""
        self.reach_quiz()
        for _ in range(3):
            self.client.post(self.url, json=self.WRONG)
        self.client.post(f"{self.progress_url}/reset")
        self.reach_quiz()
        result = self.client.post(self.url, json=self.WRONG).get_json()
        self.assertEqual(result["attempt"], 1)

    def test_unknown_course(self):
        """an unknown course gets a 404"""
        self.reach_quiz()
        response = self.client.post("/api/quiz/no-such-course", json=self.RIGHT)
        self.assertEqual(response.status_code, 404)


class ResetEndpointTests(unittest.TestCase):
    """the reset endpoint with the Flask test client"""

    def setUp(self):
        """create a fresh database and a test browser for each test"""
        reset_database()
        self.client = flask_app.test_client()
        self.url = f"/api/progress/{SLUG}"

    def reach_steps(self, client, last_step):
        """save the steps from 1 up to the given step"""
        for position in range(1, last_step + 1):
            client.post(self.url, json={"position": position})

    def test_reset_needs_login(self):
        """a visitor without a cookie gets a 401"""
        response = self.client.post(f"{self.url}/reset")
        self.assertEqual(response.status_code, 401)

    def test_reset_clears_progress_and_attempts(self):
        """after a reset the student is back at 0 percent and 0 attempts"""
        login(self.client, "student")
        self.reach_steps(self.client, 5)
        self.client.post(
            f"/api/quiz/{SLUG}",
            json={
                "platform": "highcharts",
                "charts": "yes",
                "lesson-flow": "no",
                "application": "yes",
            },
        )
        response = self.client.post(f"{self.url}/reset")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(), {"attempts": 0, "passed": False, "percent": 0, "step": 0}
        )

    def test_reset_does_not_touch_other_users(self):
        """the reset of the student keeps the progress of the admin"""
        login(self.client, "student")
        self.reach_steps(self.client, 1)
        admin_client = flask_app.test_client()
        login(admin_client, "admin")
        self.reach_steps(admin_client, 1)
        self.client.post(f"{self.url}/reset")
        self.assertEqual(admin_client.get(self.url).get_json()["percent"], 1)


if __name__ == "__main__":
    unittest.main()
