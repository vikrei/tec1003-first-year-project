import { getProgress, saveStep } from "./services/course-progress.service.js";

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

if (transcriptButton && transcript) {
    transcriptButton.addEventListener("click", () => {
        const isExpanded = transcriptButton.getAttribute("aria-expanded") === "true";
        transcriptButton.setAttribute("aria-expanded", String(!isExpanded));
        transcript.hidden = isExpanded;
    });
}

if (playButton && videoStatus) {
    playButton.addEventListener("click", () => {
        const isShowingStatus = playButton.getAttribute("aria-pressed") === "true";
        playButton.setAttribute("aria-pressed", String(!isShowingStatus));
        playButton.setAttribute("aria-label", isShowingStatus ? "Show video availability" : "Hide video availability");
        videoStatus.hidden = isShowingStatus;
    });
}

const taskButtons = Array.from(document.querySelectorAll(".lesson-page [data-task-step]"));
const nextTaskButton = document.querySelector(".lesson-page [data-next-task]");

if (taskButtons.length) {
    const taskName = document.querySelector("[data-task-name]");
    const taskTitle = document.querySelector("[data-task-title]");
    const taskProgress = document.querySelector("[data-task-progress]");
    const progressFill = document.querySelector("[data-task-progress-bar]");
    const videoTitle = document.querySelector("[data-video-title]");
    const videoImage = document.querySelector(".lesson-video-image");
    const transcriptParts = Array.from(document.querySelectorAll("[data-transcript-part]"));
    const instructionsTitle = document.querySelector("[data-task-instructions-title]");
    const instructionParts = Array.from(document.querySelectorAll("[data-task-instructions-part]"));
    const taskContent = {
        1: {
            name: "First Steps",
            title: "Task 1 - First Steps",
            progress: "25%",
            progressClass: "progress-twenty-five-percent",
            videoTitle: "Learn how to make a pie chart",
            image: "../assets/images/learning-flow-1-chart.png",
            imageAlt: "Pie chart lesson preview",
            transcript: [
                "A pie chart shows how parts add up to a whole. Start with a few categories and a value for each, such as how many people chose each favorite fruit. Add the values to find the total.",
                "In a spreadsheet, select your categories and values, then choose Insert → Chart → Pie. Each slice shows a category’s share of the total. Add a clear title and labels with names and percentages, which should add up to 100%."
            ],
            instructionsTitle: "Task Explanation",
            instructions: [
                "Your task: build a simple pie chart in React. Use a chart library such as Recharts to display this data: Apples 40%, Bananas 35%, and Oranges 25%.",
                "Create a React app, install the library, and build a PieChart component. Give each slice a different color and add a legend with the fruit names. Render the chart in your app and check that all three slices and labels are visible."
            ]
        },
        2: {
            name: "Apply Data",
            title: "Task 2 - Apply Data",
            progress: "50%",
            progressClass: "progress-fifty-percent",
            videoTitle: "Layer Pie Charts with Data",
            image: "../assets/images/learning-flow-task-2.png",
            imageAlt: "A pie chart and data displayed on a tablet",
            transcript: [
                "To create a pie chart in React, start by organizing your data into categories and their corresponding values, like the number of people who prefer each type of fruit. Sum these values to get the total.",
                "In your React component, use a chart library like Chart.js or Recharts. Import your data and configure the pie chart by mapping your categories to the chart slices. Ensure each slice is labeled with the category name and its percentage of the total, which should equal 100%. Don’t forget to add a descriptive title to your chart!"
            ],
            instructionsTitle: "Apply Data to a Pie Chart",
            instructions: [
                "Organize the fruit categories and values, then calculate the total so each slice can show its share of the whole.",
                "Use Chart.js or Recharts to map your categories and values to pie slices. Add labels, percentages, and a descriptive title to your chart."
            ]
        },
        3: {
            name: "Real Life Examples",
            title: "Real Life Application",
            progress: "75%",
            progressClass: "progress-seventy-five-percent",
            videoTitle: "Put what you learned to use",
            image: "../assets/images/learning-flow-task-3.png",
            imageAlt: "People using a large pie chart to discuss real-world data",
            transcript: [
                "Pie charts are widely used in various fields to visually represent data proportions. For instance, in business, they can illustrate market share among competitors, helping stakeholders understand the landscape at a glance.",
                "In education, teachers might use pie charts to show the distribution of grades in a class, making it easier to identify trends in student performance. Additionally, healthcare professionals often utilize pie charts to display patient demographics or the breakdown of health conditions within a population, aiding in resource allocation and planning."
            ],
            instructionsTitle: "Use Pie Charts in Real Life",
            instructions: [
                "Choose a real-world data set with categories that make up a whole, such as market share, class grades, or survey responses.",
                "Create a pie chart that clearly labels each category and its proportion. Add a title and explain what the chart helps its audience understand."
            ]
        }
    };

    let currentTask = 1;

    async function setTask(taskNumber, updateHistory = true) {
        const task = taskContent[taskNumber];
        if (!task) return;

        try {
            await saveStep("build-pie-charts-react", taskNumber + 1);
            lessonStatus.hidden = true;
        } catch (error) {
            lessonStatus.textContent = error.message;
            lessonStatus.hidden = false;
            if (error.message === "Please log in first.") {
                window.location.href = "login.html";
            }
            return;
        }

        currentTask = taskNumber;
        const lessonPage = document.querySelector(".lesson-page");
        if (lessonPage) lessonPage.classList.toggle("lesson-task-three", taskNumber === 3);
        if (taskName) taskName.textContent = task.name;
        if (taskTitle) taskTitle.textContent = task.title;
        if (taskProgress) taskProgress.textContent = task.progress;
        if (progressFill) {
            progressFill.classList.remove("progress-twenty-five-percent", "progress-fifty-percent", "progress-seventy-five-percent");
            progressFill.classList.add(task.progressClass);
        }
        if (videoTitle) videoTitle.textContent = task.videoTitle;
        if (videoImage) {
            videoImage.src = task.image;
            videoImage.alt = task.imageAlt;
        }
        transcriptParts.forEach((part, index) => {
            if (task.transcript[index]) part.textContent = task.transcript[index];
        });
        if (instructionsTitle) instructionsTitle.textContent = task.instructionsTitle;
        instructionParts.forEach((part, index) => {
            if (task.instructions[index]) part.textContent = task.instructions[index];
        });

        taskButtons.forEach((button) => {
            const isCurrent = Number(button.dataset.taskStep) === taskNumber;
            button.classList.toggle("active", isCurrent);
            if (isCurrent) button.setAttribute("aria-current", "step");
            else button.removeAttribute("aria-current");
        });

        const lessonTabsNavigation = document.querySelector(".lesson-tabs");
        if (lessonTabsNavigation) lessonTabsNavigation.hidden = taskNumber === 3;

        if (nextTaskButton) {
            nextTaskButton.disabled = false;
            nextTaskButton.setAttribute("aria-label", taskNumber === 3 ? "Go to the course quiz" : `Go to Task ${taskNumber + 1}`);
        }

        if (transcriptButton && transcript) {
            transcriptButton.setAttribute("aria-expanded", "true");
            transcript.hidden = false;
        }
        if (playButton && videoStatus) {
            playButton.setAttribute("aria-pressed", "false");
            playButton.setAttribute("aria-label", "Show video availability");
            videoStatus.hidden = true;
        }
        const videoTab = lessonTabs.find((tab) => tab.dataset.tab === "video");
        if (videoTab) selectTab(videoTab);

        if (updateHistory) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set("task", String(taskNumber));
            window.history.pushState({ task: taskNumber }, "", currentUrl);
        }
    }

    const lessonStatus = document.createElement("p");
    lessonStatus.className = "course-progress-status";
    lessonStatus.setAttribute("role", "status");
    lessonStatus.hidden = true;
    document.querySelector(".lesson-progress")?.after(lessonStatus);

    taskButtons.forEach((button) => {
        button.addEventListener("click", () => setTask(Number(button.dataset.taskStep)));
    });

    nextTaskButton?.addEventListener("click", () => {
        if (currentTask === 3) {
            window.location.href = "quiz.html";
            return;
        }

        setTask(currentTask + 1);
    });

    window.addEventListener("popstate", () => {
        const taskFromUrl = Number(new URLSearchParams(window.location.search).get("task")) || 1;
        setTask(taskFromUrl, false);
    });

    const requestedTask = Number(new URLSearchParams(window.location.search).get("task")) || 1;
    (async () => {
        try {
            const status = await getProgress("build-pie-charts-react");
            if (status.step === 0) {
                window.location.replace("learning-flow-introduction.html");
                return;
            }
            if (status.attempts >= 3 && !status.passed) {
                window.location.replace("learning-flow-introduction.html?restart=required");
                return;
            }
            const initialTask = Math.min(requestedTask, Math.max(status.step, 1));
            await setTask(initialTask, false);
        } catch (error) {
            lessonStatus.textContent = error.message;
            lessonStatus.hidden = false;
            if (error.message === "Please log in first.") window.location.href = "login.html";
        }
    })();
}
