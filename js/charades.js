/* ── Biblical Charades ─────────────────────────────────────── */

const CH = {
  teams: [],
  currentTeam: 0,
  round: 1,
  totalRounds: 3,
  timerSeconds: 60,
  selectedCategories: ['easy','funny','miracles','parables'],
  phase: 'setup',
  deck: [],
  deckIdx: 0,
  turn: { correct: 0, passed: 0, hintsUsed: 0, log: [] },
  timer: null,
  timeLeft: 0,
};

const ALL_CATEGORIES = [
  { id: 'easy',        label: 'Easy',          icon: '🌱', color: 'var(--green)' },
  { id: 'hard',        label: 'Hard',          icon: '🔥', color: 'var(--red)' },
  { id: 'funny',       label: 'Funny',         icon: '😂', color: '#f59e0b' },
  { id: 'serious',     label: 'Serious',       icon: '🕊️', color: 'var(--blue)' },
  { id: 'miracles',    label: 'Miracles',      icon: '✨', color: 'var(--gold2)' },
  { id: 'parables',    label: 'Parables',      icon: '📖', color: 'var(--purple)' },
  { id: 'animals',     label: 'Animals',       icon: '🦁', color: '#10b981' },
  { id: 'oldTestament',label: 'Old Testament', icon: '📜', color: 'var(--gold)' },
  { id: 'newTestament',label: 'New Testament', icon: '✝️', color: 'var(--blue)' },
  { id: 'prophets',    label: 'Prophets',      icon: '👁️', color: 'var(--purple)' },
];

const root = document.getElementById('appRoot');
function render(html) {
  window.scrollTo(0,0);
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup ────────────────────────────────────────────────────
function showSetup() {
  CH.phase = 'setup';
  if (!CH.teams.length) CH.teams = [{ name: 'Team 1', score: 0, turns: 0 }, { name: 'Team 2', score: 0, turns: 0 }];
  renderSetup();
}

function renderSetup() {
  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">🎭</span>
        <h2 class="font-serif text-gold2">Biblical Charades</h2>
        <p class="text-muted text-sm mt-1">Act it out — no words, no sounds!</p>
      </div>

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showCHDirections()">📖 How to Play</button>

      <div class="card mb-3">
        <p class="input-label mb-2">Teams <span class="text-muted">(2–6)</span></p>
        <div id="teamList" class="flex flex-col gap-2 mb-2"></div>
        <div class="flex gap-2">
          ${CH.teams.length < 6 ? `<button class="btn btn-ghost btn-sm" style="flex:1;" onclick="addCHTeam()">+ Add Team</button>` : ''}
          ${CH.teams.length > 2 ? `<button class="btn btn-ghost btn-sm" style="flex:1;color:var(--red);" onclick="removeCHTeam()">− Remove</button>` : ''}
        </div>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-3">Categories <span class="text-muted">(select at least one)</span></p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${ALL_CATEGORIES.map(cat => {
            const active = CH.selectedCategories.includes(cat.id);
            return `<button onclick="toggleCHCategory('${cat.id}')" id="cat-${cat.id}"
              style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;border-radius:var(--r-sm);border:1px solid ${active ? cat.color : 'var(--border)'};background:${active ? `color-mix(in srgb,${cat.color} 12%,transparent)` : 'var(--bg3)'};cursor:pointer;transition:all 0.15s;text-align:left;">
              <span style="font-size:1rem;">${cat.icon}</span>
              <span style="font-size:0.8rem;font-weight:${active ? '700' : '400'};color:${active ? cat.color : 'var(--text2)'};">${cat.label}</span>
              ${active ? `<span style="margin-left:auto;font-size:0.65rem;color:${cat.color};">✓</span>` : ''}
            </button>`;
          }).join('')}
        </div>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Timer per Turn</p>
        <div class="flex gap-2">
          ${[45,60,90].map(s => `
            <button class="diff-btn ${CH.timerSeconds===s?'active':''}" style="flex:1;" onclick="setCHTimer(${s})">${s}s</button>
          `).join('')}
        </div>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Rounds</p>
        <div class="flex items-center justify-center gap-4">
          <button class="btn btn-secondary btn-icon" onclick="adjustCHRounds(-1)" style="font-size:1.5rem;">−</button>
          <span id="roundsDisplay" style="font-size:2rem;font-weight:700;font-family:var(--font-h);color:var(--text);min-width:3rem;text-align:center;">${CH.totalRounds}</span>
          <button class="btn btn-secondary btn-icon" onclick="adjustCHRounds(1)" style="font-size:1.5rem;">+</button>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startCHGame()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
  renderCHTeamList();
}

