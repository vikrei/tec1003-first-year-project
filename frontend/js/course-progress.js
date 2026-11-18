import { getProgress, resetCourse, saveStep } from "./services/course-progress.service.js";

const COURSE = "build-pie-charts-react";
const progressClasses = ["progress-one-percent", "progress-twenty-five-percent", "progress-fifty-percent", "progress-seventy-five-percent", "progress-ninety-percent", "progress-complete"];

function resumeUrl(status) {
    if (status.passed) return "course-certificate.html";
    if (status.attempts >= 3) return "learning-flow-introduction.html?restart=required";
    if (status.step >= 5) return "quiz.html";
    if (status.step >= 2) return `lesson.html?task=${Math.min(status.step - 1, 3)}`;
    if (status.step === 1) return "lesson.html?task=1";
    return "learning-flow-introduction.html";
}

function setLinkLabel(link, label) {
    const icon = link.querySelector("img");
    const textNode = Array.from(link.childNodes).find((node) => (
        node.nodeType === Node.TEXT_NODE && (!icon || node.textContent.trim())
    ));
    if (textNode) {
        textNode.textContent = icon ? ` ${label}` : label;
    } else {
        link.append(document.createTextNode(icon ? ` ${label}` : label));
    }
}

function showProgress(status) {
    const percent = status.percent;
    document.querySelectorAll("[data-course-progress-value], [data-pie-chart-progress]").forEach((element) => {
        element.textContent = `${percent}%`;
    });

    document.querySelectorAll("[data-course-progress-bar], [data-pie-chart-progress-bar]").forEach((bar) => {
        bar.classList.remove(...progressClasses);
        bar.classList.add(percent >= 100 ? "progress-complete" : percent >= 90 ? "progress-ninety-percent" : percent >= 75 ? "progress-seventy-five-percent" : percent >= 50 ? "progress-fifty-percent" : percent >= 25 ? "progress-twenty-five-percent" : "progress-one-percent");
        bar.style.width = `${Math.max(percent, 1)}%`;
    });

    document.querySelectorAll("[data-pie-chart-current-chapter]").forEach((element) => {
        element.textContent = status.passed ? "Course completed" : status.step >= 5 ? "Quiz" : status.step >= 2 ? `Task ${Math.min(status.step - 1, 3)} - Pie Charts` : "Introduction";
    });

    document.querySelectorAll("[data-pie-chart-quiz-result]").forEach((element) => {
        element.textContent = status.passed ? "Passed" : status.attempts ? `${status.attempts} quiz attempt${status.attempts === 1 ? "" : "s"}` : "Not attempted";
    });

    document.querySelectorAll("[data-earned-course-certificate]").forEach((element) => {
        element.hidden = !status.passed;
    });

    document.querySelectorAll("[data-dashboard-progress-value]").forEach((element) => {
        element.textContent = `${percent}% complete`;
    });

    document.querySelectorAll("[data-dashboard-course-count]").forEach((element) => {
        element.textContent = status.step > 0 ? "1 started" : "0 started";
    });

    document.querySelectorAll("[data-course-resume]").forEach((link) => {
        link.href = resumeUrl(status);
        if (status.passed) setLinkLabel(link, link.dataset.completedLabel || "View Certificate");
        else if (status.attempts >= 3) setLinkLabel(link, link.dataset.restartLabel || "Restart Course");
        else if (status.step > 0) setLinkLabel(link, link.dataset.continueLabel || "Continue Course");
    });
}

async function loadProgress() {
    try {
        const status = await getProgress(COURSE);
        showProgress(status);
        return status;
    } catch (error) {
        const target = document.querySelector("[data-course-status]") || document.querySelector("main");
        if (target) {
            const message = document.createElement("p");
            message.className = "course-progress-status";
            message.setAttribute("role", "status");
            message.textContent = error.message === "Please log in first." ? "Please log in to view and save your course progress." : error.message;
            target.prepend(message);
        }
        return null;
    }
}

const intro = document.querySelector(".course-introduction-page");
if (intro) {
    const pageUrl = new URL(window.location.href);
    const statusMessage = intro.querySelector("[data-course-status]");
    const startLink = intro.querySelector("[data-course-start]");
    const startLabel = intro.querySelector("[data-course-start-label]");
    const restartRequired = pageUrl.searchParams.get("restart") === "required";

    if (restartRequired) {
        if (startLink) startLink.href = "learning-flow-introduction.html?restart=1";
        if (startLabel) startLabel.textContent = "Restart Course";
        if (statusMessage) {
            statusMessage.textContent = "All quiz attempts were used. Restart the course to try the quiz again.";
            statusMessage.hidden = false;
        }
    }

    (async () => {
        try {
            if (pageUrl.searchParams.get("restart") === "1") {
                await resetCourse(COURSE);
                pageUrl.searchParams.delete("restart");
                window.history.replaceState({}, "", pageUrl);
                if (statusMessage) {
                    statusMessage.textContent = "Course progress has been reset. Start again from the introduction.";
                    statusMessage.hidden = false;
                    statusMessage.classList.add("is-reset");
                }
            }

            const status = await saveStep(COURSE, 1);
            showProgress(status);
            if (startLink && !restartRequired) {
                startLink.href = resumeUrl(status);
                if (status.step > 1 && startLabel) startLabel.textContent = "Continue Course";
                if (status.passed && startLabel) startLabel.textContent = "View Certificate";
                if (status.attempts >= 3 && startLabel) startLabel.textContent = "Restart Course";
            }
        } catch (error) {
            if (error.message === "Please log in first.") {
                if (statusMessage) {
                    statusMessage.textContent = "Please log in before starting this course.";
                    statusMessage.hidden = false;
                }
                if (startLink) startLink.href = "login.html";
            } else if (error.message.includes("earlier steps")) {
                if (startLabel) startLabel.textContent = "Continue Course";
                if (startLink) startLink.href = "lesson.html?task=1";
            } else if (statusMessage) {
                statusMessage.textContent = error.message;
                statusMessage.hidden = false;
            }
            await loadProgress();
        }
    })();
}

if (document.querySelector("[data-pie-chart-course], [data-dashboard-progress-card], [data-earned-course-certificate], [data-course-resume]")) {
    loadProgress();
}

const reviseButton = document.querySelector(".revise-button");
reviseButton?.addEventListener("click", async () => {
    reviseButton.disabled = true;
    try {
        await resetCourse(COURSE);
        window.location.href = "learning-flow-introduction.html";
    } catch (error) {
        reviseButton.disabled = false;
        window.alert(error.message);
    }
});
