"""Flask app that serves the frontend and the help API."""

from flask import Flask, redirect, request, jsonify

from help_answers import find_answer  # the scripted answers live in help_answers.py

app = Flask(__name__, static_folder="../frontend", static_url_path="")


@app.get("/")
def home():
    """Redirect the root address to the start page."""
    return redirect("/pages/index.html")


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