function renderCHTeamList() {
  const list = document.getElementById('teamList');
  if (!list) return;
  list.innerHTML = CH.teams.map((t, i) => `
    <input class="input" value="${t.name}" placeholder="Team ${i+1} name"
      oninput="CH.teams[${i}].name=this.value"/>
  `).join('');
}

function addCHTeam() {
  if (CH.teams.length >= 6) return;
  CH.teams.push({ name: `Team ${CH.teams.length + 1}`, score: 0, turns: 0 });
  renderSetup();
}

function removeCHTeam() {
  if (CH.teams.length <= 2) return;
  CH.teams.pop();
  renderSetup();
}

function toggleCHCategory(id) {
  const idx = CH.selectedCategories.indexOf(id);
  if (idx === -1) {
    CH.selectedCategories.push(id);
  } else {
    if (CH.selectedCategories.length === 1) { showToast('Select at least one category', 'error'); return; }
    CH.selectedCategories.splice(idx, 1);
  }
  const cat = ALL_CATEGORIES.find(c => c.id === id);
  const active = CH.selectedCategories.includes(id);
  const btn = document.getElementById(`cat-${id}`);
  if (btn && cat) {
    btn.style.border = `1px solid ${active ? cat.color : 'var(--border)'}`;
    btn.style.background = active ? `color-mix(in srgb,${cat.color} 12%,transparent)` : 'var(--bg3)';
    btn.innerHTML = `<span style="font-size:1rem;">${cat.icon}</span><span style="font-size:0.8rem;font-weight:${active?'700':'400'};color:${active?cat.color:'var(--text2)'};">${cat.label}</span>${active?`<span style="margin-left:auto;font-size:0.65rem;color:${cat.color};">✓</span>`:''}`;
  }
}

function setCHTimer(s) {
  CH.timerSeconds = s;
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.textContent) === s);
  });
}

function adjustCHRounds(delta) {
  CH.totalRounds = Math.max(1, Math.min(10, CH.totalRounds + delta));
  const el = document.getElementById('roundsDisplay');
  if (el) el.textContent = CH.totalRounds;
}

function showCHDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay center" id="chDirOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:360px;max-height:85vh;overflow-y:auto;">
        <h3 class="font-serif text-gold2 mb-3 text-center">🎭 How to Play</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.6;">
          <div><p class="font-bold mb-1" style="color:var(--text);">The Basics</p>
            <p>Teams take turns. One player acts out a biblical scene while their team guesses. No talking, no mouthing words, no pointing at objects in the room.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">The Actor's Turn</p>
            <p>Pass the phone to the actor privately. They see the card, then tap Start when ready. The timer begins immediately. Tap ✓ for each correct guess, ↩ to skip a card.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Hints</p>
            <p>Each card has a hidden hint. The actor may reveal it once — but it counts as a hint used. Use sparingly!</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Scoring</p>
            <p>1 point per correct guess. No penalty for passing. After all teams play each round, scores are tallied. Most points after all rounds wins!</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Categories</p>
            <p>Mix and match categories at setup — Easy, Funny, Serious, Miracles, Parables, Animals, Old & New Testament, and Prophets.</p></div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('chDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
}

