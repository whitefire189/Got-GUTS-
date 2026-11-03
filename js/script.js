/* =========================================================
   GOT GUTS? ...WE'LL SEE.
   APPLICATION ENGINE // BUILD 03
   ========================================================= */


/* 01. DOM REFERENCES
   --------------------------------------------------------- */

const elements = {
    // Screens
    boot: document.getElementById("boot-screen"),
    story: document.getElementById("story-screen"),
    quiz: document.getElementById("quiz-screen"),
    results: document.getElementById("results-screen"),
    certificate: document.getElementById("certificate-screen"),
    warning: document.getElementById("warning-screen"),
    credits: document.getElementById("credits-screen"),

    // Welcome
    startButton: document.getElementById("start-button"),

    // Story
    storyOutput: document.getElementById("story-output"),
    storyStatus: document.getElementById("story-status"),
    storyProgress: document.getElementById("story-progress"),
    storyProgressText: document.getElementById("story-progress-text"),
    storyProgressFill: document.getElementById("story-progress-fill"),
    pauseButton: document.getElementById("pause-button"),
    skipButton: document.getElementById("skip-button"),
    jumpscareToggle: document.getElementById("jumpscare-toggle"),

    // Jumpscares
    jumpscareOverlay: document.getElementById("jumpscare-overlay"),
    jumpscareVideo: document.getElementById("jumpscare-video"),

    // Quiz
    quizForm: document.getElementById("quiz-form"),
    quizQuestions: document.getElementById("quiz-questions"),
    quizProgress: document.getElementById("quiz-progress"),
    quizProgressText: document.getElementById("quiz-progress-text"),
    quizProgressFill: document.getElementById("quiz-progress-fill"),
    quizFeedback: document.getElementById("quiz-feedback"),

    // Results
    scoreValue: document.getElementById("score-value"),
    resultMessage: document.getElementById("result-message"),
    certificateButton: document.getElementById("certificate-button"),

    // Certificate
    certificateForm: document.getElementById("certificate-form"),
    participantName: document.getElementById("participant-name"),
    generatedCertificate: document.getElementById("generated-certificate"),
    certificateRecipient: document.getElementById("certificate-recipient-name"),
    certificateScore: document.getElementById("certificate-score"),
    certificateDate: document.getElementById("certificate-date"),
    downloadButton: document.getElementById("download-certificate-button"),
    printButton: document.getElementById("print-certificate-button"),
    restartButton: document.getElementById("restart-button"),

    // Notifications
    notification: document.getElementById("system-notification"),
    notificationMessage: document.getElementById("notification-message")
};


/* 02. APPLICATION STATE
   --------------------------------------------------------- */

const state = {
    currentScreen: "boot",

    currentPassage: 0,
    currentCharacter: 0,

    isTyping: false,
    isPaused: false,
    storyCompleted: false,

    jumpscaresEnabled: true,
    isJumpscarePlaying: false,

    score: 0,
    participant: "",

    typingTimer: null,
    passageTimer: null,
    jumpscareTimer: null,
    jumpscareDurationTimer: null,
    notificationTimer: null
};


/* 03. STORY DATA
   --------------------------------------------------------- */

const storyPassages = [
    {
        text: "STORY TRANSMISSION INCOMING...",
        pause: 1200
    },
    {
        text: "\n\nConnection established.",
        pause: 1500
    },
    {
        text: "STORY: FIRST WORDS...",
        pause: 1500
    },
    {
        text: "\n\nAny day now, she'll say her first words.",
        pause: 1800
    },
    {
        text: "\n\nAny day now, she'll say her first words.",
        pause: 1800
    },
    {
        text: "I don't mind it though. I still believe I'll win. When we first brought her home, she would scream and cry and nothing my wife would say could calm her down, but I knew just how to hold her to help her fall asleep.",
        pause: 1500
    },
    {
        text: "\n\nOur daughter was a daddy's girl - my wife needed all the handicaps she could get.",
        pause: 1200
    },
    {
        text: "I sit our daughter in her chair and my wife and I begin babbling like chickens - 'Mama!' 'Daddy!' 'Say Mama!' 'Who's daddy's baby?'",
        pause: 2500
    },
    {
        text: "I pull the gag from our little girl's mouth. P-please... what do you want from me? Please let me go...",
        pause: 2500,
        triggerSound: "cry"
    },
    {
        text: `My wife's smile falls from her face. With a heavy heart, I put the gag back in as the girl starts to scream. I take her back to the room, locking her in and shutting the lights out. When I return, I find my wife crying. "It's ok, honey," I tell her, "The next one will be better. I promise."`,
        pause: 2500,
        triggerSound: "doorClose"
    },
    {
        text: "\n\nEND OF TEST TRANSMISSION.",
        pause: 0
    }
];

const totalStoryCharacters = storyPassages.reduce(
    (total, passage) => total + passage.text.length,
    0
);
/* 04. JUMPSCARE VIDEO LIBRARY
   --------------------------------------------------------- */

