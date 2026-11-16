"""the demo quiz: correct answers and the check"""

# the correct answers only live in the backend, not in the browser code
CORRECT_ANSWERS = {
    "platform": "highcharts",
    "charts": "yes",
    "lesson-flow": "yes",
    "application": "yes",
}


def is_complete(submitted):
    """check that every question has an answer"""
    return all(
        isinstance(submitted.get(question), str) and submitted.get(question)
        for question in CORRECT_ANSWERS
    )


def check_answers(submitted):
    """compare the submitted answers with the correct ones, question by question"""
    questions = {}
    for question, correct_value in CORRECT_ANSWERS.items():
        chosen = submitted.get(question)
        questions[question] = {
            "chosen": chosen,
            "correct_value": correct_value,
            "correct": chosen == correct_value,
        }
    score = sum(1 for result in questions.values() if result["correct"])
    total = len(CORRECT_ANSWERS)
    return {
        "score": score,
        "total": total,
        "passed": score == total,
        "questions": questions,
    }
