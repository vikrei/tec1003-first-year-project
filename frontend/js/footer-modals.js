(() => {
    const content = {
        terms: {
            title: "Terms & Privacy",
            body: `<p>Use the Highcharts Course Portal to explore courses, follow lessons, and manage your learning progress. Please keep your account details private and use the portal respectfully.</p><p>We use the information you provide to support your account and improve your learning experience. We do not sell personal information. You can contact our support team with questions about your account or privacy.</p>`
        },
        support: {
            title: "Support",
            body: `<p>If you have questions or need help with a course, please contact our support team:</p><p><strong>Monday–Friday, 08:00–16:00</strong><br><a href="mailto:highcharts@graph.no">highcharts@graph.no</a><br>Phone: 11 22 33 44</p><p>We normally respond within two business days.</p>`
        },
        about: {
            title: "About the App",
            subtitle: "App Version 1.0.0.",
            body: `<p>We’re a team dedicated to making data education clear and approachable. The portal brings courses, practical chart lessons, and learning progress together in one place.</p><p>Our goal is to help every learner build confidence working with charts and data, one lesson at a time.</p>`
        }
    };

    const wrapper = document.createElement("div");
    wrapper.className = "footer-modal-backdrop";
    wrapper.hidden = true;
    wrapper.innerHTML = `
        <section class="footer-modal" role="dialog" aria-modal="true" aria-labelledby="footer-modal-title">
            <header class="footer-modal-header">
                <div>
                    <h2 id="footer-modal-title"></h2>
                    <p class="footer-modal-subtitle" hidden></p>
                </div>
                <button class="footer-modal-close" type="button" aria-label="Close dialog">&times;</button>
            </header>
            <div class="footer-modal-content"></div>
        </section>`;
    document.body.append(wrapper);

    const title = wrapper.querySelector("#footer-modal-title");
    const subtitle = wrapper.querySelector(".footer-modal-subtitle");
    const body = wrapper.querySelector(".footer-modal-content");
    const closeButton = wrapper.querySelector(".footer-modal-close");
    let returnFocusTo = null;

    const close = () => {
        wrapper.hidden = true;
        document.body.classList.remove("footer-modal-open");
        returnFocusTo?.focus();
    };

    document.querySelectorAll("[data-modal]").forEach((link) => {
        link.addEventListener("click", (event) => {
            const modal = content[link.dataset.modal];
            if (!modal) return;
            event.preventDefault();
            returnFocusTo = link;
            title.textContent = modal.title;
            subtitle.textContent = modal.subtitle || "";
            subtitle.hidden = !modal.subtitle;
            body.innerHTML = modal.body;
            wrapper.hidden = false;
            document.body.classList.add("footer-modal-open");
            closeButton.focus();
        });
    });

    closeButton.addEventListener("click", close);
    wrapper.addEventListener("click", (event) => {
        if (event.target === wrapper) close();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !wrapper.hidden) close();
    });
})();
