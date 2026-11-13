"""Database setup for course portal (SQLite, Python standard library)"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "course_portal.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin'))
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses (id),
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    percent INTEGER NOT NULL CHECK (percent BETWEEN 0 AND 100),
    UNIQUE (course_id, position)
);

CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL REFERENCES users (id),
    step_id INTEGER NOT NULL REFERENCES steps (id),
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, step_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users (id),
    course_id INTEGER NOT NULL REFERENCES courses (id),
    submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    correct_count INTEGER NOT NULL,
    passed INTEGER NOT NULL CHECK (passed IN (0, 1))
);
"""


def get_connection():
    """Open a connection to the database with foreign keys enabled."""
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def create_tables():
    """Create all tables if they do not exist yet."""
    connection = get_connection()
    try:
        connection.executescript(SCHEMA)
        connection.commit()
    finally:
        connection.close()

USERS = [
    ("Alex Liland", "student"),
    ("Per Håland", "admin"),
]

COURSE = ("build-pie-charts-react", "Build Pie Charts with React")

STEPS = [
    (1, "Introduction", 1),
    (2, "Task 1", 25),
    (3, "Task 2", 50),
    (4, "Task 3", 75),
    (5, "Quiz", 90),
]


def seed_data():
    """Insert the dummy users and the demo course if the database is empty."""
    connection = get_connection()
    try:
        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count:
            return
        connection.executemany("INSERT INTO users (name, role) VALUES (?, ?)", USERS)
        cursor = connection.execute(
            "INSERT INTO courses (slug, title) VALUES (?, ?)", COURSE
        )
        course_id = cursor.lastrowid
        connection.executemany(
            "INSERT INTO steps (course_id, position, title, percent) "
            "VALUES (?, ?, ?, ?)",
            [
                (course_id, position, title, percent)
                for position, title, percent in STEPS
            ],
        )
        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    create_tables()
    seed_data()
    print(f"Database ready in {DB_PATH}")
