/* ── Biblical Mr. White ──────────────────────────────────── */

const MW = {
  players: [],
  difficulty: 'easy',
  word: '',        // citizens' word
  mrWhiteWord: '', // Mr. White's related word
  mrWhiteIndex: -1,
  round: 1,
  eliminated: [],
  votes: {},
  phase: 'setup', // setup | name-entry | role-reveal | clues | vote | result | guess | gameover
  _pool: null,
  clueTimer: 0,    // 0 = off, else seconds per player

  get activePlayers() {
    return this.players.filter((_, i) => !this.eliminated.includes(i));
  }
};

// ── Persistence ────────────────────────────────────────────
const MW_SAVE_KEY = 'zionMrWhiteSession';

function saveMWState() {
  try {
    const state = {
      players:      MW.players,
      difficulty:   MW.difficulty,
      word:         MW.word,
      mrWhiteWord:  MW.mrWhiteWord,
      mrWhiteIndex: MW.mrWhiteIndex,
      round:        MW.round,
      eliminated:   MW.eliminated,
      votes:        MW.votes,
      phase:        MW.phase,
      _pool:        MW._pool,
      _setupCount:  _setupCount,
      clueTimer:    MW.clueTimer,
    };
    localStorage.setItem(MW_SAVE_KEY, JSON.stringify(state));
  } catch(_) {}
}

function clearMWState() {
  try { localStorage.removeItem(MW_SAVE_KEY); } catch(_) {}
}

function loadMWState() {
  try { return JSON.parse(localStorage.getItem(MW_SAVE_KEY)); } catch(_) { return null; }
}

// ── Render helpers ────────────────────────────────────────
const root = document.getElementById('appRoot');

