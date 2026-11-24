"""Flask app that serves the frontend, help API and mock log in"""

import os
from datetime import timedelta

from flask import Flask, redirect, request, jsonify, session

from database import create_tables, get_connection, seed_data
import error_messages as messages
from help_answers import find_answer  # the scripted answers live in help_answers.py
from progress import get_status, record_step, reset_course, submit_quiz, admin_insights

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# The secret key signs the session cookie. This fixed text is only for the demo
app.secret_key = os.environ.get("SECRET_KEY", "demo-only-secret-key")
app.permanent_session_lifetime = timedelta(days=1)

# Creates database and dummy data on start if they don't exist yet
create_tables()
seed_data()


def current_user():
    """return the logged-in dummy user as a dict, or None if nobody is logged in"""
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
    """redirect the root address to the start page"""
    return redirect("/pages/index.html")


@app.post("/api/login")
def login():
    """mock login: choose the student or the admin dummy user (no password)"""
    data = request.get_json(silent=True) or {}
    role = (data.get("role") or "").strip()

    if role not in ("student", "admin"):
        return jsonify({"error": messages.CHOOSE_ROLE}), 400

    connection = get_connection()
    try:
        user = connection.execute(
            "SELECT id, name, role FROM users WHERE role = ?", (role,)
        ).fetchone()
    finally:
        connection.close()

    if user is None:
        return jsonify({"error": messages.ACCOUNT_NOT_FOUND}), 404

    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]
    return jsonify(dict(user))


@app.get("/api/me")
def me():
    """return the logged-in dummy user, or ask the visitor to log in first"""
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401
    return jsonify(user)


@app.get("/api/progress/<slug>")
def progress_status(slug):
    """return percent, passed and attempts of the logged-in user for a course"""
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401

    status = get_status(user["id"], slug)
    if status is None:
        return jsonify({"error": messages.COURSE_NOT_FOUND}), 404
    return jsonify(status)


@app.post("/api/progress/<slug>")
def progress_save(slug):
    """save that the logged-in user reached a step of a course """
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401

    data = request.get_json(silent=True) or {}
    position = data.get("position")
    if not isinstance(position, int) or isinstance(position, bool):
        return jsonify({"error": messages.STEP_NOT_A_NUMBER}), 400

    saved, message, code = record_step(user["id"], slug, position)
    if not saved:
        return jsonify({"error": message}), code
    return jsonify(get_status(user["id"], slug))


@app.post("/api/progress/<slug>/reset")
def progress_reset(slug):
    """reset progress and quiz attempts of the logged-in user for a course"""
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401

    done, message, code = reset_course(user["id"], slug)
    if not done:
        return jsonify({"error": message}), code
    return jsonify(get_status(user["id"], slug))


@app.get("/api/admin/insights/<slug>")
def admin_insights_overview(slug):
    """return the overview of all students for a course, for the admin only"""
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401
    if user["role"] != "admin":
        return jsonify({"error": messages.ADMINS_ONLY}), 403

    insights = admin_insights(slug)
    if insights is None:
        return jsonify({"error": messages.COURSE_NOT_FOUND}), 404
    return jsonify(insights)


@app.post("/api/quiz/<slug>")
def quiz_submit(slug):
    """check the quiz answers of the logged-in user and count the attempt"""
    user = current_user()
    if user is None:
        return jsonify({"error": messages.LOGIN_REQUIRED}), 401

    submitted = request.get_json(silent=True) or {}
    result, message, code = submit_quiz(user["id"], slug, submitted)
    if result is None:
        return jsonify({"error": message}), code
    return jsonify(result)


@app.post("/api/help")
def help_answer():
    """returns an answer to a question sent by the AI assistant window"""
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": messages.QUESTION_REQUIRED}), 400

    return jsonify(find_answer(question))

@app.errorhandler(404)
def not_found(error):
    """answer an unknown address with json for the api and with a page for the browser"""
    if request.path.startswith("/api/"):
        return jsonify({"error": messages.NOT_FOUND}), 404
    return app.send_static_file("pages/404.html"), 404


@app.errorhandler(500)
def server_error(error):
    """answer an unexpected error with json for the api and with a page for the browser"""
    if request.path.startswith("/api/"):
        return jsonify({"error": messages.SERVER_ERROR}), 500
    return app.send_static_file("pages/500.html"), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
