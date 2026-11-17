"""Tests of the admin insights endpoint (temporary database only)"""

import unittest

from test_helpers import SLUG, flask_app, login, reset_database

RIGHT = {
    "platform": "highcharts",
    "charts": "yes",
    "lesson-flow": "yes",
    "application": "yes",
}
WRONG = {**RIGHT, "lesson-flow": "no"}


class AdminInsightsTests(unittest.TestCase):
    """the admin overview with the Flask test client"""

    def setUp(self):
        """create a fresh database and a test browser for each test"""
        reset_database()
        self.client = flask_app.test_client()
        self.url = f"/api/admin/insights/{SLUG}"

    def student_reaches_quiz(self):
        """log in as student and reach all five steps"""
        student = flask_app.test_client()
        login(student, "student")
        for position in range(1, 6):
            student.post(f"/api/progress/{SLUG}", json={"position": position})
        return student

    def admin_overview(self):
        """log in as admin and return the overview"""
        login(self.client, "admin")
        return self.client.get(self.url).get_json()

    def test_needs_login(self):
        """a visitor without a cookie gets a 401"""
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_student_is_refused(self):
        """a student gets a 403"""
        login(self.client, "student")
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_admin_sees_the_course(self):
        """the admin sees the course name and one student"""
        overview = self.admin_overview()
        self.assertEqual(overview["course"], "Build Pie Charts with React")
        self.assertEqual(overview["student_count"], 1)

    def test_new_student_has_no_result(self):
        """a new student has 0 percent and no score or pass date"""
        student = self.admin_overview()["students"][0]
        self.assertEqual(student["percent"], 0)
        self.assertIsNone(student["last_score"])
        self.assertIsNone(student["passed_at"])

    def test_wrong_attempt_is_counted(self):
        """after a wrong attempt the admin sees 1 attempt and 3 of 4 correct"""
        student = self.student_reaches_quiz()
        student.post(f"/api/quiz/{SLUG}", json=WRONG)
        overview = self.admin_overview()
        row = overview["students"][0]
        self.assertEqual(row["attempts"], 1)
        self.assertEqual(row["last_score"], 3)
        self.assertFalse(row["passed"])
        self.assertEqual(overview["passed_count"], 0)

    def test_passed_quiz_is_shown(self):
        """after a pass the admin sees 100 percent and the pass date"""
        student = self.student_reaches_quiz()
        student.post(f"/api/quiz/{SLUG}", json=RIGHT)
        overview = self.admin_overview()
        row = overview["students"][0]
        self.assertTrue(row["passed"])
        self.assertEqual(row["percent"], 100)
        self.assertIsNotNone(row["passed_at"])
        self.assertEqual(overview["passed_count"], 1)

    def test_unknown_course(self):
        """an unknown course gets a 404"""
        login(self.client, "admin")
        response = self.client.get("/api/admin/insights/no-such-course")
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
