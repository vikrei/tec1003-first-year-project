"""Scripted answers for the AI assistant (no external AI service)."""

import re  # built-in module for text patterns (reg expressions), looks for key-word as a whole word

ANSWERS = [
    {
        "keywords": ["progress", "how far", "percent", "percentage", "completed"],
        "answer": "Your progress is shown on your dashboard and in your My Courses page. "
        "Progress bar and percentage help you to find your current progress right away.",
        "links": [
            {"label": "Open my dashboard", "url": "/pages/student-dashboard.html"}
        ],
    },
    {
        "keywords": [
            "continue",
            "resume",
            "pick up",
            "where was i",
            "my course",
            "my courses",
        ],
        "answer": "Open My Courses and select the course you want to continue. "
        "Your progress is saved, so you can pick up where you stopped.",
        "links": [{"label": "Go to My Courses", "url": "/pages/my-courses.html"}],
    },
    {
        "keywords": [
            "browse",
            "new course",
            "new courses",
            "catalogue",
            "catalog",
            "search",
            "skill",
            "skills",
        ],
        "answer": "You can find all available courses in the course catalogue. "
        "Use the filters to show courses you're interested in.",
        "links": [{"label": "Browse courses", "url": "/pages/courses.html"}],
    },
    {
        "keywords": ["settings", "profile", "account"],
        "answer": "You can manage your account on your profile page. "
        "Open the menu by clicking on your profile image and navigate to Profile & Settings.",
        "links": [{"label": "Open my profile", "url": "/pages/profile.html"}],
    },
    {
        "keywords": [
            "tutor",
            "tutors",
            "teacher",
            "teachers",
            "contact",
            "human",
            "inbox",
            "message",
            "messages",
            "mail",
        ],
        "answer": "You can send a message to a tutor/admin or fellow student from your inbox. "
        "Go there by tapping inbox in the bottom nav on mobile or by clicking your profile image and choosing Mail on Desktop screens.",
        "links": [{"label": "Open my inbox", "url": "/pages/inbox.html"}],
    },
]

FALLBACK = {
    "answer": "I am not sure about that one. This assistant gives prepared answers "
    "to common questions. You can try one of the topics below or "
    "contact a tutor.",
    "links": [
        {"label": "Browse courses", "url": "/pages/courses.html"},
        {"label": "Contact a tutor", "url": "/pages/inbox.html"},
    ],
}


def find_answer(question):
    """Return the first scripted answer with a keyword that appears as a whole word."""
    text = question.lower()
    for entry in ANSWERS:
        for keyword in entry["keywords"]:
            if re.search(rf"\b{re.escape(keyword)}\b", text):
                return {"answer": entry["answer"], "links": entry["links"]}
    return FALLBACK
