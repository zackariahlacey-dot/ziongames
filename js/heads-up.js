/* ── Bible Heads Up ─────────────────────────────────────────── */

const HU = {
  category: 'people',
  timerDuration: 60,
  score: { correct: 0, passed: 0 },
  deck: [],
  currentIdx: 0,
  timeLeft: 0,
  phase: 'setup',
  _timerInterval: null,
  _orientationBound: null,
  _wakeLock: null,
  _betaOffset: 0,
};

const HU_CATS = [
  { id: 'people',   label: 'Bible People',   icon: '👤', col: '#d4a017' },
  { id: 'places',   label: 'Bible Places',   icon: '🏛️', col: '#60a5fa' },
  { id: 'stories',  label: 'Bible Stories',  icon: '📖', col: '#a78bfa' },
  { id: 'miracles', label: 'Miracles',       icon: '✨', col: '#fbbf24' },
  { id: 'books',    label: 'Books of Bible', icon: '📜', col: '#34d399' },
  { id: 'animals',  label: 'Bible Animals',  icon: '🦁', col: '#fb923c' },
  { id: 'parables', label: 'Parables',       icon: '🌱', col: '#4ade80' },
  { id: 'objects',  label: 'Sacred Objects', icon: '⚗️', col: '#f87171' },
];

const root = document.getElementById('appRoot');

