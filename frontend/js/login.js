import { login } from "./services/auth.service.js";

const loginForm = document.querySelector("#login-form");
const loginTabs = document.querySelectorAll(".login-tab");
const loginButton = loginForm.querySelector("[type='submit']");
const loginStatus = document.createElement("p");
loginStatus.setAttribute("role", "alert");
loginStatus.hidden = true;
loginForm.append(loginStatus);

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

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginStatus.hidden = true;
    loginButton.disabled = true;

    try {
        await login(selectedRole);
        window.location.href = selectedRole === "student" ? "student-dashboard.html" : "admin-dashboard.html";
    } catch (error) {
        loginStatus.textContent = error.message;
        loginStatus.hidden = false;
        loginButton.disabled = false;
    }

});
