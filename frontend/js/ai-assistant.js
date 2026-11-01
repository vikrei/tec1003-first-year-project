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
                <div class="ai-messages" role="log" aria-live="polite" aria-label="Conversation"></div>
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
    const messages = document.querySelector(".ai-messages");
    let lastFocusedElement;

    // Adds one message to the conversation box
    // role is "user" or "assistant"; links is an optional list of {label, url}
    function addMessage(role, text, links = []) {
        const message = document.createElement("div");
        message.className = `ai-message ai-message-${role}`;

        const label = document.createElement("span");
        label.className = "ai-message-label";
        label.textContent = role === "user" ? "You" : "Assistant";

        const body = document.createElement("p");
        body.textContent = text; // textContent shows plain text and never runs html

        message.append(label, body);

        links.forEach((link) => {
            const anchor = document.createElement("a");
            anchor.className = "ai-message-link";
            anchor.href = link.url;
            anchor.textContent = link.label;
            message.append(anchor);
        });

        messages.append(message);
        messages.scrollTop = messages.scrollHeight; // scrolls to the newest message
    }

    // Function: Suggestions for FAQ in Ask Ai -------------------------

    // ex questions a user can click instead of typing
    const suggestedQuestions = [
        "How do I continue my course?",
        "Where do I find my progress?",
        "How do I find a new course?",
        "How do I contact a teacher?",
    ];

    let suggestionsShown = false;

    // greeting with clickable example questions (only once per page visit)
    function showSuggestions() {
        if (suggestionsShown) return;
        suggestionsShown = true;

        const message = document.createElement("div");
        message.className = "ai-message ai-message-assistant";

        const label = document.createElement("span");
        label.className = "ai-message-label";
        label.textContent = "Assistant";

        const body = document.createElement("p");
        body.textContent = "Hi! I can help with common questions. Pick one or write your own:";

        const list = document.createElement("div");
        list.className = "ai-suggestions";

        suggestedQuestions.forEach((question) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "ai-suggestion";
            chip.textContent = question;
            chip.addEventListener("click", () => {
                questionField.value = question;
                form.requestSubmit(); // runs same code as the Send button
            });
            list.append(chip);
        });

        message.append(label, body, list);
        messages.append(message);
    }

    // Function: Open Modal & Function Close Modal ----------------------

    function openModal() {
        lastFocusedElement = document.activeElement;
        backdrop.hidden = false;
        document.body.classList.add("ai-modal-open");
        showSuggestions(); // CS: greeting with example questions
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

    // ---------------------------------------------------------------

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

    // Ask AI Help Button ----------------------------------------------------

    const helpText = "Enter a question, then select Send.";

    // first click on "?" shows the hint, a second click hides it again
    helpButton.addEventListener("click", () => {
        const hintIsShown = !status.hidden && status.textContent === helpText;
        status.textContent = hintIsShown ? "" : helpText;
        status.hidden = hintIsShown;
    });

    // hides hint when user starts typing
    questionField.addEventListener("input", () => {
        if (status.textContent === helpText) status.hidden = true;
    });

    // --------------------------------------------------------------------------

    // Function: Message writing & receiving answer ----------------------


    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const question = questionField.value.trim();
        if (!question) return; // ignore empty or space-only messages

        addMessage("user", question);
        questionField.value = "";
        status.textContent = "Thinking...";
        status.hidden = false;

        try {
            // Send the question to the Flask endpoint as JSON
            const response = await fetch("/api/help", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }

            addMessage("assistant", data.answer, data.links);
            status.hidden = true;
        } catch (error) {
            status.textContent = "Something went wrong. Please try again.";
        }
    });

     // Enter sends the message, Shift+Enter starts a new line
        questionField.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            form.requestSubmit(); // runs the same submit code as the Send button
            }   
        });
}
