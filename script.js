const calendar = document.getElementById("calendar");
const triviaModal = document.getElementById("triviaModal");
const closeButtons = document.querySelectorAll(".close");
const triviaTitle = document.getElementById("triviaTitle");
const triviaQuestion = document.getElementById("triviaQuestion");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const finalMessageDiv = document.getElementById("finalMessage");
const secretMessage = document.getElementById("secretMessage");
const finalDoor = document.getElementById("finalDoor");
const passwordModal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("passwordInput");
const submitPassword = document.getElementById("submitPassword");
const passwordFeedback = document.getElementById("passwordFeedback");

let foundLetters = JSON.parse(localStorage.getItem("foundLetters")) || [];
let openedDays = JSON.parse(localStorage.getItem("openedDays")) || [];

const today = new Date();
const currentDay = today.getMonth() === 11 ? today.getDate() : 31;

function renderCalendar() {
  calendar.innerHTML = "";
  for (let i = 1; i <= 31; i++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day");
    dayBox.textContent = i;

    if (i > currentDay) {
      dayBox.classList.add("locked");
    } else {
      dayBox.addEventListener("click", () => openDay(i));
    }

    calendar.appendChild(dayBox);
  }
}

function openDay(day) {
  const trivia = triviaData.find(t => t.day === day);
  if (!trivia) return alert("No trivia for this day yet!");
  triviaTitle.textContent = `Day ${day}`;
  triviaQuestion.textContent = trivia.question;
  feedback.textContent = "";
  answerInput.value = "";
  triviaModal.style.display = "block";

  submitAnswer.onclick = () => {
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (userAnswer === trivia.answer.toLowerCase()) {
      feedback.textContent = "✅ Correct!";
      foundLetters.push(trivia.letter);
      foundLetters = [...new Set(foundLetters)];
      localStorage.setItem("foundLetters", JSON.stringify(foundLetters));
      triviaModal.style.display = "none";
      checkCompletion();
    } else {
      feedback.textContent = "❌ Try again!";
    }
  };
}

closeButtons.forEach(btn => (btn.onclick = () => btn.parentElement.parentElement.style.display = "none"));

window.onclick = event => {
  if (event.target === triviaModal) triviaModal.style.display = "none";
  if (event.target === passwordModal) passwordModal.style.display = "none";
};

function checkCompletion() {
  if (foundLetters.length === triviaData.length) {
    secretMessage.textContent = foundLetters.join("");
    finalMessageDiv.classList.remove("hidden");
  }
}

// Final door password check
finalDoor.addEventListener("click", () => {
  passwordInput.value = "";
  passwordFeedback.textContent = "";
  passwordModal.style.display = "block";
});

submitPassword.addEventListener("click", () => {
  const input = passwordInput.value.trim().toLowerCase();
  if (input === finalPassword.toLowerCase()) {
    passwordFeedback.textContent = "✅ Unlocked!";
    passwordModal.style.display = "none";
    showConfetti();
    alert(secretFinalMessage);
  } else {
    passwordFeedback.textContent = "❌ Incorrect password.";
  }
});

renderCalendar();
checkCompletion();
startSnow();
// Snowfall animation
function startSnow() {
  const canvas = document.getElementById("snowCanvas");
  const ctx = canvas.getContext("2d");
  let flakes = [];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function createFlakes() {
    flakes.push({
      x: Math.random() * canvas.width,
      y: 0,
      radius: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      drift: Math.random() * 2 - 1,
    });
  }

  function drawFlakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    flakes.forEach(flake => {
      ctx.moveTo(flake.x, flake.y);
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    });
    ctx.fill();
    moveFlakes();
  }

  function moveFlakes() {
    flakes.forEach(flake => {
      flake.y += flake.speed;
      flake.x += flake.drift;
      if (flake.y > canvas.height) {
        flake.y = 0;
        flake.x = Math.random() * canvas.width;
      }
    });
  }

  setInterval(() => {
    createFlakes();
    drawFlakes();
  }, 50);
}

function showConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