function render(html) {
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup state ───────────────────────────────────────────
let _setupCount = 3; // chosen player count
let _nameEntryIndex = 0; // which player is currently entering their name
let _enteredNames = []; // names typed so far

// ── SCREEN: Continue or New ────────────────────────────────
function showContinuePrompt(saved) {
  render(`
    <div class="stagger text-center">
      <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">📜</span>
      <h2 class="font-serif text-gold2 mb-1">Biblical Mr. White</h2>
      <p class="text-muted text-sm mb-4">A game was in progress. Would you like to continue?</p>

      <div class="card mb-3 text-left" style="padding:1rem 1.25rem;">
        <p class="text-sm font-bold mb-1" style="color:var(--text);">Last saved game</p>
        <p class="text-muted text-sm">Players: ${saved.players.join(', ')}</p>
        <p class="text-muted text-sm">Round: ${saved.round} · Difficulty: ${saved.difficulty}</p>
      </div>

      <div class="flex flex-col gap-2">
        <button class="btn btn-primary btn-lg btn-full" onclick="restoreMWState()">
          ▶ Continue Game
        </button>
        <button class="btn btn-ghost btn-full" onclick="clearMWState();showSetup()">
          New Game
        </button>
      </div>
    </div>
  `);
}

function restoreMWState() {
  const saved = loadMWState();
  if (!saved) { showSetup(); return; }
  MW.players      = saved.players;
  MW.difficulty   = saved.difficulty;
  MW.word         = saved.word;
  MW.mrWhiteWord  = saved.mrWhiteWord;
  MW.mrWhiteIndex = saved.mrWhiteIndex;
  MW.round        = saved.round;
  MW.eliminated   = saved.eliminated;
  MW.votes        = saved.votes;
  MW.phase        = saved.phase;
  MW._pool        = saved._pool;
  MW.clueTimer    = saved.clueTimer || 0;
  _setupCount     = saved._setupCount || 3;
  // Resume at the correct phase
  resumePhase();
}

function resumePhase() {
  switch (MW.phase) {
    case 'clues':    showCluePhase();    break;
    case 'vote':     showVotePhase();    break;
    case 'gameover': showSetup();        break;
    default:         showSetup();        break;
  }
}

// ── SCREEN: Setup – Choose Player Count ───────────────────
function showSetup() {
  MW.phase = 'setup';
  saveMWState();
  renderSetupScreen();
}

function renderSetupScreen() {
  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">📜</span>
        <h2 class="font-serif text-gold2">Biblical Mr. White</h2>
        <p class="text-muted text-sm mt-1">Everyone shares a secret word — except Mr. White</p>
      </div>

      <!-- Difficulty -->
      <div class="card mb-3">
        <p class="input-label mb-2">Difficulty</p>
        <div class="flex gap-1">
          ${['easy','medium','hard'].map(d => `
            <button class="diff-btn ${d} ${MW.difficulty === d ? 'active' : ''}" onclick="setDiff('${d}')">
              <span class="diff-icon">${d==='easy'?'🌱':d==='medium'?'⚡':'🔥'}</span>
              ${d.charAt(0).toUpperCase()+d.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Clue Timer -->
      <div class="card mb-3">
        <div class="flex justify-between items-center mb-2">
          <div>
            <p class="text-sm font-bold">Clue Timer</p>
            <p class="text-muted" style="font-size:0.75rem;">Seconds per player for clues</p>
          </div>
          <div class="flex gap-1" id="mwTimerBtns">
            ${[0,15,30,60].map(s => `
              <button class="btn btn-sm ${MW.clueTimer===s?'btn-primary':'btn-ghost'}" id="mwt-${s}"
                onclick="setMWTimer(${s})">${s===0?'Off':s+'s'}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Player count picker -->
      <div class="card mb-4">
        <p class="input-label mb-3">How many players?</p>
        <div class="flex items-center justify-center gap-4">
          <button onclick="adjustCount(-1)" class="btn btn-ghost btn-icon" style="width:44px;height:44px;font-size:1.4rem;">−</button>
          <span id="countDisplay" style="font-family:var(--font-h);font-size:2.5rem;font-weight:700;color:var(--gold2);min-width:48px;text-align:center;">${_setupCount}</span>
          <button onclick="adjustCount(1)" class="btn btn-ghost btn-icon" style="width:44px;height:44px;font-size:1.4rem;">+</button>
        </div>
        <p class="text-muted text-sm text-center mt-2">3–10 players</p>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startNameEntry()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
}

function adjustCount(delta) {
  _setupCount = Math.max(3, Math.min(10, _setupCount + delta));
  const el = document.getElementById('countDisplay');
  if (el) el.textContent = _setupCount;
}

function setDiff(d) {
  MW.difficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.diff-btn.${d}`)?.classList.add('active');
}

function setMWTimer(s) {
  MW.clueTimer = s;
  document.querySelectorAll('#mwTimerBtns button').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-ghost');
  });
  document.getElementById(`mwt-${s}`)?.classList.replace('btn-ghost', 'btn-primary');
}


// ── Name Entry Flow ────────────────────────────────────────
function startNameEntry() {
  _enteredNames = [];
  _nameEntryIndex = 0;

  // Pick word & Mr. White now so we have it ready
  const data = getGameData();
  const pool = data.mrWhite[MW.difficulty];
  if (!pool || pool.length === 0) { showToast('No words for this difficulty', 'error'); return; }

  const pair = pickRandom(pool);
  MW.word = pair.word;
  MW.mrWhiteWord = pair.mrWhite;
  MW.mrWhiteIndex = Math.floor(Math.random() * _setupCount);
  MW._pool = pool;
  MW.eliminated = [];
  MW.round = 1;
  MW.votes = {};
  MW.phase = 'name-entry';
  saveMWState();

  showNameEntry(0);
}

function showNameEntry(idx) {
  _nameEntryIndex = idx;
  render(`
    <div class="stagger text-center">
      <p class="text-muted text-sm mb-1">Player ${idx + 1} of ${_setupCount}</p>
      <h2 class="font-serif text-gold2 mb-1">Who's next?</h2>
      <p class="text-muted text-sm mb-4">Hand the phone to <strong style="color:var(--text)">Player ${idx + 1}</strong> — no peeking!</p>

      <div class="card card-glow mb-4" style="padding:2rem;">
        <div class="avatar" style="width:64px;height:64px;font-size:1.6rem;margin:0 auto 1rem;">${idx + 1}</div>
        <input class="input" id="nameInput" placeholder="Enter your name…" autocomplete="off"
          style="font-size:1.1rem;text-align:center;"
          onkeydown="if(event.key==='Enter')submitName()"
        />
      </div>

      <div class="progress-bar mb-2"><div class="progress-fill" style="width:${((idx)/_setupCount)*100}%"></div></div>

      <button class="btn btn-primary btn-lg btn-full mt-2" onclick="submitName()">
        Continue →
      </button>
    </div>
  `);
  setTimeout(() => document.getElementById('nameInput')?.focus(), 80);
}

function submitName() {
  const input = document.getElementById('nameInput');
  const name = input?.value?.trim();
  if (!name) { showToast('Please enter your name', 'error'); return; }

  _enteredNames.push(name);
  haptic('light');

  const nextIdx = _nameEntryIndex + 1;
  if (nextIdx < _setupCount) {
    // Show a "cover" screen before handing phone to next person
    showHandoffScreen(nextIdx);
  } else {
    // All names collected, now do card reveals
    MW.players = [..._enteredNames];
    MW.mrWhiteIndex = Math.floor(Math.random() * MW.players.length); // re-randomise now we know names
    saveMWState();
    showRoleReveal(0);
  }
}

function showHandoffScreen(nextIdx) {
  render(`
    <div class="stagger text-center" style="padding:3rem 1rem;">
      <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:bounce 1.5s ease-in-out infinite;">🙈</span>
      <h2 class="font-serif text-gold2 mb-2">Pass the Phone</h2>
      <p class="text-muted mb-4">Hand the phone to <strong style="color:var(--text)">Player ${nextIdx + 1}</strong>.<br/>Everyone else look away!</p>
      <button class="btn btn-primary btn-lg btn-full" onclick="showNameEntry(${nextIdx})">
        I'm ready →
      </button>
    </div>
  `);
}

function reshuffleWord() {
  const pool = MW._pool;
  if (!pool || pool.length < 2) { showToast('Not enough words to shuffle', 'error'); return; }
  let pair;
  do { pair = pickRandom(pool); } while (pair.word === MW.word && pool.length > 1);
  MW.word = pair.word;
  MW.mrWhiteWord = pair.mrWhite;
  MW.mrWhiteIndex = Math.floor(Math.random() * MW.players.length);
  saveMWState();
  haptic('medium');
  const btn = document.getElementById('shuffleBtn');
  if (btn) { btn.textContent = '✓ New word ready!'; btn.disabled = true; btn.style.opacity = '0.5'; }
  showToast('New word picked!', 'success');
}

// ── SCREEN: Role Reveal (card flip per player) ────────────
let revealIndex = 0;
function showRoleReveal(idx) {
  revealIndex = idx;
  MW.phase = 'role-reveal';
  saveMWState();
  const name = MW.players[idx];
  const isMW = idx === MW.mrWhiteIndex;

  render(`
    <div class="stagger text-center">
      <p class="text-muted text-sm mb-1">Round 1 — Word Reveal</p>
      <h2 class="font-serif text-gold2 mb-1">${name}'s Turn</h2>
      <p class="text-muted text-sm mb-4">Hand the phone to <strong style="color:var(--text)">${name}</strong> and everyone else look away.</p>

      ${idx === 0 ? `
      <button id="shuffleBtn" class="btn btn-ghost btn-sm mb-3" onclick="reshuffleWord()" style="opacity:0.7;">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:0.35rem;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Already played this word? Shuffle
      </button>` : ''}

      <div class="flip-card w-full mb-4" id="revCard" onclick="flipReveal(${idx}, ${isMW})">
        <div class="flip-inner">
          <div class="flip-front">
            <div class="role-card-front">
              <span style="font-size:3rem;animation:float 3s ease-in-out infinite">🤫</span>
              <p class="font-serif text-gold2" style="font-size:1.1rem;">Tap to reveal your word</p>
              <p class="text-muted text-sm">Make sure no one else is looking!</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" id="revBack">
              <!-- filled after flip -->
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted text-sm">Player ${idx + 1} of ${MW.players.length}</p>
      <div class="progress-bar mt-2"><div class="progress-fill" style="width:${((idx+1)/MW.players.length)*100}%"></div></div>
    </div>
  `);
}

function flipReveal(idx, isMW) {
  const card = document.getElementById('revCard');
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  haptic('medium');

  const back = document.getElementById('revBack');
  // Whether Mr. White or citizen, just show "Your Word is …"
  // Mr. White sees their DIFFERENT word but doesn't know they are Mr. White
  const displayWord = isMW ? MW.mrWhiteWord : MW.word;

  back.innerHTML = `
    <span style="font-size:2rem;margin-bottom:0.5rem;animation:float 3s ease-in-out infinite">📜</span>
    <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">Your Word is</p>
    <p class="word-text">${displayWord}</p>
    <p class="text-muted text-sm mt-2">Remember it — don't say it aloud!</p>
  `;

  // Next button appears after a moment
  setTimeout(() => {
    const nextIdx = idx + 1;
    const container = document.querySelector('.container');
    const nextBtn = document.createElement('div');
    nextBtn.className = 'mt-3 animate-slide-up';
    if (nextIdx < MW.players.length) {
      nextBtn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showRoleReveal(${nextIdx})">
        Next: ${MW.players[nextIdx]} →
      </button>`;
    } else {
      nextBtn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showCluePhase()">
        🕊️ Begin — All Words Revealed
      </button>`;
    }
    container.appendChild(nextBtn);
  }, 1000);
}

// ── SCREEN: Clue Phase ────────────────────────────────────
let _clueOrder = [];
let _clueIdx = 0;
let _clueTimerInterval = null;

function clearMWClueTimer() {
  if (_clueTimerInterval) { clearInterval(_clueTimerInterval); _clueTimerInterval = null; }
}

function showCluePhase() {
  MW.phase = 'clues';
  saveMWState();
  const active = MW.activePlayers;
  _clueOrder = shuffle([...active]);
  _clueIdx = 0;

  if (MW.clueTimer > 0) {
    renderTimedCluePhase();
  } else {
    renderStaticCluePhase();
  }
}

function renderStaticCluePhase() {
  render(`
    <div class="stagger">
      <div class="card card-glow mb-3 text-center">
        <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.25rem;">Round ${MW.round}</p>
        <h2 class="font-serif text-gold2">Clue Giving</h2>
        <p class="text-muted text-sm mt-1">Each player gives ONE clue. Mr. White has a <em>similar</em> word — find who doesn't quite fit!</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Clue Order</p>
        <div class="flex flex-col gap-2" id="clueOrder">
          ${_clueOrder.map((name, i) => `
            <div class="player-chip" id="clue-${i}">
              <div class="avatar">${getInitials(name)}</div>
              <span>${name}</span>
              <span class="text-muted text-sm" style="margin-left:auto;">${i+1}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mb-3" style="background:var(--gold-dim);border-color:var(--border2);">
        <p class="text-sm text-center" style="color:var(--text);">
          💡 Rules: One word per player. No gestures. No giving away the word directly. Mr. White must try to blend in!
        </p>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showVotePhase()">
        Proceed to Vote
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `);
}

function renderTimedCluePhase() {
  clearMWClueTimer();
  const name = _clueOrder[_clueIdx];
  const isLast = _clueIdx === _clueOrder.length - 1;
  const total  = _clueOrder.length;
  const secs   = MW.clueTimer;

  render(`
    <div class="stagger">
      <div class="card card-glow mb-3 text-center">
        <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.25rem;">Round ${MW.round} &nbsp;·&nbsp; ${_clueIdx+1} of ${total}</p>
        <h2 class="font-serif text-gold2">${name}'s Clue</h2>
        <p class="text-muted text-sm mt-1">Give ONE word or phrase about your word. Don't give it away!</p>
      </div>

      <!-- Progress dots -->
      <div class="flex justify-center gap-1 mb-3">
        ${_clueOrder.map((_, i) => `
          <span style="width:8px;height:8px;border-radius:50%;background:${i < _clueIdx ? 'var(--green)' : i === _clueIdx ? 'var(--gold)' : 'var(--border)'};display:inline-block;transition:background 0.3s;"></span>
        `).join('')}
      </div>

      <!-- Timer area -->
      <div class="card mb-4" style="padding:1.25rem;text-align:center;">
        <div id="mwTimerDigit" style="font-family:var(--font-h);font-size:3.5rem;font-weight:800;color:var(--gold2);line-height:1;margin-bottom:0.75rem;">${secs}</div>
        <div style="height:8px;border-radius:4px;background:var(--bg3);overflow:hidden;margin-bottom:1rem;">
          <div id="mwTimerBar" style="height:100%;width:100%;background:var(--gold);border-radius:4px;transition:width 0.9s linear,background 0.5s;"></div>
        </div>
        <button id="mwStartBtn" class="btn btn-primary btn-full" onclick="startMWClueTimer(${secs})">
          ▶ Start Timer
        </button>
        <button id="mwDoneBtn" class="btn btn-ghost btn-full mt-2" style="display:none;" onclick="advanceMWClue()">
          ✓ Done Early
        </button>
      </div>

      <button class="btn btn-ghost btn-sm btn-full" onclick="showVotePhase()" style="opacity:0.6;">
        Skip to Vote
      </button>
    </div>
  `);
}

function startMWClueTimer(secs) {
  clearMWClueTimer();
  let remaining = secs;
  document.getElementById('mwStartBtn').style.display = 'none';
  document.getElementById('mwDoneBtn').style.display  = '';
  haptic('light');

  _clueTimerInterval = setInterval(() => {
    remaining--;
    const digit = document.getElementById('mwTimerDigit');
    const bar   = document.getElementById('mwTimerBar');
    if (digit) digit.textContent = remaining;
    if (bar) {
      const pct = (remaining / secs) * 100;
      bar.style.width = pct + '%';
      bar.style.background = remaining <= 5 ? 'var(--red)' : remaining <= Math.floor(secs * 0.3) ? '#f59e0b' : 'var(--gold)';
    }
    if (remaining <= 3 && remaining > 0) haptic('medium');
    if (remaining <= 0) {
      clearMWClueTimer();
      haptic('heavy');
      setTimeout(advanceMWClue, 600);
    }
  }, 1000);
}

function advanceMWClue() {
  clearMWClueTimer();
  _clueIdx++;
  if (_clueIdx >= _clueOrder.length) {
    showVotePhase();
  } else {
    renderTimedCluePhase();
  }
}



// ── SCREEN: Vote Phase ────────────────────────────────────
function showVotePhase() {
  MW.phase = 'vote';
  saveMWState();
  MW.votes = {};
  const active = MW.activePlayers;

  render(`
    <div class="stagger">
      <div class="text-center mb-3">
        <span class="phase-banner phase-vote mb-2" style="display:inline-block;">🗳️ Voting Round ${MW.round}</span>
        <p class="text-muted text-sm">Who is Mr. White? Tap the player you suspect, then confirm.</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Cast Your Vote</p>
        <div class="flex flex-col gap-2" id="voteList">
          ${active.map((p, i) => {
            const realIdx = MW.players.indexOf(p);
            return `
              <button class="vote-btn" id="vbtn-${realIdx}" onclick="selectVote(${realIdx})">
                <div class="avatar">${getInitials(p)}</div>
                <span>${p}</span>
                <span class="vote-count hidden" id="vc-${realIdx}">0</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="card mb-3" style="display:none;" id="voteConfirmBox">
        <p class="text-sm text-center text-muted mb-2">Eliminate <strong id="voteTarget" style="color:var(--text)"></strong>?</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="clearVoteSelection()">Cancel</button>
          <button class="btn btn-danger btn-full" onclick="confirmElimination()">⚡ Eliminate</button>
        </div>
      </div>

      <button class="btn btn-ghost btn-full" onclick="showCluePhase()">← Back to Clues</button>
    </div>
  `);
}

let selectedVote = -1;
function selectVote(idx) {
  selectedVote = idx;
  document.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`vbtn-${idx}`)?.classList.add('selected');
  const box = document.getElementById('voteConfirmBox');
  box.style.display = '';
  document.getElementById('voteTarget').textContent = MW.players[idx];
  haptic('light');
}

function clearVoteSelection() {
  selectedVote = -1;
  document.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('voteConfirmBox').style.display = 'none';
}

function confirmElimination() {
  if (selectedVote === -1) return;
  haptic('heavy');
  const eliminated = MW.players[selectedVote];
  const isMW = selectedVote === MW.mrWhiteIndex;

  if (isMW) {
    showMrWhiteGuess(eliminated);
  } else {
    MW.eliminated.push(selectedVote);
    saveMWState();
    showEliminationResult(eliminated, false);
  }
}

// ── SCREEN: Mr. White Guess ───────────────────────────────
function showMrWhiteGuess(name) {
  MW.phase = 'guess';
  saveMWState();
  render(`
    <div class="stagger text-center">
      <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:bounce 1.5s infinite">🕵️</span>
      <h2 class="font-serif text-gold2 mb-2">Mr. White Caught!</h2>
      <p class="text-muted mb-4"><strong style="color:var(--text)">${name}</strong> was revealed as Mr. White!</p>

      <div class="card card-glow mb-4">
        <p class="font-bold mb-2" style="color:var(--text);">Last Chance, ${name}!</p>
        <p class="text-muted text-sm mb-3">Can you guess the word everyone else had? One try wins it all!</p>
        <input class="input mb-2" id="guessInput" placeholder="Enter the citizens' word…" autocomplete="off"/>
        <button class="btn btn-primary btn-full" onclick="checkGuess('${name}')">
          Submit Guess
        </button>
      </div>

      <p class="text-muted text-sm">The citizens' word has ${MW.word.length} letters</p>
    </div>
  `);
  document.getElementById('guessInput')?.focus();
}

function checkGuess(name) {
  const guess = document.getElementById('guessInput')?.value?.trim();
  if (!guess) { showToast('Enter a guess first', 'error'); return; }
  haptic('heavy');
  const correct = guess.toLowerCase() === MW.word.toLowerCase();
  showGameOver(correct ? 'mrwhite' : 'citizens', name, correct);
}

// ── SCREEN: Elimination Result ────────────────────────────
function showEliminationResult(name, wasMW) {
  const active = MW.activePlayers;
  const mrWhiteAlive = !MW.eliminated.includes(MW.mrWhiteIndex);
  const goodCount = active.length - (mrWhiteAlive ? 1 : 0);

  // Check win conditions
  if (!mrWhiteAlive) { showGameOver('citizens', name, false); return; }
  if (goodCount <= 1) { showGameOver('mrwhite', name, false); return; }

  MW.round++;
  saveMWState();

  render(`
    <div class="stagger text-center">
      <div class="card card-elevated mb-4" style="padding:2rem;">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">😮</span>
        <h2 class="font-serif mb-1" style="color:var(--text)">${name} was eliminated!</h2>
        <p class="text-muted text-sm">But they were <strong style="color:var(--green)">innocent</strong>. Mr. White is still hiding…</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Remaining Players</p>
        <div class="flex flex-col gap-2">
          ${MW.players.map((p, i) => {
            const elim = MW.eliminated.includes(i);
            return `
              <div class="player-chip ${elim ? 'eliminated' : ''}">
                <div class="avatar">${getInitials(p)}</div>
                <span>${p}</span>
                ${elim ? '<span class="badge badge-red" style="margin-left:auto;">Eliminated</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showCluePhase()">
        Continue to Round ${MW.round}
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `);
}

// ── SCREEN: Game Over ─────────────────────────────────────
function showGameOver(winner, lastElim, mrWhiteGuessed) {
  MW.phase = 'gameover';
  clearMWState(); // clear save on game end
  const isMWWin    = winner === 'mrwhite';
  const mrWhiteName = MW.players[MW.mrWhiteIndex];

  // Determine winners for scoreboard
  const sbWinners = isMWWin
    ? [mrWhiteName]
    : MW.players.filter((_, i) => i !== MW.mrWhiteIndex && !MW.eliminated.includes(i));

  render(`
    <div class="stagger text-center">
      <span style="font-size:3.5rem;display:block;margin-bottom:1rem;animation:bounce 1.5s ease-in-out infinite">
        ${isMWWin ? '🕵️' : '🕊️'}
      </span>

      <div class="card card-glow mb-4" style="padding:2rem;">
        <h2 class="font-serif mb-2" style="font-size:1.8rem;color:${isMWWin ? 'var(--red)' : 'var(--green)'};">
          ${isMWWin ? 'Mr. White Wins!' : 'The Faithful Win!'}
        </h2>
        <p class="text-muted mb-3">
          ${isMWWin
            ? mrWhiteGuessed
              ? `<strong style="color:var(--text)">${lastElim}</strong> correctly guessed "<strong style="color:var(--gold2)">${MW.word}</strong>"!`
              : `The faithful ran out of time. Mr. White survived!`
            : `<strong style="color:var(--text)">${mrWhiteName}</strong> was the deceiver among you!`
          }
        </p>
        <div class="divider mb-3">The Secret Word</div>
        <p class="word-text">${MW.word}</p>
        <p class="text-muted text-sm mt-2">Mr. White's word was: <strong style="color:var(--gold2)">${MW.mrWhiteWord}</strong></p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Final Standings</p>
        <div class="flex flex-col gap-2">
          ${MW.players.map((p, i) => {
            const isMW = i === MW.mrWhiteIndex;
            const elim = MW.eliminated.includes(i);
            return `
              <div class="player-chip ${isMW ? 'active' : ''}">
                <div class="avatar">${getInitials(p)}</div>
                <span>${p}</span>
                ${isMW ? '<span class="badge badge-red" style="margin-left:auto;">Mr. White</span>' : ''}
                ${(!isMW && elim) ? '<span class="badge badge-blue" style="margin-left:auto;">Eliminated</span>' : ''}
                ${(!isMW && !elim) ? '<span class="badge badge-green" style="margin-left:auto;">Survived</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="navigateTo('/')">Home</button>
        <button class="btn btn-primary btn-full" onclick="resetGame()">Play Again</button>
      </div>
    </div>
  `);

  // Show congrats overlay on top of the results screen
  showCongrats(sbWinners, 'mrwhite');
}

function resetGame() {
  MW.eliminated = [];
  MW.round = 1;
  MW.votes = {};
  MW.phase = 'setup';
  _setupCount = 3;
  _enteredNames = [];
  clearMWState();
  showSetup();
}

// ── Init ──────────────────────────────────────────────────
(function init() {
  const saved = loadMWState();
  if (saved && saved.phase && saved.phase !== 'setup' && saved.phase !== 'gameover' && saved.players?.length > 0) {
    showContinuePrompt(saved);
  } else {
    showSetup();
  }
})();
