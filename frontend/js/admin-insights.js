import { getAdminInsights } from "./services/admin-insights.service.js";

const section = document.querySelector("[data-admin-course-insights]");
if (section) {
    const summary = section.querySelector("[data-admin-course-summary]");
    const students = section.querySelector("[data-admin-course-students]");

    (async () => {
        try {
            const data = await getAdminInsights("build-pie-charts-react");
            section.querySelector("h2").textContent = data.course;
            summary.textContent = `${data.passed_count} of ${data.student_count} students passed.`;

            if (!data.students.length) {
                students.textContent = "No student progress yet.";
                return;
            }

            const list = document.createElement("ul");
            data.students.forEach((student) => {
                const item = document.createElement("li");
                const quizStatus = student.passed ? "Passed" : student.attempts ? `${student.attempts} attempt${student.attempts === 1 ? "" : "s"}` : "Not attempted";
                const lastScore = student.last_score === null ? "No score yet" : `Latest score: ${student.last_score}/4`;
                item.textContent = `${student.name} — ${student.percent}% complete; ${quizStatus}; ${lastScore}`;
                list.append(item);
            });
            students.replaceChildren(list);
        } catch (error) {
            summary.textContent = error.message === "Please log in first." || error.message === "Admins only."
                ? "Please log in with the admin account to view course insights."
                : error.message;
        }
    })();
}
