(() => {
    const certificateKey = "pie-chart-react-certificate-earned";
    const dateKey = "pie-chart-react-certificate-date";
    const earned = (() => {
        try {
            return window.localStorage.getItem(certificateKey) === "true";
        } catch (error) {
            return false;
        }
    })();

    if (!earned) {
        window.location.replace("my-courses.html");
        return;
    }

    let earnedDate = null;
    try {
        earnedDate = window.localStorage.getItem(dateKey);
    } catch (error) {
        earnedDate = null;
    }

    const date = earnedDate ? new Date(earnedDate) : new Date();
    const certificate = document.querySelector("[data-certificate-content]");
    if (certificate) certificate.hidden = false;
    const dateLabel = document.querySelector("[data-certificate-date]");
    if (dateLabel) {
        dateLabel.dateTime = date.toISOString();
        dateLabel.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
    }

    document.querySelector("[data-print-certificate]")?.addEventListener("click", () => window.print());
})();
