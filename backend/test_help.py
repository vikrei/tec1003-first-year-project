"""tests of the help endpoint"""

import unittest

from test_helpers import flask_app


class HelpEndpointTests(unittest.TestCase):
    """the assistant endpoint with the Flask test client"""

    def setUp(self):
        """create a test browser for each test"""
        self.client = flask_app.test_client()
        self.url = "/api/help"

    def test_empty_question_is_rejected(self):
        """an empty or blank question gets a 400 with the key error"""
        for question in ["", "   "]:
            response = self.client.post(self.url, json={"question": question})
            self.assertEqual(response.status_code, 400)
            self.assertIn("error", response.get_json())

    def test_known_question_gets_its_answer(self):
        """a question with a known keyword gets the matching answer and link"""
        response = self.client.post(self.url, json={"question": "How far am I?"})
        self.assertEqual(response.status_code, 200)
        links = response.get_json()["links"]
        self.assertEqual(links[0]["url"], "/pages/student-dashboard.html")

    def test_part_of_a_word_is_no_match(self):
        """only whole words count, so progressive does not match progress"""
        response = self.client.post(self.url, json={"question": "progressive"})
        links = response.get_json()["links"]
        self.assertEqual(links[0]["url"], "/pages/courses.html")
