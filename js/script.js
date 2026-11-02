
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

// Original story passages preserved from your supplied script.
// The repeated passage is intentionally retained.

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
        pause: 2500
    },

    {
        text: `My wife's smile falls from her face. With a heavy heart, I put the gag back in as the girl starts to scream. I take her back to the room, locking her in and shutting the lights out. When I return, I find my wife crying. "It's ok, honey," I tell her, "The next one will be better. I promise."`,
        pause: 2500
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
    "anomaly.mp4",
    "doll.mp4",
    "infected.mp4",
    "jeff.mp4",
    "man.mp4",
    "scarecrow.mp4",
    "scp.mp4",
    "spider.mp4"
];

const JUMPSCARE_MIN_DELAY = 12000;
const JUMPSCARE_MAX_DELAY = 18000;
const JUMPSCARE_DURATION = 3000;


/* 05. QUIZ DATABASE
   --------------------------------------------------------- */

// Answers are checked without case sensitivity.
// Spaces and punctuation are normalized.

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
    boot: elements.boot,
    story: elements.story,
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
        screen.classList.toggle("hidden", name !== screenName);
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

    // Current passage finished.
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
        beginQuiz();
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


/* 20. QUIZ SCREEN
   --------------------------------------------------------- */

function beginQuiz() {
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

        const isCorrect = question.answers.some(answer => {
            return submittedAnswer === normalizeAnswer(answer);
        });

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

    elements.scoreValue.textContent = `${state.score}/${total}`;

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

    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString(
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

    notify("CERTIFICATE GENERATED SUCCESSFULLY.");
}


/* 26. PRINT CERTIFICATE
   --------------------------------------------------------- */

function printCertificate() {
    if (elements.generatedCertificate.classList.contains("hidden")) {
        return;
    }

    window.print();
}


/* 27. RESTART EXPERIENCE
   --------------------------------------------------------- */

function restartExperience() {
    clearTimeout(state.typingTimer);
    clearTimeout(state.passageTimer);
    clearTimeout(state.jumpscareTimer);
    clearTimeout(state.jumpscareDurationTimer);
    clearTimeout(state.notificationTimer);

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

    elements.jumpscareToggle.textContent =
        state.jumpscaresEnabled
            ? "JUMPSCARES: ON"
            : "JUMPSCARES: OFF";

    elements.notification.classList.add("hidden");

    showScreen("boot");

    notify("SYSTEM RESET // READY", 1800);
}


/* 28. EVENT LISTENERS
   --------------------------------------------------------- */

// Start the experience.
// Fullscreen is requested directly from the user's click.

elements.startButton.addEventListener("click", () => {

    const fullscreenRequest =
        document.documentElement.requestFullscreen;

    if (fullscreenRequest) {
        document.documentElement.requestFullscreen()
            .catch(error => {
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


elements.restartButton.addEventListener(
    "click",
    restartExperience
);


/* 29. KEYBOARD CONTROLS
   --------------------------------------------------------- */

// Spacebar pauses/resumes the story.
// Escape can still be used to leave browser fullscreen.

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


/* 30. INITIALIZATION
   --------------------------------------------------------- */

function initializeApplication() {

    showScreen("boot");

    elements.jumpscareToggle.setAttribute(
        "aria-pressed",
        "true"
    );

    elements.pauseButton.disabled = true;
    elements.skipButton.disabled = true;

    elements.printButton.disabled = true;

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

initializeApplication();