const jumpscareFiles = [
    "doll.mp4",
    "jeff.mp4",
    "scarecrow.mp4",
    "scp.mp4",
    "spider.mp4"
];

const JUMPSCARE_MIN_DELAY = 12000;
const JUMPSCARE_MAX_DELAY = 18000;
const JUMPSCARE_DURATION = 3000;


/* 05. QUIZ DATABASE
   --------------------------------------------------------- */

const quizQuestions = [
    {
        prompt: "The narrator described their daughter as a daddy's _____.",
        answers: ["girl"]
    },
    {
        prompt: "What did the narrator pull from the little girl's mouth?",
        answers: ["gag"]
    },
    {
        prompt: "Where did the narrator take the girl after she screamed?",
        answers: ["room", "her room", "the room"]
    },
    {
        prompt: "What was the narrator's wife doing when he returned?",
        answers: ["crying"]
    },
    {
        prompt: "Complete the narrator's promise: 'The next one will be _____. I promise.'",
        answers: ["better"]
    }
];


/* 06. SCREEN MANAGEMENT
   --------------------------------------------------------- */

const screens = {
    warning: elements.warning,
    boot: elements.boot,
    story: elements.story,
    credits: elements.credits,
    quiz: elements.quiz,
    results: elements.results,
    certificate: elements.certificate
};

function showScreen(screenName) {
    const nextScreen = screens[screenName];

    if (!nextScreen) {
        console.error(`Unknown screen: ${screenName}`);
        return;
    }

    Object.entries(screens).forEach(([name, screen]) => {
        if (screen) {
            screen.classList.toggle("hidden", name !== screenName);
        }
    });

    state.currentScreen = screenName;
}


/* 07. SYSTEM NOTIFICATIONS
   --------------------------------------------------------- */

function notify(message, duration = 2600) {
    clearTimeout(state.notificationTimer);

    elements.notificationMessage.textContent = message;
    elements.notification.classList.remove("hidden");

    state.notificationTimer = setTimeout(() => {
        elements.notification.classList.add("hidden");
    }, duration);
}


/* 08. STORY PROGRESS
   --------------------------------------------------------- */

function updateStoryProgress() {
    const completedCharacters = storyPassages
        .slice(0, state.currentPassage)
        .reduce((total, passage) => total + passage.text.length, 0)
        + state.currentCharacter;

    const percentage = Math.min(
        100,
        Math.round((completedCharacters / totalStoryCharacters) * 100)
    );

    elements.storyProgressText.textContent = `${percentage}%`;
    elements.storyProgressFill.style.width = `${percentage}%`;

    elements.storyProgress.setAttribute(
        "aria-valuenow",
        percentage
    );
}


/* 09. STORY TYPEWRITER ENGINE
   --------------------------------------------------------- */

function typeNextCharacter() {
    if (!state.isTyping || state.isPaused) {
        return;
    }

    const passage = storyPassages[state.currentPassage];

    if (!passage) {
        completeStory();
        return;
    }

    // Trigger specific sound logic right as the passage begins typing
    if (state.currentCharacter === 0) {
        if (passage.triggerSound === "cry") {
            playSound("cry");
        } else if (passage.triggerSound === "doorClose") {
            playSound("doorClose");
        }
    }

    if (state.currentCharacter < passage.text.length) {
        elements.storyOutput.textContent +=
            passage.text.charAt(state.currentCharacter);

        state.currentCharacter++;

        updateStoryProgress();

        elements.storyOutput.parentElement.scrollTop =
            elements.storyOutput.parentElement.scrollHeight;

        state.typingTimer = setTimeout(
            typeNextCharacter,
            35
        );

        return;
    }

    const pauseDuration = passage.pause;

    state.currentPassage++;
    state.currentCharacter = 0;

    if (state.currentPassage >= storyPassages.length) {
        completeStory();
        return;
    }

    state.passageTimer = setTimeout(() => {
        if (!state.isPaused && state.isTyping) {
            typeNextCharacter();
        }
    }, pauseDuration);
}


function beginStory() {
    clearTimeout(state.typingTimer);
    clearTimeout(state.passageTimer);

    state.currentPassage = 0;
    state.currentCharacter = 0;

    state.isTyping = true;
    state.isPaused = false;
    state.storyCompleted = false;

    elements.storyOutput.textContent = "";

    elements.storyStatus.textContent =
        "■ RECEIVING DATA...";

    elements.pauseButton.textContent = "PAUSE";
    elements.pauseButton.disabled = false;
    elements.skipButton.disabled = false;

    updateStoryProgress();

    showScreen("story");

    typeNextCharacter();
    scheduleJumpscare();
}


/* 10. PAUSE AND RESUME
   --------------------------------------------------------- */

