import { getProgress, saveStep } from "./services/course-progress.service.js";
import { submitQuiz } from "./services/quiz.service.js";

const form = document.querySelector("#course-quiz");
if (form) {
    const COURSE = "build-pie-charts-react";
    const maxAttempts = 3;
    const questionGroups = Array.from(form.querySelectorAll(".quiz-question"));
    const checkButton = form.querySelector(".quiz-check-button");
    const errorMessage = form.querySelector(".quiz-form-error");
    const result = form.querySelector("[data-quiz-result]");
    const attemptLabel = form.querySelector("[data-attempt-label]");
    const resultMark = form.querySelector("[data-result-mark]");
    const resultTitle = form.querySelector("[data-result-title]");
    const resultScore = form.querySelector("[data-result-score]");
    const resultMessage = form.querySelector("[data-result-message]");
    const retryButton = form.querySelector("[data-quiz-retry]");
    const cancelLink = form.querySelector("[data-quiz-cancel]");
    const restartLink = form.querySelector("[data-quiz-restart]");
    const certificateLink = form.querySelector("[data-view-certificate]");
    const finishButton = document.querySelector("[data-finish-quiz]");
    const progressValue = document.querySelector("[data-course-progress-value]");
    const progressBar = document.querySelector("[data-course-progress-bar]");
    let attempts = 0;
    let locked = false;

    function setProgress(percent) {
        if (progressValue) progressValue.textContent = `${percent}%`;
        if (progressBar) {
            const classes = ["progress-one-percent", "progress-twenty-five-percent", "progress-fifty-percent", "progress-seventy-five-percent", "progress-ninety-percent", "progress-complete"];
            progressBar.classList.remove(...classes);
            progressBar.classList.add(percent >= 100 ? "progress-complete" : percent >= 90 ? "progress-ninety-percent" : percent >= 75 ? "progress-seventy-five-percent" : percent >= 50 ? "progress-fifty-percent" : percent >= 25 ? "progress-twenty-five-percent" : "progress-one-percent");
            progressBar.style.width = `${Math.max(percent, 1)}%`;
        }
    }

    function answered(group) {
        return Boolean(group.querySelector("input[type='radio']:checked"));
    }

    function clearFeedback() {
        questionGroups.forEach((group) => {
            group.classList.remove("has-error", "is-incorrect");
            group.querySelectorAll(".quiz-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
            group.querySelectorAll("input[type='radio']").forEach((input) => {
                input.disabled = false;
                input.checked = false;
            });
        });
        errorMessage.hidden = true;
        result.hidden = true;
        checkButton.hidden = false;
    }

    function showResult({ score, total = questionGroups.length, attempt, passed, questions = {}, alreadyPassed = false }) {
        locked = !passed && attempt >= maxAttempts;
        attempts = attempt;

        questionGroups.forEach((group) => {
            const question = questions[group.dataset.question];
            const selected = question ? group.querySelector(`input[value="${CSS.escape(question.chosen || "")}"]`) : null;
            if (question) group.classList.toggle("is-incorrect", !question.correct);
            group.querySelectorAll("input[type='radio']").forEach((input) => {
                input.disabled = true;
                const choice = input.closest(".quiz-choice");
                if (question && input.value === question.correct_value) choice.classList.add("is-correct");
                if (question && input === selected && !question.correct) choice.classList.add("is-wrong");
            });
        });

        const percent = total ? Math.round((score / total) * 100) : 0;
        attemptLabel.textContent = `Attempt ${attempt} of ${maxAttempts}`;
        resultTitle.textContent = passed ? "Course quiz passed" : locked ? "Course restart required" : "Try again";
        resultScore.textContent = score === null
            ? "No attempts remain. Restart the course to try again."
            : `${percent}% - ${score} of ${total} answers are correct`;
        resultMessage.textContent = passed
            ? alreadyPassed ? "You have already passed this course quiz. Your certificate is ready." : "You passed the course quiz. Your certificate is ready."
            : locked ? "You have used all three attempts. Restart the course from the introduction to try again." : "Would you like to try again? All answers must be correct to pass.";
        resultMark.textContent = passed ? "✓" : locked ? "!" : "";
        result.classList.toggle("is-passed", passed);
        result.classList.toggle("is-failed", !passed);
        result.hidden = false;
        checkButton.hidden = true;
        retryButton.hidden = passed || locked;
        cancelLink.hidden = passed || locked;
        restartLink.hidden = !locked;
        certificateLink.hidden = !passed;
        if (finishButton) {
            finishButton.disabled = !passed;
            finishButton.setAttribute("aria-label", passed ? "Finish and view your certificate" : "Pass the quiz to finish the course");
        }
        setProgress(passed ? 100 : 90);
    }

    questionGroups.forEach((group) => {
        group.addEventListener("change", () => {
            if (!errorMessage.hidden) {
                questionGroups.forEach((question) => question.classList.toggle("has-error", !answered(question)));
                if (questionGroups.every(answered)) errorMessage.hidden = true;
            }
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const unanswered = questionGroups.filter((group) => !answered(group));
        questionGroups.forEach((group) => group.classList.toggle("has-error", unanswered.includes(group)));
        if (unanswered.length) {
            errorMessage.hidden = false;
            unanswered[0].querySelector("input")?.focus();
            return;
        }

        const answers = Object.fromEntries(questionGroups.map((group) => [
            group.dataset.question,
            group.querySelector("input[type='radio']:checked").value,
        ]));
        checkButton.disabled = true;
        errorMessage.hidden = true;
        try {
            const data = await submitQuiz(COURSE, answers);
            showResult(data);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.hidden = false;
        } finally {
            checkButton.disabled = false;
        }
    });

    retryButton.addEventListener("click", clearFeedback);
    finishButton?.addEventListener("click", () => {
        if (!finishButton.disabled) window.location.href = "course-certificate.html";
    });

    (async () => {
        try {
            const status = await getProgress(COURSE);
            if (status.step < 4) {
                if (status.step === 0) {
                    window.location.replace("learning-flow-introduction.html");
                    return;
                }
                window.location.replace(`lesson.html?task=${Math.max(1, Math.min(3, status.step - 1))}`);
                return;
            }
            if (status.attempts >= maxAttempts && !status.passed) {
                showResult({ score: null, total: questionGroups.length, attempt: status.attempts, passed: false });
                return;
            }
            attempts = status.attempts;
            const updated = await saveStep(COURSE, 5);
            setProgress(updated.percent);
            if (status.passed) {
                showResult({ score: questionGroups.length, attempt: status.attempts, passed: true, alreadyPassed: true });
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.hidden = false;
            checkButton.disabled = true;
            if (error.message === "Please log in first.") window.location.href = "login.html";
        }
    })();
}
