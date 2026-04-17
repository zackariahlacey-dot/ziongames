/* ── Biblical Taboo ───────────────────────────────────────── */

const TB = {
  teams: [],           // [{ name, score, turns }]
  currentTeam: 0,
  round: 1,
  totalRounds: 3,
  timerSeconds: 60,
  phase: 'setup',      // setup | ready | playing | turn-end | gameover
  deck: [],            // shuffled cards
  deckIdx: 0,
  turn: {              // live turn state
    correct: 0,
    skipped: 0,
    buzzed: 0,
    log: [],           // [{ word, result }]
  },
  timer: null,
  timeLeft: 0,
};

const root = document.getElementById('appRoot');

function render(html) {
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.25rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup names ────────────────────────────────────────────
let _tbNames = ['', ''];

function showSetup() {
  TB.phase = 'setup';
  document.getElementById('headerTitle').textContent = '📖 Biblical Taboo';
  renderSetup();
}

function renderSetup() {
  const data = getGameData();
  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">📖</span>
        <h2 class="font-serif text-gold2">Biblical Taboo</h2>
        <p class="text-muted text-sm mt-1">Describe the word — without saying what's forbidden</p>
      </div>

      <!-- Teams -->
      <div class="card mb-3">
        <p class="input-label mb-2">Teams <span class="text-muted">(2–6)</span></p>
        <div id="teamList" class="flex flex-col gap-2 mb-2">
          ${_tbNames.map((v, i) => teamRow(v, i)).join('')}
        </div>
        <button class="btn btn-ghost btn-sm btn-full" onclick="addTBTeam()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Team
        </button>
      </div>

      <!-- Settings -->
      <div class="card mb-4">
        <p class="input-label mb-2">Game Settings</p>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold">Rounds</p>
              <p class="text-muted" style="font-size:0.75rem;">Each team plays once per round</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="adjustRounds(-1)" class="btn btn-ghost btn-sm btn-icon" style="width:32px;height:32px;">−</button>
              <span style="font-weight:700;font-size:1.1rem;min-width:24px;text-align:center;" id="roundCount">${TB.totalRounds}</span>
              <button onclick="adjustRounds(1)" class="btn btn-ghost btn-sm btn-icon" style="width:32px;height:32px;">+</button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold">Timer</p>
              <p class="text-muted" style="font-size:0.75rem;">Seconds per turn</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="adjustTimer(-10)" class="btn btn-ghost btn-sm btn-icon" style="width:32px;height:32px;">−</button>
              <span style="font-weight:700;font-size:1.1rem;min-width:36px;text-align:center;" id="timerCount">${data.taboo?.timerSeconds || 60}s</span>
              <button onclick="adjustTimer(10)" class="btn btn-ghost btn-sm btn-icon" style="width:32px;height:32px;">+</button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startTaboo()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
}

function teamRow(val, i) {
  return `
    <div class="flex gap-1 items-center">
      <div class="avatar avatar-sm">${val ? getInitials(val) : (i+1)}</div>
      <input class="input" placeholder="Team ${i+1}" value="${val}"
        oninput="onTBNameInput(this,${i})" style="flex:1;"/>
      ${i > 1 ? `<button onclick="removeTBTeam(${i})" class="btn btn-ghost btn-icon" style="width:36px;height:36px;color:var(--text3);">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>` : '<div style="width:36px"></div>'}
    </div>`;
}

function onTBNameInput(input, i) {
  _tbNames[i] = input.value;
  const av = input.parentElement.querySelector('.avatar');
  if (av) av.textContent = input.value ? getInitials(input.value) : (i + 1);
}

function addTBTeam() {
  syncTBNames();
  if (_tbNames.length >= 6) { showToast('Max 6 teams', 'error'); return; }
  _tbNames.push('');
  renderSetup();
  setTimeout(() => {
    const inputs = document.querySelectorAll('#teamList input');
    inputs[inputs.length - 1]?.focus();
  }, 50);
}

function removeTBTeam(i) {
  syncTBNames();
  _tbNames.splice(i, 1);
  renderSetup();
}

function syncTBNames() {
  document.querySelectorAll('#teamList input').forEach((inp, i) => { _tbNames[i] = inp.value; });
}

function adjustRounds(delta) {
  TB.totalRounds = Math.max(1, Math.min(10, TB.totalRounds + delta));
  const el = document.getElementById('roundCount');
  if (el) el.textContent = TB.totalRounds;
}

function adjustTimer(delta) {
  const data = getGameData();
  data.taboo.timerSeconds = Math.max(20, Math.min(120, (data.taboo?.timerSeconds || 60) + delta));
  saveGameData(data);
  TB.timerSeconds = data.taboo.timerSeconds;
  const el = document.getElementById('timerCount');
  if (el) el.textContent = `${data.taboo.timerSeconds}s`;
}

function startTaboo() {
  syncTBNames();
  const names = _tbNames.filter(n => n.trim());
  if (names.length < 2) { showToast('Need at least 2 teams', 'error'); return; }

  const data = getGameData();
  TB.timerSeconds = data.taboo?.timerSeconds || 60;
  TB.teams = names.map(name => ({ name: name.trim(), score: 0 }));
  TB.currentTeam = 0;
  TB.round = 1;
  TB.deck = shuffle([...(data.taboo?.cards || [])]);
  TB.deckIdx = 0;
  TB.phase = 'ready';

  showReadyScreen();
}

// ── Ready screen (hand device to team) ────────────────────
function showReadyScreen() {
  TB.phase = 'ready';
  const team = TB.teams[TB.currentTeam];
  const isFirst = TB.currentTeam === 0 && TB.round === 1;

  document.getElementById('headerTitle').textContent = `Round ${TB.round} of ${TB.totalRounds}`;

  render(`
    <div class="stagger text-center">
      <!-- Scoreboard -->
      ${TB.round > 1 || TB.currentTeam > 0 ? `
        <div class="flex gap-2 mb-4 overflow-x-auto" style="padding-bottom:2px;">
          ${TB.teams.map((t, i) => `
            <div class="score-row ${i === TB.currentTeam ? 'leader' : ''}" style="flex:1;flex-direction:column;gap:0.1rem;min-width:80px;text-align:center;padding:0.5rem;">
              <span class="text-sm" style="color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;">${t.name}</span>
              <span class="score-value" style="font-size:1.05rem;">${t.score}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="card card-glow p-3 mb-4" style="padding:2rem;">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;animation:bounce 1.5s ease-in-out infinite;">
          ${TB.currentTeam % 4 === 0 ? '📖' : TB.currentTeam % 4 === 1 ? '🦅' : TB.currentTeam % 4 === 2 ? '🌿' : '⭐'}
        </span>
        <p class="text-muted text-sm mb-1">Round ${TB.round} · ${TB.timerSeconds}s per turn</p>
        <h2 class="font-serif text-gold2 mb-2">${team.name}'s Turn</h2>
        <p class="text-muted text-sm">
          Hand the phone to <strong style="color:var(--text)">${team.name}'s describer</strong>.
          Others look away — you'll guess out loud!
        </p>
      </div>

      <div class="card mb-4" style="background:rgba(248,113,113,0.05);border-color:rgba(248,113,113,0.2);">
        <p class="text-sm text-center" style="color:var(--text);">
          ⚡ Rules: Describe the word — no forms of the word, no forbidden words, no sounds or gestures.
          Other team can <strong style="color:var(--red);">Buzz</strong> if they hear a forbidden word.
        </p>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="beginTurn()">
        Start Turn →
      </button>
    </div>
  `);
}

// ── Playing screen ─────────────────────────────────────────
function beginTurn() {
  TB.phase = 'playing';
  TB.turn = { correct: 0, skipped: 0, buzzed: 0, log: [] };
  TB.timeLeft = TB.timerSeconds;
  nextCard(false);
}

function nextCard(animate) {
  if (TB.deckIdx >= TB.deck.length) {
    TB.deck = shuffle([...getGameData().taboo.cards]);
    TB.deckIdx = 0;
  }
  const card = TB.deck[TB.deckIdx];
  TB.deckIdx++;
  renderPlayScreen(card, animate);
}

function renderPlayScreen(card, animate) {
  const team = TB.teams[TB.currentTeam];
  const pct  = (TB.timeLeft / TB.timerSeconds) * 100;
  const fillColor = TB.timeLeft > 20 ? 'var(--gold)' : TB.timeLeft > 10 ? '#f59e0b' : 'var(--red)';

  root.innerHTML = `
    <div class="container" style="padding-top:1rem;padding-bottom:1rem;">
      <!-- Timer bar + count -->
      <div class="flex items-center justify-between mb-2">
        <span class="badge badge-gold">${team.name}</span>
        <span style="font-family:var(--font-h);font-size:1.6rem;font-weight:700;color:${TB.timeLeft <= 10 ? 'var(--red)' : 'var(--gold2)'};" id="timerDigit">${TB.timeLeft}</span>
        <div class="flex gap-2">
          <span style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.8rem;color:var(--green);">✓ ${TB.turn.correct}</span>
          <span style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.8rem;color:var(--text2);">✗ ${TB.turn.skipped}</span>
        </div>
      </div>

      <div class="timer-bar mb-3">
        <div class="timer-bar-fill" id="timerFill" style="width:${pct}%;background:${fillColor};"></div>
      </div>

      <!-- Card -->
      <div class="${animate ? 'animate-slide-up' : ''}">
        <!-- The Word -->
        <div class="card card-glow mb-3" style="padding:1.75rem 1.25rem;text-align:center;background:linear-gradient(145deg,rgba(212,160,23,0.1),var(--bg2));">
          <p class="text-muted text-sm mb-2" style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;">Describe This</p>
          <p class="taboo-word">${card.word}</p>
        </div>

        <!-- Forbidden words -->
        <div class="card mb-4" style="padding:1rem;">
          <p class="input-label mb-2" style="color:var(--red);">⚡ Forbidden — Do NOT say:</p>
          <div class="flex flex-col gap-1" id="forbiddenList">
            ${card.taboo.map((w, i) => `
              <div class="forbidden-word" id="fw-${i}" onclick="markBuzzed(${i},'${w.replace(/'/g,"\\'")}')">
                <span style="flex:1;">${w}</span>
                <span style="font-size:0.7rem;color:var(--text3);">tap if said</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-bar">
        <button class="btn btn-success" style="font-size:1rem;min-height:56px;" onclick="recordResult('correct')">
          ✓ Correct
        </button>
        <button class="btn btn-ghost" style="font-size:1rem;min-height:56px;" onclick="recordResult('skip')">
          ✗ Skip
        </button>
        <button class="btn btn-danger btn-buzz" style="min-height:48px;font-size:0.95rem;" onclick="recordResult('buzz')">
          🚫 Buzzed (Said Forbidden Word)
        </button>
      </div>
    </div>
  `;

  startTimer();
}

// ── Timer ──────────────────────────────────────────────────
function startTimer() {
  clearInterval(TB.timer);
  TB.timer = setInterval(() => {
    TB.timeLeft--;

    const digit = document.getElementById('timerDigit');
    const fill  = document.getElementById('timerFill');
    const pct   = (TB.timeLeft / TB.timerSeconds) * 100;
    const fillColor = TB.timeLeft > 20 ? 'var(--gold)' : TB.timeLeft > 10 ? '#f59e0b' : 'var(--red)';

    if (digit) {
      digit.textContent = TB.timeLeft;
      digit.style.color = TB.timeLeft <= 10 ? 'var(--red)' : 'var(--gold2)';
    }
    if (fill) {
      fill.style.width  = `${Math.max(0, pct)}%`;
      fill.style.background = fillColor;
    }

    if (TB.timeLeft <= 5 && TB.timeLeft > 0) haptic('light');
    if (TB.timeLeft <= 0) {
      clearInterval(TB.timer);
      haptic('heavy');
      endTurn();
    }
  }, 1000);
}

function stopTimer() { clearInterval(TB.timer); }

function markBuzzed(idx, word) {
  const el = document.getElementById(`fw-${idx}`);
  if (el && !el.classList.contains('buzzed')) {
    el.classList.add('buzzed');
    haptic('medium');
    showToast(`"${word}" is forbidden!`, 'error');
  }
}

function recordResult(type) {
  stopTimer();
  const card = TB.deck[TB.deckIdx - 1];
  haptic(type === 'correct' ? 'medium' : 'light');

  if (type === 'correct') {
    TB.turn.correct++;
    TB.turn.log.push({ word: card.word, result: 'correct' });
  } else if (type === 'skip') {
    TB.turn.skipped++;
    TB.turn.log.push({ word: card.word, result: 'skip' });
  } else {
    TB.turn.buzzed++;
    TB.turn.log.push({ word: card.word, result: 'buzz' });
  }

  // Brief flash then next card
  const container = root.querySelector('.container');
  if (container) {
    container.style.transition = 'opacity 0.15s';
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.opacity = '1';
      nextCard(true);
      startTimer();
    }, 150);
  } else {
    nextCard(true);
    startTimer();
  }
}

// ── End of turn ────────────────────────────────────────────
function endTurn() {
  TB.phase = 'turn-end';
  stopTimer();

  // Calculate points: +1 correct, -1 skip, -1 buzz
  const pts = TB.turn.correct - TB.turn.skipped - TB.turn.buzzed;
  const earned = Math.max(0, pts); // can't go below 0 on a turn (house rule option)
  TB.teams[TB.currentTeam].score += earned;

  const team = TB.teams[TB.currentTeam];

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4">
        <p class="text-muted text-sm mb-1">Turn Over — ${team.name}</p>
        <h2 class="font-serif text-gold2 mb-3">+${earned} point${earned !== 1 ? 's' : ''}</h2>

        <!-- Turn summary -->
        <div class="flex flex-col gap-1 mb-3">
          <div class="turn-summary-row" style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);">
            <span class="text-sm">✓ Correct</span>
            <span style="font-weight:700;color:var(--green);">${TB.turn.correct}</span>
          </div>
          <div class="turn-summary-row" style="background:var(--bg3);border:1px solid var(--border);">
            <span class="text-sm">✗ Skipped</span>
            <span style="font-weight:700;color:var(--text2);">${TB.turn.skipped}</span>
          </div>
          <div class="turn-summary-row" style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);">
            <span class="text-sm">🚫 Buzzed</span>
            <span style="font-weight:700;color:var(--red);">${TB.turn.buzzed}</span>
          </div>
        </div>

        ${TB.turn.log.length ? `
          <details style="text-align:left;">
            <summary class="text-muted text-sm" style="cursor:pointer;list-style:none;padding:0.35rem 0;">▸ See all cards played</summary>
            <div class="flex flex-col gap-1 mt-2">
              ${TB.turn.log.map(l => `
                <div style="display:flex;justify-content:space-between;padding:0.35rem 0.6rem;background:var(--bg3);border-radius:6px;font-size:0.85rem;">
                  <span>${l.word}</span>
                  <span style="color:${l.result==='correct'?'var(--green)':l.result==='skip'?'var(--text2)':'var(--red)'};">
                    ${l.result==='correct'?'✓':l.result==='skip'?'✗':'🚫'}
                  </span>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}
      </div>

      <!-- Scoreboard -->
      <div class="card mb-4">
        <p class="input-label mb-2">Scores After Round ${TB.round}</p>
        <div class="flex flex-col gap-2">
          ${[...TB.teams].sort((a,b) => b.score-a.score).map((t, i) => `
            <div class="score-row ${i===0?'leader':''}">
              <div class="flex items-center gap-2">
                <span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'✦'}</span>
                <span>${t.name}</span>
              </div>
              <span class="score-value">${t.score}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="nextTurn()">
        ${nextTurnLabel()}
      </button>
    </div>
  `);
}

function nextTurnLabel() {
  const nextTeam = (TB.currentTeam + 1) % TB.teams.length;
  const isLastTeamThisRound = nextTeam === 0;
  const isLastRound = TB.round === TB.totalRounds && isLastTeamThisRound;

  if (isLastRound) return 'See Final Results →';
  if (isLastTeamThisRound) return `Start Round ${TB.round + 1} →`;
  return `${TB.teams[nextTeam].name}'s Turn →`;
}

function nextTurn() {
  TB.currentTeam++;

  if (TB.currentTeam >= TB.teams.length) {
    TB.currentTeam = 0;
    TB.round++;
  }

  if (TB.round > TB.totalRounds) {
    showGameOver();
    return;
  }

  showReadyScreen();
}

// ── Game over ──────────────────────────────────────────────
function showGameOver() {
  TB.phase = 'gameover';
  const sorted    = [...TB.teams].sort((a,b) => b.score - a.score);
  const topScore  = sorted[0].score;
  const winners   = sorted.filter(t => t.score === topScore).map(t => t.name);

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4" style="background:linear-gradient(145deg,rgba(212,160,23,0.1),transparent);">
        <span style="font-size:3rem;display:block;margin-bottom:0.75rem;animation:bounce 1.5s infinite">📖</span>
        <h2 class="font-serif text-gold2 mb-1">Game Over!</h2>
        <p class="text-muted">${winners.join(' & ')} win${winners.length === 1 ? 's' : ''}!</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Final Standings</p>
        <div class="flex flex-col gap-2">
          ${sorted.map((t, i) => `
            <div class="score-row ${i===0?'leader':''}">
              <div class="flex items-center gap-2">
                <span style="font-size:1.2rem;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'✦'}</span>
                <span>${t.name}</span>
              </div>
              <span class="score-value">${t.score} pt${t.score!==1?'s':''}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="navigateTo('/')">Home</button>
        <button class="btn btn-primary btn-full" onclick="showSetup()">Play Again</button>
      </div>
    </div>
  `);

  showCongrats(winners, 'taboo');
}

// ── Quit confirmation ──────────────────────────────────────
function confirmQuit() {
  if (TB.phase === 'setup' || TB.phase === 'gameover') { navigateTo('/'); return; }
  stopTimer();
  const html = `
    <div class="overlay center" id="quitOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:320px;">
        <div class="text-center mb-3">
          <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">🚪</span>
          <h3 class="font-serif text-gold2 mb-1">Quit Game?</h3>
          <p class="text-muted text-sm">Your current game progress will be lost.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="document.getElementById('quitOverlay').remove();if(typeof startTimer!=='undefined'&&TB.phase==='playing')startTimer()">Keep Playing</button>
          <button class="btn btn-danger btn-full" onclick="navigateTo('/')">Quit</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

// ── Init ──────────────────────────────────────────────────
showSetup();