function pauseStory() {
    if (!state.isTyping || state.storyCompleted) {
        return;
    }

    if (!state.isPaused) {
        state.isPaused = true;

        clearTimeout(state.typingTimer);
        clearTimeout(state.passageTimer);
        clearTimeout(state.jumpscareTimer);

        stopJumpscare();

        elements.pauseButton.textContent = "RESUME";
        elements.storyStatus.textContent =
            "■ TRANSMISSION PAUSED";

        notify("TRANSMISSION PAUSED");

    } else {
        state.isPaused = false;

        elements.pauseButton.textContent = "PAUSE";
        elements.storyStatus.textContent =
            "■ RECEIVING DATA...";

        typeNextCharacter();
        scheduleJumpscare();

        notify("TRANSMISSION RESUMED");
    }
}


/* 11. SKIP STORY
   --------------------------------------------------------- */

function skipStory() {
    if (!state.isTyping || state.storyCompleted) {
        return;
    }

    clearTimeout(state.typingTimer);
    clearTimeout(state.passageTimer);

    stopJumpscare();

    elements.storyOutput.textContent =
        storyPassages.map(passage => passage.text).join("");

    state.currentPassage = storyPassages.length;
    state.currentCharacter = 0;

    updateStoryProgress();

    completeStory();
}


/* 12. STORY COMPLETION
   --------------------------------------------------------- */

function completeStory() {
    if (state.storyCompleted) {
        return;
    }

    state.storyCompleted = true;
    state.isTyping = false;
    state.isPaused = false;

    clearTimeout(state.typingTimer);
    clearTimeout(state.passageTimer);
    clearTimeout(state.jumpscareTimer);

    stopJumpscare();

    elements.storyProgressText.textContent = "100%";
    elements.storyProgressFill.style.width = "100%";

    elements.storyProgress.setAttribute(
        "aria-valuenow",
        "100"
    );

    elements.storyStatus.textContent =
        "■ TRANSMISSION COMPLETE";

    elements.pauseButton.disabled = true;
    elements.skipButton.disabled = true;

    notify("TRANSMISSION COMPLETE // EVALUATION UNLOCKED");

    setTimeout(() => {
        beginCredits();
    }, 1800);
}


/* 13. JUMPSCARE SCHEDULER
   --------------------------------------------------------- */

function scheduleJumpscare() {
    clearTimeout(state.jumpscareTimer);

    if (
        !state.jumpscaresEnabled ||
        !state.isTyping ||
        state.isPaused ||
        state.isJumpscarePlaying
    ) {
        return;
    }

    const randomDelay =
        Math.floor(
            Math.random() *
            (JUMPSCARE_MAX_DELAY - JUMPSCARE_MIN_DELAY + 1)
        ) + JUMPSCARE_MIN_DELAY;

    state.jumpscareTimer = setTimeout(() => {
        playJumpscare();
    }, randomDelay);
}


/* 14. PLAY JUMPSCARE
   --------------------------------------------------------- */

function playJumpscare() {
    if (
        !state.jumpscaresEnabled ||
        !state.isTyping ||
        state.isPaused ||
        state.isJumpscarePlaying
    ) {
        return;
    }

    state.isJumpscarePlaying = true;

    const randomIndex = Math.floor(
        Math.random() * jumpscareFiles.length
    );

    const selectedVideo = jumpscareFiles[randomIndex];

    elements.jumpscareVideo.src =
        `assets/jumpscares/${selectedVideo}`;

    elements.jumpscareVideo.muted = false;
    elements.jumpscareVideo.volume = 1;

    elements.jumpscareOverlay.classList.remove("hidden");

    elements.jumpscareOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    elements.jumpscareVideo.currentTime = 0;

    const playback = elements.jumpscareVideo.play();

    playback.then(() => {
        if (!state.isJumpscarePlaying) {
            return;
        }

        state.jumpscareDurationTimer = setTimeout(() => {
            stopJumpscare();

            if (state.isTyping && !state.isPaused) {
                scheduleJumpscare();
            }
        }, JUMPSCARE_DURATION);

    }).catch(error => {
        console.error("Jumpscare playback failed:", error);

        stopJumpscare();

        if (state.isTyping && !state.isPaused) {
            scheduleJumpscare();
        }
    });
}


/* 15. STOP JUMPSCARE
   --------------------------------------------------------- */

function stopJumpscare() {
    clearTimeout(state.jumpscareDurationTimer);

    elements.jumpscareVideo.pause();
    elements.jumpscareVideo.removeAttribute("src");
    elements.jumpscareVideo.load();

    elements.jumpscareOverlay.classList.add("hidden");

    elements.jumpscareOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    state.isJumpscarePlaying = false;
}


/* 16. JUMPSCARE VIDEO EVENTS
   --------------------------------------------------------- */

elements.jumpscareVideo.addEventListener("ended", () => {
    if (!state.isJumpscarePlaying) {
        return;
    }

    stopJumpscare();

    if (state.isTyping && !state.isPaused) {
        scheduleJumpscare();
    }
});


