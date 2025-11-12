// === Advent Calendar Script ===

// ===== CONFIG =====
const totalDays = 31;
const progressKey = 'advent_opened_days';
const urlParams = new URLSearchParams(window.location.search);
const isPreview = urlParams.has('preview');

// ===== ELEMENTS =====
const calendar = document.getElementById('calendar');
const collectedEl = document.getElementById('collectedLetters');
const resetBtn = document.getElementById('resetProgress');
const cipherTextEl = document.getElementById('cipherText');
const decodedTextEl = document.getElementById('decodedText');

// ===== PROGRESS HANDLING =====
let openedDays = JSON.parse(localStorage.getItem(progressKey)) || [];
let collectedLetters = JSON.parse(localStorage.getItem('advent_letters')) || [];

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(openedDays));
  localStorage.setItem('advent_letters', JSON.stringify(collectedLetters));
}

function resetProgress() {
  if (confirm('Reset all progress?')) {
    localStorage.removeItem(progressKey);
    localStorage.removeItem('advent_letters');
    location.reload();
  }
}
resetBtn.addEventListener('click', resetProgress);

// ===== CREATE CALENDAR =====
function createCalendar() {
  const now = new Date();
  const currentDay = now.getMonth() === 11 ? now.getDate() : 0; // Dec only
  for (let i = 1; i <= totalDays; i++) {
    const box = document.createElement('div');
    box.className = 'day-box';
    box.textContent = i;

    const canOpen = isPreview || (i <= currentDay);
    if (!canOpen) box.classList.add('locked');
    if (openedDays.includes(i)) box.classList.add('opened');

    box.addEventListener('click', () => {
      if (!canOpen) {
        alert("You can't open this yet!");
        return;
      }
      openDay(i, box);
    });

    calendar.appendChild(box);
  }
}

function openDay(day, box) {
  if (!openedDays.includes(day)) openedDays.push(day);
  saveProgress();

  box.classList.add('opened');
  alert(`Day ${day} opened! 🎁`);

  // Redirect to a daily page (like day1/index.html)
  window.location.href = `day${day}/index.html`;
}

// ===== UPDATE LETTERS =====
function updateCollectedLetters() {
  collectedEl.innerHTML = collectedLetters.length
    ? `<strong>Collected Letters:</strong> ${collectedLetters.join(' ')}`
    : `<em>No letters collected yet.</em>`;
}

// ===== SECRET MESSAGE SECTION =====
function updateCipherDisplay() {
  cipherTextEl.textContent = "🔐 Secret Message — click to decode!";
  cipherTextEl.addEventListener('click', () => {
    window.location.href = 'final.html';
  });
}
updateCipherDisplay();

// ===== STARS + SNOW EFFECTS =====

// 🌨️ SNOW (white dots falling)
const snowContainer = document.createElement('div');
snowContainer.style.position = 'fixed';
snowContainer.style.top = 0;
snowContainer.style.left = 0;
snowContainer.style.width = '100%';
snowContainer.style.height = '100%';
snowContainer.style.pointerEvents = 'none';
snowContainer.style.zIndex = '1';
document.body.appendChild(snowContainer);

function createSnowflake() {
  const flake = document.createElement('div');
  flake.classList.add('snowflake');
  flake.style.position = 'absolute';
  flake.style.top = '-5px';
  flake.style.left = Math.random() * 100 + 'vw';
  flake.style.width = flake.style.height = Math.random() * 3 + 2 + 'px';
  flake.style.background = 'white';
  flake.style.borderRadius = '50%';
  flake.style.opacity = Math.random();
  snowContainer.appendChild(flake);

  const fallDuration = 8 + Math.random() * 6;
  flake.animate(
    [
      { transform: `translateY(0)` },
      { transform: `translateY(${window.innerHeight + 10}px)` }
    ],
    { duration: fallDuration * 1000, iterations: 1 }
  );

  setTimeout(() => flake.remove(), fallDuration * 1000);
}
setInterval(createSnowflake, 150);

// 🌟 STARFIELD (only a few clickable)
const numStars = 80;
const numClickable = 2;
const starContainer = document.createElement('div');
starContainer.style.position = 'fixed';
starContainer.style.top = 0;
starContainer.style.left = 0;
starContainer.style.width = '100%';
starContainer.style.height = '100%';
starContainer.style.pointerEvents = 'none';
starContainer.style.zIndex = '2';
document.body.appendChild(starContainer);

const clickableIndices = new Set();
while (clickableIndices.size < numClickable) {
  clickableIndices.add(Math.floor(Math.random() * numStars));
}

for (let i = 0; i < numStars; i++) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.style.position = 'absolute';
  star.style.width = '2px';
  star.style.height = '2px';
  star.style.borderRadius = '50%';
  star.style.background = 'white';
  star.style.opacity = Math.random() * 0.8 + 0.2;
  star.style.left = Math.random() * 100 + 'vw';
  star.style.top = Math.random() * 100 + 'vh';
  star.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  starContainer.appendChild(star);

  // twinkle effect
  setInterval(() => {
    star.style.opacity = Math.random() * 0.8 + 0.2;
  }, 1500 + Math.random() * 2000);

  // only a few stars are interactive
  if (clickableIndices.has(i)) {
    star.style.pointerEvents = 'auto';
    star.style.cursor = 'pointer';
    star.dataset.trivia = i;
    star.addEventListener('click', () => triggerStarTrivia(star));
  }
}

// === STAR TRIVIA ===
function triggerStarTrivia(star) {
  star.style.pointerEvents = 'none';
  star.style.background = 'gold';
  star.style.boxShadow = '0 0 10px 3px gold';
  showStarTrivia();
}

function showStarTrivia() {
  const trivia = document.createElement('div');
  trivia.classList.add('star-trivia');
  trivia.style.position = 'fixed';
  trivia.style.top = '50%';
  trivia.style.left = '50%';
  trivia.style.transform = 'translate(-50%, -50%)';
  trivia.style.background = 'rgba(255,255,255,0.1)';
  trivia.style.border = '1px solid rgba(255,255,255,0.3)';
  trivia.style.borderRadius = '10px';
  trivia.style.padding = '20px';
  trivia.style.color = 'white';
  trivia.style.zIndex = '1000';
  trivia.style.maxWidth = '300px';
  trivia.innerHTML = `
    <h3>🌟 The stars hold secrets...</h3>
    <p>Answer this to reveal your hidden letter:</p>
    <p><em>What is 2 × 6?</em></p>
    <input type="text" id="starAnswer" placeholder="Your answer" style="margin-top:10px;padding:5px;">
    <button id="starSubmit" style="margin-top:10px;">Submit</button>
    <p id="starFeedback"></p>
  `;
  document.body.appendChild(trivia);

  const input = trivia.querySelector('#starAnswer');
  const btn = trivia.querySelector('#starSubmit');
  const feedback = trivia.querySelector('#starFeedback');

  btn.addEventListener('click', () => {
    if (input.value.trim() === '12') {
      feedback.textContent = '✅ Correct! You found a secret letter: L';
      feedback.style.color = 'lightgreen';
      collectedLetters.push('L');
      saveProgress();
      updateCollectedLetters();
      setTimeout(() => trivia.remove(), 2000);
    } else {
      feedback.textContent = '❌ Try again!';
      feedback.style.color = 'red';
    }
  });
}

// ===== INITIALIZE =====
createCalendar();
updateCollectedLetters();
