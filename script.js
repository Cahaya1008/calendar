// === Advent Calendar Script ===

// ===== CONFIG =====
const totalDays = 31;
const progressKey = 'advent_opened_days';
const letterKey = 'advent_letters';
const starKey = 'advent_clickable_stars';
const urlParams = new URLSearchParams(window.location.search);
const isPreview = urlParams.has('preview');

// ===== ELEMENTS =====
const calendar = document.getElementById('calendar');
const collectedEl = document.getElementById('collectedLetters');
const resetBtn = document.getElementById('resetProgress');
const cipherTextEl = document.getElementById('cipherText');

// ===== PROGRESS =====
let openedDays = JSON.parse(localStorage.getItem(progressKey)) || [];
let collectedLetters = JSON.parse(localStorage.getItem(letterKey)) || [];

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(openedDays));
  localStorage.setItem(letterKey, JSON.stringify(collectedLetters));
}

function resetProgress() {
  if (confirm('Reset all progress?')) {
    localStorage.removeItem(progressKey);
    localStorage.removeItem(letterKey);
    localStorage.removeItem(starKey);
    location.reload();
  }
}
resetBtn.addEventListener('click', resetProgress);

// ===== CALENDAR =====
function createCalendar() {
  const now = new Date();
  const currentDay = now.getMonth() === 11 ? now.getDate() : 0; // only Dec
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
  window.location.href = `day${day}/index.html`;
}

// ===== LETTERS =====
function updateCollectedLetters() {
  collectedEl.innerHTML = collectedLetters.length
    ? `<strong>Collected Letters:</strong> ${collectedLetters.join(' ')}`
    : `<em>No letters collected yet.</em>`;
}

// ===== SECRET MESSAGE =====
cipherTextEl.textContent = "🔐 Secret Message — click to decode!";
cipherTextEl.addEventListener('click', () => {
  window.location.href = 'final.html';
});

// ===== SNOW EFFECT =====
const snowContainer = document.createElement('div');
Object.assign(snowContainer.style, {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: '1'
});
document.body.appendChild(snowContainer);

function createSnowflake() {
  const flake = document.createElement('div');
  Object.assign(flake.style, {
    position: 'absolute',
    top: '-5px',
    left: Math.random() * 100 + 'vw',
    width: Math.random() * 3 + 2 + 'px',
    height: Math.random() * 3 + 2 + 'px',
    background: 'white',
    borderRadius: '50%',
    opacity: Math.random()
  });
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

// ===== STARS =====
const numStars = 80;
let clickableIndices = JSON.parse(localStorage.getItem(starKey));

if (!clickableIndices) {
  clickableIndices = [];
  while (clickableIndices.length < 2) {
    const n = Math.floor(Math.random() * numStars);
    if (!clickableIndices.includes(n)) clickableIndices.push(n);
  }
  localStorage.setItem(starKey, JSON.stringify(clickableIndices));
}

const starContainer = document.createElement('div');
Object.assign(starContainer.style, {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: '2'
});
document.body.appendChild(starContainer);

for (let i = 0; i < numStars; i++) {
  const star = document.createElement('div');
  Object.assign(star.style, {
    position: 'absolute',
    width: '2px',
    height: '2px',
    borderRadius: '50%',
    background: 'white',
    opacity: Math.random() * 0.8 + 0.2,
    left: Math.random() * 100 + 'vw',
    top: Math.random() * 100 + 'vh',
    transition: 'transform 0.3s ease, opacity 0.3s ease'
  });

  // Twinkle effect
  setInterval(() => {
    star.style.opacity = Math.random() * 0.8 + 0.2;
  }, 1500 + Math.random() * 2000);

  // Only allow clicks for two chosen stars
  if (clickableIndices.includes(i)) {
    star.classList.add('clickable-star');
    star.style.cursor = 'pointer';
    star.addEventListener('click', () => triggerStarTrivia(star));
  } else {
    star.style.pointerEvents = 'none';
  }

  starContainer.appendChild(star);
}

// ===== STAR TRIVIA =====
function triggerStarTrivia(star) {
  star.style.pointerEvents = 'none';
  star.style.background = 'gold';
  star.style.boxShadow = '0 0 10px 3px gold';
  showStarTrivia();
}

function showStarTrivia() {
  const trivia = document.createElement('div');
  Object.assign(trivia.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    padding: '20px',
    color: 'white',
    zIndex: '1000',
    maxWidth: '300px',
    textAlign: 'center',
    backdropFilter: 'blur(8px)'
  });

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
      sparkleEffect();
      setTimeout(() => trivia.remove(), 2000);
    } else {
      feedback.textContent = '❌ Try again!';
      feedback.style.color = 'red';
    }
  });
}

// ===== SPARKLE ANIMATION =====
function sparkleEffect() {
  const sparkle = document.createElement('div');
  sparkle.textContent = '✨';
  Object.assign(sparkle.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(1)',
    fontSize: '2rem',
    opacity: '1',
    transition: 'all 1s ease',
    zIndex: '2000'
  });
  document.body.appendChild(sparkle);

  setTimeout(() => {
    sparkle.style.transform = 'translate(-50%, -50%) scale(2)';
    sparkle.style.opacity = '0';
  }, 100);
  setTimeout(() => sparkle.remove(), 1000);
}

// ===== INIT =====
createCalendar();
updateCollectedLetters();