elements.jumpscareVideo.addEventListener("error", () => {
    if (!state.isJumpscarePlaying) {
        return;
    }

    console.error("Unable to load jumpscare video.");

    stopJumpscare();

    if (state.isTyping && !state.isPaused) {
        scheduleJumpscare();
    }
});


/* 17. JUMPSCARE SETTINGS
   --------------------------------------------------------- */

function toggleJumpscares() {
    state.jumpscaresEnabled = !state.jumpscaresEnabled;

    elements.jumpscareToggle.textContent =
        state.jumpscaresEnabled
            ? "JUMPSCARES: ON"
            : "JUMPSCARES: OFF";

    elements.jumpscareToggle.setAttribute(
        "aria-pressed",
        String(state.jumpscaresEnabled)
    );

    if (!state.jumpscaresEnabled) {
        clearTimeout(state.jumpscareTimer);
        stopJumpscare();

        notify("JUMPSCARES DISABLED");

    } else {
        scheduleJumpscare();

        notify("JUMPSCARES ENABLED");
    }
}


/* 18. QUIZ GENERATION
   --------------------------------------------------------- */

function renderQuiz() {
    elements.quizQuestions.replaceChildren();

    quizQuestions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "question-card";

        const number = document.createElement("span");
        number.className = "question-number";
        number.textContent =
            `QUESTION ${String(index + 1).padStart(2, "0")}`;

        const prompt = document.createElement("p");
        prompt.className = "question-prompt";
        prompt.textContent = question.prompt;

        const input = document.createElement("input");

        input.className = "question-input";
        input.type = "text";
        input.name = `question-${index + 1}`;
        input.id = `question-${index + 1}`;

        input.placeholder = "ENTER RESPONSE...";
        input.autocomplete = "off";
        input.maxLength = 80;
        input.required = true;

        input.setAttribute(
            "aria-label",
            `Answer to question ${index + 1}`
        );

        input.addEventListener("input", updateQuizProgress);

        card.append(number, prompt, input);

        elements.quizQuestions.appendChild(card);
    });

    updateQuizProgress();
}


/* 19. QUIZ PROGRESS
   --------------------------------------------------------- */

function updateQuizProgress() {
    const inputs = elements.quizQuestions.querySelectorAll(
        ".question-input"
    );

    let answered = 0;

    inputs.forEach(input => {
        if (input.value.trim() !== "") {
            answered++;
        }
    });

    elements.quizProgressText.textContent =
        `${answered} / ${quizQuestions.length}`;

    elements.quizProgressFill.style.width =
        `${(answered / quizQuestions.length) * 100}%`;

    elements.quizProgress.setAttribute(
        "aria-valuenow",
        answered
    );
}


/* 20. ACTUAL QUIZ SCREEN
   --------------------------------------------------------- */

function beginActualQuiz() {
    renderQuiz();

    elements.quizFeedback.textContent =
        "ALL RESPONSES REQUIRED.";

    showScreen("quiz");
}


/* 21. ANSWER NORMALIZATION
   --------------------------------------------------------- */

