// === Advent Calendar Logic ===

// Number of days in December
const totalDays = 31;

// Get today's date (month/day)
const today = new Date();
const isPreview = window.location.search.includes("preview=true");
const currentMonth = today.getMonth(); // 11 = December
const currentDay = today.getDate();

// Calendar container
const calendarContainer = document.getElementById("calendar");

// Create day buttons
for (let i = 1; i <= totalDays; i++) {
  const dayButton = document.createElement("button");
  dayButton.classList.add("day-button");
  dayButton.textContent = i;

  // Disable future days unless preview mode
  if (!isPreview && (currentMonth !== 11 || i > currentDay)) {
    dayButton.disabled = true;
    dayButton.classList.add("locked");
  }

  dayButton.addEventListener("click", () => openDay(i));
  calendarContainer.appendChild(dayButton);
}

// Handle opening a day
function openDay(day) {
  alert(`🎄 You opened Day ${day}! Something special awaits you...`);
  // Later: redirect to that day’s unique page (day1.html, day2.html, etc.)
  // window.location.href = `days/day${day}.html`;
}

// === Falling Snow Effect (white dots) ===
const snowContainer = document.getElementById("snow-container");

function createSnowflake() {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.style.left = Math.random() * 100 + "vw";
  snowflake.style.animationDuration = 3 + Math.random() * 5 + "s";
  snowflake.style.opacity = Math.random();
  snowflake.style.width = snowflake.style.height = 3 + Math.random() * 3 + "px";
  snowContainer.appendChild(snowflake);

  setTimeout(() => {
    snowflake.remove();
  }, 8000);
}
setInterval(createSnowflake, 150);

// === Collect Letters & Progress ===
const collectedContainer = document.getElementById("collected");
let collectedLetters = JSON.parse(localStorage.getItem("collectedLetters")) || [];

function updateCollected() {
  collectedContainer.textContent =
    "Collected Letters: " + collectedLetters.join(" ");
}
updateCollected();

function collectLetter(letter) {
  if (!collectedLetters.includes(letter)) {
    collectedLetters.push(letter);
    localStorage.setItem("collectedLetters", JSON.stringify(collectedLetters));
    updateCollected();
  }
}

// Reset Progress Button
document.getElementById("resetProgress").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset your progress?")) {
    localStorage.removeItem("collectedLetters");
    collectedLetters = [];
    updateCollected();
  }
});

// === Twinkling Stars (only 2 clickable ones) ===
const starsContainer = document.getElementById("stars-container");
const numStars = 30; // keep it small for visual clarity
const numClickable = 2;

// Randomly pick 2 stars to be clickable
const clickableStars = [];
while (clickableStars.length < numClickable) {
  const rand = Math.floor(Math.random() * numStars);
  if (!clickableStars.includes(rand)) clickableStars.push(rand);
}

// Create stars
for (let i = 0; i < numStars; i++) {
  const star = document.createElement("div");
  star.classList.add("star");
  star.style.left = Math.random() * 100 + "vw";
  star.style.top = Math.random() * 40 + "vh";
  star.style.animationDelay = Math.random() * 2 + "s";
  starsContainer.appendChild(star);

  if (clickableStars.includes(i)) {
    star.classList.add("clickable");
    star.addEventListener("click", () => {
      const trivia = prompt("✨ The stars hold secrets... Solve this: What is 5 × 6?");
      if (trivia && trivia.trim() === "30") {
        alert("🌟 Correct! You’ve discovered a secret letter: L");
        collectLetter("L");
      } else {
        alert("❌ That’s not quite right.");
      }
    });
  }
}
