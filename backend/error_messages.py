"""accessible error messages the backend sends to the frontend"""

# the frontend redirects to the login page on exactly this text, do not change it
LOGIN_REQUIRED = "Please log in first."

CHOOSE_ROLE = "Please choose whether you want to log in as a student or an admin."
ACCOUNT_NOT_FOUND = (
    "We could not find this account. Please check your login details and try again."
)
ADMINS_ONLY = "This page is only available for admins."

COURSE_NOT_FOUND = (
    "We could not find this course. Please go back to the course overview."
)
STEP_NOT_FOUND = "We could not find this step. Please go back to the course overview."
QUIZ_NOT_FOUND = "We could not find this quiz. Please go back to the course overview."

STEP_NOT_A_NUMBER = "Something went wrong while saving your progress. Please try again."
EARLIER_STEPS_FIRST = "Please finish the earlier steps first."
FINISH_TASKS_FIRST = "Please finish all tasks before you take the quiz."
ANSWER_ALL_QUESTIONS = "Please answer all questions."
ATTEMPTS_USED_UP = "All three quiz attempts were used. Please restart the course."

QUESTION_REQUIRED = "Please enter a question."
