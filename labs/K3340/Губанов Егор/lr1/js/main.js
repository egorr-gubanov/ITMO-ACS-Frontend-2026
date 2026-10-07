"use strict";

const typeFilter = document.querySelector("#typeFilter");
const levelFilter = document.querySelector("#levelFilter");
const durationFilter = document.querySelector("#durationFilter");
const searchFilter = document.querySelector("#searchFilter");
const trainingItems = [...document.querySelectorAll(".training-item")];

function filterTrainings() {
    if (!trainingItems.length) return;

    const type = typeFilter.value;
    const level = levelFilter.value;
    const maxMinutes = Number(durationFilter.value);
    const query = searchFilter.value.trim().toLowerCase();
    let visibleCount = 0;

    trainingItems.forEach((item) => {
        const matches =
            (type === "all" || item.dataset.type === type) &&
            (level === "all" || item.dataset.level === level) &&
            Number(item.dataset.minutes) <= maxMinutes &&
            item.textContent.toLowerCase().includes(query);

        item.hidden = !matches;
        if (matches) visibleCount += 1;
    });

    document.querySelector("#resultsCount").textContent =
        `Найдено занятий: ${visibleCount}`;
    document.querySelector("#emptyResults").hidden = visibleCount !== 0;
}

[typeFilter, levelFilter, durationFilter, searchFilter].forEach((control) => {
    control?.addEventListener("input", filterTrainings);
});
filterTrainings();

document.querySelectorAll("[data-join]").forEach((button) => {
    button.addEventListener("click", () => {
        button.textContent = "Ты записан(а)";
        button.setAttribute("aria-pressed", "true");
    });
});

document.querySelectorAll(".needs-validation").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add("was-validated");

        if (!form.checkValidity()) return;

        const message = form.querySelector(".form-message");
        if (message) {
            message.textContent = "Готово! Это демонстрационный режим формы.";
        }
    });
});

const planChecks = [...document.querySelectorAll(".plan-check")];

if (planChecks.length) {
    const saved = localStorage.getItem("fitflow-plan");
    const savedValues = saved ? JSON.parse(saved) : ["monday", "wednesday"];

    planChecks.forEach((check) => {
        check.checked = savedValues.includes(check.value);
        check.addEventListener("change", savePlan);
    });

    function savePlan() {
        const completed = planChecks
            .filter((check) => check.checked)
            .map((check) => check.value);

        localStorage.setItem("fitflow-plan", JSON.stringify(completed));
        updateProgress(completed.length);
    }

    function updateProgress(count) {
        const percentage = Math.round((count / planChecks.length) * 100);
        document.querySelector("#completedCount").textContent = count;
        document.querySelector("#planProgress").style.width = `${percentage}%`;
        document.querySelector(".brutal-progress")
            .setAttribute("aria-valuenow", percentage);
    }

    updateProgress(planChecks.filter((check) => check.checked).length);
}

const timer = document.querySelector("#timer");

if (timer) {
    const moves = [...document.querySelectorAll("#sessionSteps li")];
    const moveTitle = document.querySelector("#currentMove");
    const toggleButton = document.querySelector("#timerToggle");
    const nextButton = document.querySelector("#nextMove");
    let seconds = 40;
    let moveIndex = 0;
    let interval = null;

    function renderTimer() {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const remainder = String(seconds % 60).padStart(2, "0");
        timer.textContent = `${minutes}:${remainder}`;
    }

    function nextMove() {
        moveIndex = (moveIndex + 1) % moves.length;
        moves.forEach((move, index) => {
            move.classList.toggle("current-step", index === moveIndex);
        });
        moveTitle.textContent = moves[moveIndex].textContent;
        seconds = 40;
        renderTimer();
    }

    toggleButton.addEventListener("click", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
            toggleButton.textContent = "Продолжить";
            return;
        }

        toggleButton.textContent = "Пауза";
        interval = setInterval(() => {
            if (seconds > 0) {
                seconds -= 1;
                renderTimer();
            } else {
                clearInterval(interval);
                interval = null;
                toggleButton.textContent = "Начать";
                nextMove();
            }
        }, 1000);
    });

    nextButton.addEventListener("click", nextMove);
    renderTimer();
}

const blogButtons = [...document.querySelectorAll(".blog-filter")];
const articleItems = [...document.querySelectorAll(".article-item")];

blogButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        blogButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        articleItems.forEach((article) => {
            article.hidden =
                category !== "all" && article.dataset.category !== category;
        });
    });
});