
/* =========================================
   1. SUNSET CLOUD ANIMATION
========================================= */

const canvas = document.getElementById("cloudCanvas") ||
  document.createElement("canvas");

canvas.id = "cloudCanvas";

if (!canvas.parentElement) {
  document.body.prepend(canvas);
}

const ctx = canvas.getContext("2d");

let w, h, frame = 0, time = 0, imageData;

function resize() {
  const scale = 0.35;
  w = Math.max(1, Math.floor(window.innerWidth * scale));
  h = Math.max(1, Math.floor(window.innerHeight * scale));
  canvas.width = w;
  canvas.height = h;
  imageData = ctx.createImageData(w, h);
}

function noise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const a = noise(ix, iy);
  const b = noise(ix + 1, iy);
  const c = noise(ix, iy + 1);
  const d = noise(ix + 1, iy + 1);

  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;

  return top + (bottom - top) * sy;
}

function fbm(x, y) {
  let value = 0;
  let amplitude = 0.5;

  for (let i = 0; i < 4; i++) {
    value += smoothNoise(x, y) * amplitude;
    x *= 2;
    y *= 2;
    amplitude *= 0.5;
  }

  return value;
}

function renderClouds() {
  const data = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;
      const drift = time;

      const warp = fbm(nx * 3 + drift, ny * 5);

      const shape = fbm(
        nx * 4 + drift * 0.8 + warp * 0.8,
        ny * 9 + warp * 0.3
      );

      const detail = fbm(nx * 11 - drift * 0.5, ny * 17);
      const density = shape * 0.78 + detail * 0.22;

      let alpha = (density - 0.48) * 4.2;
      alpha = Math.max(0, Math.min(1, alpha));
      alpha *= Math.min(1, ny * 2.5 + 0.15);

      const i = (y * w + x) * 4;

      data[i] = 255;
      data[i + 1] = 175 + detail * 45;
      data[i + 2] = 150 + detail * 45;
      data[i + 3] = alpha * 190;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function animateClouds() {
  frame++;

  if (frame % 2 === 0) {
    time += 0.028;
    renderClouds();
  }

  requestAnimationFrame(animateClouds);
}

resize();
renderClouds();

window.addEventListener("resize", () => {
  resize();
  renderClouds();
});

animateClouds();


/* =========================================
   2. MAIN HTML ELEMENTS
========================================= */

const continueBtn = document.getElementById("continueBtn");
const welcomeSection = document.querySelector(".welcome-section");
const secondScene = document.getElementById("secondScene");
const personName = document.getElementById("personName");

const questionText = document.getElementById("questionText");
const questionNumber = document.querySelector(".question-number");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const percentageGame = document.getElementById("percentageGame");
const percentageInput = document.getElementById("percentageInput");
const submitGuess = document.getElementById("submitGuess");

const questionThree = document.getElementById("questionThree");
const optionA = document.getElementById("optionA");
const optionB = document.getElementById("optionB");

const finalQuestion = document.getElementById("finalQuestion");
const loveYes = document.getElementById("loveYes");
const loveNo = document.getElementById("loveNo");

let specialName = "";
let currentStep = "question1";


/* =========================================
   3. START WEBSITE
========================================= */

continueBtn.addEventListener("click", () => {
  if (!personName.value.trim()) {
    personName.focus();
    return;
  }

  specialName = personName.value.trim();

  continueBtn.classList.remove("clicked");
  void continueBtn.offsetWidth;
  continueBtn.classList.add("clicked");

  setTimeout(() => {
    welcomeSection.style.transition =
      "opacity 0.5s ease, transform 0.5s ease";

    welcomeSection.style.opacity = "0";
    welcomeSection.style.transform = "translateY(-20px)";

    secondScene.classList.add("show");
  }, 500);
});


/* =========================================
   4. COMMON REPLY
========================================= */

function showReply(message, nextStep) {
  currentStep = nextStep;

  questionText.textContent = message;
  questionNumber.textContent = "A LITTLE SOMETHING FOR YOU ❤️";

  questionText.style.display = "block";
  questionNumber.style.display = "block";

  yesBtn.style.display = "none";
  noBtn.style.display = "block";
  noBtn.textContent = "Continue →";

  percentageGame.classList.remove("show");
  questionThree.classList.remove("show");
  finalQuestion.classList.remove("show");
}


/* =========================================
   5. QUESTION ONE
========================================= */

yesBtn.addEventListener("click", () => {
  showReply(
    `Oh really, ${specialName}? Someone seems pretty confident! 😂❤️`,
    "toPercentage"
  );
});

noBtn.addEventListener("click", () => {
  if (currentStep === "question1") {
    showReply(
      `Haha, ${specialName}! I knew you had no idea how special you are to me! ❤️`,
      "toPercentage"
    );
  } else if (currentStep === "toPercentage") {
    showPercentageQuestion();
  } else if (currentStep === "toQuestion3") {
    showQuestion3();
  } else if (currentStep === "toFinal") {
    showFinalQuestion();
  }
});


/* =========================================
   6. QUESTION TWO - PERCENTAGE GAME
========================================= */

function showPercentageQuestion() {
  currentStep = "percentage";

  questionNumber.textContent = "QUESTION 02 · 🎲";

  questionText.textContent =
  `Alright, ${specialName}… how special do you think you are to me? Here's a little hint: it's just 1% less than 100%! 🙈❤️`;

  questionText.style.display = "block";
  questionNumber.style.display = "block";

  yesBtn.style.display = "none";
  noBtn.style.display = "none";

  percentageInput.value = "";
  percentageGame.classList.add("show");
}

submitGuess.addEventListener("click", () => {
  const value = percentageInput.value.trim();
  const guess = Number(value);

  if (value === "" || guess < 0 || guess > 100) {
    showReply(
      "Please enter a number between 0 and 100! ❤️",
      "toQuestion3"
    );
    return;
  }

  if (guess === 99) {
    showReply(
      "Awww, 99%? You left 1% for me to prove! 🙈❤️",
      "toQuestion3"
    );
  } else if (guess === 100) {
    showReply(
      "100%? Someone's being extra confident! 😂❤️",
      "toQuestion3"
    );
  } else {
    showReply(
      "Not quite! But I love your confidence! 🥰❤️",
      "toQuestion3"
    );
  }
});


/* =========================================
   7. QUESTION THREE
========================================= */

function showQuestion3() {
  currentStep = "question3";

  questionNumber.textContent = "QUESTION 03 · ❤️";

  questionText.textContent =
    `What if I told you, ${specialName}, that someone secretly smiles every time your name appears on their screen… would you guess who?`;

  questionText.style.display = "block";
  questionNumber.style.display = "block";

  percentageGame.classList.remove("show");

  yesBtn.style.display = "none";
  noBtn.style.display = "none";

  questionThree.classList.add("show");
}

optionA.addEventListener("click", () => {
  showReply(
    `Awww, ${specialName}! Someone caught me smiling! 🥹❤️ But how did you figure that out so quickly?`,
    "toFinal"
  );
});

optionB.addEventListener("click", () => {
  showReply(
    `${specialName}, someone else? Ouch! 😂 I guess I need to make it more obvious that it's you! ❤️`,
    "toFinal"
  );
});


/* =========================================
   8. FINAL QUESTION
========================================= */

function showFinalQuestion() {
  currentStep = "final";

  questionText.style.display = "none";
  questionNumber.style.display = "none";

  questionThree.classList.remove("show");
  percentageGame.classList.remove("show");

  finalQuestion.classList.add("show");

  finalQuestion.querySelector("h2").textContent =
    `Do you love me, ${specialName}? 🥺`;

  yesBtn.style.display = "none";
  noBtn.style.display = "none";

  loveYes.style.display = "block";
  loveNo.style.display = "block";

  loveNo.textContent = "No 🙈";
  loveNo.disabled = false;

  loveNo.style.position = "";
  loveNo.style.left = "";
  loveNo.style.top = "";
  loveNo.style.zIndex = "";
}


/* =========================================
   9. FINAL YES - CELEBRATION
========================================= */

loveYes.addEventListener("click", () => {
  const questionCard = document.querySelector(".question-card");
  const celebrationScreen =
    document.getElementById("celebrationScreen");

  if (!questionCard || !celebrationScreen) return;

  loveYes.disabled = true;
  loveNo.disabled = true;

  questionCard.classList.add("question-card-leaving");

  setTimeout(() => {
    secondScene.classList.remove("show");
    celebrationScreen.classList.add("show");
    startFireworks();
  }, 520);
});

/* =========================
   10. FINAL NO BUTTON - SAFE & SMOOTH MOVEMENT
========================= */

const noButtonReplies = [
  "Gotcha 💔",
  "Missed 😮‍💨💔",
  "Try again 🤭💔",
  "Too slow 🐌💔",
  "Almost 😅💔"
];

let lastNoReplyIndex = -1;

function moveNoButton() {
  if (loveNo.disabled) return;

  // Change reply
  let nextIndex;

  do {
    nextIndex = Math.floor(Math.random() * noButtonReplies.length);
  } while (
    noButtonReplies.length > 1 &&
    nextIndex === lastNoReplyIndex
  );

  lastNoReplyIndex = nextIndex;
  loveNo.textContent = noButtonReplies[nextIndex];

  // Make button use viewport coordinates
  loveNo.style.position = "fixed";
  loveNo.style.right = "auto";
  loveNo.style.bottom = "auto";
  loveNo.style.zIndex = "9999";
  loveNo.style.margin = "0";

  const rect = loveNo.getBoundingClientRect();

  const margin = 16;

  // Available screen space
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

  // Random position safely inside screen
  const newX = margin + Math.random() * (maxX - margin);
  const newY = margin + Math.random() * (maxY - margin);

  loveNo.style.left = `${newX}px`;
  loveNo.style.top = `${newY}px`;
}

// Desktop hover
if (window.matchMedia("(hover: hover)").matches) {
  loveNo.addEventListener("pointerenter", moveNoButton);
}

// Mobile touch
loveNo.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });

