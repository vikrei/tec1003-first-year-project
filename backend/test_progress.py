"""Tests of mock login and progress rules (temporary database only)"""

import tempfile
import unittest
from pathlib import Path

import database

# Point the app to a temporary database before it is imported,
# so that the tests never touch the real course_portal.db
TEMP_DIR = tempfile.TemporaryDirectory()
database.DB_PATH = Path(TEMP_DIR.name) / "test_course_portal.db"

from app import app as flask_app  # pylint: disable=wrong-import-position
import progress  # pylint: disable=wrong-import-position

SLUG = "build-pie-charts-react"


def reset_database():
    """Start every test with a fresh database that contains the dummy data."""
    database.DB_PATH.unlink(missing_ok=True)
    database.create_tables()
    database.seed_data()


def tearDownModule():
    """Remove the temporary database folder after all tests."""
    TEMP_DIR.cleanup()


class ProgressTests(unittest.TestCase):
    """Rules for steps, percent and the quiz result."""

    def setUp(self):
        """Create a fresh database for each test."""
        reset_database()

    def test_new_user_starts_at_zero(self):
        """A user without progress has 0 percent, no pass and no attempts."""
        status = progress.get_status(1, SLUG)
        self.assertEqual(status, {"percent": 0, "passed": False, "attempts": 0})

    def test_step_two_needs_step_one(self):
        """A step is refused if an earlier step is missing."""
        ok, _message, code = progress.record_step(1, SLUG, 2)
        self.assertFalse(ok)
        self.assertEqual(code, 409)

    def test_steps_in_order_set_percent(self):
        """Reaching steps 1, 2 and 3 in order gives 50 percent."""
        for position in (1, 2, 3):
            ok, _message, code = progress.record_step(1, SLUG, position)
            self.assertTrue(ok)
            self.assertEqual(code, 200)
        self.assertEqual(progress.get_status(1, SLUG)["percent"], 50)

    def test_same_step_twice_is_safe(self):
        """Saving the same step twice does not break anything."""
        progress.record_step(1, SLUG, 1)
        ok, _message, _code = progress.record_step(1, SLUG, 1)
        self.assertTrue(ok)
        self.assertEqual(progress.get_status(1, SLUG)["percent"], 1)

    def test_unknown_course(self):
        """An unknown course gives no status and a 404 when saving."""
        self.assertIsNone(progress.get_status(1, "no-such-course"))
        _ok, _message, code = progress.record_step(1, "no-such-course", 1)
        self.assertEqual(code, 404)

    def test_unknown_step(self):
        """An unknown step number gives a 404."""
        _ok, _message, code = progress.record_step(1, SLUG, 9)
        self.assertEqual(code, 404)

    def test_passed_quiz_gives_100_percent(self):
        """A passed quiz attempt gives 100 percent, passed and one attempt."""
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
        self.assertEqual(status, {"percent": 100, "passed": True, "attempts": 1})


class LoginTests(unittest.TestCase):
    """The mock login with the Flask session."""

    def setUp(self):
        """Create a fresh database and a test browser for each test."""
        reset_database()
        self.client = flask_app.test_client()

    def test_login_as_student(self):
        """Choosing student logs in Alex Liland."""
        response = self.client.post("/api/login", json={"role": "student"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Alex Liland")

    def test_login_as_admin(self):
        """Choosing admin logs in Per Håland."""
        response = self.client.post("/api/login", json={"role": "admin"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["name"], "Per Håland")

    def test_invalid_role_is_refused(self):
        """Any other role gives a 400."""
        response = self.client.post("/api/login", json={"role": "teacher"})
        self.assertEqual(response.status_code, 400)

    def test_me_without_login(self):
        """Without a cookie, /api/me asks the visitor to log in."""
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 401)

    def test_me_after_login(self):
        """After the login, /api/me returns the same user."""
        self.client.post("/api/login", json={"role": "student"})
        response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["role"], "student")


if __name__ == "__main__":
    unittest.main()
