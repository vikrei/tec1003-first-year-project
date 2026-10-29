const askAiButton = document.querySelector(".ask-ai-button");

if (askAiButton) {
    const modalMarkup = `
        <div class="ai-modal-backdrop" hidden>
            <section class="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" aria-describedby="ai-modal-description">
                <header class="ai-modal-header">
                    <span class="ai-sparkle" aria-hidden="true">
                        <img src="../assets/icons/ai-upscale-spark--magnifier-zoom-view-find-search-ai.svg" alt="">
                    </span>
                    <div class="ai-modal-heading">
                        <h2 id="ai-modal-title">Ask AI</h2>
                        <p id="ai-modal-description">Write a question or describe what you need help with</p>
                    </div>
                    <button type="button" class="ai-close-button" aria-label="Close Ask AI">×</button>
                </header>
                <form class="ai-modal-form">
                    <label class="visually-hidden" for="ai-question">Your question</label>
                    <textarea id="ai-question" name="question" rows="3" placeholder="Where do I find my Profile Settings?" required></textarea>
                    <div class="ai-modal-actions">
                        <button type="submit" class="ai-send-button">Send</button>
                        <button type="button" class="ai-help-button" aria-label="Ask AI help" title="Ask AI help">?</button>
                    </div>
                    <p class="ai-modal-status" role="status" hidden></p>
                </form>
            </section>
        </div>
    `;

    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = modalMarkup;
    document.body.append(modalWrapper.firstElementChild);

    const backdrop = document.querySelector(".ai-modal-backdrop");
    const closeButton = document.querySelector(".ai-close-button");
    const questionField = document.querySelector("#ai-question");
    const form = document.querySelector(".ai-modal-form");
    const status = document.querySelector(".ai-modal-status");
    const helpButton = document.querySelector(".ai-help-button");
    let lastFocusedElement;

    function openModal() {
        lastFocusedElement = document.activeElement;
        backdrop.hidden = false;
        document.body.classList.add("ai-modal-open");
        questionField.focus();
    }

    function closeModal() {
        backdrop.hidden = true;
        document.body.classList.remove("ai-modal-open");
        askAiButton.focus();
        if (lastFocusedElement && lastFocusedElement !== askAiButton) {
            lastFocusedElement.focus();
        }
    }

    askAiButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (backdrop.hidden) return;

        if (event.key === "Escape") {
            closeModal();
            return;
        }

        if (event.key === "Tab") {
            const focusableElements = Array.from(
                backdrop.querySelectorAll("button:not(:disabled), textarea")
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });

    helpButton.addEventListener("click", () => {
        status.textContent = "Enter a question about your course, then select Send.";
        status.hidden = false;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        status.textContent = "The AI assistant is not connected yet.";
        status.hidden = false;
    });
}
