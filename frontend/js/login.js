const loginForm = document.querySelector("#login-form");
const loginTabs = document.querySelectorAll(".login-tab");

let selectedRole = "student";

loginTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        selectedRole = tab.dataset.role;

        loginTabs.forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-pressed", "true");
    });
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (selectedRole === "student") {
        window.location.href = "student-dashboard.html";
    }

    if (selectedRole === "admin") {
        window.location.href = "admin-dashboard.html";
    }
});
