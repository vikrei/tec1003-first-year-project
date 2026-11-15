(() => {
    const form = document.querySelector("#course-quiz");
    if (!form) return;

    const attemptsKey = "pie-chart-react-quiz-attempts";
    const certificateKey = "pie-chart-react-certificate-earned";
    const certificateDateKey = "pie-chart-react-certificate-date";
    const lockedKey = "pie-chart-react-course-locked";
    const maxAttempts = 3;
    const answers = new Map([
        ["platform", "highcharts"],
        ["charts", "yes"],
        ["lesson-flow", "yes"],
        ["application", "yes"]
    ]);
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
    const attempts = () => {
        try {
            const stored = Number(window.localStorage.getItem(attemptsKey));
            return Number.isFinite(stored) ? Math.max(0, stored) : 0;
        } catch (error) {
            return 0;
        }
    };
    const save = (key, value) => {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            // Quiz feedback still works if persistent storage is unavailable.
        }
    };
    const hasCertificate = () => {
        try {
            return window.localStorage.getItem(certificateKey) === "true";
        } catch (error) {
            return false;
        }
    };

    function answered(group) {
        return Boolean(group.querySelector("input[type='radio']:checked"));
    }

    function resetFeedback() {
        questionGroups.forEach((group) => {
            group.classList.remove("has-error", "is-incorrect");
            group.querySelectorAll(".quiz-choice").forEach((choice) => {
                choice.classList.remove("is-correct", "is-wrong");
            });
            group.querySelectorAll("input[type='radio']").forEach((input) => {
                input.disabled = false;
                input.checked = false;
            });
        });
        errorMessage.hidden = true;
        result.hidden = true;
        checkButton.hidden = false;
    }

    function showResult({ score, attempt, passed, locked }) {
        const total = answers.size;
        const percent = Math.round((score / total) * 100);

        attemptLabel.textContent = `Attempt ${attempt} of ${maxAttempts}`;
        resultTitle.textContent = passed ? "Course quiz passed" : locked ? "Course restart required" : "Try again";
        resultScore.textContent = `${percent}% - ${score} of ${total} answers are correct`;
        resultMessage.textContent = passed
            ? "You passed the course quiz. Your certificate is ready."
            : locked
                ? "You have used all three attempts. Restart the course from the introduction to try again."
                : "Would you like to try again? All answers must be correct to pass.";
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
    }

    questionGroups.forEach((group) => {
        group.addEventListener("change", () => {
            if (!errorMessage.hidden) {
                questionGroups.forEach((question) => question.classList.toggle("has-error", !answered(question)));
                if (questionGroups.every(answered)) errorMessage.hidden = true;
            }
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const unansweredGroups = questionGroups.filter((group) => !answered(group));

        questionGroups.forEach((group) => group.classList.toggle("has-error", unansweredGroups.includes(group)));
        if (unansweredGroups.length) {
            errorMessage.hidden = false;
            unansweredGroups[0].querySelector("input")?.focus();
            return;
        }

        errorMessage.hidden = true;
        const attempt = Math.min(attempts() + 1, maxAttempts);
        save(attemptsKey, String(attempt));
        let score = 0;

        questionGroups.forEach((group) => {
            const correctValue = answers.get(group.dataset.question);
            const selectedInput = group.querySelector("input[type='radio']:checked");
            const selectedIsCorrect = selectedInput.value === correctValue;
            if (selectedIsCorrect) score += 1;
            group.classList.toggle("is-incorrect", !selectedIsCorrect);

            group.querySelectorAll("input[type='radio']").forEach((input) => {
                input.disabled = true;
                const choice = input.closest(".quiz-choice");
                if (input.value === correctValue) choice.classList.add("is-correct");
                if (input === selectedInput && !selectedIsCorrect) choice.classList.add("is-wrong");
            });
        });

        const passed = score === answers.size;
        const locked = !passed && attempt >= maxAttempts;
        if (passed) {
            save(certificateKey, "true");
            save(certificateDateKey, new Date().toISOString());
            save(lockedKey, "false");
        } else if (locked) {
            save(lockedKey, "true");
            save(certificateKey, "false");
            try {
                window.localStorage.removeItem(certificateDateKey);
            } catch (error) {
                // The failed result still remains visible for this page session.
            }
        }

        showResult({ score, attempt, passed, locked });
    });

    retryButton.addEventListener("click", resetFeedback);
    finishButton?.addEventListener("click", () => {
        if (hasCertificate()) window.location.href = "course-certificate.html";
    });
})();