// ── Start game ───────────────────────────────────────────────
function startCHGame() {
  const data = getGameData();
  const allCards = [];
  CH.selectedCategories.forEach(catId => {
    const cards = data.charades[catId] || [];
    cards.forEach(card => allCards.push({ ...card, category: catId }));
  });
  if (allCards.length < 5) { showToast('Not enough cards in selected categories', 'error'); return; }
  CH.deck = shuffle([...allCards]);
  CH.deckIdx = 0;
  CH.round = 1;
  CH.currentTeam = 0;
  CH.teams.forEach(t => { t.score = 0; t.turns = 0; });
  CH.phase = 'playing';
  showCHTeamReady();
}

// ── Team ready screen ────────────────────────────────────────
function showCHTeamReady() {
  const team = CH.teams[CH.currentTeam];
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:bounce 2s infinite;">🎭</span>
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.1em;text-transform:uppercase;">Round ${CH.round} of ${CH.totalRounds}</p>
        <h2 class="font-serif text-gold2 mb-2">${team.name}</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          It's your turn!<br/>
          <span class="text-sm">Decide who is acting, then pass the phone.</span>
        </p>
        <button class="btn btn-primary btn-full" onclick="showCHActorPass()">Pass to Actor →</button>
      </div>
    </div>
  `);
}

// ── Actor pass screen ────────────────────────────────────────
function showCHActorPass() {
  const team = CH.teams[CH.currentTeam];
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <span style="font-size:4rem;display:block;margin-bottom:1rem;animation:bounce 2s infinite">🙈</span>
        <h2 class="font-serif text-gold2 mb-2">Pass the Phone</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          Hand the phone to the <strong style="color:var(--text);">actor</strong> from ${team.name}.<br/>
          <span class="text-sm text-muted">Everyone else look away!</span>
        </p>
        <button class="btn btn-primary btn-full" onclick="showCHActorScreen()">I'm the Actor →</button>
      </div>
    </div>
  `);
}

