// MAIN PAGE SCRIPT
// Handles: calendar navigation to day pages, stars with bonus trivia, star-modal answering,
// localStorage for letters, cipher reveal, reset, and white-dot falling snow.

// storage key (shared across pages)
const STORAGE_KEY = 'advent_foundLetters_v1';

// elements
const calendarEl = document.getElementById('calendar');
const lettersFoundEl = document.getElementById('lettersFound');
const resetBtn = document.getElementById('resetBtn');
const cipherTextEl = document.getElementById('cipherText');
const decodedTextEl = document.getElementById('decodedText');

const triviaModal = document.getElementById('triviaModal');
const triviaQuestion = document.getElementById('triviaQuestion');
const triviaAnswer = document.getElementById('triviaAnswer');
const submitAnswer = document.getElementById('submitAnswer');
const triviaFeedback = document.getElementById('triviaFeedback');
const closeModal = document.getElementById('closeModal');

const starsContainer = document.getElementById('starsContainer');

const previewMode = new URLSearchParams(window.location.search).get('preview') === 'true';

// final message and cipher
const finalMessage = "LOVE KNOWS NOT ITS DEPTH TILL THE HOUR OF SEPARATION.";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const cipher = finalMessage
  .toUpperCase()
  .split('')
  .map(ch => (ALPHABET.includes(ch) ? ALPHABET.indexOf(ch)+1 : ch))
  .join(' ');

// letters collected (array of single-letter strings)
let foundLetters = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// -- Build calendar: clicking a day navigates to that day's page
(function buildCalendar(){
  const now = new Date();
  const unlockedDay = previewMode ? 31 : (now.getMonth() === 11 ? now.getDate() : 0);

  for(let d=1; d<=31; d++){
    const dayBox = document.createElement('div');
    dayBox.className = 'day';
    dayBox.textContent = d;

    if(d > unlockedDay){
      dayBox.classList.add('locked');
      dayBox.setAttribute('aria-disabled','true');
    } else {
      // go to day page
      dayBox.addEventListener('click', () => {
        // navigate to folder dayN/index.html
        window.location.href = `day${d}/index.html`;
      });
    }
    calendarEl.appendChild(dayBox);
  }
})();

// -- Stars (multiple) and star-based trivia
// Define star trivia items (you can extend these)
const starTrivia = [
  { id: 'star1', question: "What is the brightest star in the night sky?", answer: "sirius", letter: "E" },
  { id: 'star2', question: "Which galaxy do we call home?", answer: "milky way", letter: "K" },
  { id: 'star3', question: "What color is the Sun to our eyes at noon?", answer: "white", letter: "N" },
  { id: 'star4', question: "What star is known as the North Star?", answer: "polaris", letter: "W" },
  // add more hidden star-trivia objects as desired
];

function spawnStars(count = 10){
  // place many subtle white stars; a subset are interactive (we'll use our starTrivia list)
  for(let i=0;i<count;i++){
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = (5 + Math.random()*80) + '%';
    star.style.left = (3 + Math.random()*90) + '%';
    // choose whether this star should be interactive: pick from starTrivia if available
    const idx = i % starTrivia.length;
    const trivia = starTrivia[idx];
    // small chance to be one of the special trivia stars (we'll make most clickable)
    star.dataset.triviaIndex = idx;
    star.title = "A twinkling star (click!)";
    // make it clickable
    star.addEventListener('click', (ev) => {
      ev.stopPropagation();
      openStarTrivia(trivia);
    });
    // starsContainer exists and covers viewport; pointer-events allowed on stars
    starsContainer.appendChild(star);
  }
}
spawnStars(12);

// open star trivia modal with provided trivia object
function openStarTrivia(trivia) {
  if(!trivia) return;
  triviaModal.classList.remove('hidden');
  triviaModal.setAttribute('aria-hidden','false');
  triviaQuestion.textContent = trivia.question;
  triviaAnswer.value = '';
  triviaFeedback.textContent = '';
  // submit handler
  submitAnswer.onclick = () => {
    const user = (triviaAnswer.value || '').trim().toLowerCase();
    if(user === (trivia.answer || '').toLowerCase()){
      triviaFeedback.textContent = "✅ Correct!";
      // add letter if not already present
      if(trivia.letter && !foundLetters.includes(trivia.letter)){
        foundLetters.push(trivia.letter);
        persistProgress();
        updateLettersDisplay();
      }
      setTimeout(closeTriviaModal, 700);
    } else {
      triviaFeedback.textContent = "❌ Try again!";
    }
  };
}

closeModal.addEventListener('click', closeTriviaModal);
function closeTriviaModal(){
  triviaModal.classList.add('hidden');
  triviaModal.setAttribute('aria-hidden','true');
  triviaQuestion.textContent = '';
  triviaAnswer.value = '';
  triviaFeedback.textContent = '';
  submitAnswer.onclick = null;
}

// -- letters display and cipher
function updateLettersDisplay(){
  lettersFoundEl.textContent = foundLetters.length ? foundLetters.join(' ') : '(none yet)';
  updateCipherDisplay();
}

function updateCipherDisplay(){
  cipherTextEl.textContent = cipher;
  // check if user has every unique letter in final message
  const uniqueLetters = [...new Set(finalMessage.replace(/[^A-Z]/g,''))];
  const hasAll = uniqueLetters.every(l => foundLetters.includes(l));
  if(hasAll || previewMode){
    decodedTextEl.textContent = `"${finalMessage}"`;
    decodedTextEl.classList.remove('hidden');
  } else {
    decodedTextEl.classList.add('hidden');
  }
}

function persistProgress(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foundLetters));
}

// reset button
resetBtn.addEventListener('click', () => {
  if(!confirm("Reset all collected letters and restart?")) return;
  foundLetters = [];
  persistProgress();
  updateLettersDisplay();
});

// initialize displays on load
updateLettersDisplay();

// -- Soft white-dot falling snow (simple implementation)
(function startSnow(){
  const container = document.querySelector('.snow');
  const width = window.innerWidth;
  const height = window.innerHeight;

  // create a pool of flakes and animate them; simple interval-based
  setInterval(() => {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    // random start left along top
    flake.style.left = Math.random() * 100 + '%';
    flake.style.top = '-8px';
    const size = (Math.random() * 4) + 2;
    flake.style.width = size + 'px';
    flake.style.height = size + 'px';
    flake.style.opacity = Math.random() * 0.9 + 0.2;
    // random duration and drift
    const duration = (Math.random() * 4) + 4; // 4-8s
    const drift = (Math.random() * 80) - 40; // -40 to +40 px drift
    flake.style.transition = `transform ${duration}s linear, opacity ${duration}s linear`;
    container.appendChild(flake);
    // trigger movement on next tick
    requestAnimationFrame(() => {
      flake.style.transform = `translate(${drift}px, ${window.innerHeight + 40}px)`;
      flake.style.opacity = 0;
    });
    // cleanup
    setTimeout(() => flake.remove(), (duration*1000)+200);
  }, 160);
})();

// ensure modal hidden at start (prevent accidental open)
window.addEventListener('DOMContentLoaded', () => {
  triviaModal.classList.add('hidden');
  triviaModal.setAttribute('aria-hidden','true');
});
