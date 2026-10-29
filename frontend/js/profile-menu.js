const profileMenuButton = document.querySelector(".profile-menu-button[aria-controls='student-profile-menu']");

if (profileMenuButton) {
    const menuMarkup = `
        <section class="student-profile-menu" id="student-profile-menu" aria-label="Student profile menu" hidden>
            <header class="student-profile-menu-header">
                <div>
                    <h2>Alex Liland</h2>
                    <p>Student</p>
                </div>
                <img src="../assets/images/profile-image-student.png" alt="">
            </header>
            <nav class="student-profile-menu-links" role="menu" aria-label="Profile navigation">
                <a href="student-dashboard.html" role="menuitem">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>
                    <span>Home</span>
                </a>
                <a href="my-courses.html" role="menuitem">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 1 2.5 2z" /></svg>
                    <span>My Courses</span>
                </a>
                <a href="courses.html" role="menuitem">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h8" /></svg>
                    <span>All Courses</span>
                </a>
                <a href="profile.html" role="menuitem">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2A1.7 1.7 0 0 0 5.4 5.8l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9z" /></svg>
                    <span>Profile &amp; Settings</span>
                </a>
                <a href="index.html" role="menuitem">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" /></svg>
                    <span>Log out</span>
                </a>
            </nav>
        </section>
    `;

    const menuWrapper = document.createElement("div");
    menuWrapper.innerHTML = menuMarkup;
    document.body.append(menuWrapper.firstElementChild);

    const profileMenu = document.querySelector("#student-profile-menu");
    const menuItems = Array.from(profileMenu.querySelectorAll("[role='menuitem']"));

    function closeMenu(restoreFocus = false) {
        profileMenu.hidden = true;
        profileMenuButton.setAttribute("aria-expanded", "false");
        if (restoreFocus) profileMenuButton.focus();
    }

    function openMenu() {
        profileMenu.hidden = false;
        profileMenuButton.setAttribute("aria-expanded", "true");
        menuItems[0].focus();
    }

    profileMenuButton.addEventListener("click", () => {
        if (profileMenu.hidden) openMenu();
        else closeMenu();
    });

    profileMenu.addEventListener("keydown", (event) => {
        const currentIndex = menuItems.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (event.key === "Tab") {
            closeMenu();
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu(true);
            return;
        }

        if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % menuItems.length;
        if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = menuItems.length - 1;

        if (nextIndex !== currentIndex) {
            event.preventDefault();
            menuItems[nextIndex].focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!profileMenu.hidden && !profileMenu.contains(event.target) && !profileMenuButton.contains(event.target)) {
            closeMenu();
        }
    });
}