// ── Actor sees card ──────────────────────────────────────────
function showCHActorScreen() {
  if (CH.deckIdx >= CH.deck.length) {
    CH.deck = shuffle([...CH.deck]);
    CH.deckIdx = 0;
  }
  const card = CH.deck[CH.deckIdx];
  const cat = ALL_CATEGORIES.find(c => c.id === card.category);

  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card card-glow" style="max-width:360px;width:100%;padding:2.5rem 1.5rem;">
        <p class="text-muted text-sm mb-3" style="letter-spacing:0.1em;text-transform:uppercase;">Your Card — Actor Only</p>
        <span style="font-size:2rem;margin-bottom:0.5rem;display:block;">${cat?.icon || '🎭'}</span>
        <span class="cat-badge mb-3" style="background:color-mix(in srgb,${cat?.color||'var(--gold)'} 15%,transparent);color:${cat?.color||'var(--gold2)'};border:1px solid color-mix(in srgb,${cat?.color||'var(--gold)'} 30%,transparent);">${cat?.label || ''}</span>
        <p class="act-word mb-4">${card.act}</p>
        <p class="text-sm text-muted mb-4">No talking, no sounds, no pointing at objects.</p>
        <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showCHHintPreview()">
          👁 Peek at Hint (optional)
        </button>
        <button class="btn btn-primary btn-lg btn-full" onclick="startCHTurn()">
          ▶ Start Timer — Let's Go!
        </button>
      </div>
    </div>
  `);
}

let _chHintShown = false;
function showCHHintPreview() {
  const card = CH.deck[CH.deckIdx];
  _chHintShown = true;
  const hint = document.createElement('div');
  hint.className = 'card animate-slide-up';
  hint.style.cssText = 'margin-top:1rem;padding:0.85rem;background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:var(--r-sm);';
  hint.innerHTML = `<p class="text-sm text-center" style="color:var(--gold2);">💡 ${card.hint}</p>`;
  const container = document.querySelector('.container');
  const hintBtn = container?.querySelector('button');
  if (hintBtn) {
    hintBtn.disabled = true;
    hintBtn.textContent = '👁 Hint Revealed';
    hintBtn.style.opacity = '0.5';
    hintBtn.parentNode.insertBefore(hint, hintBtn);
  }
}

// ── Active turn ──────────────────────────────────────────────
let _chTimerInterval = null;

function startCHTurn() {
  CH.turn = { correct: 0, passed: 0, hintsUsed: _chHintShown ? 1 : 0, log: [] };
  _chHintShown = false;
  CH.timeLeft = CH.timerSeconds;
  renderActiveTurn();
  _chTimerInterval = setInterval(() => {
    CH.timeLeft -= 0.1;
    if (CH.timeLeft <= 0) {
      CH.timeLeft = 0;
      clearInterval(_chTimerInterval);
      updateCHTimerDisplay();
      haptic('heavy');
      setTimeout(() => endCHTurn(), 600);
    } else {
      updateCHTimerDisplay();
    }
  }, 100);
}

function updateCHTimerDisplay() {
  const el = document.getElementById('chTimerText');
  const bar = document.getElementById('chTimerBar');
  if (el) {
    const secs = Math.ceil(CH.timeLeft);
    el.textContent = secs;
    el.style.color = CH.timeLeft <= 10 ? 'var(--red)' : CH.timeLeft <= 20 ? '#f59e0b' : 'var(--gold2)';
  }
  if (bar) {
    bar.style.width = `${(CH.timeLeft / CH.timerSeconds) * 100}%`;
    bar.style.background = CH.timeLeft <= 10 ? 'var(--red)' : CH.timeLeft <= 20 ? '#f59e0b' : 'var(--gold2)';
  }
}

function renderActiveTurn() {
  if (CH.deckIdx >= CH.deck.length) { CH.deck = shuffle([...CH.deck]); CH.deckIdx = 0; }
  const card = CH.deck[CH.deckIdx];
  const cat = ALL_CATEGORIES.find(c => c.id === card.category);
  const team = CH.teams[CH.currentTeam];

  render(`
    <div class="stagger">
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold" style="color:var(--gold2);">${team.name}</span>
        <div class="flex items-center gap-2">
          <span class="text-muted text-sm">✓ <strong style="color:var(--green);" id="chCorrectCount">${CH.turn.correct}</strong></span>
          <span class="text-muted text-sm">↩ <strong style="color:var(--text2);" id="chPassCount">${CH.turn.passed}</strong></span>
        </div>
      </div>

      <div class="progress-bar mb-2" style="height:10px;">
        <div id="chTimerBar" class="progress-fill" style="width:100%;background:var(--gold2);transition:width 0.1s linear,background 0.3s;"></div>
      </div>
      <p class="text-center font-bold mb-4" style="font-size:1.4rem;font-family:var(--font-h);" id="chTimerText">${CH.timerSeconds}</p>

      <div class="card card-glow mb-4" style="padding:1.75rem 1.25rem;text-align:center;" id="chCardDisplay">
        <span style="font-size:1.2rem;display:block;margin-bottom:0.5rem;">${cat?.icon || '🎭'}</span>
        <p class="act-word" id="chActWord">${card.act}</p>
        <div id="chHintArea" style="margin-top:0.75rem;"></div>
      </div>

      <div class="flex gap-3 mb-3">
        <button class="btn btn-danger btn-lg" style="flex:1;font-size:1rem;" onclick="chPass()">↩ Pass</button>
        <button class="btn btn-success btn-lg" style="flex:2;font-size:1.1rem;font-weight:700;" onclick="chCorrect()">✓ Got It!</button>
      </div>

      <button class="btn btn-ghost btn-sm btn-full" id="chHintBtn" onclick="revealCHHint()">💡 Show Hint</button>
    </div>
  `);
}

function chCorrect() {
  haptic('medium');
  const card = CH.deck[CH.deckIdx];
  CH.turn.correct++;
  CH.turn.log.push({ act: card.act, result: 'correct' });
  CH.deckIdx++;
  document.getElementById('chCorrectCount').textContent = CH.turn.correct;
  nextCHCard();
}

function chPass() {
  haptic('light');
  const card = CH.deck[CH.deckIdx];
  CH.turn.passed++;
  CH.turn.log.push({ act: card.act, result: 'passed' });
  CH.deckIdx++;
  document.getElementById('chPassCount').textContent = CH.turn.passed;
  nextCHCard();
}

function nextCHCard() {
  if (CH.deckIdx >= CH.deck.length) { CH.deck = shuffle([...CH.deck]); CH.deckIdx = 0; }
  const card = CH.deck[CH.deckIdx];
  const cat = ALL_CATEGORIES.find(c => c.id === card.category);
  const wordEl = document.getElementById('chActWord');
  const iconEl = document.querySelector('#chCardDisplay span');
  const hintArea = document.getElementById('chHintArea');
  const hintBtn = document.getElementById('chHintBtn');
  if (wordEl) wordEl.textContent = card.act;
  if (iconEl) iconEl.textContent = cat?.icon || '🎭';
  if (hintArea) hintArea.innerHTML = '';
  if (hintBtn) { hintBtn.disabled = false; hintBtn.textContent = '💡 Show Hint'; hintBtn.style.opacity = '1'; }
}

function revealCHHint() {
  const card = CH.deck[CH.deckIdx];
  CH.turn.hintsUsed++;
  const hintArea = document.getElementById('chHintArea');
  const hintBtn = document.getElementById('chHintBtn');
  if (hintArea) hintArea.innerHTML = `<p class="text-sm text-muted mt-1" style="color:var(--gold);">💡 ${card.hint}</p>`;
  if (hintBtn) { hintBtn.disabled = true; hintBtn.style.opacity = '0.4'; }
}

// ── End turn ─────────────────────────────────────────────────
function endCHTurn() {
  clearInterval(_chTimerInterval);
  CH.teams[CH.currentTeam].score += CH.turn.correct;
  CH.teams[CH.currentTeam].turns++;
  showCHTurnSummary();
}

function showCHTurnSummary() {
  const team = CH.teams[CH.currentTeam];
  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">⏱️</span>
        <h2 class="font-serif text-gold2 mb-1">Time's Up!</h2>
        <p class="text-muted text-sm">${team.name}'s turn is over</p>
      </div>

      <div class="card mb-3">
        <div class="flex justify-around" style="padding:0.5rem 0;">
          <div class="text-center">
            <p style="font-size:2.5rem;font-family:var(--font-h);font-weight:700;color:var(--green);">${CH.turn.correct}</p>
            <p class="text-muted text-sm">Correct</p>
          </div>
          <div class="text-center">
            <p style="font-size:2.5rem;font-family:var(--font-h);font-weight:700;color:var(--text2);">${CH.turn.passed}</p>
            <p class="text-muted text-sm">Passed</p>
          </div>
          <div class="text-center">
            <p style="font-size:2.5rem;font-family:var(--font-h);font-weight:700;color:var(--gold2);">${team.score}</p>
            <p class="text-muted text-sm">Total Score</p>
          </div>
        </div>
      </div>

      ${CH.turn.log.length ? `
        <div class="card mb-4" style="text-align:left;">
          <p class="input-label mb-2">This Turn</p>
          <div class="flex flex-col gap-1">
            ${CH.turn.log.map(entry => `
              <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;padding:0.25rem 0;">
                <span style="color:${entry.result==='correct'?'var(--green)':'var(--text3)'};">${entry.result==='correct'?'✓':'↩'}</span>
                <span style="color:${entry.result==='correct'?'var(--text)':'var(--text3)'};">${entry.act}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${buildCHScoreCard()}

      <button class="btn btn-primary btn-lg btn-full" onclick="advanceCHTurn()">
        ${getNextTurnLabel()}
      </button>
    </div>
  `);
}

function buildCHScoreCard() {
  return `
    <div class="card mb-4">
      <p class="input-label mb-2">Scores</p>
      <div class="flex flex-col gap-1">
        ${[...CH.teams].sort((a,b) => b.score - a.score).map((t,i) => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.4rem 0.5rem;background:var(--bg3);border-radius:var(--r-sm);">
            <span style="font-size:1rem;">${i===0?'🥇':i===1?'🥈':'🥉'}</span>
            <span style="flex:1;font-size:0.9rem;">${t.name}</span>
            <span style="font-family:var(--font-h);font-weight:700;color:var(--gold2);">${t.score}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getNextTurnLabel() {
  const nextTeam = (CH.currentTeam + 1) % CH.teams.length;
  const isLastTeam = CH.currentTeam === CH.teams.length - 1;
  const isLastRound = isLastTeam && CH.round === CH.totalRounds;
  if (isLastRound) return '🏆 See Final Results';
  if (isLastTeam) return `🔄 Start Round ${CH.round + 1}`;
  return `Next: ${CH.teams[nextTeam].name} →`;
}

function advanceCHTurn() {
  const isLastTeam = CH.currentTeam === CH.teams.length - 1;
  if (isLastTeam && CH.round === CH.totalRounds) { showCHGameOver(); return; }
  if (isLastTeam) CH.round++;
  CH.currentTeam = (CH.currentTeam + 1) % CH.teams.length;
  showCHTeamReady();
}

// ── Game over ────────────────────────────────────────────────
function showCHGameOver() {
  CH.phase = 'gameover';
  const sorted = [...CH.teams].sort((a,b) => b.score - a.score);
  const winner = sorted[0];
  const tied = sorted.filter(t => t.score === winner.score);

  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3" style="background:linear-gradient(135deg,rgba(212,160,23,0.15),transparent);">
        <span style="font-size:3rem;display:block;margin-bottom:0.75rem;animation:bounce 2s infinite;">🏆</span>
        <h2 class="font-serif text-gold2 mb-1">${tied.length > 1 ? "It's a Tie!" : `${winner.name} Wins!`}</h2>
        <p class="text-muted text-sm">${tied.length > 1 ? tied.map(t=>t.name).join(' & ') + ' tied with' : 'Champions with'} ${winner.score} point${winner.score !== 1 ? 's' : ''}</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-3">Final Standings</p>
        <div class="flex flex-col gap-2">
          ${sorted.map((t,i) => `
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.85rem;background:${i===0?'rgba(212,160,23,0.1)':'var(--bg3)'};border:1px solid ${i===0?'rgba(212,160,23,0.3)':'var(--border)'};border-radius:var(--r-sm);">
              <span style="font-size:1.3rem;">${i===0?'🥇':i===1?'🥈':'🥉'}</span>
              <span style="flex:1;font-weight:${i===0?'700':'400'};">${t.name}</span>
              <span style="font-family:var(--font-h);font-size:1.3rem;font-weight:700;color:${i===0?'var(--gold2)':'var(--text2)'};">${t.score}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="showSetup()">New Game</button>
        <button class="btn btn-primary btn-full" onclick="replayCHGame()">Play Again</button>
      </div>
    </div>
  `);
}

function replayCHGame() {
  CH.teams.forEach(t => { t.score = 0; t.turns = 0; });
  CH.round = 1;
  CH.currentTeam = 0;
  CH.deck = shuffle([...CH.deck]);
  CH.deckIdx = 0;
  CH.phase = 'playing';
  showCHTeamReady();
}

// ── Init ─────────────────────────────────────────────────────
showSetup();
