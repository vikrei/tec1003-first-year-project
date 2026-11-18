# Highcharts Course Portal

> **Status:** work in progress. This README is the current state of the project (01.11.2026) and will be updated as features are added and changes are made.

Our solution for a responsive course portal for Highsoft's Highcharts learning content. It was built for the TEC1003 First Year Industry Project at Oslo Nye Fagskole 2026.

## Foundations

**Target User by UX Research**: Our primary target user is an intermediate online learner who has already completed or taken part in several online courses and is generally comfortable using digital learning platforms. They understand common course structures, navigation patterns, lessons, tasks, and progress tracking, and do not need extensive guidance on how an online course platform itself works.

Their **main motivation** is to learn something new, expand their existing skills, or explore a new technical area such as Highcharts and data visualization. They may not yet be highly experienced with Highcharts specifically, but they are confident enough with online learning to navigate the course independently and make use of supporting resources when needed.

**How might we questions..** 
1. How might we help intermediate users in the Highcharts ecosystem get clear guidance and see their progress, so they stay motivated to complete their courses?

2. How might we design a progress-tracking experience that helps intermediate users feel in control of their learning?

3. How might we create a course experience that keeps intermediate users motivated while giving Highsoft useful insight into where they struggle?


## Tech stack

| Part | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (no framework) |
| Backend | Python with Flask |
| Database | SQLite (`sqlite3` from the Python standard library), created automatically on first start |

## Setup and run

**Requirements:** Python 3 (developed and tested with Python 3.12) and Git.

1. Clone the repository and open the backend folder:
   ```bash
   git clone https://github.com/vikrei/tec1003-first-year-project.git
   cd tec1003-first-year-project/backend
   ```
2. Create and **activate** a virtual environment:

   | Step | Linux / macOS | Windows (PowerShell) |
   |---|---|---|
   | Create | `python3 -m venv venv` | `py -m venv venv` |
   | Activate | `source venv/bin/activate` | `venv\Scripts\Activate.ps1` |

   After activating, `(venv)` appears at the start of the terminal line. **Activate the environment again every time you open a new terminal.**
3. Install the dependencies. This installs Flask and the other packages listed in `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python app.py
   ```
5. OPEN `http://127.0.0.1:5000` in your browser. STOP the server with `Ctrl+C`.

Open the pages through this address. The AI assistant, the login, progress and the quiz only work while the Flask server is running. Do not open the HTML files directly and do not use a tool like Live Server.

On the first start, the server creates the database file `backend/course_portal.db` with two dummy users (a student and an admin) and the demo course. The file is not part of the repository. To start again from zero, stop the server, delete `course_portal.db` and start the server again.

**Run the tests** (in the `backend` folder; the environment must be active, so `(venv)` is shown at the start of the line, see step 2):
```bash
python -m unittest
```

### Troubleshooting

- **`python: command not found`:** The virtual environment is not active. Activate it first (step 2). Outside the environment, Ubuntu only knows `python3`.
- **Linux, error about `ensurepip` when creating the environment:** run `sudo apt install python3-venv`.
- **Windows, "running scripts is disabled":** use the Command Prompt and run `venv\Scripts\activate.bat` instead.
- **macOS, "Address already in use":** the AirPlay Receiver can occupy port 5000. Switch it off in the system settings.

## How to test the demo

> **Section in Progress** Describes the planned flow and will be updated when frontend is connected to backend and the admin overview is built.

**Today (backend only):** Run `python -m unittest` in the `backend` folder to run all tests. The endpoints can also be tried with a tool like `curl` (see "API endpoints"). The login is a mock without a password, so no registration is needed.

**Planned flow in the browser:**
1. Start the server and open `http://127.0.0.1:5000` (see "Setup and run").
2. On the login page, choose **student** (Alex Liland).
3. Open the course overview (the Courses page) and click **Start Learning** on the course "Build Pie Charts with React". The introduction page opens. Click **Start Course** and go through the three tasks.
4. Take the quiz. All four answers must be correct to pass, and the correct answers are shown after each attempt.
5. When the quiz is passed, the button **View Certificate** appears (or use the arrow button at the end of the quiz page). It opens the certificate page.
6. Go back to the login page, choose **admin** (Per Håland) and check that Alex Liland appears with his progress, the quiz result and the number of attempts (planned, available when the admin overview is built).

**Start again from zero:** The progress stays saved in the database, also after the server is stopped. After a full run, the student is at 100 % and the quiz counts as passed. To test the demo again from the beginning, for example as a second reviewer, reset it: stop the server, delete `backend/course_portal.db` and start the server again. The database is created again with the dummy users and the demo course. Until the frontend is connected to the backend, the browser also keeps its own state (quiz attempts and certificate). Clear the site data for `127.0.0.1` in the browser settings to reset it as well.

Pages stay reachable without a login on purpose, so that the demo can be tested easily (see "Known limitations").

## Project structure

