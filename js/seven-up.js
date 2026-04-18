/* ── Biblical Heads Up Seven Up ────────────────────────────── */

const SU = {
  players: [],
  numDisciples: 7,
  disciples: [],
  discipleHistory: [],
  pressedPlayers: [],
  guesses: {},
  scores: {},
  round: 1,
  phase: 'setup',
  useBibleBonus: true,
  bonusPool: [],
  currentBonusQ: null,
  pendingBonusPlayer: -1,
};

const root = document.getElementById('appRoot');
function render(html) {
  window.scrollTo(0,0);
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup ────────────────────────────────────────────────────
function showSetup() {
  SU.phase = 'setup';
  if (!SU.players.length) SU.players = ['','','','','','',''];
  renderSetup();
}

function renderSetup() {
  const count = SU.players.length;
  const maxDisciples = Math.min(7, Math.floor(count / 2));
  if (SU.numDisciples > maxDisciples) SU.numDisciples = Math.max(1, maxDisciples);

  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">👍</span>
        <h2 class="font-serif text-gold2">Heads Up Seven Up</h2>
        <p class="text-muted text-sm mt-1">Thumbs up, heads down — who pressed yours?</p>
      </div>

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showSUDirections()">📖 How to Play</button>

      <div class="card mb-3">
        <p class="input-label mb-2">Players <span class="text-muted">(4–20)</span></p>
        <div id="suPlayerList" class="flex flex-col gap-2 mb-2">
          ${SU.players.map((p, i) => `
            <div class="flex gap-2 items-center">
              <input class="input" style="flex:1;" value="${p}" placeholder="Player ${i+1}"
                oninput="SU.players[${i}]=this.value"/>
              ${count > 4 ? `<button onclick="removeSUPlayer(${i})" style="background:none;border:none;color:var(--text3);font-size:1.3rem;cursor:pointer;padding:0 0.25rem;line-height:1;" title="Remove">×</button>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="flex gap-2">
          ${count < 20 ? `<button class="btn btn-ghost btn-sm" style="flex:1;" onclick="addSUPlayer()">+ Add Player</button>` : ''}
        </div>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Number of Disciples</p>
        <p class="text-muted text-sm mb-3">How many players walk around pressing thumbs.</p>
        <div class="flex items-center justify-center gap-4">
          <button class="btn btn-secondary btn-icon" onclick="adjustSUDisciples(-1)" style="font-size:1.5rem;">−</button>
          <span id="suDiscipleCount" style="font-size:2rem;font-weight:700;font-family:var(--font-h);color:var(--text);min-width:3rem;text-align:center;">${SU.numDisciples}</span>
          <button class="btn btn-secondary btn-icon" onclick="adjustSUDisciples(1)" style="font-size:1.5rem;">+</button>
        </div>
        <p class="text-muted text-center text-sm mt-2">Max: ${maxDisciples} (half of ${count} players)</p>
      </div>

      <div class="card mb-4">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <p class="input-label" style="margin:0;">Bible Bonus Questions</p>
            <p class="text-muted text-sm mt-1">Correct guessers answer a Bible Q for +1 bonus point.</p>
          </div>
          <button onclick="toggleSUBonus()" id="suBonusToggle"
            style="width:52px;height:28px;border-radius:999px;border:none;cursor:pointer;transition:all 0.2s;background:${SU.useBibleBonus?'var(--green)':'var(--bg3)'};position:relative;flex-shrink:0;">
            <span style="position:absolute;top:3px;width:22px;height:22px;border-radius:50%;background:white;transition:all 0.2s;left:${SU.useBibleBonus?'27px':'3px'};box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>
          </button>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startSUGame()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
}

function addSUPlayer() {
  if (SU.players.length >= 20) return;
  SU.players.push('');
  renderSetup();
}

function removeSUPlayer(idx) {
  if (SU.players.length <= 4) return;
  SU.players.splice(idx, 1);
  renderSetup();
}

function adjustSUDisciples(delta) {
  const count = SU.players.length;
  const max = Math.min(7, Math.floor(count / 2));
  SU.numDisciples = Math.max(1, Math.min(max, SU.numDisciples + delta));
  const el = document.getElementById('suDiscipleCount');
  if (el) el.textContent = SU.numDisciples;
}

function toggleSUBonus() {
  SU.useBibleBonus = !SU.useBibleBonus;
  const btn = document.getElementById('suBonusToggle');
  if (btn) {
    btn.style.background = SU.useBibleBonus ? 'var(--green)' : 'var(--bg3)';
    btn.querySelector('span').style.left = SU.useBibleBonus ? '27px' : '3px';
  }
}

function showSUDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay center" id="suDirOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:360px;max-height:85vh;overflow-y:auto;">
        <h3 class="font-serif text-gold2 mb-3 text-center">👍 How to Play</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.6;">
          <div><p class="font-bold mb-1" style="color:var(--text);">Setup</p>
            <p>Everyone sits down, puts their head down on the desk, and holds one thumb up. Disciples are chosen secretly — only the narrator (teacher) knows who they are.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Night Phase</p>
            <p>Disciples quietly walk around and press exactly one person's thumb down. Then they return to their seat. The narrator calls "Heads up, seven up!"</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Guessing</p>
            <p>Those whose thumbs were pressed stand up. One by one they guess who pressed them. If correct — they swap seats and become a disciple next round!</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Bible Bonus</p>
            <p>When the Bible Bonus is on, a correct guesser must also answer a Bible trivia question to earn +1 bonus point. Wrong guess = no swap.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Scoring</p>
            <p>Disciples: +1 for each person they fooled. Guessers: +1 for a correct guess, +1 bonus for the Bible Q.</p></div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('suDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
}

// ── Start game ───────────────────────────────────────────────
function startSUGame() {
  const named = SU.players.map((p, i) => p.trim() || `Player ${i+1}`);
  if (named.length < 4) { showToast('Need at least 4 players', 'error'); return; }
  SU.players = named;
  SU.scores = {};
  SU.players.forEach((_, i) => { SU.scores[i] = 0; });
  SU.discipleHistory = [];
  SU.round = 1;

  if (SU.useBibleBonus) buildSUBonusPool();
  pickDisciples();
  showSUNarratorScreen();
}

function buildSUBonusPool() {
  const data = getGameData();
  const qs = [];
  (data.jeopardy?.categories || []).forEach(cat => {
    cat.questions.forEach(q => { if (q.question && q.answer) qs.push({ q: q.question, a: q.answer }); });
  });
  SU.bonusPool = shuffle(qs);
}

function pickDisciples() {
  const indices = SU.players.map((_, i) => i);
  // Prefer players who haven't been disciples recently
  const notRecent = indices.filter(i => !SU.discipleHistory.slice(-SU.players.length).includes(i));
  const pool = notRecent.length >= SU.numDisciples ? notRecent : indices;
  SU.disciples = shuffle([...pool]).slice(0, SU.numDisciples);
  SU.discipleHistory.push(...SU.disciples);
}

// ── Narrator screen: see disciples ──────────────────────────
function showSUNarratorScreen() {
  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3" style="background:linear-gradient(135deg,rgba(212,160,23,0.12),transparent);">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">📜</span>
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.1em;text-transform:uppercase;">Narrator / Teacher Only</p>
        <h2 class="font-serif text-gold2 mb-1">Round ${SU.round}</h2>
        <p class="text-muted text-sm">Read this privately before telling everyone to put heads down.</p>
      </div>

      <div class="card mb-4" style="text-align:left;">
        <p class="input-label mb-3">🔒 Disciples This Round</p>
        <div class="flex flex-col gap-2">
          ${SU.disciples.map(i => `
            <div class="disciple-chip">
              <div class="avatar" style="flex-shrink:0;">${getInitials(SU.players[i])}</div>
              <span style="font-weight:600;">${SU.players[i]}</span>
              <span class="badge badge-gold" style="margin-left:auto;font-size:0.65rem;">Disciple</span>
            </div>
          `).join('')}
        </div>
      </div>

      <p class="text-muted text-sm mb-4">Tell everyone: <strong style="color:var(--text);">"Put your head down, close your eyes, and put one thumb up."</strong></p>
      <button class="btn btn-primary btn-lg btn-full" onclick="showSUHeadsDown()">
        Everyone's Ready →
      </button>
    </div>
  `);
}

// ── Heads down screen ────────────────────────────────────────
function showSUHeadsDown() {
  SU.pressedPlayers = [];
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%);">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <span style="font-size:4rem;display:block;margin-bottom:1rem;animation:float 4s ease-in-out infinite;">🙇</span>
        <h2 class="font-serif text-gold2 mb-3">Heads Down!</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:0.75rem;">
          Everyone has their head down and<br/><strong style="color:var(--text);">one thumb up.</strong>
        </p>
        <p class="text-muted text-sm mb-4">Disciples — quietly walk around and press exactly <strong style="color:var(--text);">one</strong> person's thumb. Then sit back down.</p>
        <button class="btn btn-primary btn-lg btn-full" onclick="showSUHeadsUp()">
          ☀️ "Heads Up, Seven Up!"
        </button>
      </div>
    </div>
  `);
}

// ── Heads up: mark who is standing ──────────────────────────
function showSUHeadsUp() {
  SU.pressedPlayers = [];
  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <span style="font-size:1.5rem;display:block;margin-bottom:0.5rem;">☀️</span>
        <h2 class="font-serif text-gold2 mb-1">Heads Up!</h2>
        <p class="text-muted text-sm">Tap the players whose thumbs were pressed — they stand up.</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Who is Standing?</p>
        <div class="flex flex-col gap-2" id="suStandingList">
          ${SU.players.map((p, i) => `
            <button class="player-select-btn" id="sustand-${i}" onclick="toggleSUStanding(${i})">
              <div class="avatar" style="flex-shrink:0;">${getInitials(p)}</div>
              <span style="flex:1;">${p}</span>
              <span id="sustand-badge-${i}" style="font-size:0.8rem;color:var(--text3);"></span>
            </button>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startSUGuessing()" id="suStartGuessBtn">
        Begin Guessing →
      </button>
    </div>
  `);
}

function toggleSUStanding(idx) {
  const btn = document.getElementById(`sustand-${idx}`);
  const badge = document.getElementById(`sustand-badge-${idx}`);
  const already = SU.pressedPlayers.includes(idx);
  if (already) {
    SU.pressedPlayers = SU.pressedPlayers.filter(i => i !== idx);
    if (btn) btn.classList.remove('standing');
    if (badge) badge.textContent = '';
  } else {
    if (SU.pressedPlayers.length >= SU.numDisciples) {
      showToast(`Only ${SU.numDisciples} thumbs were pressed`, 'error'); return;
    }
    SU.pressedPlayers.push(idx);
    if (btn) btn.classList.add('standing');
    if (badge) badge.textContent = '👆 Standing';
  }
  haptic('light');
}

// ── Guessing phase ───────────────────────────────────────────
let _suGuessingIdx = 0;

function startSUGuessing() {
  if (!SU.pressedPlayers.length) { showToast('Mark who is standing first', 'error'); return; }
  SU.guesses = {};
  _suGuessingIdx = 0;
  showSUGuesserTurn();
}

function showSUGuesserTurn() {
  if (_suGuessingIdx >= SU.pressedPlayers.length) { showSURoundResults(); return; }
  const guesserIdx = SU.pressedPlayers[_suGuessingIdx];
  const guesser = SU.players[guesserIdx];

  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.08em;text-transform:uppercase;">Guessing ${_suGuessingIdx + 1} of ${SU.pressedPlayers.length}</p>
        <div class="avatar" style="width:48px;height:48px;font-size:1.1rem;margin:0.5rem auto;">${getInitials(guesser)}</div>
        <h2 class="font-serif text-gold2 mb-1">${guesser}</h2>
        <p class="text-muted text-sm">Who pressed your thumb?</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Choose a Disciple</p>
        <div class="flex flex-col gap-2">
          ${SU.disciples.map(di => `
            <button class="player-select-btn" id="suguess-${di}" onclick="selectSUGuess(${guesserIdx}, ${di})">
              <div class="avatar" style="flex-shrink:0;">${getInitials(SU.players[di])}</div>
              <span style="flex:1;">${SU.players[di]}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card hidden animate-slide-up" id="suGuessConfirm">
        <p class="text-sm text-center text-muted mb-2">Confirm guess?</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="clearSUGuess()">Change</button>
          <button class="btn btn-primary btn-full" onclick="confirmSUGuess(${guesserIdx})">Confirm</button>
        </div>
      </div>
    </div>
  `);
}

let _suSelectedGuess = -1;
function selectSUGuess(guesserIdx, guessedIdx) {
  _suSelectedGuess = guessedIdx;
  document.querySelectorAll('.player-select-btn').forEach(b => b.classList.remove('pressed'));
  document.getElementById(`suguess-${guessedIdx}`)?.classList.add('pressed');
  document.getElementById('suGuessConfirm')?.classList.remove('hidden');
  haptic('light');
}

function clearSUGuess() {
  _suSelectedGuess = -1;
  document.querySelectorAll('.player-select-btn').forEach(b => b.classList.remove('pressed'));
  document.getElementById('suGuessConfirm')?.classList.add('hidden');
}

function confirmSUGuess(guesserIdx) {
  if (_suSelectedGuess === -1) { showToast('Select a guess first', 'error'); return; }
  const correct = SU.disciples.includes(_suSelectedGuess) &&
    SU.pressedPlayers.includes(guesserIdx) &&
    suDisciplePressedThisPlayer(guesserIdx, _suSelectedGuess);

  SU.guesses[guesserIdx] = { guessed: _suSelectedGuess, correct };
  haptic(correct ? 'heavy' : 'medium');

  if (correct && SU.useBibleBonus) {
    SU.pendingBonusPlayer = guesserIdx;
    showSUBonusQuestion(guesserIdx);
  } else {
    if (correct) SU.scores[guesserIdx] = (SU.scores[guesserIdx] || 0) + 1;
    _suGuessingIdx++;
    showSUGuesserTurn();
  }
}

function suDisciplePressedThisPlayer(playerIdx, discipleIdx) {
  // Since we don't track exact press mapping, any correct disciple guess counts
  return SU.disciples.includes(discipleIdx);
}

// ── Bible Bonus Question ─────────────────────────────────────
function showSUBonusQuestion(playerIdx) {
  if (!SU.bonusPool.length) buildSUBonusPool();
  SU.currentBonusQ = SU.bonusPool.pop() || { q: 'Name one of the twelve disciples.', a: 'Any of the twelve' };
  const player = SU.players[playerIdx];

  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3" style="background:linear-gradient(135deg,rgba(74,222,128,0.1),transparent);">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">✅</span>
        <h2 class="font-serif mb-1" style="color:var(--green);">Correct Guess!</h2>
        <p class="text-muted text-sm">${player} identified their disciple!</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2" style="color:var(--gold2);">⭐ Bible Bonus — +1 Point</p>
        <p class="text-sm text-muted mb-3">${player}, answer this question for a bonus point:</p>
        <div class="card" style="background:var(--bg3);padding:1rem;">
          <p style="font-size:1rem;color:var(--text);line-height:1.5;text-align:center;">${SU.currentBonusQ.q}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-danger btn-full" onclick="suBonusResult(false)">✗ Wrong</button>
        <button class="btn btn-success btn-full" onclick="suBonusResult(true)">✓ Correct!</button>
      </div>
      <button class="btn btn-ghost btn-sm btn-full mt-2" onclick="revealSUBonusAnswer()">Show Answer</button>
    </div>
  `);
}

function revealSUBonusAnswer() {
  showToast(`Answer: ${SU.currentBonusQ.a}`, 'success');
}

function suBonusResult(correct) {
  const playerIdx = SU.pendingBonusPlayer;
  SU.scores[playerIdx] = (SU.scores[playerIdx] || 0) + 1; // correct guess point
  if (correct) SU.scores[playerIdx] += 1; // bonus point
  haptic(correct ? 'heavy' : 'medium');
  _suGuessingIdx++;
  showSUGuesserTurn();
}

// ── Round results ────────────────────────────────────────────
function showSURoundResults() {
  // Award disciples points for each pressed player who guessed wrong
  SU.disciples.forEach(di => {
    const fooled = SU.pressedPlayers.filter(pi => {
      const g = SU.guesses[pi];
      return !g || !g.correct;
    }).length;
    SU.scores[di] = (SU.scores[di] || 0) + fooled;
  });

  const sorted = Object.entries(SU.scores)
    .sort((a,b) => b[1] - a[1])
    .map(([i, score]) => ({ name: SU.players[parseInt(i)], score, idx: parseInt(i) }));

  render(`
    <div class="stagger">
      <div class="card mb-4 text-center">
        <span style="font-size:1.5rem;display:block;margin-bottom:0.5rem;">📋</span>
        <h2 class="font-serif text-gold2 mb-1">Round ${SU.round} Results</h2>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Guesses</p>
        <div class="flex flex-col gap-2">
          ${SU.pressedPlayers.map(pi => {
            const g = SU.guesses[pi];
            const guessedName = g ? SU.players[g.guessed] : '—';
            return `
              <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.75rem;background:${g?.correct?'rgba(74,222,128,0.08)':'rgba(248,113,113,0.06)'};border:1px solid ${g?.correct?'rgba(74,222,128,0.25)':'rgba(248,113,113,0.2)'};border-radius:var(--r-sm);">
                <div class="avatar" style="flex-shrink:0;">${getInitials(SU.players[pi])}</div>
                <span style="flex:1;font-size:0.85rem;">${SU.players[pi]}</span>
                <span style="font-size:0.8rem;color:var(--text3);">guessed ${guessedName}</span>
                <span style="font-size:1rem;">${g?.correct?'✅':'❌'}</span>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">The Disciples Were</p>
        <div class="flex flex-col gap-2">
          ${SU.disciples.map(di => `
            <div class="disciple-chip">
              <div class="avatar" style="flex-shrink:0;">${getInitials(SU.players[di])}</div>
              <span>${SU.players[di]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Scores</p>
        <div class="flex flex-col gap-1">
          ${sorted.map((p, i) => `
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.4rem 0.6rem;background:${i===0?'rgba(212,160,23,0.08)':'var(--bg3)'};border:1px solid ${i===0?'rgba(212,160,23,0.25)':'var(--border)'};border-radius:var(--r-sm);">
              <span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'  '}</span>
              <span style="flex:1;font-size:0.9rem;">${p.name}</span>
              <span style="font-family:var(--font-h);font-weight:700;color:${i===0?'var(--gold2)':'var(--text2)'};">${p.score}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="showSetup()">End Game</button>
        <button class="btn btn-primary btn-full" onclick="nextSURound()">Round ${SU.round + 1} →</button>
      </div>
    </div>
  `);
}

function nextSURound() {
  SU.round++;
  pickDisciples();
  showSUNarratorScreen();
}

// ── Init ─────────────────────────────────────────────────────
showSetup();