function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .trim()
        .replace(/[.,!?'"“”‘’]/g, "")
        .replace(/\s+/g, " ");
}


/* 22. QUIZ EVALUATION
   --------------------------------------------------------- */

function evaluateQuiz(event) {
    event.preventDefault();

    if (!elements.quizForm.reportValidity()) {
        return;
    }

    const inputs = elements.quizQuestions.querySelectorAll(
        ".question-input"
    );

    let score = 0;

    quizQuestions.forEach((question, index) => {
        const submittedAnswer = normalizeAnswer(
            inputs[index].value
        );

        const isCorrect = question.answers.some(answer =>
            submittedAnswer === normalizeAnswer(answer)
        );

        if (isCorrect) {
            score++;
        }

        inputs[index].disabled = true;

        inputs[index].style.borderColor = isCorrect
            ? "rgba(177, 239, 120, 0.65)"
            : "rgba(182, 91, 69, 0.7)";
    });

    state.score = score;

    showResults();
}


/* 23. RESULTS
   --------------------------------------------------------- */

function showResults() {
    const total = quizQuestions.length;

    elements.scoreValue.textContent =
        `${state.score}/${total}`;

    const percentage = Math.round(
        (state.score / total) * 100
    );

    if (state.score === total) {
        elements.resultMessage.textContent =
            "PERFECT RECALL. EVERY DETAIL ACCOUNTED FOR.";

    } else if (state.score >= 3) {
        elements.resultMessage.textContent =
            "TRANSMISSION RETAINED. SOME DETAILS WERE LOST.";

    } else {
        elements.resultMessage.textContent =
            "TRANSMISSION RECEIVED. MEMORY INTEGRITY: PARTIAL.";
    }

    elements.quizFeedback.textContent =
        `EVALUATION: ${percentage}%`;

    showScreen("results");
}


/* 24. CERTIFICATE SCREEN
   --------------------------------------------------------- */

function openCertificate() {
    elements.participantName.value = "";

    elements.certificateForm.classList.remove("hidden");
    elements.generatedCertificate.classList.add("hidden");

    elements.printButton.disabled = true;
    elements.downloadButton.disabled = true;

    showScreen("certificate");
}


/* 25. CERTIFICATE GENERATION
   --------------------------------------------------------- */

function generateCertificate(event) {
    event.preventDefault();

    if (!elements.certificateForm.reportValidity()) {
        return;
    }

    const name = elements.participantName.value.trim();

    if (!name) {
        notify("PLEASE ENTER A NAME.");
        return;
    }

    state.participant = name;

    const formattedDate = new Date().toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    elements.certificateRecipient.textContent = name;

    elements.certificateScore.textContent =
        `${state.score}/${quizQuestions.length}`;

    elements.certificateDate.textContent = formattedDate;

    elements.certificateForm.classList.add("hidden");
    elements.generatedCertificate.classList.remove("hidden");

    elements.printButton.disabled = false;
    elements.downloadButton.disabled = false;

    notify("CERTIFICATE GENERATED SUCCESSFULLY.");
}


/* 26. DOWNLOAD CERTIFICATE AS PNG
   --------------------------------------------------------- */

function downloadCertificate() {
    if (
        elements.generatedCertificate.classList.contains("hidden") ||
        !state.participant
    ) {
        notify("GENERATE YOUR CERTIFICATE FIRST.");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1600;
    canvas.height = 1100;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    const background = ctx.createLinearGradient(
        0, 0, width, height
    );

    background.addColorStop(0, "#151c11");
    background.addColorStop(0.5, "#0d130b");
    background.addColorStop(1, "#1b1b12");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    // Outer frame
    ctx.strokeStyle = "#a28d5c";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        45, 45,
        width - 90,
        height - 90
    );

    // Inner frame
    ctx.strokeStyle = "rgba(162, 141, 92, 0.45)";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        62, 62,
        width - 124,
        height - 124
    );

    // Decorative corners
    const corners = [
        [85, 85],
        [width - 85, 85],
        [85, height - 85],
        [width - 85, height - 85]
    ];

    ctx.strokeStyle = "#a28d5c";
    ctx.lineWidth = 3;

    corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Header
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#a28d5c";
    ctx.font = "bold 22px monospace";

    ctx.fillText(
        "G.G. TERMINAL SYSTEMS PRESENTS",
        width / 2,
        190
    );

    // Main heading
    ctx.fillStyle = "#d1ff9b";
    ctx.font = "normal 62px Georgia";

    ctx.fillText(
        "UNFAZED BY",
        width / 2,
        330
    );

    ctx.fillStyle = "#a28d5c";
    ctx.font = "italic 57px Georgia";

    ctx.fillText(
        "HALLOWEEN SPOOK...",
        width / 2,
        410
    );

    // Divider
    ctx.strokeStyle = "#a28d5c";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(570, 470);
    ctx.lineTo(1030, 470);
    ctx.stroke();

    // Certificate recipient label
    ctx.fillStyle = "#77806a";
    ctx.font = "20px monospace";

    ctx.fillText(
        "THIS CERTIFICATE IS AWARDED TO",
        width / 2,
        555
    );

    // Participant name
    ctx.fillStyle = "#d1ff9b";

    let nameSize = 64;

    do {
        ctx.font = `italic ${nameSize}px Georgia`;
        nameSize -= 2;
    } while (
        ctx.measureText(state.participant).width > 1250 &&
        nameSize > 30
    );

    ctx.fillText(
        state.participant,
        width / 2,
        680
    );

    // Achievement text
    ctx.fillStyle = "#9aaa83";
    ctx.font = "20px monospace";

    ctx.fillText(
        "FOR COMPLETING THE TRANSMISSION",
        width / 2,
        785
    );

    ctx.fillText(
        "AND SURVIVING THE EXPERIENCE.",
        width / 2,
        820
    );

    // Score
    ctx.fillStyle = "#77806a";
    ctx.font = "19px monospace";

    ctx.fillText(
        `SCORE: ${state.score}/${quizQuestions.length}`,
        570,
        925
    );

    // Date
    ctx.fillText(
        `RECORD: ${elements.certificateDate.textContent}`,
        1030,
        925
    );

    // Verification seal
    ctx.fillStyle = "#a28d5c";
    ctx.font = "bold 21px monospace";

    ctx.fillText(
        "G.G. // VERIFIED",
        width / 2,
        1000
    );

    // Export PNG
    canvas.toBlob(blob => {
        if (!blob) {
            notify("PNG GENERATION FAILED.");
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "Unfazed-by-Halloween.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        notify("CERTIFICATE DOWNLOADED.");
    }, "image/png");
}


/* 27. PRINT CERTIFICATE
   --------------------------------------------------------- */

function printCertificate() {
    if (
        elements.generatedCertificate.classList.contains("hidden")
    ) {
        return;
    }

    window.print();
}


/* 28. RESTART EXPERIENCE
   --------------------------------------------------------- */

function restartExperience() {
    clearTimeout(state.typingTimer);
    clearTimeout(state.passageTimer);
    clearTimeout(state.jumpscareTimer);
    clearTimeout(state.jumpscareDurationTimer);
    clearTimeout(state.notificationTimer);

    clearTimeout(creditsTypingTimer);
    clearInterval(creditsCountdownTimer);

    stopJumpscare();

    state.currentPassage = 0;
    state.currentCharacter = 0;

    state.isTyping = false;
    state.isPaused = false;
    state.storyCompleted = false;

    state.score = 0;
    state.participant = "";

    elements.storyOutput.textContent = "";

    elements.storyStatus.textContent =
        "AWAITING DATA...";

    elements.pauseButton.textContent = "PAUSE";
    elements.pauseButton.disabled = true;
    elements.skipButton.disabled = true;

    elements.storyProgressText.textContent = "0%";
    elements.storyProgressFill.style.width = "0%";

    elements.storyProgress.setAttribute(
        "aria-valuenow",
        "0"
    );

    elements.quizForm.reset();
    elements.quizQuestions.replaceChildren();

    elements.quizFeedback.textContent =
        "ALL RESPONSES REQUIRED.";

    elements.quizProgressText.textContent =
        `0 / ${quizQuestions.length}`;

    elements.quizProgressFill.style.width = "0%";

    elements.quizProgress.setAttribute(
        "aria-valuenow",
        "0"
    );

    elements.certificateForm.reset();

    elements.certificateForm.classList.remove("hidden");
    elements.generatedCertificate.classList.add("hidden");

    elements.printButton.disabled = true;
    elements.downloadButton.disabled = true;

    elements.jumpscareToggle.textContent =
        state.jumpscaresEnabled
            ? "JUMPSCARES: ON"
            : "JUMPSCARES: OFF";

    elements.notification.classList.add("hidden");

    creditsTypingIndex = 0;
    creditsRemaining = 10;

    elements.creditsOutput.textContent = "";
    elements.countdown.textContent = "10";
    elements.progress.style.width = "0%";

    showScreen("boot");

    notify("SYSTEM RESET // READY", 1800);
}


/* 29. EVENT LISTENERS
   --------------------------------------------------------- */

// Start experience and request fullscreen.

elements.startButton.addEventListener("click", () => {
    initAudioContext(); // Unlocks browser audio permissions immediately

    const fullscreenRequest = document.documentElement.requestFullscreen;
    if (fullscreenRequest) {
        document.documentElement.requestFullscreen().catch(error => {
            console.warn("Fullscreen unavailable:", error);
        });
    }

    beginStory();
});

elements.pauseButton.addEventListener(
    "click",
    pauseStory
);

elements.skipButton.addEventListener(
    "click",
    skipStory
);

elements.jumpscareToggle.addEventListener(
    "click",
    toggleJumpscares
);

elements.quizForm.addEventListener(
    "submit",
    evaluateQuiz
);

elements.certificateButton.addEventListener(
    "click",
    openCertificate
);

elements.certificateForm.addEventListener(
    "submit",
    generateCertificate
);

elements.printButton.addEventListener(
    "click",
    printCertificate
);

elements.downloadButton.addEventListener(
    "click",
    downloadCertificate
);

elements.restartButton.addEventListener(
    "click",
    restartExperience
);


/* 30. KEYBOARD CONTROLS
   --------------------------------------------------------- */

document.addEventListener("keydown", event => {
    if (
        state.currentScreen !== "story" ||
        event.target.matches("input, textarea, button")
    ) {
        return;
    }

    if (event.code === "Space") {
        event.preventDefault();
        pauseStory();
    }
});


/* 31. DISCLAIMER AND CREDITS ELEMENTS
   --------------------------------------------------------- */

const warningElements = {
    acknowledgeButton: document.getElementById(
        "acknowledge-warning-button"
    ),
    creditsOutput: document.getElementById("credits-output"),
    countdown: document.getElementById("credits-countdown"),
    progress: document.getElementById("credits-progress-fill")
};

const projectCredits = [
    "GOT GUTS? ...WE'LL SEE.",
    "",
    "PROJECT CREDITS",
    "------------------------------",
    "",
    "JUMPSCARE VIDEO ASSETS",
    "SOURCE: VLIPSY LIBRARY",
    "",
    "HORROR SHORT STORY",
    "SOURCE: BUZZFEED",
    "",
    "------------------------------",
    "TRANSMISSION: COMPLETE",
    "G.G. TERMINAL SYSTEMS",
    "END OF ARCHIVE."
].join("\n");

let creditsTypingTimer = null;
let creditsCountdownTimer = null;
let creditsTypingIndex = 0;
let creditsRemaining = 10;

let disclaimerAcknowledged = false;


/* 32. DISCLAIMER FLOW
   --------------------------------------------------------- */

// The first Start click opens the disclaimer.
// The next Start click begins the story after acknowledgement.

elements.startButton.addEventListener("click", event => {
    if (disclaimerAcknowledged) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    showScreen("warning");
}, true);


warningElements.acknowledgeButton.addEventListener("click", () => {
    disclaimerAcknowledged = true;
    showScreen("boot");
});


/* 33. CREDITS TYPEWRITER
   --------------------------------------------------------- */

function typeCredits() {
    clearTimeout(creditsTypingTimer);

    if (creditsTypingIndex >= projectCredits.length) {
        startCreditsCountdown();
        return;
    }

    warningElements.creditsOutput.textContent +=
        projectCredits.charAt(creditsTypingIndex);

    creditsTypingIndex++;

    creditsTypingTimer = setTimeout(typeCredits, 35);
}


/* 34. CREDITS COUNTDOWN
   --------------------------------------------------------- */

function startCreditsCountdown() {
    clearInterval(creditsCountdownTimer);

    creditsRemaining = 10;

    warningElements.countdown.textContent =
        String(creditsRemaining);

    warningElements.progress.style.width = "0%";

    creditsCountdownTimer = setInterval(() => {
        creditsRemaining--;

        warningElements.countdown.textContent =
            String(creditsRemaining);

        warningElements.progress.style.width =
            `${((10 - creditsRemaining) / 10) * 100}%`;

        if (creditsRemaining <= 0) {
            clearInterval(creditsCountdownTimer);
            creditsCountdownTimer = null;

            warningElements.progress.style.width = "100%";

            beginActualQuiz();
        }
    }, 1000);
}


/* 35. BEGIN CREDITS
   --------------------------------------------------------- */

function beginCredits() {
    clearTimeout(creditsTypingTimer);
    clearInterval(creditsCountdownTimer);

    creditsTypingIndex = 0;
    creditsRemaining = 10;

    warningElements.creditsOutput.textContent = "";
    warningElements.countdown.textContent = "10";
    warningElements.progress.style.width = "0%";

    showScreen("credits");

    typeCredits();
}


/* 36. INITIALIZATION
   --------------------------------------------------------- */

function initializeApplication() {
    showScreen("warning");

    elements.jumpscareToggle.setAttribute(
        "aria-pressed",
        "true"
    );

    elements.pauseButton.disabled = true;
    elements.skipButton.disabled = true;

    elements.printButton.disabled = true;
    elements.downloadButton.disabled = true;

    console.log(
        "%cGOT GUTS? ...WE'LL SEE.",
        "color: #b1ef78; font-size: 18px; font-weight: bold;"
    );

    console.log(
        "%cG.G. TERMINAL SYSTEMS // BUILD 03",
        "color: #759b54; font-size: 11px;"
    );

    console.log(
        "Application initialized successfully."
    );
}

/*/* =========================================================
   LOGICAL AUDIO ENGINE // GOT GUTS?
   ========================================================= */

const audioAssets = {
    beep: new Audio("assets/audio/beep.mp3"),
    cry: new Audio("assets/audio/cry.mp3"),
    doorClose: new Audio("assets/audio/door-close.mp3"),
    footsteps: new Audio("assets/audio/footsteps.mp3"),
    glitch: new Audio("assets/audio/glitch-effect.mp3"),
    print: new Audio("assets/audio/print.mp3"),
    static: new Audio("assets/audio/static.mp3")
};

// Configure continuous background static loop
audioAssets.static.loop = true;
audioAssets.static.volume = 0.25;

let activeAudioTimeouts = [];
let footstepsTimer = null;
let isAudioGloballySuspended = false;

// Master playback function enforcing the 4-second rule and exceptions
function playSound(soundName, forcePlay = false) {
    if (isAudioGloballySuspended && soundName !== "glitch") return;

    const sound = audioAssets[soundName];
    if (!sound) return;

    // Do not re-trigger static if it's already playing
    if (soundName === "static" && !sound.paused) return;

    sound.currentTime = 0;
    sound.volume = (soundName === "static") ? 0.25 : 0.7;

    const playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => console.warn(`Audio play blocked for ${soundName}:`, err));
    }

    // 4-Second Rule: 
    // - Applies to files bigger than 4sec (except 'footsteps' and looping 'static').
    // - Short files or forced plays finish naturally unless specified.
    const isExempt = (soundName === "footsteps" || soundName === "static" || forcePlay);
    
    if (!isExempt) {
        const timeoutId = setTimeout(() => {
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        }, 4000);
        activeAudioTimeouts.push(timeoutId);
    }
}

