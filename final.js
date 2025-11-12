// FINAL DECODING PAGE SCRIPT (v2 with clue types and colors)
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const message = "LOVE KNOWS NOT ITS DEPTH TILL THE HOUR OF SEPARATION.";
const cipher = message.toUpperCase().split('')
  .map(ch => (ALPHABET.includes(ch) ? ALPHABET.indexOf(ch) + 1 : ch));

const cipherGrid = document.getElementById('cipherGrid');
const eqBox = document.getElementById('equationBox');
const eqPrompt = document.getElementById('eqPrompt');
const eqAnswer = document.getElementById('eqAnswer');
const eqSubmit = document.getElementById('eqSubmit');
const eqFeedback = document.getElementById('eqFeedback');
const finalMessage = document.getElementById('finalMessage');
const backBtn = document.getElementById('backBtn');

const SOLVED_KEY = 'advent_decoded_letters_v2';
let solvedNums = JSON.parse(localStorage.getItem(SOLVED_KEY)) || [];

/*
  🧮 equation — logic/math
  📖 reference — literature, history, etc.
  💭 memory — personal or emotional
*/
const equations = {
  1:  { q: "What is 2 - 1?", a: "1", type: "🧮" },
  2:  { q: "Half of 4?", a: "2", type: "🧮" },
  3:  { q: "How long was Jesus dead for?", a: "3", type: "📖" },
  4:  { q: "2 × 2", a: "4", type: "🧮" },
  5:  { q: "10 ÷ 2", a: "5", type: "🧮" },
  8:  { q: "2³", a: "8", type: "🧮" },
  9:  { q: "3²", a: "9", type: "🧮" },
  10: { q: "5 × 2", a: "10", type: "🧮" },
  11: { q: "What comes after 10?", a: "11", type: "💭" },
  12: { q: "6 × 2", a: "12", type: "🧮" },
  15: { q: "30 ÷ 2", a: "15", type: "🧮" },
  16: { q: "8 × 2", a: "16", type: "🧮" },
  18: { q: "9 × 2", a: "18", type: "🧮" },
  19: { q: "20 - 1", a: "19", type: "🧮" },
  20: { q: "4 × 5", a: "20", type: "🧮" },
  21: { q: "7 × 3", a: "21", type: "🧮" },
  23: { q: "46 ÷ 2", a: "23", type: "🧮" },
  24: { q: "12 × 2", a: "24", type: "🧮" },
  25: { q: "50 ÷ 2", a: "25", type: "🧮" },
  26: { q: "13 × 2", a: "26", type: "🧮" },
};

// color themes for types
const typeColors = {
  "🧮": "#c7ffe1",  // mint
  "📖": "#ffe6a7",  // golden parchment
  "💭": "#ffc1dc"   // pink
};

// Build cipher grid
cipher.forEach(num => {
  const cell = document.createElement('div');
  cell.className = 'cell';
  if (typeof num === 'number') {
    cell.dataset.num = num;
    if (solvedNums.includes(num)) {
      const eq = equations[num];
      cell.textContent = ALPHABET[num - 1];
      cell.classList.add('solved');
      cell.style.background = typeColors[eq?.type || "🧮"];
      cell.style.color = "#06202a";
    } else {
      cell.textContent = num;
    }
    cell.addEventListener('click', () => handleCellClick(num));
  } else {
    cell.textContent = num;
  }
  cipherGrid.appendChild(cell);
});

function handleCellClick(num) {
  if (solvedNums.includes(num)) return;
  const eq = equations[num];
  eqBox.classList.remove('hidden');
  eqFeedback.textContent = '';

  if (!eq) {
    eqPrompt.textContent = `Letter #${num}: (no clue yet)`;
    eqAnswer.value = '';
    eqSubmit.onclick = null;
    return;
  }

  eqPrompt.textContent = `${eq.type} Letter #${num}: ${eq.q}`;
  eqAnswer.value = '';
  eqSubmit.onclick = () => {
    const ans = eqAnswer.value.trim().toLowerCase();
    if (ans === eq.a.toLowerCase()) {
      eqFeedback.textContent = "✅ Correct!";
      unlockLetter(num);
      eqBox.classList.add('hidden');
    } else {
      eqFeedback.textContent = "❌ Try again!";
    }
  };
}

function unlockLetter(num) {
  if (!solvedNums.includes(num)) solvedNums.push(num);
  localStorage.setItem(SOLVED_KEY, JSON.stringify(solvedNums));
  refreshGrid();
  checkCompletion();
}

function refreshGrid() {
  [...cipherGrid.children].forEach(cell => {
    if (cell.dataset.num) {
      const n = Number(cell.dataset.num);
      if (solvedNums.includes(n)) {
        const eq = equations[n];
        cell.textContent = ALPHABET[n - 1];
        cell.classList.add('solved');
        cell.style.background = typeColors[eq?.type || "🧮"];
        cell.style.color = "#06202a";
      }
    }
  });
}

function checkCompletion() {
  const uniqueNums = [...new Set(cipher.filter(c => typeof c === 'number'))];
  if (uniqueNums.every(n => solvedNums.includes(n))) {
    finalMessage.classList.remove('hidden');
    finalMessage.textContent = `"${message}"`;
    confetti();
  }
}

function confetti() {
  for (let i = 0; i < 120; i++) {
    const el = document.createElement('div');
    el.textContent = '🎉';
    el.style.position = 'fixed';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-10px';
    el.style.fontSize = (Math.random() * 20 + 10) + 'px';
    el.style.transition = `transform ${3 + Math.random() * 3}s linear, opacity 3s`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${window.innerHeight + 60}px) rotate(${Math.random() * 360}deg)`;
      el.style.opacity = 0;
    });
    setTimeout(() => el.remove(), 5000);
  }
}

backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

refreshGrid();
checkCompletion();
