# Backend

This folder holds the Flask backend of our course portal. It saves the progress of the 
students in an SQLite database, checks the quiz answers and gives the admin an overview 
of all students. It also serves the `frontend/` folder as static files and answers the 
questions of the AI assistant with prepared answers.

This file is a short overview of the backend code. The setup, the API endpoints, 
the architecture and the known limitations are described in the [main README](../README.md), 
which is the main source.

## Files

| File | Content |
|---|---|
| `app.py` | Flask app: routes for login, progress, quiz, reset, admin insights and the assistant, serves the frontend and creates the database on the first start |
| `database.py` | Database schema (five tables), connection helper and the demo data (two users, one course, five steps) |
| `progress.py` | Rules for progress, quiz attempts, reset and the admin insights |
| `quiz_answers.py` | The correct quiz answers and the check of a submission (the answers stay in the backend) |
| `help_answers.py` | Prepared answers of the AI assistant |
| `requirements.txt` | Python dependencies |
| `test_helpers.py` | Shared test setup with a temporary database |
| `test_progress.py` | Tests for login, progress, quiz and reset |
| `test_admin.py` | Tests for the admin insights |

## Data model

The database file `course_portal.db` is created on the first start of the app. It is not part of the repository.

| Table | One row is | Columns |
|---|---|---|
| `users` | a user | `id`, `name`, `role` (`student` or `admin`) |
| `courses` | a course | `id`, `slug`, `title` |
| `steps` | a step of a course | `id`, `course_id`, `position`, `title`, `percent` |
| `progress` | a step a user has reached | `user_id`, `step_id`, `completed_at` |
| `quiz_attempts` | one quiz attempt | `id`, `user_id`, `course_id`, `submitted_at`, `correct_count`, `passed` |

The 100 % of a passed course is not saved as a step. The backend calculates it when a passed quiz attempt exists.

## Progress, quiz, reset and access rules

| Position | Step | Percent |
|---|---|---|
| 1 | Introduction | 1 |
| 2 | Task 1 | 25 |
| 3 | Task 2 | 50 |
| 4 | Task 3 | 75 |
| 5 | Quiz | 90 |

- **Progress:** A step counts when the user reaches it. The earlier steps must be reached first, otherwise the backend answers `409`. The progress is the percent of the highest reached step, and 100 % if the quiz was passed.
- **Quiz:** It is only accepted after step 5 was reached. All four answers must be right to pass. After each attempt the backend returns the correct answer for every question. After three wrong attempts the fourth one gets a `409`, and after a pass no new attempt is counted.
- **Reset:** It deletes the progress and the quiz attempts of the user for the course, so the user can start again (the "Restart Course" button in the frontend).
- **Access:** Without a login the backend answers `401` ("Please log in first."). The admin insights are only for admins, students get `403`.

## Error messages

All error texts live in `error_messages.py`. Every error response is JSON with the key `error`, for example `{"error": "Please log in first."}`.

| Status | Situation | Message |
|---|---|---|
| 400 | Log in without choosing a role | Please choose whether you want to log in as a student or an admin. |
| 400 | Step is not sent as a number | Something went wrong while saving your progress. Please try again. |
| 400 | Quiz submitted without all answers | Please answer all questions. |
| 400 | Help question is empty | Please enter a question. |
| 401 | Not logged in | Please log in first. |
| 403 | Student opens the admin dashboard | This page is only available for admins. |
| 404 | User not found | We could not find this account. Please check your login details and try again. |
| 404 | Course not found | We could not find this course. Please go back to the course overview. |
| 404 | Step not found | We could not find this step. Please go back to the course overview. |
| 404 | Quiz not found | We could not find this quiz. Please go back to the course overview. |
| 409 | Step saved before the earlier steps | Please finish the earlier steps first. |
| 409 | Quiz submitted before all tasks | Please finish all tasks before you take the quiz. |
| 409 | Fourth quiz attempt | All three quiz attempts were used. Please restart the course. |

The frontend sends students to the log in page when it receives exactly the 401 text, so that text must not change.

## Configuration

| Setting | Where | Value |
|---|---|---|
| Port | `app.py` (`app.run`) | `5001` |
| Secret key for the session cookie | environment variable `SECRET_KEY` | `demo-only-secret-key` if the variable is not set |
| Database file | `database.py` (`DB_PATH`) | `backend/course_portal.db` |

The demo key is part of the public code, so it is only fine for a demo and must be replaced in a real product (see the known limitations in the [main README](../README.md)). The app also runs in Flask debug mode, which is meant for local development only.

## Tests

The tests use `unittest` from the Python standard library and a temporary database, so the real `course_portal.db` is not touched. Run them in the `backend` folder with the virtual environment active:

```bash
python -m unittest
```

A run ends with `OK` if all tests pass. A single test file runs with its name, for example `python -m unittest test_admin`.