// Suspend ALL audio immediately during jumpscare
function suspendAllAudioForJumpscare() {
    isAudioGloballySuspended = true;

    // Clear active 4-second cutoff timers
    activeAudioTimeouts.forEach(id => clearTimeout(id));
    activeAudioTimeouts = [];

    // Pause all playing audio elements
    Object.values(audioAssets).forEach(sound => {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
    });

    if (footstepsTimer) {
        clearTimeout(footstepsTimer);
        footstepsTimer = null;
    }
}

// Resume audio after jumpscare: GLITCH SOUND FIRST, then static loop & footsteps
function resumeAudioAfterJumpscare() {
    isAudioGloballySuspended = false;

    // 1. Play glitch sound FIRST as required
    playSound("glitch", true);

    // 2. Resume continuous background static loop
    playSound("static", true);

    // 3. Restart random footsteps loop
    startRandomFootsteps();
}

// Random footsteps before entering and during the storyline
function startRandomFootsteps() {
    if (footstepsTimer || isAudioGloballySuspended) return;

    const triggerFootstep = () => {
        if (!isAudioGloballySuspended) {
            playSound("footsteps", true); // Footsteps are exempt from 4s cap
        }
        // Random interval between 7 to 15 seconds
        const randomDelay = Math.floor(Math.random() * 8000) + 7000;
        footstepsTimer = setTimeout(triggerFootstep, randomDelay);
    };

    triggerFootstep();
}

