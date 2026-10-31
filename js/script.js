
const startButton = document.getElementById("start-button");

const welcomeScreen = document.getElementById("welcome-screen");
const storyScreen = document.getElementById("story-screen");
const storyOutput = document.getElementById("story-output");
const storyStatus = document.querySelector(".story-status");

const jumpscareOverlay = document.getElementById("jumpscare-overlay");
const jumpscareVideo = document.getElementById("jumpscare-video");
const jumpscareToggle = document.getElementById("jumpscare-toggle");


// JUMPSCARE SETTINGS

let jumpscaresEnabled = true;
let jumpscareTimer;
let jumpscareDurationTimer;
let isJumpscarePlaying = false;


// STORY PASSAGES

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


// TYPEWRITER VARIABLES

let currentPassage = 0;
let typingTimer;
let isTyping = false;


// JUMPSCARE VIDEOS

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


// TYPEWRITER ENGINE

function typeText(text, index = 0) {
    if (index < text.length) {
        storyOutput.textContent += text.charAt(index);

        typingTimer = setTimeout(() => {
            typeText(text, index + 1);
        }, 45);

    } else {
        currentPassage++;

        if (currentPassage < storyPassages.length) {
            const delay = storyPassages[currentPassage - 1].pause;

            typingTimer = setTimeout(() => {
                typeNextPassage();
            }, delay);

        } else {
            isTyping = false;
            storyStatus.textContent = "■ TRANSMISSION COMPLETE";

            clearTimeout(jumpscareTimer);
            clearTimeout(jumpscareDurationTimer);

            stopJumpscare();
        }
    }
}


function typeNextPassage() {
    const passage = storyPassages[currentPassage];

    if (passage) {
        typeText(passage.text);
    }
}


// JUMPSCARE SCHEDULER

function scheduleJumpscare() {
    clearTimeout(jumpscareTimer);

    if (!jumpscaresEnabled || !isTyping || isJumpscarePlaying) {
        return;
    }

    // Random interval: 3–5 seconds

    const randomDelay = Math.floor(Math.random() * 3000) + 6000;

    jumpscareTimer = setTimeout(() => {
        playJumpscare();
    }, randomDelay);
}


// STOP CURRENT JUMPSCARE

function stopJumpscare() {
    clearTimeout(jumpscareDurationTimer);

    jumpscareVideo.pause();
    jumpscareVideo.removeAttribute("src");
    jumpscareVideo.load();

    jumpscareOverlay.classList.add("hidden");

    isJumpscarePlaying = false;
}


// PLAY RANDOM VIDEO

function playJumpscare() {
    if (!jumpscaresEnabled || !isTyping || isJumpscarePlaying) {
        return;
    }

    isJumpscarePlaying = true;

    const randomIndex = Math.floor(Math.random() * jumpscareFiles.length);
    const selectedVideo = jumpscareFiles[randomIndex];

    jumpscareVideo.src = `assets/jumpscares/${selectedVideo}`;

    jumpscareVideo.muted = false;
    jumpscareVideo.volume = 1;

    jumpscareOverlay.classList.remove("hidden");

    jumpscareVideo.currentTime = 0;

    jumpscareVideo.play()
        .then(() => {

            // Stop the jumpscare after exactly 3 seconds

            jumpscareDurationTimer = setTimeout(() => {
                stopJumpscare();
                scheduleJumpscare();
            }, 3000);

        })
        .catch((error) => {
            console.error("Video playback failed:", error);

            stopJumpscare();
            scheduleJumpscare();
        });
}


// VIDEO COMPLETION

jumpscareVideo.addEventListener("ended", () => {
    if (!isJumpscarePlaying) return;

    stopJumpscare();
    scheduleJumpscare();
});


// VIDEO ERROR

jumpscareVideo.addEventListener("error", () => {
    if (!isJumpscarePlaying) return;

    console.error("Unable to load jumpscare video.");

    stopJumpscare();
    scheduleJumpscare();
});


// TOGGLE JUMPSCARES

jumpscareToggle.addEventListener("click", () => {
    jumpscaresEnabled = !jumpscaresEnabled;

    jumpscareToggle.textContent = jumpscaresEnabled
        ? "JUMPSCARES: ON"
        : "JUMPSCARES: OFF";

    if (!jumpscaresEnabled) {
        clearTimeout(jumpscareTimer);
        stopJumpscare();

    } else {
        scheduleJumpscare();
    }
});


// START TRANSMISSION

startButton.addEventListener("click", () => {
    if (isTyping) return;

    welcomeScreen.classList.add("hidden");
    storyScreen.classList.remove("hidden");

    storyOutput.textContent = "";
    storyStatus.textContent = "■ RECEIVING DATA...";

    currentPassage = 0;
    isTyping = true;

    typeNextPassage();
    scheduleJumpscare();
});

