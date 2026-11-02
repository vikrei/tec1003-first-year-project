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
| Database | SQLite (planned, not built yet) |

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
5. Open `http://127.0.0.1:5000` in your browser. Stop the server with `Ctrl+C`.


Open the pages through this address. The AI assistant only works while the Flask server is running.

### Troubleshooting

- **`python: command not found`:** The virtual environment is not active. Activate it first (step 2). Outside the environment, Ubuntu only knows `python3`.
- **Linux, error about `ensurepip` when creating the environment:** run `sudo apt install python3-venv`.
- **Windows, "running scripts is disabled":** use the Command Prompt and run `venv\Scripts\activate.bat` instead.
- **macOS, "Address already in use":** the AirPlay Receiver can occupy port 5000. Switch it off in the system settings.


## Project structure

```text
tec1003-first-year-project/
├── README.md
├── licence
├── .gitignore
├── backend/
│   ├── README.md
│   ├── app.py              Flask app: serves the frontend and the /api/help endpoint
│   ├── help_answers.py     Scripted answers and keywords for the AI assistant
│   └── requirements.txt    Python dependencies
└── frontend/
    ├── README.md
    ├── pages/              HTML pages (student and admin screens)
    ├── css/
    │   ├── variables.css   Design tokens: colors (light and dark), typography, spacing
    │   ├── global.css      Base styles
    │   ├── components.css  Reusable components (theme toggle, profile menu, AI assistant, footer modals)
    │   └── pages.css       Page-specific styles
    ├── js/                 Scripts for the pages (see table below)
    └── assets/             Icons and images
```

The `backend/venv/` folder is created during setup and is not part of the repository.

**Pages** (`frontend/pages/`): `index` (home), `login`, `student-dashboard`, `my-courses`, `courses`, `lesson`, `inbox`, `profile`, `admin-dashboard`, `admin-inbox`, `admin-profile`.

**Scripts** (`frontend/js/`):

| File | Purpose |
|---|---|
| `ai-assistant.js` | AI assistant window: sends questions to `/api/help` and shows the answers, prepared answers for service |
| `login.js` | Mock login |
| `courses-page.js` | Filters on the course overview |
| `profile-menu.js` | Profile dropdown menu |
| `theme-toggle.js` | Light and dark mode toggle |
| `footer-modals.js` | Information pop-ups in the footer |
| `dashboard-tutorial.js` | Tutorial on the student dashboard |
| `lesson.js` | Lesson page |


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

## Current status

| Feature | Status |
|---|---|
| Student and admin pages (HTML, CSS) | Built as static pages, now with routing |
| Light and dark mode | Working |
| Filters on the course overview | Working (will be up for re-evaluation) |
| Progress tracker on the dashboard | Hard-coded values |
| Example lesson flow | Frontend only |
| Login | Mock (`login.js`, no real authentication) |
| AI assistant | Working with scripted answers from the Flask endpoint `/api/help` |
| Database (SQLite) | Planned, not built yet |
| Saving progress and enrollments | Planned, not built yet |

## Technical main decisions

| Decision | Reason |
|---|---|
| Flask only as backend, serving the frontend as static files (no Jinja templates) | Keeps responsibilities clear: the frontend shows and reacts, the backend provides data and rules. The pages were built as static HTML first, so they stay unchanged. |
| Scripted AI assistant instead of an external AI service | An external service needs API access, keys and a decision on what user data may be sent to a third party. Scripted answers work offline and need no personal data. The endpoint can later call a real API without changes to the frontend. |
| Answers stored in `help_answers.py` | New topics are added by copying one entry. No other file needs to change. |
| Keyword matching on whole words | "tutor" must not match "tutorial". The first matching topic wins, so the order of the list matters. |
| Empty questions are checked in the frontend and in the backend | The frontend is convenient for the user. The backend protects the endpoint against direct calls. |
| Mock login | Real authentication is out of scope for this prototype. |
| SQLite (planned) | A file-based database needs no separate server and fits a prototype. |



## Known limitations

- **The AI assistant does not answer on the GitHub Pages preview.** The deployed pages (https://vikrei.github.io/tec1003-first-year-project/frontend/pages/index.html) shows the design and the pages, but GitHub Pages only serves static files and cannot run Flask. There, a question in the assistant window ends with an error message. Run the project locally to use the assistant (see "Setup and run").
- **The assistant gives prepared answers only.** It matches keywords to a fixed list of topics. Questions outside these topics get a fallback answer with suggested links.
- **Login is a mock.** There is no real authentication and no user accounts.
- **Progress is not saved yet.** The progress tracker shows hard-coded values, because the database is not built yet.
- **Known bug:** the profile menu sometimes marks the wrong tab as active.
- **Tested setup:** the setup instructions were tested on Linux (Ubuntu) with Python 3.12. The Windows and macOS instructions have not been tested yet.

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