// === SNOW ===
function createSnow() {
  const snowContainer = document.getElementById("snow-container");
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement("div");
    snowflake.classList.add("snowflake");
    snowflake.style.left = Math.random() * 100 + "%";
    const size = Math.random() * 4 + 1;
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.animationDuration = 3 + Math.random() * 5 + "s";
    snowflake.style.animationDelay = Math.random() * 5 + "s";
    snowContainer.appendChild(snowflake);
  }
}

// === STARS ===
function createStars() {
  const starsContainer = document.getElementById("stars-container");
  const totalStars = 80;
  const clickableCount = 2;
  const clickableIndexes = [];

  while (clickableIndexes.length < clickableCount) {
    const random = Math.floor(Math.random() * totalStars);
    if (!clickableIndexes.includes(random)) clickableIndexes.push(random);
  }

  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 60 + "%";

    if (clickableIndexes.includes(i)) {
      star.classList.add("clickable");
      star.addEventListener("click", () => openStarTrivia(i, star));
    }

    starsContainer.appendChild(star);
  }
}

// Trivia logic
const starTrivia = [
  { question: "What is the chemical symbol for gold?", answer: "au", letter: "L" },
  { question: "In what year did Apollo 11 land on the moon?", answer: "1969", letter: "O" }
];

function openStarTrivia(index, star) {
  const trivia = starTrivia[index % starTrivia.length];
  if (localStorage.getItem(`starSolved${index}`)) return;

  const response = prompt(trivia.question);
  if (!response) return;

  if (response.trim().toLowerCase() === trivia.answer) {
    alert(`Correct! You have obtained the letter "${trivia.letter}"`);
    addLetter(trivia.letter);
    localStorage.setItem(`starSolved${index}`, true);
    star.classList.remove("clickable");
  } else {
    alert("Incorrect! Try again!");
  }
}

// === ADVENT CALENDAR ===
function createCalendar() {
  const calendar = document.getElementById("calendar");
  const today = new Date();
  const currentDay = today.getDate();
  const isPreview = window.location.search.includes("preview=true");

  for (let i = 1; i <= 25; i++) {
    const button = document.createElement("button");
    button.classList.add("day-button");
    button.textContent = i;

    if (!isPreview && i > currentDay) {
      button.disabled = true;
      button.classList.add("locked");
    }

    button.addEventListener("click", () => openDay(i));
    calendar.appendChild(button);
  }
}

function openDay(day) {
  window.location.href = `days/day${day}.html`;
}

// === LETTER STORAGE ===
function addLetter(letter) {
  const letters = JSON.parse(localStorage.getItem("letters") || "[]");
  if (!letters.includes(letter)) {
    letters.push(letter);
    localStorage.setItem("letters", JSON.stringify(letters));
    updateLettersDisplay();
  }
}

function updateLettersDisplay() {
  const letters = JSON.parse(localStorage.getItem("letters") || "[]");
  const display = document.getElementById("letters");
  display.textContent = letters.length ? letters.join(" ") : "None yet!";
}

function resetProgress() {
  if (confirm("Reset all progress?")) {
    localStorage.clear();
    updateLettersDisplay();
    alert("Progress reset!");
  }
}

document.getElementById("resetProgress").addEventListener("click", resetProgress);

// === INITIALIZE EVERYTHING ===
createSnow();
createStars();
createCalendar();
updateLettersDisplay();
