/* ── Biblical Jeopardy ────────────────────────────────────── */

const JP = {
  teams: [],
  answered: {}, // "catIdx-qIdx": true
  currentQ: null,
  finalJeopardy: false,
  finalBets: {},
  finalAnswered: false,
  phase: 'setup', // setup | board | question | daily-double | final-bet | final-q | final-reveal | gameover
  timerDuration: 30,
  dailyDouble: null, // {ci, qi} — randomly chosen tile
  ddWager: 0,
  ddTeamIdx: -1,
};

const root = document.getElementById('appRoot');

function render(html) {
  window.scrollTo(0,0); root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.25rem;padding-bottom:2rem;">${html}</div>`;
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

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showJPDirections()">📖 How to Play</button>

      <div class="card mb-3">
        <p class="input-label mb-2">Teams / Players <span class="text-muted">(2–6)</span></p>
        <div id="teamList" class="flex flex-col gap-2 mb-2"></div>
        <button class="btn btn-ghost btn-sm btn-full" onclick="addTeam()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Team
        </button>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Question Timer</p>
        <div class="flex gap-1">
          ${[false, 15, 30, 45, 60].map(val => `
            <button class="diff-btn ${JP.timerDuration === val ? 'active' : ''}" style="flex:1;padding:0.5rem;font-size:0.9rem;"
              onclick="setJPTimer(${val})">
              ${val ? val + 's' : 'Off'}
            </button>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startJeopardy()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);

  window.setJPTimer = function(val) {
    if (JP.timerDuration === val) JP.timerDuration = false;
    else JP.timerDuration = val;
    document.querySelectorAll('.diff-btn').forEach(btn => {
      const v = btn.textContent.trim();
      const match = v === 'Off' ? false : parseInt(v);
      btn.classList.toggle('active', match === JP.timerDuration);
    });
  };

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

function showJPDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay" id="jpDirOverlay" onclick="if(event.target.id==='jpDirOverlay')this.remove()">
      <div class="modal" style="max-height:80vh;overflow-y:auto;">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">⭐ How to Play — Biblical Jeopardy</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.7;">
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🎯 Goal</p>
            <p>Teams take turns selecting questions from the board. Answer correctly to earn points. Most points at the end wins!</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🗣️ Answering</p>
            <p>All answers must be phrased as a question — "What is…?" or "Who is…?". The host reveals the answer and awards points to the correct team.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">⭐ Daily Double</p>
            <p>One hidden tile on the board is the Daily Double! The team that finds it wagers some or all of their points before hearing the question.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🏆 Final Jeopardy</p>
            <p>After the board is cleared, all teams secretly wager any amount of their score. Everyone hears the final question, writes their answer, then reveals simultaneously. Correct answers add the wager; wrong answers lose it.</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('jpDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
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

  // Pick 1 random Daily Double tile
  const cats = getGameData().jeopardy.categories;
  const allTiles = [];
  cats.forEach((cat, ci) => cat.questions.forEach((q, qi) => allTiles.push({ci, qi})));
  JP.dailyDouble = shuffle([...allTiles])[0] || null;

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

  const isDesktop = window.innerWidth >= 900;

  render(`
    <div class="${isDesktop ? 'jp-desktop-layout' : ''}" style="${isDesktop ? 'display:grid;grid-template-columns:1fr 250px;gap:2rem;align-items:start;' : ''}">
      ${!isDesktop && window.innerHeight > window.innerWidth && window.innerWidth > 600 ? 
        `<div class="card mb-3 text-center p-2" style="background:rgba(212,160,23,0.1);border-color:var(--gold2);"><span class="text-sm text-gold2">📱 Rotate to landscape for best experience</span></div>` : ''}
    
      <!-- Board Area -->
      <div style="flex:1;">
        <div class="jeopardy-scroll animate-fade-in" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:5px;">
          ${cats.map((cat, ci) => `
            <div class="jeopardy-cell header" style="${isDesktop ? 'font-size:1.1rem;padding:1rem 0.5rem;' : ''}">${cat.name}</div>
          `).join('')}
          ${[0,1,2,3,4].map(qi => cats.map((cat, ci) => {
            const q = cat.questions[qi];
            if (!q) return `<div class="jeopardy-cell"></div>`;
            const isAnswered = JP.answered[`${ci}-${qi}`];
            return `<div class="jeopardy-cell value ${isAnswered ? 'answered' : ''}" style="${isDesktop ? 'font-size:2rem;padding:2rem 1rem;' : ''}" onclick="${isAnswered ? '' : `openQuestion(${ci},${qi})`}">
              ${isAnswered ? '' : `$${q.value}`}
            </div>`;
          }).join('')).join('')}
        </div>
      </div>

      <!-- Right Sidebar (Scores & Final Jeopardy) -->
      <div style="${isDesktop ? 'position:sticky;top:2rem;' : 'margin-top:1rem;'}">
        <!-- Scores -->
        <h3 class="font-serif text-gold2 mb-2" style="${!isDesktop?'display:none;':''}">Leaderboard</h3>
        <div class="${isDesktop ? 'flex flex-col gap-2' : 'flex gap-2 overflow-x-auto'}" id="scoreboard" style="padding-bottom:4px;">
          ${JP.teams.map((t, i) => `
            <div class="score-row card card-glow" style="min-width:90px;flex:1;flex-direction:column;gap:0.25rem;padding:0.75rem;text-align:center;">
              <span class="text-sm" style="color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;">${t.name}</span>
              <span class="score-value" style="font-size:1.5rem;">$${t.score}</span>
            </div>
          `).join('')}
        </div>

        <!-- Daily Double tracker -->
        ${JP.dailyDouble && !JP.answered[`${JP.dailyDouble.ci}-${JP.dailyDouble.qi}`] ? `
          <div class="text-center mt-3 text-sm text-muted">⭐ 1 Daily Double hidden on the board</div>
        ` : JP.dailyDouble ? `
          <div class="text-center mt-3 text-sm" style="color:var(--gold2);">⭐ Daily Double found!</div>
        ` : ''}

        <!-- Final Jeopardy -->
        <div class="mt-4">
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
    </div>
  `);
}

// ── SCREEN: Question ───────────────────────────────────────
function openQuestion(ci, qi) {
  // Check for Daily Double
  if (JP.dailyDouble && JP.dailyDouble.ci === ci && JP.dailyDouble.qi === qi && !JP.answered[`${ci}-${qi}`]) {
    showDailyDouble(ci, qi);
    return;
  }

  const data = getGameData();
  const cat = data.jeopardy.categories[ci];
  const q = cat.questions[qi];
  JP.currentQ = { ci, qi, q, cat };
  JP.phase = 'question';

  const isDesktop = window.innerWidth >= 900;

  render(`
    <div class="stagger ${isDesktop ? 'jp-question-desktop' : ''}" style="${isDesktop ? 'max-width:800px;margin:0 auto;' : ''}">
      <!-- Category label -->
      <div class="text-center mb-3">
        <span class="badge badge-gold" style="${isDesktop ? 'font-size:1.1rem;padding:0.4rem 0.8rem;' : ''}">${cat.name}</span>
        <span class="badge badge-gold ml-1" style="margin-left:0.5rem;${isDesktop ? 'font-size:1.1rem;padding:0.4rem 0.8rem;' : ''}">$${q.value}</span>
      </div>

      <!-- Question card -->
      <div class="card card-glow p-3 mb-4 text-center" style="${isDesktop ? 'padding:4rem 2rem;' : 'padding:2rem;'}">
        <p class="font-serif" style="font-size:clamp(1rem,4vw,1.3rem);color:var(--text);line-height:1.6;${isDesktop ? 'font-size:2rem;' : ''}">${q.question}</p>
      </div>

      <!-- Timer Bar -->
      ${JP.timerDuration ? `
      <div id="jpTimerContainer" class="progress-bar mb-4" style="height:12px;background:var(--bg-card);border:1px solid var(--border1);">
        <div id="jpTimerFill" class="progress-fill" style="width:100%;background:var(--gold2);transition:width 0.1s linear, background-color 0.3s ease;"></div>
      </div>
      <div id="jpTimerText" class="text-center font-serif mb-4" style="font-size:1.5rem;color:var(--gold2);font-weight:700;">
        ${JP.timerDuration}s
      </div>
      ` : ''}

      <!-- Answer (hidden by default) -->
      <div class="flip-card w-full mb-4" id="ansCard" onclick="revealAnswer()">
        <div class="flip-inner" style="min-height:0;">
          <div class="flip-front">
            <div class="role-card-front" style="min-height:90px;padding:1.25rem;${isDesktop ? 'padding:2rem;' : ''}">
              <span style="font-size:1.5rem;${isDesktop ? 'font-size:2.5rem;' : ''}">🤔</span>
              <p class="text-muted text-sm" style="${isDesktop ? 'font-size:1.1rem;' : ''}">Tap to reveal answer</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" style="min-height:90px;height:100%;padding:1.25rem;background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);${isDesktop ? 'padding:2rem;' : ''}">
              <p class="font-serif" style="color:var(--green);font-size:1.1rem;font-weight:700;${isDesktop ? 'font-size:1.5rem;' : ''}">${q.answer}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Award points -->
      <div id="awardSection" class="card mb-3 hidden">
        <p class="input-label mb-2">Award $${q.value} to:</p>
        <div class="flex flex-col gap-2" id="teamAwardList">
          ${JP.teams.map((t, ti) => `
            <button class="vote-btn" style="${isDesktop ? 'padding:1rem;font-size:1.25rem;' : ''}" onclick="awardPoints(${ti}, ${q.value}, ${ci}, ${qi})">
              <div class="avatar">${getInitials(t.name)}</div>
              <span>${t.name}</span>
              <span class="score-value" style="margin-left:auto;font-size:1rem;${isDesktop ? 'font-size:1.25rem;' : ''}">$${t.score}</span>
            </button>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-sm btn-full mt-2" onclick="markAnswered(${ci}, ${qi}, false)" style="${isDesktop ? 'padding:1rem;' : ''}">
          No one gets points
        </button>
      </div>

      <button class="btn btn-ghost btn-full" onclick="stopQuestionTimer(); showBoard()" style="${isDesktop ? 'padding:1.5rem;font-size:1.25rem;' : ''}">← Back to Board</button>
    </div>
  `);

  if (JP.timerDuration) {
    startQuestionTimer(JP.timerDuration);
  }
}

// ── SCREEN: Daily Double ───────────────────────────────────
function showDailyDouble(ci, qi) {
  JP.phase = 'daily-double';
  JP.ddWager = 0;
  JP.ddTeamIdx = -1;
  const data = getGameData();
  const cat = data.jeopardy.categories[ci];
  const q = cat.questions[qi];

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4" style="background:linear-gradient(135deg,rgba(212,160,23,0.2),rgba(212,160,23,0.05));border-color:var(--gold2);">
        <span style="font-size:3rem;display:block;margin-bottom:0.5rem;animation:bounce 1s infinite">⭐</span>
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.15em;text-transform:uppercase;">Daily Double!</p>
        <h2 class="font-serif text-gold2" style="font-size:2rem;">Daily Double</h2>
        <p class="text-muted text-sm mt-1">${cat.name}</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Which team found it?</p>
        <div class="flex flex-col gap-2" id="ddTeamList">
          ${JP.teams.map((t, i) => `
            <button id="dd-team-${i}" class="vote-btn ${JP.ddTeamIdx === i ? 'selected' : ''}" onclick="selectDDTeam(${i})">
              <div class="avatar">${getInitials(t.name)}</div>
              <span>${t.name}</span>
              <span class="score-value" style="margin-left:auto;font-size:1rem;">$${t.score}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card mb-4 hidden" id="ddWagerCard">
        <p class="input-label mb-1">Place Your Wager</p>
        <p class="text-muted text-sm mb-3">Up to <strong id="ddMaxLabel">$0</strong> (or minimum $100)</p>
        <div class="flex items-center gap-3 justify-center mb-2">
          <button onclick="adjustDDWager(-100)" class="btn btn-ghost btn-sm btn-icon" style="width:40px;height:40px;font-size:1.1rem;">−</button>
          <span style="font-family:var(--font-h);font-size:2rem;font-weight:700;color:var(--gold2);min-width:90px;text-align:center;" id="ddWagerDisplay">$100</span>
          <button onclick="adjustDDWager(100)" class="btn btn-ghost btn-sm btn-icon" style="width:40px;height:40px;font-size:1.1rem;">+</button>
        </div>
        <button class="btn btn-primary btn-lg btn-full" onclick="showDailyDoubleQuestion(${ci}, ${qi})">
          Reveal Question →
        </button>
      </div>
    </div>
  `);
}

function selectDDTeam(teamIdx) {
  JP.ddTeamIdx = teamIdx;
  document.querySelectorAll('#ddTeamList .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`dd-team-${teamIdx}`)?.classList.add('selected');
  const maxWager = Math.max(JP.teams[teamIdx].score, 100);
  JP.ddWager = Math.max(100, Math.min(maxWager, 100));
  const card = document.getElementById('ddWagerCard');
  if (card) card.classList.remove('hidden');
  const maxLbl = document.getElementById('ddMaxLabel');
  if (maxLbl) maxLbl.textContent = `$${maxWager}`;
  const disp = document.getElementById('ddWagerDisplay');
  if (disp) disp.textContent = `$${JP.ddWager}`;
  haptic('light');
}

function adjustDDWager(delta) {
  if (JP.ddTeamIdx === -1) return;
  const maxWager = Math.max(JP.teams[JP.ddTeamIdx].score, 100);
  JP.ddWager = Math.max(100, Math.min(maxWager, JP.ddWager + delta));
  const disp = document.getElementById('ddWagerDisplay');
  if (disp) disp.textContent = `$${JP.ddWager}`;
}

function showDailyDoubleQuestion(ci, qi) {
  if (JP.ddTeamIdx === -1) { showToast('Select a team first', 'error'); return; }
  const data = getGameData();
  const cat = data.jeopardy.categories[ci];
  const q = cat.questions[qi];
  JP.currentQ = { ci, qi, q, cat, isDailyDouble: true, ddWager: JP.ddWager, ddTeamIdx: JP.ddTeamIdx };
  JP.phase = 'question';
  const wager = JP.ddWager;
  const teamName = JP.teams[JP.ddTeamIdx].name;

  render(`
    <div class="stagger">
      <div class="text-center mb-3">
        <span class="badge badge-gold" style="margin-right:0.4rem;">⭐ Daily Double</span>
        <span class="badge badge-gold">${cat.name}</span>
        <span class="badge" style="background:rgba(212,160,23,0.2);color:var(--gold2);border:1px solid var(--gold2);margin-left:0.4rem;">$${wager} wagered by ${teamName}</span>
      </div>

      <div class="card card-glow p-3 mb-4 text-center" style="padding:2rem;">
        <p class="font-serif" style="font-size:clamp(1rem,4vw,1.3rem);color:var(--text);line-height:1.6;">${q.question}</p>
      </div>

      <div class="flip-card w-full mb-4" id="ansCard" onclick="revealAnswer()">
        <div class="flip-inner" style="min-height:0;">
          <div class="flip-front">
            <div class="role-card-front" style="min-height:90px;padding:1.25rem;">
              <span style="font-size:1.5rem;">🤔</span>
              <p class="text-muted text-sm">Tap to reveal answer</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" style="min-height:90px;height:100%;padding:1.25rem;background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);">
              <p class="font-serif" style="color:var(--green);font-size:1.1rem;font-weight:700;">${q.answer}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="awardSection" class="card mb-3 hidden">
        <p class="input-label mb-2">Did <strong>${teamName}</strong> answer correctly?</p>
        <div class="flex gap-2">
          <button class="btn btn-success btn-full" onclick="awardDDPoints(true)">✓ Correct (+$${wager})</button>
          <button class="btn btn-danger btn-full" onclick="awardDDPoints(false)">✗ Wrong (−$${wager})</button>
        </div>
      </div>

      <button class="btn btn-ghost btn-full" onclick="stopQuestionTimer(); showBoard()">← Back to Board</button>
    </div>
  `);
}

function awardDDPoints(correct) {
  const { ddWager, ddTeamIdx, ci, qi } = JP.currentQ;
  if (correct) {
    JP.teams[ddTeamIdx].score += ddWager;
    haptic('heavy');
    showToast(`+$${ddWager} for ${JP.teams[ddTeamIdx].name}!`, 'success');
  } else {
    JP.teams[ddTeamIdx].score = Math.max(0, JP.teams[ddTeamIdx].score - ddWager);
    haptic('medium');
    showToast(`−$${ddWager} for ${JP.teams[ddTeamIdx].name}`, 'error');
  }
  JP.answered[`${ci}-${qi}`] = true;
  showBoard();
}

let _jpTimerInterval = null;

function startQuestionTimer(duration) {
  stopQuestionTimer();
  let timeLeft = duration;
  const fill = document.getElementById('jpTimerFill');
  const text = document.getElementById('jpTimerText');
  if (!fill || !text) return;

  _jpTimerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      stopQuestionTimer();
      text.textContent = "Time's up!";
      text.style.color = "var(--red)";
      fill.style.width = "0%";
      haptic('heavy');
      revealAnswer(); // Auto reveal when time is out
      return;
    }

    const pct = (timeLeft / duration) * 100;
    fill.style.width = `${pct}%`;
    text.textContent = Math.ceil(timeLeft) + "s";

    if (pct < 25) {
      fill.style.backgroundColor = "var(--red)";
      text.style.color = "var(--red)";
    } else if (pct < 50) {
      fill.style.backgroundColor = "var(--orange)";
      text.style.color = "var(--orange)";
    }
  }, 100);
}

function stopQuestionTimer() {
  if (_jpTimerInterval) {
    clearInterval(_jpTimerInterval);
    _jpTimerInterval = null;
  }
}

function revealAnswer() {
  const card = document.getElementById('ansCard');
  if (card.classList.contains('flipped')) return;
  stopQuestionTimer();
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
  const fj = data.jeopardy.finalJeopardy;
  JP.currentQ = { q: { question: fj.question, answer: fj.answer }, cat: { name: fj.category } };

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
        <div class="flip-inner" style="min-height:0;">
          <div class="flip-front">
            <div class="role-card-front" style="min-height:90px;padding:1.25rem;">
              <span style="font-size:1.5rem">🤫</span>
              <p class="text-muted text-sm">Tap after all teams write their answers</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" style="min-height:90px;height:100%;padding:1.25rem;background:rgba(74,222,128,0.08);border-color:rgba(74,222,128,0.3);">
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
