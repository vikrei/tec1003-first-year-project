const lessonTabs = Array.from(document.querySelectorAll(".lesson-tab"));
const lessonPanels = Array.from(document.querySelectorAll(".lesson-panel"));
const transcriptButton = document.querySelector(".transcript-button");
const transcript = document.querySelector("#lesson-transcript");
const playButton = document.querySelector(".play-button");
const videoStatus = document.querySelector(".video-status");

function selectTab(tab) {
    const selectedTab = tab.dataset.tab;

    lessonTabs.forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle("active", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
    });

    lessonPanels.forEach((panel) => {
        panel.hidden = panel.id !== `${selectedTab}-panel`;
    });
}

lessonTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") nextIndex = (index + 1) % lessonTabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + lessonTabs.length) % lessonTabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = lessonTabs.length - 1;

        if (nextIndex !== index) {
            event.preventDefault();
            lessonTabs[nextIndex].focus();
            selectTab(lessonTabs[nextIndex]);
        }
    });
});

transcriptButton.addEventListener("click", () => {
    const isExpanded = transcriptButton.getAttribute("aria-expanded") === "true";
    transcriptButton.setAttribute("aria-expanded", String(!isExpanded));
    transcript.hidden = isExpanded;
});

playButton.addEventListener("click", () => {
    const isShowingStatus = playButton.getAttribute("aria-pressed") === "true";
    playButton.setAttribute("aria-pressed", String(!isShowingStatus));
    playButton.setAttribute("aria-label", isShowingStatus ? "Show video availability" : "Hide video availability");
    videoStatus.hidden = isShowingStatus;
});
