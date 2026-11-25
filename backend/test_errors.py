"""tests of the answers for unknown addresses and server errors"""

import unittest
from unittest.mock import patch

from test_helpers import flask_app


class ErrorAnswerTests(unittest.TestCase):
    """the 404 and 500 answers with the Flask test client"""

    def setUp(self):
        """create a test browser for each test"""
        self.client = flask_app.test_client()

    def test_unknown_api_address_gets_json(self):
        """an unknown address under /api gets a 404 with the key error"""
        response = self.client.get("/api/does-not-exist")
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.get_json())

    def test_unknown_page_gets_the_error_page(self):
        """an unknown address in the browser gets our 404 page, not the Flask default"""
        with self.client.get("/does-not-exist") as response:
            self.assertEqual(response.status_code, 404)
            self.assertIn("We could not find this page", response.get_data(as_text=True))

    def test_crash_in_the_api_gets_json(self):
        """an unexpected error inside the api gets a 500 with the key error"""
        with patch("app.find_answer", side_effect=RuntimeError("boom")):
            with self.assertLogs(flask_app.logger, level="ERROR"):
                response = self.client.post("/api/help", json={"question": "progress"})
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.get_json())

    def test_wrong_method_gets_json(self):
        """a method that is not allowed gets a 405 with the key error"""
        response = self.client.put("/api/login")
        self.assertEqual(response.status_code, 405)
        self.assertIn("error", response.get_json())