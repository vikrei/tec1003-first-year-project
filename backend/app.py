"""Flask app that serves the frontend, help API and mock log in"""

import os
from datetime import timedelta

from flask import Flask, redirect, request, jsonify, session

from database import create_tables, get_connection, seed_data
from help_answers import find_answer  # the scripted answers live in help_answers.py

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# The secret key signs the session cookie. This fixed text is only for the demo
app.secret_key = os.environ.get("SECRET_KEY", "demo-only-secret-key")
app.permanent_session_lifetime = timedelta(days=1)

# Creates database and dummy data on start if they don't exist yet
create_tables()
seed_data()


def current_user():
    """Return the logged-in dummy user as a dict, or None if nobody is logged in."""
    user_id = session.get("user_id")
    if user_id is None:
        return None
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT id, name, role FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    finally:
        connection.close()
    return dict(row) if row else None


@app.get("/")
def home():
    """Redirect the root address to the start page."""
    return redirect("/pages/index.html")


@app.post("/api/login")
def login():
    """Mock login: choose the student or the admin dummy user (no password)."""
    data = request.get_json(silent=True) or {}
    role = (data.get("role") or "").strip()

    if role not in ("student", "admin"):
        return jsonify({"error": "Please choose student or admin."}), 400

    connection = get_connection()
    try:
        user = connection.execute(
            "SELECT id, name, role FROM users WHERE role = ?", (role,)
        ).fetchone()
    finally:
        connection.close()

    if user is None:
        return jsonify({"error": "User not found."}), 404

    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]
    return jsonify(dict(user))


@app.get("/api/me")
def me():
    """Return the logged-in dummy user, or ask the visitor to log in first."""
    user = current_user()
    if user is None:
        return jsonify({"error": "Please log in first."}), 401
    return jsonify(user)


@app.post("/api/help")
def help_answer():
    """Returns an answer to a question sent by the AI assistant window."""
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"Error": "Please enter a question."}), 400

    return jsonify(find_answer(question))


if __name__ == "__main__":
    app.run(debug=True)
