/* ── Biblical Jeopardy ────────────────────────────────────── */

const JP = {
  teams: [],
  answered: {}, // "catIdx-qIdx": true
  currentQ: null,
  finalJeopardy: false,
  finalBets: {},
  finalAnswered: false,
  phase: 'setup', // setup | board | question | final-bet | final-q | final-reveal | gameover
};

const root = document.getElementById('appRoot');

function render(html) {
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.25rem;padding-bottom:2rem;">${html}</div>`;
}

// ── SCREEN: Setup ─────────────────────────────────────────
function showSetup() {
  JP.phase = 'setup';
  JP.answered = {};
  JP.finalJeopardy = false;
  JP.finalBets = {};
  JP.currentQ = null;
  Object.keys(finalApplied).forEach(k => delete finalApplied[k]);

  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">⭐</span>
        <h2 class="font-serif text-gold2">Biblical Jeopardy</h2>
        <p class="text-muted text-sm mt-1">Test your Scripture knowledge</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Teams / Players <span class="text-muted">(2–6)</span></p>
        <div id="teamList" class="flex flex-col gap-2 mb-2"></div>
        <button class="btn btn-ghost btn-sm btn-full" onclick="addTeam()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Team
        </button>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startJeopardy()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);

  // Default teams
  if (JP.teams.length === 0) {
    JP.teams = [
      { name: 'Team 1', score: 0 },
      { name: 'Team 2', score: 0 },
    ];
  }
  setTimeout(renderTeamList, 50);
}

function renderTeamList() {
  const list = document.getElementById('teamList');
  if (!list) return;
  list.innerHTML = JP.teams.map((t, i) => `
    <div class="flex gap-1 items-center">
      <div class="avatar avatar-sm">${getInitials(t.name) || (i+1)}</div>
      <input class="input" placeholder="Team ${i+1}" value="${t.name}"
        oninput="JP.teams[${i}].name=this.value"
        style="flex:1;"/>
      ${i > 1 ? `<button onclick="JP.teams.splice(${i},1);renderTeamList()" class="btn btn-ghost btn-icon" style="width:36px;height:36px;color:var(--text3);">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>` : '<div style="width:36px"></div>'}
    </div>
  `).join('');
}

function addTeam() {
  if (JP.teams.length >= 6) { showToast('Max 6 teams', 'error'); return; }
  JP.teams.push({ name: `Team ${JP.teams.length + 1}`, score: 0 });
  renderTeamList();
}

// ── SCREEN: Board ──────────────────────────────────────────
function startJeopardy() {
  JP.teams.forEach((t, i) => {
    const input = document.querySelectorAll('#teamList input')[i];
    if (input) t.name = input.value || t.name;
    t.score = 0;
  });
  showBoard();
}

function showBoard() {
  JP.phase = 'board';
  const data = getGameData();
  const cats = data.jeopardy.categories;
  const cols = cats.length;

  // Check if all answered
  let totalQ = 0, answeredQ = 0;
  cats.forEach((cat, ci) => {
    cat.questions.forEach((q, qi) => {
      totalQ++;
      if (JP.answered[`${ci}-${qi}`]) answeredQ++;
    });
  });

  const allDone = answeredQ === totalQ;

  render(`
    <div>
      <!-- Scores -->
      <div class="flex gap-2 mb-3 overflow-x-auto" id="scoreboard" style="padding-bottom:4px;">
        ${JP.teams.map((t, i) => `
          <div class="score-row" style="min-width:90px;flex:1;flex-direction:column;gap:0.1rem;padding:0.5rem 0.6rem;text-align:center;">
            <span class="text-sm" style="color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">${t.name}</span>
            <span class="score-value" style="font-size:1.1rem;">$${t.score}</span>
          </div>
        `).join('')}
      </div>

      <!-- Board -->
      <div class="jeopardy-scroll animate-fade-in" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:5px;">
        ${cats.map((cat, ci) => `
          <div class="jeopardy-cell header">${cat.name}</div>
        `).join('')}
        ${[0,1,2,3,4].map(qi => cats.map((cat, ci) => {
          const q = cat.questions[qi];
          if (!q) return `<div class="jeopardy-cell"></div>`;
          const isAnswered = JP.answered[`${ci}-${qi}`];
          return `<div class="jeopardy-cell value ${isAnswered ? 'answered' : ''}" onclick="${isAnswered ? '' : `openQuestion(${ci},${qi})`}">
            ${isAnswered ? '' : `$${q.value}`}
          </div>`;
        }).join('')).join('')}
      </div>

      <!-- Final Jeopardy -->
      <div class="mt-3">
        ${allDone ? `
          <button class="btn btn-primary btn-lg btn-full glow-pulse" onclick="showFinalBet()">
            ⭐ Final Jeopardy
          </button>
        ` : `
          <div class="text-center text-muted text-sm mt-2">
            ${answeredQ}/${totalQ} questions answered
          </div>
          <button class="btn btn-ghost btn-full mt-2" onclick="showFinalBet()">
            Skip to Final Jeopardy →
          </button>
        `}
      </div>
    </div>
  `);
}