```text
tec1003-first-year-project/
├── backend/
│   ├── README.md
│   ├── app.py              Flask app: serves the frontend, login, progress, quiz, admin insights & help endpoints
│   ├── database.py         SQLite tables and dummy data, created on the first start
│   ├── help_answers.py     Scripted answers and keywords for the AI assistant
│   ├── progress.py         Rules for steps, progress in percent, the quiz result and the admin overview
│   ├── quiz_answers.py     Correct answers and the answer check (kept in the backend)
│   ├── requirements.txt    Python dependencies
│   ├── test_admin.py       Tests of the admin insights endpoint
│   ├── test_helpers.py     Shared setup for the tests (temporary database)
│   └── test_progress.py    Tests of login, progress, quiz and reset (run all tests with python -m unittest)
├── frontend/
│   ├── README.md
│   ├── pages/              HTML pages (student and admin screens)
│   ├── css/
│   │   ├── variables.css   Design tokens: colors (light and dark), typography, spacing
│   │   ├── global.css      Base styles
│   │   ├── components.css  Reusable components (theme toggle, profile menu, AI assistant, footer modals)
│   │   └── pages.css       Page-specific styles
│   ├── js/                 Scripts for the pages (see table below)
│   └── assets/             Icons and images
├── .gitignore
├── README.md
└── licence
```

The `backend/venv/` folder and the database file `backend/course_portal.db` are created during setup and on the first start. Neither is part of the repository.

**Pages** (`frontend/pages/`): `index` (home), `login`, `student-dashboard`, `my-courses`, `courses`, `learning-flow-introduction`, `lesson`, `quiz`, `course-certificate`, `inbox`, `profile`, `admin-dashboard`, `admin-inbox`, `admin-profile`

**Scripts** (`frontend/js/`):

| File | Purpose |
|---|---|
| `ai-assistant.js` | AI assistant window: sends questions to `/api/help` and shows the answers, prepared answers for service |
| `login.js` | Sends the selected student/admin role to the Flask login endpoint |
| `courses-page.js` | Filters on the course overview |
| `profile-menu.js` | Profile dropdown menu |
| `theme-toggle.js` | Light and dark mode toggle |
| `footer-modals.js` | Information pop-ups in the footer |
| `dashboard-tutorial.js` | Tutorial on the student dashboard |
| `lesson.js` | Lesson tabs and task navigation; records reached tasks through the backend |
| `course-progress.js` | Loads and resets course progress through the backend and updates the course card/dashboard |
| `quiz.js` | Sends selected answers to the backend, shows its score and answer feedback, and uses backend attempts/pass state |
| `course-certificate.js` | Checks the backend pass state before showing or printing the certificate |
| `admin-insights.js` | Loads course progress and quiz results for the admin dashboard |
| `services/` | Shared JSON transport and small API adapters for auth, progress, quiz, help and admin insights |


## Architecture and data flow

The project has two parts with clear responsibilities.

| Part | Responsibility |
|---|---|
| **Frontend** (`frontend/`) | Everything the user sees and uses in the browser: pages (HTML), design (CSS) and interaction (JavaScript). |
| **Backend** (`backend/`) | A Flask server that delivers the frontend files and provides data through API endpoints. Flask does not render HTML (no Jinja templates). |

Flask serves the `frontend/` folder as static files. That is why the relative paths in the pages (for example `../css/variables.css`) keep working. Opening the app through `http://127.0.0.1:5000` redirects to the start page.

### Example: asking the AI assistant a question

```text
User types a question in the assistant window
        |
ai-assistant.js sends POST /api/help  { "question": "..." }
        |
Flask (app.py) checks the question, then calls find_answer() in help_answers.py
        |
help_answers.py returns the first scripted answer whose keyword matches (or a fallback)
        |
Flask answers with JSON  { "answer": "...", "links": [ { "label": "...", "url": "..." } ] }
        |
ai-assistant.js shows the answer and its links in the conversation
```

### API endpoints

| Method | Endpoint | Purpose | Success response | Error |
|---|---|---|---|---|
| POST | `/api/help` | Returns a scripted answer to a question | `200` with `answer` and `links` | `400` if the question is empty |
| POST | `/api/login` | Mock login: choose `student` or `admin` (no password), sets a session cookie | `200` with `id`, `name` and `role` | `400` if the role is not `student` or `admin` |
| GET | `/api/me` | Returns the logged-in dummy user | `200` with `id`, `name` and `role` | `401` if nobody is logged in |
| GET | `/api/progress/<slug>` | Returns the progress of the logged-in user in a course | `200` with `percent`, `passed`, `attempts` and `step` | `401` if nobody is logged in, `404` for an unknown course |
| POST | `/api/progress/<slug>` | Saves that the user reached a step, body `{ "position": 1 }` (1 to 5) | `200` with the new progress | `400` if the step is not a number, `401`, `404` for an unknown course or step, `409` if an earlier step is missing |
| POST | `/api/progress/<slug>/reset` | Deletes progress and quiz attempts of the user for the course | `200` with the new progress | `401`, `404` for an unknown course |
| POST | `/api/quiz/<slug>` | Checks the four answers and counts the attempt | `200` with `score`, `total`, `passed`, `attempt`, `percent`, `already_passed` and `questions` (with the correct answer for each question) | `400` if an answer is missing, `401`, `404`, `409` if the quiz was not reached yet or all three attempts were used |
| GET | `/api/admin/insights/<slug>` | Overview of all students in a course for the admin: progress, quiz result, attempts and the time the quiz was passed (in UTC) | `200` with `course`, `student_count`, `passed_count` and `students` (each with `name`, `percent`, `step`, `passed`, `attempts`, `last_score` and `passed_at`) | `401` if nobody is logged in, `403` if the user is not an admin, `404` for an unknown course |

