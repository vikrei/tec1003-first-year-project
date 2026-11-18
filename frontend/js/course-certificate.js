import { getProgress } from "./services/course-progress.service.js";

(async () => {
    try {
        const status = await getProgress("build-pie-charts-react");
        if (!status.passed) {
            window.location.replace("my-courses.html");
            return;
        }

        const certificate = document.querySelector("[data-certificate-content]");
        if (certificate) certificate.hidden = false;
        const dateLine = document.querySelector(".certificate-date");
        if (dateLine) dateLine.hidden = true;
        document.querySelector("[data-print-certificate]")?.addEventListener("click", () => window.print());
    } catch (error) {
        if (error.message === "Please log in first.") {
            window.location.replace("login.html");
            return;
        }
        window.location.replace("my-courses.html");
    }
})();
