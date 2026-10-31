(() => {
    const page = document.querySelector(".courses-page");
    if (!page) return;

    const cards = Array.from(page.querySelectorAll(".course-card"));
    const levelButtons = Array.from(page.querySelectorAll("[data-level-filter]"));
    const categorySelect = page.querySelector("#course-category");
    const moreButton = page.querySelector(".course-more");
    let selectedLevel = null;
    let showAll = false;

    const hasActiveFilter = () => Boolean(
        selectedLevel || (categorySelect && categorySelect.value !== "all")
    );

    const matchesFilters = (card) => {
        const levelMatches = !selectedLevel || card.dataset.level === selectedLevel;
        const categoryMatches = !categorySelect || categorySelect.value === "all" || card.dataset.category === categorySelect.value;
        return levelMatches && categoryMatches;
    };

    const updateCourseList = () => {
        cards.forEach((card) => {
            card.hidden = !matchesFilters(card) || (card.hasAttribute("data-extra") && !showAll);
        });

        const hiddenExtraCount = cards.filter((card) => card.hasAttribute("data-extra") && matchesFilters(card)).length;
        if (moreButton) {
            moreButton.hidden = hiddenExtraCount === 0;
            moreButton.setAttribute("aria-expanded", String(showAll));
            moreButton.innerHTML = showAll
                ? 'Show fewer results <span aria-hidden="true">⌃</span>'
                : `${hiddenExtraCount} more results <span aria-hidden="true">⌄</span>`;
        }
    };

    levelButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedLevel = selectedLevel === button.dataset.levelFilter ? null : button.dataset.levelFilter;
            levelButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button && selectedLevel !== null)));
            showAll = hasActiveFilter();
            updateCourseList();
        });
    });

    categorySelect?.addEventListener("change", () => {
        showAll = hasActiveFilter();
        updateCourseList();
    });

    moreButton?.addEventListener("click", () => {
        showAll = !showAll;
        updateCourseList();
    });

    const bookmarkKey = "highcharts-course-bookmarks";
    let savedBookmarks = [];
    try {
        savedBookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
        if (!Array.isArray(savedBookmarks)) savedBookmarks = [];
    } catch (error) {
        savedBookmarks = [];
    }

    const bookmarkButtons = Array.from(page.querySelectorAll("[data-bookmark]"));
    const syncBookmarks = () => {
        bookmarkButtons.forEach((button) => {
            const bookmarked = savedBookmarks.includes(button.dataset.bookmark);
            button.setAttribute("aria-pressed", String(bookmarked));
            button.setAttribute("aria-label", `${bookmarked ? "Remove bookmark for" : "Bookmark"} ${button.dataset.bookmarkLabel || button.getAttribute("aria-label").replace(/^(Bookmark|Remove bookmark for) /, "")}`);
        });
    };

    bookmarkButtons.forEach((button) => {
        button.dataset.bookmarkLabel = button.getAttribute("aria-label").replace(/^(Bookmark|Remove bookmark for) /, "");
        button.addEventListener("click", () => {
            const id = button.dataset.bookmark;
            savedBookmarks = savedBookmarks.includes(id)
                ? savedBookmarks.filter((item) => item !== id)
                : [...savedBookmarks, id];
            syncBookmarks();
            try {
                localStorage.setItem(bookmarkKey, JSON.stringify(savedBookmarks));
            } catch (error) {
                // Bookmark changes remain active for this page session.
            }
        });
    });

    updateCourseList();
    syncBookmarks();
})();