// Initialize browser AudioContext unlock on first user click anywhere
let audioCtxUnlocked = false;
function unlockAudioContext() {
    if (audioCtxUnlocked) return;
    audioCtxUnlocked = true;

    // Start background static immediately across the experience upon first interaction
    playSound("static", true);
    startRandomFootsteps();
}

document.addEventListener("click", unlockAudioContext, { once: true });
document.addEventListener("keydown", unlockAudioContext, { once: true });
/* =========================================================
   38. BROWSER AUDIO PERMISSION & CONTEXT RESUME LOGIC
   ========================================================= */

// Create a global AudioContext to manage and unlock browser sound permissions
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume().then(() => {
            console.log("[*] Audio context unlocked and resumed successfully.");
        }).catch(err => {
            console.warn("[!] Failed to resume audio context:", err);
        });
    }
}

// Automatically bind the permission unlock to the very first user interaction anywhere or specifically on buttons
document.addEventListener("click", () => {
    initAudioContext();
}, { once: true }); // Triggers once on the initial click to satisfy browser security policies

/* =========================================================
   39. EXPLICIT AUDIO PERMISSION & ENABLE BUTTON
   ========================================================= */

const soundToggleButton = document.getElementById("sound-toggle-btn");
let soundSystemEnabled = false;

