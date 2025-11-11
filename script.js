// script.js
// Full interactivity: builds calendar, enforces day unlocks, handles letter pickups, shows trivia modals,
// and persists progress in localStorage.

(() => {
  const DAYS = ADVENT_DATA.daysTotal || 31;
  const YEAR = ADVENT_DATA.year || new Date().getFullYear();
  const letters = ADVENT_DATA.letters || [];
  const dayContents = ADVENT_DATA.dayContents || {};

  // Storage keys
  const STORAGE_KEY = `advent_${YEAR}_state`;
  const defaultState = { openedDays: [], foundLetters: [] };

  const elements = {
    grid: document.getElementById('calendar-grid'),
    daysOpenedCount: document.getElementById('days-opened'),
    lettersFoundCount: document.getElementById('letters-found'),
    lettersTotal: document.getElementById('letters-total'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    modalFindLetterBtn: document.getElementById('modal-find-letter'),
    triviaModal: document.getElementById('trivia-modal'),
    triviaBody: document.getElementById('trivia-body'),
    triviaClose: document.getElementById('trivia-close'),
    resetBtn: document.getElementById('reset-btn'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // Utility: load/save state
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return JSON.parse(JSON.stringify(defaultState));
      return Object.assign({}, defaultState, JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load state:", e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }
  function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  let state = loadState();

  // compute "today" for unlock logic.
  // Unlock day i if current date >= Dec i of the given year
  function isDayUnlocked(i) {
    const now = new Date();
    const decDate = new Date(YEAR, 11, i, 0, 0, 0); // months 0..11; Dec=11
    // allow local timezone; also allow preview by checking URL param ?preview=true? (optional)
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('preview') === 'true') return true;
    return now >= decDate;
  }

  // Build calendar grid
  function buildCalendar() {
    elements.grid.innerHTML = '';
    for (let d = 1; d <= DAYS; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      const locked = !isDayUnlocked(d);
      if (locked) dayEl.classList.add('locked');

      const number = document.createElement('div');
      number.className = 'number';
      number.textContent = d;
      dayEl.appendChild(number);

      const openBtn = document.createElement('button');
      openBtn.className = 'open-day';
      openBtn.textContent = isOpened(d) ? 'Opened' : (locked ? 'Locked' : 'Open');
      openBtn.disabled = locked || isOpened(d);
      openBtn.addEventListener('click', () => openDay(d));
      dayEl.appendChild(openBtn);

      const content = document.createElement('div');
      content.className = 'content';
      if (isOpened(d)) {
        const dayData = dayContents[d] || null;
        content.innerHTML = dayData ? (dayData.html || '') : '<em>No content yet.</em>';
        dayEl.classList.add('opened');
      } else {
        content.innerHTML = locked ? 'Opens later' : 'Click to open';
      }
      dayEl.appendChild(content);

      elements.grid.appendChild(dayEl);
    }
    updateCounts();
  }

  function isOpened(day) {
    return state.openedDays.includes(day);
  }

  function openDay(day) {
    if (!isDayUnlocked(day)) return;
    if (!state.openedDays.includes(day)) {
      state.openedDays.push(day);
      saveState(state);
    }
    showDayModal(day);
    buildCalendar();
  }

  // Modal for day content
  function showDayModal(day) {
    const dayData = dayContents[day] || { title: `Dec ${day}`, html: '<p>No content yet.</p>' };
    elements.modalTitle.textContent = dayData.title || `Day ${day}`;
    elements.modalBody.innerHTML = dayData.html || '';

    // show hint button to check letters whose dayUnlock == day
    const lettersForThisDay = letters.filter(l => l.dayUnlock === day);
    if (lettersForThisDay.length > 0) {
      elements.modalFindLetterBtn.classList.remove('hidden');
      elements.modalFindLetterBtn.onclick = () => {
        // reveal a gentle hint inside the modal
        const hints = lettersForThisDay.map(l => `<li>${escapeHtml(l.locationHint || 'A hidden place')}</li>`).join('');
        elements.modalBody.insertAdjacentHTML('beforeend', `<hr/><p>Hints for letters unlocked today:</p><ul>${hints}</ul>`);
      };
    } else {
      elements.modalFindLetterBtn.classList.add('hidden');
      elements.modalFindLetterBtn.onclick = null;
    }

    elements.modal.setAttribute('aria-hidden', 'false');
  }

  elements.modalClose.addEventListener('click', () => {
    elements.modal.setAttribute('aria-hidden', 'true');
  });

  // Letter collection logic: elements with class "letter-target" + data-letter-id
  function wireUpLetterTargets() {
    // set total letters count
    elements.lettersTotal.textContent = letters.length;

    // Find all elements that match letter targets in DOM
    const targets = document.querySelectorAll('.letter-target[data-letter-id]');
    targets.forEach(el => {
      const id = el.dataset.letterId;
      const meta = letters.find(x => x.id === id);
      if (!meta) return;
      // mark found if already in state
      updateLetterElement(el, id);

      el.addEventListener('click', ev => {
        ev.preventDefault();
        onLetterClicked(id, el);
      });
      // keyboard accessibility
      el.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          onLetterClicked(id, el);
        }
      });
    });
  }

  function onLetterClicked(id, el) {
    const meta = letters.find(x => x.id === id);
    if (!meta) return;
    if (!state.foundLetters.includes(id)) {
      state.foundLetters.push(id);
      saveState(state);
      updateCounts();
      updateLetterElement(el, id);
      // optional: show a small toast or animation
      el.classList.add('collected');
    }
    showTrivia(meta);
    checkAllCollected();
  }

  function updateLetterElement(el, id) {
    if (state.foundLetters.includes(id)) {
      if (!el.querySelector('.collected-badge')) {
        const span = document.createElement('span');
        span.className = 'collected-badge';
        span.style.cssText = 'margin-left:8px;color:var(--accent);font-weight:700';
        span.textContent = metaLetterChar(id) || '✓';
        el.appendChild(span);
      }
    } else {
      const badge = el.querySelector('.collected-badge');
      if (badge) badge.remove();
    }
  }

  function metaLetterChar(id) {
    const m = letters.find(x => x.id === id);
    return m ? m.letter : null;
  }

  function showTrivia(meta) {
    elements.triviaBody.innerHTML = `<p><strong>Letter:</strong> ${meta.letter || ''}</p><hr/>` + (meta.trivia || '<p>No trivia set yet.</p>');
    elements.triviaModal.setAttribute('aria-hidden', 'false');
  }
  elements.triviaClose.addEventListener('click', () => {
    elements.triviaModal.setAttribute('aria-hidden', 'true');
  });
  document.getElementById('trivia-close-btn').addEventListener('click', () => {
    elements.triviaModal.setAttribute('aria-hidden', 'true');
  });

  // Progress UI
  function updateCounts() {
    elements.daysOpenedCount.textContent = state.openedDays.length;
    elements.lettersFoundCount.textContent = state.foundLetters.length;
  }

  // Reset
  elements.resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all progress? This will clear opened days and collected letters.')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    buildCalendar();
    updateCounts();
    // refresh letter elements state
    document.querySelectorAll('.letter-target[data-letter-id]').forEach(el => {
      const badge = el.querySelector('.collected-badge');
      if (badge) badge.remove();
      el.classList.remove('collected');
    });
  });

  // When all letters found -> celebrate
  function checkAllCollected() {
    if (state.foundLetters.length >= letters.length && letters.length > 0) {
      // celebrate with confetti and a modal
      launchConfetti();
      setTimeout(() => {
        alert('Amazing! You found all letters! 🎉 Check the site for a secret message.');
      }, 200);
    }
  }

  // Simple confetti implementation (not library heavy)
  function launchConfetti() {
    const canvas = elements.confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const pieces = [];
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: (Math.random() * 8) + 4,
        d: (Math.random() * 40) + 10,
        tilt: Math.random() * 10 - 10,
        color: `hsl(${Math.floor(Math.random()*360)} 80% 65%)`
      });
    }
    let t = 0;
    function render() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      t += 1;
      pieces.forEach((p, i) => {
        p.y += Math.sin((t + p.d) / 10) + 3 + p.r / 2;
        p.x += Math.cos((t + p.d) / 20) * 2;
        p.tilt += 0.1;
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt * Math.PI / 180);
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
        ctx.restore();
      });
      if (t < 240) requestAnimationFrame(render);
      else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    render();
  }

  // Escape html helper
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
  }

  // Initialize
  function init() {
    // Build calendar
    buildCalendar();

    // Populate location hints for days that have dayUnlock (optional — could be shown in day content)
    letters.forEach(l => {
      if (l.dayUnlock) {
        const d = l.dayUnlock;
        if (!dayContents[d]) dayContents[d] = { title: `Dec ${d}`, html: `<p>Hint unlocked today: ${escapeHtml(l.locationHint || '')}</p>` };
        else {
          dayContents[d].html = (dayContents[d].html || '') + `<p>Hint: ${escapeHtml(l.locationHint || '')}</p>`;
        }
      }
    });

    // Wire up letter targets in the DOM
    wireUpLetterTargets();

    // Update any letter elements that exist on load
    document.querySelectorAll('.letter-target[data-letter-id]').forEach(el => {
      const id = el.dataset.letterId;
      if (state.foundLetters.includes(id)) {
        const marker = document.createElement('span');
        marker.className = 'collected-badge';
        marker.textContent = metaLetterChar(id) || '✓';
        marker.style.marginLeft = '8px';
        el.appendChild(marker);
      }
    });

    // Hook for modal close on outside click / escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.modal.setAttribute('aria-hidden','true');
        elements.triviaModal.setAttribute('aria-hidden','true');
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target === elements.modal) elements.modal.setAttribute('aria-hidden','true');
      if (e.target === elements.triviaModal) elements.triviaModal.setAttribute('aria-hidden','true');
    });

    // initial counts
    updateCounts();

    // update letters total
    elements.lettersTotal.textContent = letters.length;
  }

  init();
})();
