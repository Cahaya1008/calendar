// Fresh start script implementing the spec in your message

// Storage keys
const STORAGE = {
  letters: 'advent_collected_letters_v1',
  solvedStars: 'advent_solved_stars_v1',
  clickableStars: 'advent_clickable_stars_v1'
};

// DOM references
const calendarEl = document.getElementById('calendar');
const snowContainer = document.getElementById('snow-container');
const starsContainer = document.getElementById('stars-container');
const collectedEl = document.getElementById('collectedLetters');
const resetBtn = document.getElementById('resetProgress');
const finalBtn = document.getElementById('finalBtn');

const triviaModal = document.getElementById('triviaModal');
const modalTitle = document.getElementById('modalTitle');
const modalQuestion = document.getElementById('modalQuestion');
const modalAnswer = document.getElementById('modalAnswer');
const modalSubmit = document.getElementById('modalSubmit');
const modalClose = document.getElementById('modalClose');
const modalFeedback = document.getElementById('modalFeedback');

const TOTAL_DAYS = 31;
const STAR_COUNT = 30;      // visual stars total
const CLICKABLE_COUNT = 2;  // number of special clickable stars

// simple sample star-trivia pool; you can edit later
const STAR_TRIVIA_POOL = [
  { q: "What is 2 × 6?", a: "12", letter: "L" },
  { q: "What number is 7 × 3?", a: "21", letter: "O" },
  { q: "What is 5 + 7?", a: "12", letter: "V" },
  { q: "What's 10 - 4?", a: "6", letter: "E" }
];

// Utility: load/save
function load(key, def) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Progress state
let collectedLetters = load(STORAGE.letters, []); // e.g. ["L","C"]
let solvedStars = load(STORAGE.solvedStars, []);  // indices of stars that have been solved (persist)
let clickableStars = load(STORAGE.clickableStars, null); // indices chosen as clickable

// Preview mode override? supports ?preview=true
const PREVIEW = new URLSearchParams(window.location.search).get('preview') === 'true';

// ---------------- Calendar build ----------------
function dayUnlocked(day) {
  if (PREVIEW) return true;
  const now = new Date();
  // unlock if today is December and day <= today OR if today is after current year Dec (not needed)
  return (now.getMonth() === 11 && now.getDate() >= day);
}

function buildCalendar() {
  calendarEl.innerHTML = '';
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;
    if (!dayUnlocked(d)) el.classList.add('locked');
    if (load(STORAGE.letters, []).includes(`DAY${d}`)) el.classList.add('opened');

    el.addEventListener('click', () => {
      if (!dayUnlocked(d)) {
        alert("This day isn't unlocked yet.");
        return;
      }
      // navigate to day page (days/dayN.html)
      window.location.href = `days/day${d}.html`;
    });

    calendarEl.appendChild(el);
  }
}

// ---------------- Snow (white dots) ----------------
function startSnow() {
  setInterval(() => {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    const size = Math.random()*4 + 2;
    flake.style.width = flake.style.height = `${size}px`;
    flake.style.left = `${Math.random()*100}vw`;
    snowContainer.appendChild(flake);
    // animate using transition via transform
    const duration = 5 + Math.random()*4;
    flake.animate(
      [{ transform: 'translateY(0)', opacity: 1 },
       { transform: `translateY(${window.innerHeight + 40}px)`, opacity: 0 }],
      { duration: duration*1000, easing: 'linear' }
    );
    setTimeout(()=> flake.remove(), duration*1000 + 200);
  }, 140);
}

// ---------------- Stars (only a few clickable) ----------------
function chooseClickableStars() {
  if (Array.isArray(clickableStars) && clickableStars.length === CLICKABLE_COUNT) return clickableStars;
  const set = new Set();
  while (set.size < CLICKABLE_COUNT) {
    set.add(Math.floor(Math.random()*STAR_COUNT));
  }
  clickableStars = Array.from(set);
  save(STORAGE.clickableStars, clickableStars);
  return clickableStars;
}

function spawnStars() {
  const clickable = chooseClickableStars();
  starsContainer.innerHTML = '';
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement('div');
    s.className = 'star twinkle';
    s.style.left = `${Math.random()*95}%`;
    s.style.top = `${Math.random()*35}%`;
    // if this index is clickable and not yet solved, make clickable
    if (clickable.includes(i) && !solvedStars.includes(i)) {
      s.classList.add('clickable');
      s.style.pointerEvents = 'auto';
      s.addEventListener('click', (e)=> {
        openStarTrivia(i);
      });
    } else {
      // ensure inert
      s.style.pointerEvents = 'none';
    }
    // if solved, mark visually (still twinkles but looks a bit dim)
    if (solvedStars.includes(i)) s.classList.add('solved');

    starsContainer.appendChild(s);
  }
}

// ---------------- Star Trivia modal ----------------
let activeStarIndex = null;
let activeStarTrivia = null;

function openStarTrivia(index) {
  // pick a trivia object from pool (round-robin based on index so it's deterministic)
  activeStarIndex = index;
  const poolIndex = index % STAR_TRIVIA_POOL.length;
  activeStarTrivia = STAR_TRIVIA_POOL[poolIndex];

  modalTitle.textContent = 'Star Surprise';
  modalQuestion.textContent = activeStarTrivia.q;
  modalAnswer.value = '';
  modalFeedback.textContent = '';
  triviaModal.classList.remove('hidden');
  triviaModal.setAttribute('aria-hidden','false');
  modalAnswer.focus();
}

modalClose.addEventListener('click', closeModal);
function closeModal() {
  triviaModal.classList.add('hidden');
  triviaModal.setAttribute('aria-hidden','true');
  activeStarIndex = null;
  activeStarTrivia = null;
}

// submit handling: clicking submit checks answer
modalSubmit.addEventListener('click', () => {
  if (!activeStarTrivia) return;
  const val = (modalAnswer.value || '').trim().toLowerCase();
  if (!val) { modalFeedback.textContent = 'Please enter an answer.'; return; }
  if (val === String(activeStarTrivia.a).toLowerCase()) {
    modalFeedback.textContent = '✅ Correct — you found a letter!';
    // award letter
    collectedLetters.push(activeStarTrivia.letter);
    saveCollected();
    // mark star solved so it cannot be clicked again
    if (!solvedStars.includes(activeStarIndex)) {
      solvedStars.push(activeStarIndex);
      save(STORAGE.solvedStars, solvedStars);
    }
    // refresh stars visually
    spawnStars();
    updateCollectedDisplay();
    // close after short delay
    setTimeout(closeModal, 900);
  } else {
    modalFeedback.textContent = '❌ Not quite — try again.';
  }
});

// ---------------- Collected letters display ----------------
function saveCollected() { save(STORAGE.letters, collectedLetters); }
function updateCollectedDisplay() {
  if (collectedLetters.length === 0) {
    collectedEl.textContent = '(none yet)';
    return;
  }
  // show as spaced letters
  collectedEl.textContent = collectedLetters.joi
