const calendar = document.getElementById("calendar");
const triviaModal = document.getElementById("triviaModal");
const closeModal = document.querySelector(".close");
const triviaTitle = document.getElementById("triviaTitle");
const triviaQuestion = document.getElementById("triviaQuestion");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const resetButton = document.getElementById("resetProgress");
const lettersFoundDiv = document.getElementById("lettersFound");

let foundLetters = JSON.parse(localStorage.getItem("foundLetters")) || [];

// check if ?preview=true in URL
const urlParams = new URLSearchParams(window.location.search);
const previewMode = urlParams.get("preview") === "true";

function getUnlockedDay() {
  if (previewMode) return 31;
  const now = new Date();
  // Only December unlocks days normally; others stay locked
  return (now.getMonth() === 11) ? now.getDate() : 0;
}
const currentDay = getUnlockedDay();

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
  updateLettersDisplay();
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
      updateLettersDisplay();
      triviaModal.style.display = "none";
      alert(`You found a letter: ${trivia.letter}!`);
    } else {
      feedback.textContent = "❌ Try again!";
    }
  };
}

function updateLettersDisplay() {
  if (foundLetters.length === 0) {
    lettersFoundDiv.textContent = "(none yet)";
  } else {
    lettersFoundDiv.textContent = foundLetters.join(" ");
  }
}

closeModal.onclick = () => (triviaModal.style.display = "none");
window.onclick = e => { if (e.target === triviaModal) triviaModal.style.display = "none"; };

// Reset progress
resetButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset your progress?")) {
    localStorage.removeItem("foundLetters");
    foundLetters = [];
    updateLettersDisplay();
    alert("Progress reset! 🎄");
  }
});

renderCalendar();
startSnow();
