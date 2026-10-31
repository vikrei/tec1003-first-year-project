(() => {
    const tutorial = document.querySelector(".tutorial-card");
    const dismissButton = tutorial?.querySelector(".tutorial-dismiss");
    const showButton = document.querySelector(".tutorial-show");
    if (!tutorial || !dismissButton || !showButton) return;

    const storageKey = "highcharts-dashboard-tutorial-dismissed";
    try {
        tutorial.hidden = localStorage.getItem(storageKey) === "true";
    } catch (error) {
        // The dismiss control remains available if browser storage is disabled.
    }
    showButton.hidden = !tutorial.hidden;

    dismissButton.addEventListener("click", () => {
        tutorial.hidden = true;
        showButton.hidden = false;
        try {
            localStorage.setItem(storageKey, "true");
        } catch (error) {
            // The tutorial stays hidden until the current page is refreshed.
        }
    });

    showButton.addEventListener("click", () => {
        tutorial.hidden = false;
        showButton.hidden = true;
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            // The tutorial remains visible for the current page.
        }
    });
})();
