const calendar = document.getElementById("calendar");
const triviaModal = document.getElementById("triviaModal");
const triviaQuestion = document.getElementById("triviaQuestion");
const triviaAnswer = document.getElementById("triviaAnswer");
const submitAnswer = document.getElementById("submitAnswer");
const triviaFeedback = document.getElementById("triviaFeedback");
const closeModal = document.getElementById("closeModal");
const lettersFoundDiv = document.getElementById("lettersFound");
const resetBtn = document.getElementById("resetBtn");

const previewMode = window.location.search.includes("preview=true");
let today = new Date();
let currentDay = today.getMonth() === 11 ? today.getDate() : 0; // December only

const triviaData = {
  1: { q: "What color is Santa's suit?", a: "red", letter: "L" },
  2: { q: "What month comes after November?", a: "december", letter: "O" },
  12: { q: "How many days are in December?", a: "31", letter: "V" },
};

const starTrivia = [
  { q: "What is the hottest planet?", a: "venus", letter: "E" },
  { q: "What color are stars?", a: "varies", letter: "K" },
  { q: "What galaxy do we live in?", a: "milky way", letter: "N" },
];

let foundLetters = JSON.parse(localStorage.getItem("foundLetters")) || [];

// Build Calendar
for (let i = 1; i <= 31; i++) {
  const dayDiv = document.createElement("div");
  dayDiv.className = "day";
  dayDiv.textContent = i;

  if (!previewMode && i > currentDay) {
    dayDiv.classList.add("locked");
  } else {
    dayDiv.addEventListener("click", () => openTrivia(i));
  }
  calendar.appendChild(dayDiv);
}

// Trivia popup system
function openTrivia(day) {
  const trivia = triviaData[day];
  if (!trivia) return;
  triviaModal.classList.remove("hidden");
  triviaQuestion.textContent = trivia.q;
  triviaAnswer.value = "";
  triviaFeedback.textContent = "";

  submitAnswer.onclick = () => {
    const answer = triviaAnswer.value.trim().toLowerCase();
    if (answer === trivia.a.toLowerCase()) {
      triviaFeedback.textContent = "✅ Correct!";
      if (!foundLetters.includes(trivia.letter)) {
        foundLetters.push(trivia.letter);
        saveProgress();
        updateLettersDisplay();
      }
      setTimeout(() => closeTrivia(), 1000);
    } else {
      triviaFeedback.textContent = "❌ Try again!";
    }
  };
}

function closeTrivia() {
  triviaModal.classList.add("hidden");
}

closeModal.onclick = closeTrivia;

// Stars (hidden trivia)
function spawnStars(num = 8) {
  for (let i = 0; i < num; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = Math.random() * 80 + "%";
    star.style.left = Math.random() * 95 + "%";
    document.body.appendChild(star);

    const trivia = starTrivia[i % starTrivia.length];
    star.onclick = () => {
      triviaModal.classList.remove("hidden");
      triviaQuestion.textContent = trivia.q;
      triviaAnswer.value = "";
      triviaFeedback.textContent = "";

      submitAnswer.onclick = () => {
        const answer = triviaAnswer.value.trim().toLowerCase();
        if (answer === trivia.a.toLowerCase()) {
          triviaFeedback.textContent = "✅ Correct!";
          if (!foundLetters.includes(trivia.letter)) {
            foundLetters.push(trivia.letter);
            saveProgress();
            updateLettersDisplay();
          }
          setTimeout(() => closeTrivia(), 1000);
        } else {
          triviaFeedback.textContent = "❌ Try again!";
        }
      };
    };
  }
}
spawnStars();

// Cipher logic
const cipherTextEl = document.getElementById("cipherText");
const decodedTextEl = document.getElementById("decodedText");
const finalMessage = "LOVE KNOWS NOT ITS DEPTH TILL THE HOUR OF SEPARATION.";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const cipher = finalMessage
  .toUpperCase()
  .split("")
  .map(ch => (alphabet.includes(ch) ? alphabet.indexOf(ch) + 1 : ch))
  .join(" ");

function updateCipherDisplay() {
  cipherTextEl.textContent = cipher;
  const uniqueLetters = [...new Set(finalMessage.replace(/[^A-Z]/g, ""))];
  const allFound = uniqueLetters.every(l => foundLetters.includes(l));
  if (allFound || previewMode) {
    decodedTextEl.textContent = `"${finalMessage}"`;
    decodedTextEl.classList.remove("hidden");
  } else {
    decodedTextEl.classList.add("hidden");
  }
}

function updateLettersDisplay() {
  lettersFoundDiv.textContent = foundLetters.length ? foundLetters.join(" ") : "(none yet)";
  updateCipherDisplay();
}

function saveProgress() {
  localStorage.setItem("foundLetters", JSON.stringify(foundLetters));
}

resetBtn.onclick = () => {
  if (confirm("Reset your progress?")) {
    localStorage.removeItem("foundLetters");
    foundLetters = [];
    updateLettersDisplay();
  }
};

updateLettersDisplay();

// Snow animation
function startSnow() {
  const snowContainer = document.querySelector(".snow");
  setInterval(() => {
    const snowflake = document.createElement("div");
    snowflake.textContent = "❄️";
    snowflake.style.position = "absolute";
    snowflake.style.left = Math.random() * 100 + "%";
    snowflake.style.fontSize = Math.random() * 15 + 10 + "px";
    snowflake.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
    snowContainer.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), 5000);
  }, 200);
}
startSnow();