// Click fallback
loveNo.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

// Recheck position after screen resize
window.addEventListener("resize", () => {
  if (loveNo.style.position !== "fixed") return;

  const rect = loveNo.getBoundingClientRect();
  const margin = 16;

  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

  const x = Math.min(Math.max(rect.left, margin), maxX);
  const y = Math.min(Math.max(rect.top, margin), maxY);

  loveNo.style.left = `${x}px`;
  loveNo.style.top = `${y}px`;
});


/* =========================================
   11. DIWALI-STYLE FIREWORKS + CONFETTI
========================================= */

let fireworksStarted = false;

function startFireworks() {
  if (fireworksStarted) return;
  fireworksStarted = true;

  const canvas = document.getElementById("fireworksCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;

  let particles = [];
  let rockets = [];
  let confetti = [];
  let frame = 0;

  const colors = [
    "#fff1a8",
    "#ffd1dc",
    "#b8f7ff",
    "#d8c5ff",
    "#fff7f0",
    "#ffb86b",
    "#c9ffcf"
  ];

  function resizeFireworks() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeFireworks);
  resizeFireworks();

  function burst(x, y) {
    const color = colors[
      Math.floor(Math.random() * colors.length)
    ];

    const count = 75;

    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * i / count;
      const speed = 1.2 + Math.random() * 4;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 90,
        size: 1.5 + Math.random() * 2,
        color
      });
    }

    for (let i = 0; i < 30; i++) {
      confetti.push({
        x,
        y,
        vx: (Math.random() - .5) * 5,
        vy: -1 - Math.random() * 5,
        gravity: .05,
        rotation: Math.random() * 6,
        spin: (Math.random() - .5) * .18,
        life: 160,
        color: colors[
          Math.floor(Math.random() * colors.length)
        ],
        size: 3 + Math.random() * 4
      });
    }
  }

  function launchRocket() {
    rockets.push({
      x: width * (.12 + Math.random() * .76),
      y: height + 10,
      targetY: height * (.15 + Math.random() * .4),
      speed: 5 + Math.random() * 2,
      color: colors[
        Math.floor(Math.random() * colors.length)
      ]
    });
  }

  function animateFireworks() {
    ctx.clearRect(0, 0, width, height);
    frame++;

    if (frame % 24 === 0 && rockets.length < 5) {
      launchRocket();
    }

    rockets = rockets.filter(rocket => {
      rocket.y -= rocket.speed;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      if (rocket.y <= rocket.targetY) {
        burst(rocket.x, rocket.y);
        return false;
      }

      return true;
    });

    particles = particles.filter(p => p.life > 0);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      p.vx *= .985;
      p.vy = p.vy * .985 + .025;
      p.life--;

      ctx.globalAlpha = Math.max(0, p.life / 90);
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    confetti = confetti.filter(
      c => c.life > 0 && c.y < height + 20
    );

    confetti.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.spin;
      c.life--;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);

      ctx.globalAlpha = Math.min(1, c.life / 35);
      ctx.fillStyle = c.color;

      ctx.fillRect(
        -c.size / 2,
        -c.size / 2,
        c.size,
        c.size * 1.8
      );

      ctx.restore();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateFireworks);
  }

  setTimeout(() => burst(width * .25, height * .28), 250);
  setTimeout(() => burst(width * .75, height * .25), 650);
  setTimeout(() => burst(width * .5, height * .18), 1000);

  animateFireworks();
}