if (soundToggleButton) {
    soundToggleButton.addEventListener("click", () => {
        // Initialize and resume browser AudioContext
        initAudioContext();

        // Unlock and play background static to verify audio pipeline is hot
        audioAssets.static.play().then(() => {
            soundSystemEnabled = true;
            soundSystemEnabledText = "SOUNDS: ACTIVE";
            
            soundToggleButton.querySelector("span").textContent = "[ AUDIO SYSTEM ACTIVE ]";
            soundToggleButton.style.borderColor = "var(--phosphor-bright)";
            
            notify("AUDIO SYSTEM ENGAGED // STATIC ONLINE");
            playSound("beep");
        }).catch(err => {
            console.warn("Audio permission denied or blocked:", err);
            notify("AUDIO PERMISSION BLOCKED BY BROWSER");
        });
    });
}

/* =========================================================
   40. NON-REPEATING JUMPSCARE POOL EXTENSION
   ========================================================= */

// Queue pool to ensure all jumpscares play once before any repetition
let _jumpscareQueue = [];

// Override playJumpscare to pull from the non-repeating queue
playJumpscare = function() {
    if (
        !state.jumpscaresEnabled ||
        !state.isTyping ||
        state.isPaused ||
        state.isJumpscarePlaying
    ) {
        return;
    }

    state.isJumpscarePlaying = true;

    // Suspend audio for jumpscare
    stopAllAudioForJumpscare();

    // Refill and shuffle the queue if it's empty
    if (_jumpscareQueue.length === 0) {
        _jumpscareQueue = [...jumpscareFiles];
        for (let i = _jumpscareQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [_jumpscareQueue[i], _jumpscareQueue[j]] = [_jumpscareQueue[j], _jumpscareQueue[i]];
        }
    }

    const selectedVideo = _jumpscareQueue.pop();

    elements.jumpscareVideo.src =
        `assets/jumpscares/${selectedVideo}`;

    elements.jumpscareVideo.muted = false;
    elements.jumpscareVideo.volume = 1;

    elements.jumpscareOverlay.classList.remove("hidden");

    elements.jumpscareOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    elements.jumpscareVideo.currentTime = 0;

    const playback = elements.jumpscareVideo.play();

    playback.then(() => {
        if (!state.isJumpscarePlaying) {
            return;
        }

        state.jumpscareDurationTimer = setTimeout(() => {
            stopJumpscare();

            if (state.isTyping && !state.isPaused) {
                scheduleJumpscare();
            }
        }, JUMPSCARE_DURATION);

    }).catch(error => {
        console.error("Jumpscare playback failed:", error);

        stopJumpscare();

        if (state.isTyping && !state.isPaused) {
            scheduleJumpscare();
        }
    });
};