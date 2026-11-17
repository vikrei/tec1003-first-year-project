"""shared setup for the tests: temporary database and helpers"""

import atexit
import tempfile
from pathlib import Path

import database

__all__ = ["SLUG", "flask_app", "login", "progress", "reset_database"]

# point the app to a temporary database before it is imported,
# so that the tests never touch the real course_portal.db
TEMP_DIR = tempfile.TemporaryDirectory()
database.DB_PATH = Path(TEMP_DIR.name) / "test_course_portal.db"
atexit.register(TEMP_DIR.cleanup)

from app import app as flask_app  # pylint: disable=wrong-import-position
import progress  # pylint: disable=wrong-import-position

SLUG = "build-pie-charts-react"


def reset_database():
    """start every test with a fresh database that contains the dummy data"""
    database.DB_PATH.unlink(missing_ok=True)
    database.create_tables()
    database.seed_data()


def login(client, role):
    """log in as the given dummy user"""
    client.post("/api/login", json={"role": role})
