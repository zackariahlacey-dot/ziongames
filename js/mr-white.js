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
  phase: 'setup', // setup | role-reveal | clues | vote | result | guess | gameover

  get activePlayers() {
    return this.players.filter((_, i) => !this.eliminated.includes(i));
  }
};

const root = document.getElementById('appRoot');

// ── Render helpers ────────────────────────────────────────
function render(html) {
  window.scrollTo(0,0); root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup state ───────────────────────────────────────────
let _setupPlayerCount = 3;

// ── SCREEN: Setup ─────────────────────────────────────────
function showSetup() {
  MW.phase = 'setup';
  _setupPlayerCount = MW.players.length >= 3 ? MW.players.length : 3;
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

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showMWDirections()">📖 How to Play</button>

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

      <!-- Player Count -->
      <div class="card mb-4" style="padding:1.5rem;">
        <p class="input-label mb-3 text-center">Number of Players</p>
        <div class="flex items-center justify-center gap-4">
          <button class="btn btn-secondary btn-icon" onclick="adjustCount(-1)" style="font-size:1.5rem;">-</button>
          <span id="mwCountDisplay" style="font-size:2rem;font-weight:700;font-family:var(--font-h);color:var(--text);min-width:3rem;text-align:center;">${_setupPlayerCount}</span>
          <button class="btn btn-secondary btn-icon" onclick="adjustCount(1)" style="font-size:1.5rem;">+</button>
        </div>
        <p class="text-muted text-center text-sm mt-3">3 to 10 players</p>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startGame()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
}

function showMWDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay" id="mwDirOverlay" onclick="if(event.target.id==='mwDirOverlay')this.remove()">
      <div class="modal" style="max-height:80vh;overflow-y:auto;">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">📜 How to Play — Biblical Mr. White</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.7;">
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🎯 Goal</p>
            <p>All players share the same secret biblical word — except Mr. White, who gets a similar but different word. Citizens try to expose Mr. White; Mr. White tries to blend in.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🗣️ Each Round</p>
            <p>Going around the circle, each player says one word or short clue that hints at their word — without saying it directly. Listen carefully for someone who sounds off!</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">⚖️ Voting</p>
            <p>After clues, everyone votes on who they think is Mr. White. Most votes = eliminated. If they're Mr. White, citizens win — but Mr. White gets one chance to guess the citizens' word!</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🏆 Winning</p>
            <p><strong style="color:var(--green);">Citizens win</strong> when Mr. White is eliminated and fails to guess the word.<br/>
            <strong style="color:var(--red);">Mr. White wins</strong> by surviving to the final 2, or by correctly guessing the word when caught.</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('mwDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
}

function setDiff(d) {
  MW.difficulty = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.diff-btn.${d}`)?.classList.add('active');
}

function adjustCount(delta) {
  _setupPlayerCount += delta;
  if (_setupPlayerCount < 3) _setupPlayerCount = 3;
  if (_setupPlayerCount > 10) _setupPlayerCount = 10;
  const el = document.getElementById('mwCountDisplay');
  if (el) el.textContent = _setupPlayerCount;
  else renderSetupScreen();
}

function startGame() {
  const data = getGameData();
  const pool = data.mrWhite[MW.difficulty];
  if (!pool || pool.length === 0) { showToast('No words for this difficulty', 'error'); return; }

  const pair = pickRandom(pool);
  MW.word = pair.word;
  MW.mrWhiteWord = pair.mrWhite;
  MW.mrWhiteIndex = Math.floor(Math.random() * _setupPlayerCount);
  MW._pool = pool;
  MW.eliminated = [];
  MW.round = 1;
  MW.votes = {};
  MW.players = new Array(_setupPlayerCount).fill('');

  showPassPhone(0);
}

// ── SCREEN: Pass Phone ──────────────────────────────────────
function showPassPhone(idx) {
  MW.phase = 'pass-phone';
  
  render(`
    <div class="stagger text-center" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh;">
      <span style="font-size:4rem; margin-bottom:1rem; animation:bounce 2s infinite">🙈</span>
      <h2 class="font-serif text-gold2 mb-2">Pass the Phone</h2>
      <p class="text-muted mb-4">Hand the device to <strong style="color:var(--text)">Player ${idx + 1}</strong>.</p>
      
      <button class="btn btn-primary btn-lg" onclick="showNameEntry(${idx})" style="width:100%; max-width:300px;">
        I'm Ready!
      </button>
      
      <div class="progress-bar w-full mt-4" style="max-width:300px;margin-left:auto;margin-right:auto;">
        <div class="progress-fill" style="width:${((idx+1)/_setupPlayerCount)*100}%"></div>
      </div>
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
  haptic('medium');
  const btn = document.getElementById('shuffleBtn');
  if (btn) { btn.textContent = '✓ New word ready!'; btn.disabled = true; btn.style.opacity = '0.5'; }
  showToast('New word picked!', 'success');

  // Update Player 1's card instantly if it's already flipped
  const card = document.getElementById('revCard');
  if (card && card.classList.contains('flipped')) {
    const isMW = revealIndex === MW.mrWhiteIndex;
    const back = document.getElementById('revBack');
    if (back) {
      if (isMW) {
        back.innerHTML = `
          <span style="font-size:2rem;margin-bottom:0.5rem;animation:float 3s ease-in-out infinite">📜</span>
          <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">Your Word is</p>
          <p class="word-text">${MW.mrWhiteWord}</p>
          <p class="text-muted text-sm mt-2">Remember it — don't say it aloud!</p>
        `;
      } else {
        back.innerHTML = `
          <span style="font-size:2rem;margin-bottom:0.5rem;animation:float 3s ease-in-out infinite">📜</span>
          <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">Your Word is</p>
          <p class="word-text">${MW.word}</p>
          <p class="text-muted text-sm mt-2">Remember it — don't say it aloud!</p>
        `;
      }
    }
  }
}

// ── SCREEN: Name Entry (Sequential) ─────────────────────────
function showNameEntry(idx) {
  MW.phase = 'name-entry';

  render(`
    <div class="stagger text-center">
      <p class="text-muted text-sm mb-1">Player ${idx + 1} of ${_setupPlayerCount}</p>
      <h2 class="font-serif text-gold2 mb-4">Who are you?</h2>

      <div class="card mb-4 text-left">
        <p class="input-label mb-2">Enter your name</p>
        <input type="text" class="input text-center" id="mwNameInput" placeholder="Name..."
          style="font-size:1.25rem;font-weight:700;"
          onkeydown="if(event.key==='Enter') submitName(${idx})">
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="submitName(${idx})">
        Next →
      </button>

      <div class="progress-bar mt-4"><div class="progress-fill" style="width:${((idx)/_setupPlayerCount)*100}%"></div></div>
    </div>
  `);

  setTimeout(() => document.getElementById('mwNameInput')?.focus(), 100);
}

function submitName(idx) {
  const input = document.getElementById('mwNameInput');
  const name = input.value.trim();
  if (!name) { showToast('Please enter a name', 'error'); return; }

  MW.players[idx] = name;
  showRoleReveal(idx);
}

// ── SCREEN: Role Reveal ───────────────────────────────────
let revealIndex = 0;
function showRoleReveal(idx) {
  revealIndex = idx;
  MW.phase = 'role-reveal';
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
  if (isMW) {
    back.innerHTML = `
      <span style="font-size:2rem;margin-bottom:0.5rem;animation:float 3s ease-in-out infinite">📜</span>
      <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">Your Word is</p>
      <p class="word-text">${MW.mrWhiteWord}</p>
      <p class="text-muted text-sm mt-2">Remember it — don't say it aloud!</p>
    `;
  } else {
    back.innerHTML = `
      <span style="font-size:2rem;margin-bottom:0.5rem;animation:float 3s ease-in-out infinite">📜</span>
      <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">Your Word is</p>
      <p class="word-text">${MW.word}</p>
      <p class="text-muted text-sm mt-2">Remember it — don't say it aloud!</p>
    `;
  }

  // Next button appears after a moment
  setTimeout(() => {
    const nextIdx = idx + 1;
    const container = document.querySelector('.container');
    const nextBtn = document.createElement('div');
    nextBtn.className = 'mt-3 animate-slide-up';
    if (nextIdx < MW.players.length) {
      nextBtn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showPassPhone(${nextIdx})">
        Next Player →
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
function showCluePhase() {
  MW.phase = 'clues';
  const active = MW.activePlayers;
  const order = shuffle([...active]);

  render(`
    <div class="stagger">
      <div class="card card-glow mb-3 text-center">
        <p class="text-muted text-sm" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.25rem;">Round ${MW.round}</p>
        <h2 class="font-serif text-gold2">Clue Giving</h2>
        <p class="text-muted text-sm mt-1">Each player gives ONE clue about their word. Mr. White has a <em>similar</em> word — find who doesn't quite fit!</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Clue Order</p>
        <div class="flex flex-col gap-2" id="clueOrder">
          ${order.map((name, i) => `
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

// ── SCREEN: Vote Phase ────────────────────────────────────
function showVotePhase() {
  MW.phase = 'vote';
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
    showEliminationResult(eliminated, false);
  }
}

// ── SCREEN: Mr. White Guess ───────────────────────────────
function showMrWhiteGuess(name) {
  render(`
    <div class="stagger text-center">
      <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:bounce 1.5s infinite">🕵️</span>
      <h2 class="font-serif text-gold2 mb-2">Mr. White Caught!</h2>
      <p class="text-muted mb-4"><strong style="color:var(--text)">${name}</strong> was revealed as Mr. White!</p>

      <div class="card card-glow mb-4">
        <p class="font-bold mb-2" style="color:var(--text);">Last Chance, ${name}!</p>
        <p class="text-muted text-sm mb-3">Your word was <strong style="color:var(--gold2)">${MW.mrWhiteWord}</strong>. Can you guess the word everyone else had? One try wins it all!</p>
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
  showSetup();
}

// ── Init ──────────────────────────────────────────────────
showSetup();
