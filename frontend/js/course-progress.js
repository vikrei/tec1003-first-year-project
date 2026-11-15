(() => {
    const attemptsKey = "pie-chart-react-quiz-attempts";
    const certificateKey = "pie-chart-react-certificate-earned";
    const certificateDateKey = "pie-chart-react-certificate-date";
    const lockedKey = "pie-chart-react-course-locked";
    const pageUrl = new URL(window.location.href);
    const restartRequested = pageUrl.searchParams.get("restart") === "1";

    const read = (key) => {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };

    if (restartRequested) {
        try {
            window.localStorage.removeItem(attemptsKey);
            window.localStorage.removeItem(certificateKey);
            window.localStorage.removeItem(certificateDateKey);
            window.localStorage.removeItem(lockedKey);
        } catch (error) {
            // A private browsing session can block persistent storage.
        }

        pageUrl.searchParams.delete("restart");
        window.history.replaceState({}, "", pageUrl);
    }

    const isLocked = read(lockedKey) === "true";
    const introduction = document.querySelector(".course-introduction-page");
    const lessonOrQuiz = document.querySelector(".lesson-page, .course-quiz-page");

    if (isLocked && lessonOrQuiz) {
        window.location.replace("learning-flow-introduction.html?restart=required");
        return;
    }

    if (introduction) {
        const startLink = introduction.querySelector("[data-course-start]");
        const startLabel = introduction.querySelector("[data-course-start-label]");
        const status = introduction.querySelector("[data-course-status]");
        const restartRequired = pageUrl.searchParams.get("restart") === "required" || isLocked;

        if (restartRequired && startLink && startLabel) {
            startLink.href = "learning-flow-introduction.html?restart=1";
            startLabel.textContent = "Restart Course";
            startLink.setAttribute("aria-label", "Restart the course from the beginning");
        }

        if (status && (restartRequired || restartRequested)) {
            status.hidden = false;
            status.classList.toggle("is-reset", restartRequested && !restartRequired);
            status.textContent = restartRequired
                ? "All quiz attempts were used. Restart the course to try the quiz again."
                : "Course progress has been reset. Start again from the introduction.";
        }
    }

    const earnedCertificate = read(certificateKey) === "true";
    const earnedCertificateCard = document.querySelector("[data-earned-course-certificate]");
    if (earnedCertificateCard) {
        earnedCertificateCard.hidden = !earnedCertificate;
        const dateLabel = earnedCertificateCard.querySelector("[data-certificate-date]");
        const earnedDate = read(certificateDateKey);
        if (dateLabel && earnedDate) {
            dateLabel.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(earnedDate));
        }
    }

    const pieChartCourse = document.querySelector("[data-pie-chart-course]");
    if (pieChartCourse && earnedCertificate) {
        const progressValue = pieChartCourse.querySelector("[data-pie-chart-progress]");
        const progressBar = pieChartCourse.querySelector("[data-pie-chart-progress-bar]");
        const chapter = pieChartCourse.querySelector("[data-pie-chart-current-chapter]");
        const quizResult = pieChartCourse.querySelector("[data-pie-chart-quiz-result]");

        if (progressValue) progressValue.textContent = "100%";
        if (progressBar) {
            progressBar.classList.remove("progress-one-percent", "progress-twenty-five-percent", "progress-fifty-percent", "progress-seventy-five-percent");
            progressBar.classList.add("progress-complete");
        }
        if (chapter) chapter.textContent = "Course completed";
        if (quizResult) quizResult.textContent = "Passed with 100%";
    }
})();
