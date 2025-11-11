const calendar = document.getElementById("calendar");
const triviaModal = document.getElementById("triviaModal");
const closeModal = document.querySelector(".close");
const triviaTitle = document.getElementById("triviaTitle");
const triviaQuestion = document.getElementById("triviaQuestion");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const finalMessageDiv = document.getElementById("finalMessage");
const secretMessage = document.getElementById("secretMessage");

let foundLetters = JSON.parse(localStorage.getItem("foundLetters")) || [];
let openedDays = JSON.parse(localStorage.getItem("openedDays")) || [];

const today = new Date();
const currentDay = today.getMonth() === 11 ? today.getDate() : 31; // unlock all if not December

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

closeModal.onclick = () => (triviaModal.style.display = "none");

window.onclick = event => {
  if (event.target === triviaModal) triviaModal.style.display = "none";
};

function checkCompletion() {
  if (foundLetters.length === triviaData.length) {
    secretMessage.textContent = foundLetters.join("");
    finalMessageDiv.classList.remove("hidden");
  }
}

renderCalendar();
checkCompletion();