// ── SCREEN: Question ───────────────────────────────────────
function openQuestion(ci, qi) {
  const data = getGameData();
  const cat = data.jeopardy.categories[ci];
  const q = cat.questions[qi];
  JP.currentQ = { ci, qi, q, cat };
  JP.phase = 'question';

  render(`
    <div class="stagger">
      <!-- Category label -->
      <div class="text-center mb-3">
        <span class="badge badge-gold">${cat.name}</span>
        <span class="badge badge-gold ml-1" style="margin-left:0.5rem;">$${q.value}</span>
      </div>

      <!-- Question card -->
      <div class="card card-glow p-3 mb-4 text-center" style="padding:2rem;">
        <p class="font-serif" style="font-size:clamp(1rem,4vw,1.3rem);color:var(--text);line-height:1.6;">${q.question}</p>
      </div>

      <!-- Answer (hidden by default) -->
      <div class="flip-card w-full mb-4" id="ansCard" onclick="revealAnswer()">
        <div class="flip-inner">
          <div class="flip-front">
            <div class="role-card-front" style="height:100px;">
              <span style="font-size:1.5rem">🤔</span>
              <p class="text-muted text-sm">Tap to reveal answer</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" style="height:100px;background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);">
              <p class="font-serif" style="color:var(--green);font-size:1.1rem;font-weight:700;">${q.answer}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Award points -->
      <div id="awardSection" class="card mb-3 hidden">
        <p class="input-label mb-2">Award $${q.value} to:</p>
        <div class="flex flex-col gap-2" id="teamAwardList">
          ${JP.teams.map((t, ti) => `
            <button class="vote-btn" onclick="awardPoints(${ti}, ${q.value}, ${ci}, ${qi})">
              <div class="avatar">${getInitials(t.name)}</div>
              <span>${t.name}</span>
              <span class="score-value" style="margin-left:auto;font-size:1rem;">$${t.score}</span>
            </button>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-sm btn-full mt-2" onclick="markAnswered(${ci}, ${qi}, false)">
          No one gets points
        </button>
      </div>

      <button class="btn btn-ghost btn-full" onclick="showBoard()">← Back to Board</button>
    </div>
  `);
}

function revealAnswer() {
  const card = document.getElementById('ansCard');
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  haptic('medium');
  setTimeout(() => {
    document.getElementById('awardSection')?.classList.remove('hidden');
  }, 600);
}

function awardPoints(teamIdx, value, ci, qi) {
  JP.teams[teamIdx].score += value;
  haptic('heavy');
  showToast(`+$${value} for ${JP.teams[teamIdx].name}!`, 'success');
  markAnswered(ci, qi, true);
}

function markAnswered(ci, qi, awarded) {
  JP.answered[`${ci}-${qi}`] = true;
  showBoard();
}

// ── SCREEN: Score Edit ─────────────────────────────────────
function showScoreEdit() {
  const html = `
    <div class="overlay" id="scoreOverlay" onclick="if(event.target.id==='scoreOverlay')this.remove()">
      <div class="modal">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">Edit Scores</h3>
        <div class="flex flex-col gap-2" id="scoreEditList">
          ${JP.teams.map((t, i) => `
            <div class="flex gap-2 items-center">
              <div class="avatar">${getInitials(t.name)}</div>
              <span style="flex:1;">${t.name}</span>
              <button onclick="adjustScore(${i},-100)" class="btn btn-ghost btn-sm">−</button>
              <span class="score-value" id="seScore-${i}">$${t.score}</span>
              <button onclick="adjustScore(${i},100)" class="btn btn-ghost btn-sm">+</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-full mt-3" onclick="document.getElementById('scoreOverlay').remove();showBoard()">Done</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function adjustScore(idx, delta) {
  JP.teams[idx].score = Math.max(0, JP.teams[idx].score + delta);
  const el = document.getElementById(`seScore-${idx}`);
  if (el) el.textContent = `$${JP.teams[idx].score}`;
}

// ── SCREEN: Final Jeopardy Bet ────────────────────────────
function showFinalBet() {
  JP.phase = 'final-bet';
  JP.finalBets = {};

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4" style="background:linear-gradient(135deg,rgba(212,160,23,0.12),transparent);">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:bounce 2s infinite">⭐</span>
        <h2 class="font-serif text-gold2 mb-1">Final Jeopardy!</h2>
        <p class="text-muted text-sm">Each team wagers their points. All bets are placed before the question is revealed.</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-3">Place Your Wagers</p>
        <div class="flex flex-col gap-3" id="betList">
          ${JP.teams.map((t, i) => `
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center">
                <span class="font-bold">${t.name}</span>
                <span class="text-muted text-sm">Has: $${t.score}</span>
              </div>
              <input class="input" type="number" min="0" max="${t.score}" placeholder="Wager (0–$${t.score})"
                id="bet-${i}" value="${Math.floor(t.score / 2)}" oninput="JP.finalBets[${i}]=parseInt(this.value)||0"/>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showFinalQuestion()">
        Reveal Final Question ⭐
      </button>
    </div>
  `);

  // Pre-fill bets
  JP.teams.forEach((t, i) => { JP.finalBets[i] = Math.floor(t.score / 2); });
}

// ── SCREEN: Final Question ────────────────────────────────
function showFinalQuestion() {
  // Read bets
  JP.teams.forEach((t, i) => {
    const input = document.getElementById(`bet-${i}`);
    JP.finalBets[i] = Math.max(0, Math.min(t.score, parseInt(input?.value) || 0));
  });

  const data = getGameData();
  // Use last category's hardest question as Final Jeopardy
  const cats = data.jeopardy.categories;
  const finalCat = cats[cats.length - 1];
  const finalQ = finalCat.questions[finalCat.questions.length - 1];
  JP.currentQ = { q: finalQ, cat: finalCat };

  JP.phase = 'final-q';

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4" style="padding:2rem;">
        <span style="font-size:2rem;display:block;margin-bottom:0.75rem;animation:float 3s ease-in-out infinite;">⭐</span>
        <p class="badge badge-gold mb-3" style="display:inline-flex;">Final Jeopardy — ${finalCat.name}</p>
        <p class="font-serif" style="font-size:clamp(1rem,4vw,1.25rem);color:var(--text);line-height:1.6;">${finalQ.question}</p>
      </div>

      <p class="text-muted text-sm mb-4">All teams write their answers secretly, then reveal simultaneously.</p>

      <div class="flip-card w-full mb-4" id="finalAnsCard" onclick="revealFinalAnswer()">
        <div class="flip-inner">
          <div class="flip-front">
            <div class="role-card-front" style="height:90px;">
              <span style="font-size:1.5rem">🤫</span>
              <p class="text-muted text-sm">Tap after all teams write their answers</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" style="height:90px;background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);">
              <p class="font-serif" style="color:var(--green);font-size:1.1rem;font-weight:700;">${finalQ.answer}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="finalScoreSection" class="hidden animate-slide-up">
        <div class="card mb-4">
          <p class="input-label mb-2">Did each team answer correctly?</p>
          <div class="flex flex-col gap-2">
            ${JP.teams.map((t, i) => `
              <div class="flex items-center justify-between p-2" style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
                <div class="flex items-center gap-2">
                  <div class="avatar avatar-sm">${getInitials(t.name)}</div>
                  <span>${t.name}</span>
                  <span class="text-muted text-sm">(Bet: $${JP.finalBets[i] || 0})</span>
                </div>
                <div class="flex gap-1">
                  <button class="btn btn-success btn-sm" onclick="applyFinalScore(${i}, true, this)">✓</button>
                  <button class="btn btn-danger btn-sm" onclick="applyFinalScore(${i}, false, this)">✗</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-lg btn-full" onclick="showFinalResults()">
          See Final Results ⭐
        </button>
      </div>
    </div>
  `);
}

const finalApplied = {};
function revealFinalAnswer() {
  const card = document.getElementById('finalAnsCard');
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  haptic('heavy');
  setTimeout(() => {
    document.getElementById('finalScoreSection')?.classList.remove('hidden');
  }, 700);
}

function applyFinalScore(idx, correct, btn) {
  if (finalApplied[idx]) return;
  finalApplied[idx] = true;
  const bet = JP.finalBets[idx] || 0;
  JP.teams[idx].score = Math.max(0, JP.teams[idx].score + (correct ? bet : -bet));
  haptic('medium');
  btn.closest('.flex').querySelectorAll('button').forEach(b => b.disabled = true);
  btn.style.opacity = '1';
  showToast(`${JP.teams[idx].name}: ${correct ? '+' : '-'}$${bet}`, correct ? 'success' : 'error');
}

// ── SCREEN: Final Results ──────────────────────────────────
function showFinalResults() {
  JP.phase = 'gameover';
  const sorted = [...JP.teams].sort((a,b) => b.score - a.score);

  // All teams tied for first are co-winners
  const topScore   = sorted[0].score;
  const sbWinners  = sorted.filter(t => t.score === topScore).map(t => t.name);

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4">
        <span style="font-size:3rem;display:block;margin-bottom:0.75rem;animation:bounce 1.5s infinite">👑</span>
        <h2 class="font-serif text-gold2 mb-1">Game Over!</h2>
        <p class="text-muted">${sbWinners.join(' & ')} claim${sbWinners.length === 1 ? 's' : ''} victory!</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Final Standings</p>
        <div class="flex flex-col gap-2">
          ${sorted.map((t, i) => `
            <div class="score-row ${i === 0 ? 'leader' : ''}">
              <div class="flex items-center gap-2">
                <span style="font-size:1.2rem;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'✦'}</span>
                <span>${t.name}</span>
              </div>
              <span class="score-value">$${t.score}</span>
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

  showCongrats(sbWinners, 'jeopardy');
}

// ── Init ──────────────────────────────────────────────────
showSetup();