function render(html) {
  window.scrollTo(0, 0);
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

function renderGame(html) {
  root.innerHTML = html;
}

function huHandleBack() {
  if (HU.phase === 'playing') {
    if (!confirm('End this round?')) return;
    _huCleanup();
  }
  navigateTo('/');
}

function _huCleanup() {
  _stopHUTimer();
  _removeOrientationListener();
  _releaseWakeLock();
  if (_huCountdownTimer) { clearInterval(_huCountdownTimer); _huCountdownTimer = null; }
}

// ── Setup ─────────────────────────────────────────────────────
function showSetup() {
  HU.phase = 'setup';
  _huCleanup();

  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">🤔</span>
        <h2 class="font-serif text-gold2">Bible Heads Up</h2>
        <p class="text-muted text-sm mt-1">Hold phone on forehead — let everyone else give clues!</p>
      </div>

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showHUDirections()">📖 How to Play</button>

      <div class="card mb-3">
        <p class="input-label mb-2">Pick a Category</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${HU_CATS.map(cat => `
            <button onclick="selectHUCat('${cat.id}')" id="hucat-${cat.id}"
              style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.5rem;
                background:${HU.category === cat.id ? 'rgba(212,160,23,0.12)' : 'var(--bg3)'};
                border:1.5px solid ${HU.category === cat.id ? 'var(--gold2)' : 'var(--border)'};
                border-radius:var(--r-sm);cursor:pointer;transition:all 0.15s;">
              <span style="font-size:1.4rem;">${cat.icon}</span>
              <span style="font-size:0.72rem;font-weight:600;color:var(--text2);text-align:center;line-height:1.2;">${cat.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Timer</p>
        <div class="flex gap-2">
          ${[45, 60, 90, 120].map(t => `
            <button id="hutimer-${t}" onclick="selectHUTimer(${t})"
              class="btn ${HU.timerDuration === t ? 'btn-primary' : 'btn-secondary'} flex-1 btn-sm">${t}s</button>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="requestHUPermission()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Round
      </button>
    </div>
  `);
}

function selectHUCat(id) {
  HU.category = id;
  HU_CATS.forEach(cat => {
    const btn = document.getElementById(`hucat-${cat.id}`);
    if (!btn) return;
    const sel = cat.id === id;
    btn.style.background = sel ? 'rgba(212,160,23,0.12)' : 'var(--bg3)';
    btn.style.border     = `1.5px solid ${sel ? 'var(--gold2)' : 'var(--border)'}`;
  });
}

function selectHUTimer(t) {
  HU.timerDuration = t;
  [45, 60, 90, 120].forEach(v => {
    const b = document.getElementById(`hutimer-${v}`);
    if (b) b.className = `btn ${v === t ? 'btn-primary' : 'btn-secondary'} flex-1 btn-sm`;
  });
}

function showHUDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay" id="huDirOverlay" onclick="if(event.target.id==='huDirOverlay')this.remove()">
      <div class="modal" style="max-height:80vh;overflow-y:auto;">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">🤔 How to Play — Bible Heads Up</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.7;">
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🎯 Goal</p>
            <p>One player holds the phone flat on their forehead with the screen facing away. Everyone else sees the word and gives clues until the holder guesses it!</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">📱 Tilt Controls</p>
            <div style="background:var(--bg3);border-radius:var(--r-sm);padding:0.85rem 1rem;display:flex;flex-direction:column;gap:0.5rem;">
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:1.5rem;">⬆️</span>
                <div><p style="color:#4ade80;font-weight:700;margin-bottom:0.1rem;">Tilt screen UP = Got it!</p><p style="font-size:0.8rem;">Screen tilts toward the ceiling — next word.</p></div>
              </div>
              <div style="height:1px;background:var(--border);"></div>
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:1.5rem;">⬇️</span>
                <div><p style="color:#f87171;font-weight:700;margin-bottom:0.1rem;">Tilt screen DOWN = Pass</p><p style="font-size:0.8rem;">Screen tilts toward the floor — skip this word.</p></div>
              </div>
            </div>
            <p style="margin-top:0.6rem;font-size:0.8rem;">Watch the fill bars on screen — they show how far you're tilting. Hold the tilt until it triggers!</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">📖 Rules</p>
            <p>No saying the word itself. No spelling it out. Clues, sounds, and gestures only! Get as many right as you can before the timer runs out.</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('huDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
}

// ── Permission ────────────────────────────────────────────────
async function requestHUPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') { _showHUNoMotion(); return; }
    } catch(_) { _showHUNoMotion(); return; }
  }
  if (!_buildHUDeck()) return;
  _showHUCountdown();
}

function _showHUNoMotion() {
  render(`
    <div class="stagger text-center">
      <span style="font-size:3rem;display:block;margin-bottom:1rem;">🚫</span>
      <h2 class="font-serif text-gold2 mb-2">Motion Access Required</h2>
      <p class="text-muted mb-4">This game needs your device's motion sensor to detect tilts. Please allow motion access in your browser settings and try again.</p>
      <button class="btn btn-primary btn-full mb-2" onclick="requestHUPermission()">Try Again</button>
      <button class="btn btn-ghost btn-full" onclick="showSetup()">← Back</button>
    </div>
  `);
}

// ── Deck ──────────────────────────────────────────────────────
function _buildHUDeck() {
  const data  = getGameData();
  const words = data.headsUp?.[HU.category] || [];
  if (!words.length) { showToast('No words in this category', 'error'); return false; }
  HU.deck       = shuffle([...words]);
  HU.currentIdx = 0;
  HU.score      = { correct: 0, passed: 0 };
  return true;
}

// ── Countdown ─────────────────────────────────────────────────
let _huCountdownTimer = null;

function _showHUCountdown() {
  HU.phase = 'countdown';
  let count = 3;

  const cat = HU_CATS.find(c => c.id === HU.category);

  renderGame(`
    <div style="height:calc(100vh - 56px);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg);text-align:center;padding:2rem;gap:1.5rem;">
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span style="font-size:1.2rem;">${cat?.icon}</span>
        <span style="font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">${cat?.label}</span>
      </div>
      <p style="color:var(--text2);font-size:0.9rem;max-width:260px;line-height:1.5;">Hold phone flat on your forehead — screen facing away from you</p>
      <div id="huCountNum" style="font-size:7rem;font-weight:900;font-family:var(--font-h);color:var(--gold2);line-height:1;animation:animate-pop-in 0.3s ease-out;">3</div>
      <div style="padding:0.75rem 1.25rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);max-width:280px;">
        <p style="font-size:0.78rem;color:var(--text2);line-height:1.6;">
          <span style="color:#4ade80;font-weight:700;">↑ Tilt UP</span> = Got it! &nbsp;&nbsp;
          <span style="color:#f87171;font-weight:700;">↓ Tilt DOWN</span> = Pass
        </p>
      </div>
    </div>
  `);

  // Capture baseline beta during the 3-second window
  const baselineHandler = e => {
    HU._betaOffset = e.beta ?? 0;
    window.removeEventListener('deviceorientation', baselineHandler);
  };
  window.addEventListener('deviceorientation', baselineHandler, { once: true });

  _huCountdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      haptic('medium');
      const el = document.getElementById('huCountNum');
      if (el) { el.textContent = count; el.style.animation = 'none'; void el.offsetHeight; el.style.animation = 'animate-pop-in 0.3s ease-out'; }
    } else {
      clearInterval(_huCountdownTimer);
      _huCountdownTimer = null;
      haptic('heavy');
      _startHUGame();
    }
  }, 1000);
}

// ── Active game ───────────────────────────────────────────────
function _startHUGame() {
  HU.phase    = 'playing';
  HU.timeLeft = HU.timerDuration;
  _requestWakeLock();
  _renderHUActiveScreen();
  _startHUTimer();
  _attachOrientationListener();
}

function _renderHUActiveScreen() {
  const word = HU.deck[HU.currentIdx] || '—';
  const cat  = HU_CATS.find(c => c.id === HU.category);

  renderGame(`
    <div id="huGameWrap">

      <!-- Full-screen flash overlay -->
      <div id="huFlash" style="position:absolute;inset:0;opacity:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.35rem;pointer-events:none;transition:opacity 0.12s ease;">
        <span id="huFlashIcon" style="font-size:3rem;line-height:1;"></span>
        <span id="huFlashText" style="font-size:2.25rem;font-weight:900;font-family:var(--font-h);color:#fff;letter-spacing:0.04em;text-shadow:0 2px 16px rgba(0,0,0,0.35);"></span>
      </div>

      <!-- PASS zone — top ─────────────────────────────── -->
      <div id="huPassZone" style="padding:0.6rem 1.5rem 0.5rem;display:flex;flex-direction:column;align-items:center;gap:0.35rem;transition:background 0.08s;border-bottom:1px solid transparent;">

        <!-- arrow + label -->
        <div style="display:flex;align-items:center;gap:0.35rem;">
          <svg id="huPassArrow" width="22" height="22" fill="none" stroke="#f87171" stroke-width="2.5" viewBox="0 0 24 24" style="transition:transform 0.08s;"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#f87171;">Pass</span>
        </div>

        <!-- fill bar -->
        <div style="width:min(220px,65vw);height:8px;background:rgba(248,113,113,0.14);border-radius:4px;overflow:hidden;">
          <div id="huPassBar" style="height:100%;width:0%;background:linear-gradient(90deg,#f87171,#ef4444);border-radius:4px;transition:width 0.06s linear;"></div>
        </div>

      </div>

      <!-- Center ───────────────────────────────────────── -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0.75rem 1.25rem;text-align:center;gap:1rem;overflow:hidden;">

        <div style="display:flex;align-items:center;gap:0.4rem;">
          <span style="font-size:1rem;">${cat?.icon || '📖'}</span>
          <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">${cat?.label || ''}</span>
        </div>

        <!-- Word -->
        <div id="huWord" style="font-size:clamp(1.9rem,9vw,3.2rem);font-weight:900;font-family:var(--font-h);color:var(--text);line-height:1.1;letter-spacing:-0.01em;padding:0 0.25rem;transition:opacity 0.1s,transform 0.1s;">${word}</div>

        <!-- Score -->
        <div style="display:flex;align-items:baseline;gap:0.5rem;">
          <span id="huScoreNum" style="font-size:1.9rem;font-weight:900;font-family:var(--font-h);color:#4ade80;line-height:1;">${HU.score.correct}</span>
          <span style="font-size:0.78rem;color:var(--text3);">correct</span>
        </div>

        <!-- Timer -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.35rem;">
          <span id="huTimerText" style="font-size:2.4rem;font-weight:900;font-family:var(--font-h);color:var(--gold2);line-height:1;">${HU.timerDuration}</span>
          <div style="width:min(180px,55vw);height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;">
            <div id="huTimerBar" style="height:100%;width:100%;background:var(--gold2);border-radius:3px;transition:width 0.9s linear;"></div>
          </div>
        </div>

      </div>

      <!-- CORRECT zone — bottom ─────────────────────── -->
      <div id="huCorrectZone" style="padding:0.5rem 1.5rem calc(env(safe-area-inset-bottom,0px) + 0.6rem);display:flex;flex-direction:column;align-items:center;gap:0.35rem;transition:background 0.08s;border-top:1px solid transparent;">

        <!-- fill bar -->
        <div style="width:min(220px,65vw);height:8px;background:rgba(74,222,128,0.14);border-radius:4px;overflow:hidden;">
          <div id="huCorrectBar" style="height:100%;width:0%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:4px;transition:width 0.06s linear;"></div>
        </div>

        <!-- arrow + label -->
        <div style="display:flex;align-items:center;gap:0.35rem;">
          <svg id="huCorrectArrow" width="22" height="22" fill="none" stroke="#4ade80" stroke-width="2.5" viewBox="0 0 24 24" style="transition:transform 0.08s;"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#4ade80;">Got it!</span>
        </div>

      </div>

    </div>
  `);
}

// ── Orientation ───────────────────────────────────────────────
function _attachOrientationListener() {
  HU._orientationBound = _handleHUOrientation;
  window.addEventListener('deviceorientation', HU._orientationBound, { passive: true });
}

function _removeOrientationListener() {
  if (HU._orientationBound) {
    window.removeEventListener('deviceorientation', HU._orientationBound);
    HU._orientationBound = null;
  }
}

let _huLastTrigger = 0;
const HU_THRESH = 38;

function _handleHUOrientation(e) {
  if (HU.phase !== 'playing') return;
  const beta = (e.beta ?? 0) - HU._betaOffset;

  _updateHUIndicators(beta);

  const now = Date.now();
  if (now - _huLastTrigger < 1300) return;

  if (beta > HU_THRESH) {
    _huLastTrigger = now;
    _triggerHUCorrect();
  } else if (beta < -HU_THRESH) {
    _huLastTrigger = now;
    _triggerHUPass();
  }
}

function _updateHUIndicators(beta) {
  const correctFill = beta > 0 ? Math.min(100, (beta  / HU_THRESH) * 100) : 0;
  const passFill    = beta < 0 ? Math.min(100, (-beta / HU_THRESH) * 100) : 0;

  const cb = document.getElementById('huCorrectBar');
  const pb = document.getElementById('huPassBar');
  const cz = document.getElementById('huCorrectZone');
  const pz = document.getElementById('huPassZone');
  const ca = document.getElementById('huCorrectArrow');
  const pa = document.getElementById('huPassArrow');

  if (cb) cb.style.width = correctFill + '%';
  if (pb) pb.style.width = passFill    + '%';

  // Background glow on the zone
  if (cz) cz.style.background = correctFill > 5  ? `rgba(74,222,128,${(correctFill/100)*0.16})` : '';
  if (pz) pz.style.background = passFill    > 5  ? `rgba(248,113,113,${(passFill/100)*0.16})`    : '';

  // Scale arrow when filling
  if (ca) ca.style.transform = correctFill > 60 ? 'scale(1.25)' : 'scale(1)';
  if (pa) pa.style.transform = passFill    > 60 ? 'scale(1.25)' : 'scale(1)';
}

function _triggerHUCorrect() {
  HU.score.correct++;
  haptic('heavy');
  _showHUFlash(true);
  const scoreEl = document.getElementById('huScoreNum');
  if (scoreEl) {
    scoreEl.textContent = HU.score.correct;
    scoreEl.style.animation = 'none';
    void scoreEl.offsetHeight;
    scoreEl.style.animation = 'animate-pop-in 0.3s ease-out';
  }
  setTimeout(_advanceHUWord, 760);
}

function _triggerHUPass() {
  HU.score.passed++;
  haptic('medium');
  _showHUFlash(false);
  setTimeout(_advanceHUWord, 760);
}

function _showHUFlash(isCorrect) {
  const flash = document.getElementById('huFlash');
  const icon  = document.getElementById('huFlashIcon');
  const text  = document.getElementById('huFlashText');
  if (!flash) return;

  flash.style.background = isCorrect
    ? 'rgba(74,222,128,0.9)'
    : 'rgba(239,68,68,0.88)';
  if (icon) icon.textContent = isCorrect ? '✓' : '✗';
  if (text) text.textContent = isCorrect ? 'GOT IT!' : 'PASS';
  flash.style.opacity = '1';

  setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 660);
}

function _advanceHUWord() {
  HU.currentIdx++;
  if (HU.currentIdx >= HU.deck.length) {
    HU.deck       = shuffle([...HU.deck]);
    HU.currentIdx = 0;
  }

  const wordEl = document.getElementById('huWord');
  if (wordEl) {
    wordEl.style.opacity   = '0';
    wordEl.style.transform = 'scale(0.88)';
    setTimeout(() => {
      if (!wordEl) return;
      wordEl.textContent     = HU.deck[HU.currentIdx] || '—';
      wordEl.style.opacity   = '1';
      wordEl.style.transform = 'scale(1)';
    }, 115);
  }

  // Reset indicator zones
  _updateHUIndicators(0);
  const cz = document.getElementById('huCorrectZone');
  const pz = document.getElementById('huPassZone');
  if (cz) cz.style.background = '';
  if (pz) pz.style.background = '';
}

// ── Timer ─────────────────────────────────────────────────────
function _startHUTimer() {
  HU._timerInterval = setInterval(() => {
    HU.timeLeft = Math.max(0, HU.timeLeft - 1);

    const tText = document.getElementById('huTimerText');
    const tBar  = document.getElementById('huTimerBar');
    const pct   = (HU.timeLeft / HU.timerDuration) * 100;
    const color = HU.timeLeft <= 10 ? 'var(--red)' : HU.timeLeft <= 20 ? '#f59e0b' : 'var(--gold2)';

    if (tText) { tText.textContent = HU.timeLeft; tText.style.color = color; }
    if (tBar)  { tBar.style.width = pct + '%';    tBar.style.background = color; }

    if (HU.timeLeft <= 5 && HU.timeLeft > 0) haptic('light');
    if (HU.timeLeft <= 0) { clearInterval(HU._timerInterval); _endHUGame(); }
  }, 1000);
}

function _stopHUTimer() {
  if (HU._timerInterval) { clearInterval(HU._timerInterval); HU._timerInterval = null; }
}

// ── End game ──────────────────────────────────────────────────
function _endHUGame() {
  HU.phase = 'results';
  _stopHUTimer();
  _removeOrientationListener();
  _releaseWakeLock();
  haptic('heavy');

  const cat   = HU_CATS.find(c => c.id === HU.category);
  const total = HU.score.correct + HU.score.passed;
  const pct   = total > 0 ? Math.round((HU.score.correct / total) * 100) : 0;

  const rating =
    pct >= 80 ? { icon: '🏆', label: 'Outstanding!',   col: 'var(--gold2)' } :
    pct >= 60 ? { icon: '⭐', label: 'Great job!',      col: '#4ade80' }      :
    pct >= 40 ? { icon: '👍', label: 'Good effort!',    col: '#60a5fa' }      :
                { icon: '💪', label: 'Keep practicing!', col: 'var(--text2)' };

  render(`
    <div class="stagger text-center">
      <span style="font-size:3rem;display:block;margin-bottom:0.5rem;animation:bounce 1.5s ease-in-out infinite;">${rating.icon}</span>
      <h2 class="font-serif text-gold2 mb-1">Time's Up!</h2>
      <p style="font-size:0.9rem;font-weight:700;color:${rating.col};margin-bottom:1.25rem;">${rating.label}</p>

      <div class="card card-glow mb-4" style="padding:2rem;">
        <div style="display:flex;align-items:center;justify-content:center;gap:0.4rem;margin-bottom:0.25rem;">
          <span style="font-size:1rem;">${cat?.icon}</span>
          <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">${cat?.label}</span>
        </div>

        <p style="font-size:5.5rem;font-weight:900;font-family:var(--font-h);color:#4ade80;line-height:1;margin:0.5rem 0;">${HU.score.correct}</p>
        <p style="color:var(--text3);font-size:0.82rem;">words guessed correctly</p>

        <div style="margin:1.25rem 0;height:1px;background:var(--border);"></div>

        <div style="display:flex;justify-content:center;gap:2rem;">
          <div>
            <p style="font-size:1.9rem;font-weight:900;font-family:var(--font-h);color:#4ade80;">✓ ${HU.score.correct}</p>
            <p class="text-muted text-sm">Correct</p>
          </div>
          <div>
            <p style="font-size:1.9rem;font-weight:900;font-family:var(--font-h);color:#f87171;">✗ ${HU.score.passed}</p>
            <p class="text-muted text-sm">Passed</p>
          </div>
          ${total > 0 ? `<div>
            <p style="font-size:1.9rem;font-weight:900;font-family:var(--font-h);color:var(--gold2);">${pct}%</p>
            <p class="text-muted text-sm">Rate</p>
          </div>` : ''}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="navigateTo('/')">Home</button>
        <button class="btn btn-primary btn-full" onclick="showSetup()">Play Again</button>
      </div>
    </div>
  `);
}

// ── Wake Lock ─────────────────────────────────────────────────
async function _requestWakeLock() {
  try {
    if ('wakeLock' in navigator) HU._wakeLock = await navigator.wakeLock.request('screen');
  } catch(_) {}
}

function _releaseWakeLock() {
  if (HU._wakeLock) { HU._wakeLock.release().catch(() => {}); HU._wakeLock = null; }
}

// ── Init ──────────────────────────────────────────────────────
showSetup();