## Current status

| Feature | Status |
|---|---|
| Student and admin pages (HTML, CSS) | Built as static pages, now with routing |
| Light and dark mode | Working |
| Filters on the course overview | Working (will be up for re-evaluation) |
| Progress tracker on the dashboard | Reads the demo course progress from the backend |
| Example lesson flow | Frontend lesson content with reached steps saved by the backend |
| Login | Mock (`login.js`, role selection sets the backend session cookie) |
| AI assistant | Working with scripted answers from the Flask endpoint `/api/help` |
| Database (SQLite) | Built: five tables with dummy users and one demo course, created on the first start |
| Saving course progress and quiz attempts | Connected to the frontend; SQLite is the source of truth |
| Admin overview of the students | Connected to the admin dashboard insights endpoint |
| Course Enrollments | Not built |

## Technical main decisions

| Decision | Reason |
|---|---|
| Flask only as backend, serving the frontend as static files (no Jinja templates) | Keeps responsibilities clear: the frontend shows and reacts, the backend provides data and rules. The pages were built as static HTML first, so they stay unchanged. |
| Scripted AI assistant instead of an external AI service | An external service needs API access, keys and a decision on what user data may be sent to a third party. Scripted answers work offline and need no personal data. The endpoint can later call a real API without changes to the frontend. |
| Answers stored in `help_answers.py` | New topics are added by copying one entry. No other file needs to change. |
| Keyword matching on whole words | "tutor" must not match "tutorial". The first matching topic wins, so the order of the list matters. |
| Empty questions are checked in the frontend and in the backend | The frontend is convenient for the user. The backend protects the endpoint against direct calls. |
| Mock login with a session cookie | Real authentication is out of scope for this prototype. The signed cookie only tells the backend which dummy user (student or admin) is logged in, so that progress and quiz attempts belong to the right user. Pages stay reachable without a login on purpose, so that the product can be tested easily. The backend still protects its data: without a login, it answers with the message "Please log in first." (status 401). With a real login, the pages themselves would also ask the visitor to log in first. |
| SQLite (`sqlite3` from the Python standard library) | A file-based database needs no separate server, comes with Python and fits a prototype and our level of knowledge. Nothing has to be installed, because the file is created on the first start. |


## Known limitations

- **The AI assistant does not answer on the GitHub Pages preview.** The deployed pages (https://vikrei.github.io/tec1003-first-year-project/frontend/pages/index.html) shows the design and the pages, but GitHub Pages only serves static files and cannot run Flask. There, a question in the assistant window ends with an error message. Run the project locally to use the assistant (see "Setup and run").
- **The assistant gives prepared answers only.** It matches keywords to a fixed list of topics. Questions outside these topics get a fallback answer with suggested links.
- **Login is a mock.** There is no real authentication, no password and no real user accounts. The login only chooses one of two dummy users (a student and an admin) from the database. The session cookie is signed with a fixed demo key that is part of the public code, so anyone who reads the code could forge it. This is fine for a demo, but it must be replaced in a real product. Pages stay reachable without a login, but the backend answers "Please log in first." (status 401) when progress or the quiz is requested without one.
- **The course demo uses one seeded student and one course.** The frontend saves reached steps when their pages are opened, checks quiz answers through the backend, and allows a restart that clears course progress and attempts.
- **Tested setup:** the setup instructions were tested on Linux (Ubuntu) with Python 3.12, using a fresh clone of the repository on 02.11.2026. The Windows and macOS instructions have not been tested yet.
- **The pages follow the Figma design, but they are not identical.** Some elements exist only in the design, and some details were adapted during development. The reasons are explained in the project report.

## Team, license and branding

### Team

| Name | Role |
|---|---|
| (Victoria Rein) | (mostly frontend) |
| (Claudia Stoll) | (mostly backend) |

## Acknowledgements

AI tools (Claude and Codex) were used during development for support with code logic, debugging and ideas. We reviewed and tested the results and made the design and technical decisions.

### License

See the `licence` file in the root folder for the license of this repository.

### Highsoft branding

The brand assets used in this project (logos, colors, typography and tone of voice) come from the branding kit provided for the TEC1003 First Year Industry Project. They may only be used for TEC1003 coursework (educational, non-commercial use). They must not be modified, redistributed or used outside the course.
