(() => {
    const storageKey = "highcharts-course-portal-theme";
    const root = document.documentElement;

    let theme = "light";
    try {
        theme = localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
    } catch (error) {
        // The toggle still works for this page when browser storage is unavailable.
    }

    const applyTheme = (nextTheme) => {
        theme = nextTheme;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;

        document.querySelectorAll(".theme-toggle").forEach((button) => {
            button.setAttribute("aria-checked", String(theme === "dark"));
            button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
            button.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
        });
    };

    applyTheme(theme);

    document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const nextTheme = theme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            try {
                localStorage.setItem(storageKey, nextTheme);
            } catch (error) {
                // Keep the selected theme active for the current page.
            }
        });
    });
})();
