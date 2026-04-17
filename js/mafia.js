/* ── Biblical Mafia ───────────────────────────────────────── */

const MF = {
  players: [],          // { name, role, alive, protected }
  phase: 'setup',       // setup | role-reveal | night | day | vote | gameover
  revealIdx: 0,
  night: 1,
  nightActions: {},     // { prophet: idx, healer: idx, mafia: idx, sorcerer: idx, judge: idx }
  nightResults: [],
  lastHealerTarget: -1,
  dayVotes: {},
  selectedVote: -1,
  eliminatedThisRound: null,
};

const root = document.getElementById('appRoot');

function render(html) {
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Role definitions ────────────────────────────────────────
const ROLES = {
  disciple:      { name: 'Disciple',      icon: '🙏', team: 'good',    color: 'var(--green)',  bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)' },
  prophet:       { name: 'Prophet',       icon: '👁️',  team: 'good',    color: 'var(--blue)',   bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)' },
  healer:        { name: 'Healer',        icon: '🌿', team: 'good',    color: 'var(--green)',  bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)' },
  judge:         { name: 'Judge',         icon: '⚖️',  team: 'good',    color: 'var(--gold)',   bg: 'var(--gold-dim)',        border: 'var(--border2)' },
  false_prophet: { name: 'False Prophet', icon: '🐍', team: 'evil',    color: 'var(--red)',    bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  pharaoh:       { name: 'Pharaoh',       icon: '👑', team: 'evil',    color: 'var(--red)',    bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  sorcerer:      { name: 'Sorcerer',      icon: '🔮', team: 'evil',    color: 'var(--purple)', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  wanderer:      { name: 'Wanderer',      icon: '🦅', team: 'neutral', color: 'var(--text2)',  bg: 'var(--bg3)',             border: 'var(--border)' },
};

// ── Role distribution ───────────────────────────────────────
function assignRoles(playerCount) {
  const data = getGameData();
  const dist = data.mafia.roleDistribution;
  const template = dist[Math.min(playerCount, 12)] || dist[12];
  const roleList = [];

  Object.entries(template).forEach(([roleId, count]) => {
    for (let i = 0; i < count; i++) roleList.push(roleId);
  });

  // Fill remaining with disciples
  while (roleList.length < playerCount) roleList.push('disciple');

  return shuffle(roleList);
}

// ── Setup state ───────────────────────────────────────────
let _mfNames = ['', '', '', '', ''];

// ── SCREEN: Setup ─────────────────────────────────────────
function showSetup() {
  MF.phase = 'setup';
  if (_mfNames.length < 5) _mfNames = ['', '', '', '', ''];
  renderMFSetup();
}

function renderMFSetup() {
  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">🦅</span>
        <h2 class="font-serif text-gold2">Biblical Mafia</h2>
        <p class="text-muted text-sm mt-1">Seek out the False Prophets before night falls</p>
      </div>

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showRolesGuide()">
        📖 View All Roles
      </button>

      <div class="card mb-3">
        <p class="input-label mb-2">Players <span class="text-muted">(5–12)</span></p>
        <div id="playerList" class="flex flex-col gap-2 mb-2">
          ${_mfNames.map((v, i) => `
            <div class="flex gap-1 items-center">
              <div class="avatar avatar-sm">${v ? getInitials(v) : (i+1)}</div>
              <input class="input" placeholder="Player ${i+1}" value="${v}"
                oninput="onMFNameInput(this,${i})"
                style="flex:1;"/>
              ${i > 0 ? `<button onclick="removeMFPlayer(${i})" class="btn btn-ghost btn-icon" style="width:36px;height:36px;color:var(--text3);">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>` : '<div style="width:36px"></div>'}
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-sm btn-full" onclick="addMFPlayer()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Player
        </button>
      </div>

      <div class="card mb-4" id="rolePreview">
        <p class="input-label mb-2">Role Distribution Preview</p>
        <div class="flex flex-wrap gap-1">${buildRolePreview(_mfNames.filter(n=>n.trim()).length)}</div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startGame()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Assign Roles & Begin
      </button>
    </div>
  `);
}

function onMFNameInput(input, idx) {
  _mfNames[idx] = input.value;
  const av = input.parentElement.querySelector('.avatar');
  if (av) av.textContent = input.value ? getInitials(input.value) : (idx + 1);
}

function addMFPlayer() {
  syncMFNames();
  if (_mfNames.length >= 12) { showToast('Maximum 12 players', 'error'); return; }
  _mfNames.push('');
  renderMFSetup();
  setTimeout(() => {
    const inputs = document.querySelectorAll('#playerList input');
    inputs[inputs.length - 1]?.focus();
  }, 50);
}

function removeMFPlayer(idx) {
  syncMFNames();
  _mfNames.splice(idx, 1);
  renderMFSetup();
}

function syncMFNames() {
  const inputs = document.querySelectorAll('#playerList input');
  inputs.forEach((inp, i) => { _mfNames[i] = inp.value; });
}

function buildRolePreview(count) {
  if (count < 5) return '<span class="text-muted text-sm">Need at least 5 players</span>';
  const data = getGameData();
  const dist = data.mafia.roleDistribution;
  const template = dist[Math.min(count, 12)] || dist[12];
  return Object.entries(template).map(([id, n]) => {
    const r = ROLES[id] || {};
    return Array(n).fill(0).map(() =>
      `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.25rem 0.6rem;background:${r.bg};border:1px solid ${r.border};border-radius:999px;font-size:0.75rem;color:${r.color};">
        ${r.icon} ${r.name}
      </span>`
    ).join('');
  }).join('');
}

function getPlayerNames() {
  return _mfNames.filter(n => n.trim());
}


function showRolesGuide() {
  const html = `
    <div class="overlay" id="rolesOverlay" onclick="if(event.target.id==='rolesOverlay')this.remove()">
      <div class="modal" style="max-height:80vh;overflow-y:auto;">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">All Roles</h3>
        <div class="flex flex-col gap-2">
          ${Object.entries(ROLES).map(([id, r]) => `
            <div style="display:flex;gap:0.75rem;align-items:flex-start;padding:0.85rem;background:${r.bg};border:1px solid ${r.border};border-radius:var(--r-sm);">
              <span style="font-size:1.5rem;flex-shrink:0;">${r.icon}</span>
              <div>
                <p style="font-weight:700;color:${r.color};margin-bottom:0.2rem;">${r.name}</p>
                <p class="text-sm text-muted">${getRoleDesc(id)}</p>
                <span class="badge ${r.team==='good'?'badge-green':r.team==='evil'?'badge-red':'badge-blue'} mt-1">${r.team}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-ghost btn-full mt-3" onclick="document.getElementById('rolesOverlay').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function getRoleDesc(id) {
  const descs = {
    disciple: 'A faithful follower with no special ability. Vote wisely by day.',
    prophet: 'Each night, peek at one player to learn if they are Good or Evil.',
    healer: 'Each night, protect one player from elimination. Cannot protect same person twice.',
    judge: 'Once per game, block one player from using their night ability.',
    false_prophet: 'Evil mafia member. The group kills one faithful player each night.',
    pharaoh: 'Mafia leader. The Prophet sees you as "Good" when inspected.',
    sorcerer: 'Evil. Each night, redirect one player\'s action to a different target.',
    wanderer: 'Neutral. Survive to the final 3 players to win the game.',
  };
  return descs[id] || '';
}

// ── Start game & assign roles ──────────────────────────────
function startGame() {
  syncMFNames();
  const names = getPlayerNames();
  if (names.length < 5) { showToast('Need at least 5 players', 'error'); return; }
  if (names.length > 12) { showToast('Maximum 12 players', 'error'); return; }

  const roles = assignRoles(names.length);
  MF.players = names.map((name, i) => ({
    name, role: roles[i], alive: true, protected: false
  }));
  MF.night = 1;
  MF.nightActions = {};
  MF.nightResults = [];
  MF.lastHealerTarget = -1;
  MF.dayVotes = {};

  showRoleReveal(0);
}

// ── SCREEN: Role Reveal ────────────────────────────────────
function showRoleReveal(idx) {
  MF.revealIdx = idx;
  const p = MF.players[idx];
  const r = ROLES[p.role];

  render(`
    <div class="stagger text-center">
      <p class="text-muted text-sm mb-1">Role Assignment — Player ${idx+1} of ${MF.players.length}</p>
      <h2 class="font-serif text-gold2 mb-1">${p.name}'s Turn</h2>
      <p class="text-muted text-sm mb-4">Hand phone to <strong style="color:var(--text)">${p.name}</strong>. Others look away!</p>

      <div class="flip-card w-full mb-4" id="roleCard" onclick="flipRole(${idx})">
        <div class="flip-inner">
          <div class="flip-front">
            <div class="role-card-front">
              <span style="font-size:2.5rem;animation:float 3s ease-in-out infinite">🤫</span>
              <p class="font-serif text-gold2" style="font-size:1.1rem;">Tap to see your role</p>
              <p class="text-muted text-sm">Keep it secret!</p>
            </div>
          </div>
          <div class="flip-back">
            <div class="role-card-back" id="roleBack" style="background:${r.bg};border-color:${r.border};">
              <span style="font-size:2.5rem;margin-bottom:0.5rem;">${r.icon}</span>
              <p style="font-size:1.5rem;font-weight:700;color:${r.color};font-family:var(--font-h);">${r.name}</p>
              <span class="badge ${r.team==='good'?'badge-green':r.team==='evil'?'badge-red':'badge-blue'} mt-1 mb-2">${r.team}</span>
              <p class="text-sm" style="color:var(--text2);line-height:1.5;">${getRoleDesc(p.role)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="progress-bar"><div class="progress-fill" style="width:${((idx+1)/MF.players.length)*100}%"></div></div>
    </div>
  `);
}

function flipRole(idx) {
  const card = document.getElementById('roleCard');
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  haptic('medium');

  setTimeout(() => {
    const container = document.querySelector('.container');
    const btn = document.createElement('div');
    btn.className = 'mt-3 animate-slide-up';
    const nextIdx = idx + 1;
    if (nextIdx < MF.players.length) {
      btn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showRoleReveal(${nextIdx})">
        Next: ${MF.players[nextIdx].name} →
      </button>`;
    } else {
      btn.innerHTML = `<button class="btn btn-primary btn-full" onclick="beginFirstNight()">
        🌙 Begin Night 1
      </button>`;
    }
    container.appendChild(btn);
  }, 1000);
}

// ── SCREEN: Night Phase ────────────────────────────────────
function beginFirstNight() { showNightPhase(); }

function showNightPhase() {
  MF.phase = 'night';
  MF.nightActions = {};
  const nightRoles = ['prophet', 'healer', 'judge', 'pharaoh', 'false_prophet', 'sorcerer'];
  const activeSpecial = MF.players.filter(p => p.alive && nightRoles.includes(p.role));

  render(`
    <div class="stagger">
      <div class="night-screen card card-glow text-center p-3 mb-4">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">🌙</span>
        <span class="phase-banner phase-night mb-2" style="display:inline-block;">Night ${MF.night}</span>
        <h2 class="font-serif mb-1" style="color:var(--blue);">Night Falls</h2>
        <p class="text-muted text-sm">Everyone close your eyes. The narrator will wake each role in turn.</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Night Action Order</p>
        <div class="flex flex-col gap-2">
          ${buildNightOrder()}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showNightActions()">
        Begin Night Actions
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `);
}

function buildNightOrder() {
  const order = [
    { role: 'judge',         label: 'Judge awakens — blocks one player', icon: '⚖️' },
    { role: 'prophet',       label: 'Prophet awakens — inspects one soul', icon: '👁️' },
    { role: 'healer',        label: 'Healer awakens — protects one player', icon: '🌿' },
    { role: 'false_prophet', label: 'False Prophets awaken — choose a target', icon: '🐍' },
    { role: 'pharaoh',       label: 'Pharaoh directs the False Prophets', icon: '👑' },
    { role: 'sorcerer',      label: 'Sorcerer awakens — redirects an action', icon: '🔮' },
  ];

  return order.filter(o => MF.players.some(p => p.alive && p.role === o.role))
    .map((o, i) => `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
        <span style="font-size:1.3rem;">${o.icon}</span>
        <p class="text-sm">${o.label}</p>
      </div>
    `).join('') || '<p class="text-muted text-sm text-center">No special roles active tonight.</p>';
}

// ── Night action screens ────────────────────────────────────
let nightActionQueue = [];
let nightQueueIdx = 0;

function showNightActions() {
  nightActionQueue = [];
  // Build queue of roles that need action this night
  const roleOrder = ['judge','prophet','healer','false_prophet','pharaoh','sorcerer'];
  roleOrder.forEach(role => {
    const player = MF.players.find(p => p.alive && p.role === role);
    if (player) nightActionQueue.push({ role, player });
  });
  nightQueueIdx = 0;
  processNightQueue();
}

function processNightQueue() {
  if (nightQueueIdx >= nightActionQueue.length) {
    resolveNight();
    return;
  }
  const { role, player } = nightActionQueue[nightQueueIdx];
  showNightActionScreen(role, player);
}

function showNightActionScreen(role, player) {
  const r = ROLES[role];
  const alive = MF.players.filter(p => p.alive);
  const alivePlayers = alive.filter(p => p.name !== player.name);

  let instruction = '';
  let targetFilter = alivePlayers;

  if (role === 'prophet')  instruction = 'Choose one player to inspect. You will learn if they are Good or Evil.';
  if (role === 'healer')   instruction = `Choose one player to protect tonight. ${MF.lastHealerTarget >= 0 ? `You cannot protect ${MF.players[MF.lastHealerTarget]?.name} again.` : ''}`;
  if (role === 'judge')    {
    const judgeUsed = MF.players.find(p => p.role === 'judge')?.judgeUsed;
    if (judgeUsed) { nightQueueIdx++; processNightQueue(); return; }
    instruction = 'Once per game: choose one player to block tonight. Or skip.';
  }
  if (role === 'false_prophet' || role === 'pharaoh') instruction = 'Choose a faithful player to eliminate tonight.';
  if (role === 'sorcerer') instruction = 'Choose one player whose action you will redirect.';

  // For healer, filter out last healed target
  if (role === 'healer' && MF.lastHealerTarget >= 0) {
    targetFilter = alivePlayers.filter(p => MF.players.indexOf(p) !== MF.lastHealerTarget);
  }
  // Mafia see each other
  const isMafia = ['false_prophet','pharaoh','sorcerer'].includes(role);
  if (isMafia) {
    targetFilter = alive.filter(p => p.role !== role && (p.role !== 'false_prophet' && p.role !== 'pharaoh' && p.role !== 'sorcerer'));
  }

  render(`
    <div class="stagger text-center">
      <div class="night-screen card card-glow p-3 mb-4">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">${r.icon}</span>
        <h2 class="font-serif mb-1" style="color:${r.color};">${r.name} Awakens</h2>
        <p class="text-sm" style="color:var(--text2);">${player.name}, wake up quietly.</p>
      </div>

      <div class="card mb-3">
        <p class="text-sm text-center mb-3" style="color:var(--text2);">${instruction}</p>
        <div class="flex flex-col gap-2" id="nightTargets">
          ${targetFilter.map(p => {
            const pi = MF.players.indexOf(p);
            return `<button class="vote-btn" id="ntbtn-${pi}" onclick="selectNightTarget(${pi},'${role}')">
              <div class="avatar">${getInitials(p.name)}</div>
              <span>${p.name}</span>
              ${isMafia && ROLES[p.role]?.team === 'evil' ? `<span class="badge badge-red" style="margin-left:auto;">${ROLES[p.role]?.name}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
      </div>

      ${(role === 'judge' || role === 'healer') ? `
        <button class="btn btn-ghost btn-full mb-2" onclick="skipNightAction('${role}')">
          Skip (No Action)
        </button>
      ` : ''}

      <div class="card hidden animate-slide-up" id="nightConfirm">
        <p class="text-sm text-center text-muted mb-2">Confirm your choice?</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="clearNightSelection()">Change</button>
          <button class="btn btn-primary btn-full" onclick="confirmNightAction('${role}')">Confirm & Sleep</button>
        </div>
      </div>
    </div>
  `);
}

let selectedNightTarget = -1;
function selectNightTarget(idx, role) {
  selectedNightTarget = idx;
  document.querySelectorAll('#nightTargets .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`ntbtn-${idx}`)?.classList.add('selected');
  document.getElementById('nightConfirm')?.classList.remove('hidden');
  haptic('light');
}

function clearNightSelection() {
  selectedNightTarget = -1;
  document.querySelectorAll('#nightTargets .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('nightConfirm')?.classList.add('hidden');
}

function skipNightAction(role) {
  MF.nightActions[role] = null;
  nightQueueIdx++;
  showNightTransition(() => processNightQueue());
}

function confirmNightAction(role) {
  if (selectedNightTarget === -1) { showToast('Select a target first', 'error'); return; }
  haptic('medium');

  if (role === 'judge') {
    const judge = MF.players.find(p => p.role === 'judge');
    if (judge) judge.judgeUsed = true;
  }

  // For mafia roles, they share a single kill target
  if (role === 'false_prophet' || role === 'pharaoh') {
    MF.nightActions['mafia'] = selectedNightTarget;
  } else {
    MF.nightActions[role] = selectedNightTarget;
  }

  nightQueueIdx++;
  showNightTransition(() => processNightQueue());
}

function showNightTransition(cb) {
  render(`
    <div class="text-center" style="padding:4rem 1rem;">
      <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:float 3s ease-in-out infinite;">🌙</span>
      <p class="font-serif text-muted" style="font-size:1.1rem;">Sleep now…</p>
    </div>
  `);
  setTimeout(cb, 1500);
}

// ── Resolve night ───────────────────────────────────────────
function resolveNight() {
  MF.nightResults = [];
  const actions = MF.nightActions;

  // Reset protections
  MF.players.forEach(p => { p.protected = false; });

  // Healer protects
  if (actions.healer !== null && actions.healer !== undefined) {
    MF.players[actions.healer].protected = true;
    MF.lastHealerTarget = actions.healer;
  }

  // Mafia kills (check if judge blocked them or healer saved target)
  if (actions.mafia !== null && actions.mafia !== undefined) {
    const judgeBlocked = actions.judge === MF.players.findIndex(p => p.role === 'false_prophet' || p.role === 'pharaoh');
    const target = MF.players[actions.mafia];
    if (!judgeBlocked && target && !target.protected && target.alive) {
      target.alive = false;
      MF.nightResults.push({ type: 'eliminated', name: target.name, role: target.role });
    } else if (target?.protected) {
      MF.nightResults.push({ type: 'protected', name: target.name });
    } else {
      MF.nightResults.push({ type: 'blocked' });
    }
  }

  // Prophet result (private — shown to prophet)
  if (actions.prophet !== null && actions.prophet !== undefined) {
    const target = MF.players[actions.prophet];
    const r = ROLES[target?.role];
    MF.nightActions['prophetResult'] = { name: target?.name, team: r?.team, icon: r?.icon };
  }

  MF.night++;

  // Check win conditions before showing dawn
  const winCheck = checkWinCondition();
  if (winCheck) { showGameOver(winCheck); return; }

  showDawnReveal();
}

// ── SCREEN: Dawn ────────────────────────────────────────────
function showDawnReveal() {
  const results = MF.nightResults;
  const prophetResult = MF.nightActions['prophetResult'];
  const prophet = MF.players.find(p => p.role === 'prophet' && p.alive);

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4" style="background:linear-gradient(135deg,rgba(212,160,23,0.1),transparent);">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;animation:bounce 2s infinite">☀️</span>
        <h2 class="font-serif text-gold2 mb-1">Day ${MF.night - 1} Begins</h2>
        <p class="text-muted text-sm">Dawn reveals what the night has wrought…</p>
      </div>

      ${results.length ? results.map(r => `
        <div class="card mb-3 ${r.type==='eliminated' ? 'card-elevated' : ''}">
          ${r.type === 'eliminated' ? `
            <p class="font-serif text-center" style="font-size:1.1rem;color:var(--red);">💀 ${r.name} was eliminated during the night!</p>
            <p class="text-muted text-sm text-center mt-1">They were a <strong style="color:${ROLES[r.role]?.color}">${ROLES[r.role]?.name}</strong>.</p>
          ` : r.type === 'protected' ? `
            <p class="font-serif text-center" style="font-size:1rem;color:var(--green);">🌿 The Healer saved someone from harm! No one was eliminated.</p>
          ` : `
            <p class="font-serif text-center" style="font-size:1rem;color:var(--text2);">✦ The night passed peacefully. No one was eliminated.</p>
          `}
        </div>
      `).join('') : `
        <div class="card mb-3">
          <p class="font-serif text-center" style="color:var(--text2);">✦ The night passed peacefully. No one was eliminated.</p>
        </div>
      `}

      ${prophet && prophetResult ? `
        <div class="card mb-3" style="background:rgba(96,165,250,0.08);border-color:rgba(96,165,250,0.3);">
          <p class="input-label mb-2" style="color:var(--blue);">👁️ Prophet's Vision (Private)</p>
          <p class="text-sm text-muted">Only ${prophet.name} reads this. Show no reaction!</p>
          <button class="btn btn-ghost btn-sm mt-2" onclick="revealProphetVision('${prophetResult.name}','${prophetResult.team}','${prophetResult.icon}')">
            Reveal Vision (${prophet.name} only)
          </button>
        </div>
      ` : ''}

      <div class="card mb-4">
        <p class="input-label mb-2">Living Players</p>
        <div class="flex flex-col gap-2">
          ${MF.players.map((p, i) => `
            <div class="player-chip ${!p.alive ? 'eliminated' : ''}">
              <div class="avatar">${getInitials(p.name)}</div>
              <span>${p.name}</span>
              ${!p.alive ? '<span class="badge badge-red" style="margin-left:auto;">Gone</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showDayDiscussion()">
        ☀️ Begin Discussion & Voting
      </button>
    </div>
  `);
}

function revealProphetVision(name, team, icon) {
  const color = team === 'evil' ? 'var(--red)' : team === 'good' ? 'var(--green)' : 'var(--text2)';
  const label = team === 'evil' ? 'EVIL ⚠️' : team === 'good' ? 'GOOD ✓' : 'NEUTRAL';
  showToast(`${icon} ${name} is ${label}`, team === 'evil' ? 'error' : 'success');
}

// ── SCREEN: Day Discussion ─────────────────────────────────
function showDayDiscussion() {
  MF.phase = 'day';
  MF.dayVotes = {};
  MF.selectedVote = -1;
  const alive = MF.players.filter(p => p.alive);

  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <span class="phase-banner phase-day" style="display:inline-block;margin-bottom:0.75rem;">☀️ Day ${MF.night - 1}</span>
        <h2 class="font-serif text-gold2 mb-1">Seek the Truth</h2>
        <p class="text-muted text-sm">Discuss freely. Accuse wisely. Then vote to eliminate one player.</p>
      </div>

      <div class="card mb-3">
        <p class="input-label mb-2">Vote to Eliminate</p>
        <div class="flex flex-col gap-2" id="dayVoteList">
          ${alive.map(p => {
            const pi = MF.players.indexOf(p);
            return `<button class="vote-btn" id="dvbtn-${pi}" onclick="selectDayVote(${pi})">
              <div class="avatar">${getInitials(p.name)}</div>
              <span>${p.name}</span>
            </button>`;
          }).join('')}
        </div>
      </div>

      <div class="card hidden animate-slide-up mb-3" id="dayConfirm">
        <p class="text-sm text-center text-muted mb-2">Eliminate <strong id="dayVoteTarget" style="color:var(--text)"></strong>?</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="clearDayVote()">Cancel</button>
          <button class="btn btn-danger btn-full" onclick="confirmDayElim()">⚡ Eliminate</button>
        </div>
      </div>

      <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip Vote (No Elimination)</button>
    </div>
  `);
}

function selectDayVote(idx) {
  MF.selectedVote = idx;
  document.querySelectorAll('#dayVoteList .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`dvbtn-${idx}`)?.classList.add('selected');
  document.getElementById('dayConfirm')?.classList.remove('hidden');
  document.getElementById('dayVoteTarget').textContent = MF.players[idx].name;
  haptic('light');
}

function clearDayVote() {
  MF.selectedVote = -1;
  document.querySelectorAll('#dayVoteList .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('dayConfirm')?.classList.add('hidden');
}

function skipDayElim() {
  showNightPhase();
}

function confirmDayElim() {
  if (MF.selectedVote === -1) return;
  haptic('heavy');
  const target = MF.players[MF.selectedVote];
  target.alive = false;

  const win = checkWinCondition();
  if (win) { showGameOver(win); return; }

  showDayElimResult(target);
}

function showDayElimResult(target) {
  const r = ROLES[target.role];
  render(`
    <div class="stagger text-center">
      <div class="card card-elevated mb-4 p-3">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">⚖️</span>
        <h2 class="font-serif mb-2" style="color:var(--text)">${target.name} has been eliminated!</h2>
        <p class="mb-1" style="color:${r.color};font-size:1.4rem;">${r.icon} ${r.name}</p>
        <p class="text-muted text-sm">${r.team === 'evil' ? 'A deceiver has been cast out!' : r.team === 'good' ? 'An innocent was removed…' : 'The wanderer wanders no more.'}</p>
      </div>
      <button class="btn btn-primary btn-lg btn-full" onclick="showNightPhase()">
        🌙 Night ${MF.night} Falls
      </button>
    </div>
  `);
}

// ── Win condition check ─────────────────────────────────────
function checkWinCondition() {
  const alive = MF.players.filter(p => p.alive);
  const evil  = alive.filter(p => ROLES[p.role]?.team === 'evil');
  const good  = alive.filter(p => ROLES[p.role]?.team === 'good');
  const neutral = alive.filter(p => ROLES[p.role]?.team === 'neutral');

  if (evil.length === 0) return 'good';
  if (evil.length >= good.length) return 'evil';
  if (neutral.length > 0 && alive.length <= 3) return 'neutral';
  return null;
}

// ── SCREEN: Game Over ───────────────────────────────────────
function showGameOver(winner) {
  MF.phase = 'gameover';

  const msgs = {
    good:    { title: 'The Faithful Win! 🕊️', sub: 'All false prophets have been cast out.',    color: 'var(--green)' },
    evil:    { title: 'Evil Prevails 🐍',       sub: 'The false prophets overwhelmed the faithful.', color: 'var(--red)' },
    neutral: { title: 'The Wanderer Survives 🦅', sub: 'Neither side could stop the wanderer.', color: 'var(--text2)' },
  };
  const m = msgs[winner];

  // Determine winning players for scoreboard
  const winningTeam = winner === 'neutral' ? 'neutral' : winner === 'good' ? 'good' : 'evil';
  const sbWinners = MF.players
    .filter(p => p.alive && ROLES[p.role]?.team === winningTeam)
    .map(p => p.name);

  render(`
    <div class="stagger text-center">
      <div class="card card-glow p-3 mb-4">
        <span style="font-size:3rem;display:block;margin-bottom:0.75rem;animation:bounce 1.5s infinite">
          ${winner === 'good' ? '🕊️' : winner === 'evil' ? '🐍' : '🦅'}
        </span>
        <h2 class="font-serif mb-2" style="color:${m.color};font-size:1.6rem;">${m.title}</h2>
        <p class="text-muted">${m.sub}</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">All Roles Revealed</p>
        <div class="flex flex-col gap-2">
          ${MF.players.map(p => {
            const r = ROLES[p.role];
            return `
              <div class="player-chip ${!p.alive ? 'eliminated' : ''}">
                <span style="font-size:1.2rem;">${r?.icon}</span>
                <div>
                  <p style="font-weight:600;">${p.name}</p>
                  <p class="text-sm" style="color:${r?.color};">${r?.name}</p>
                </div>
                ${!p.alive ? '<span class="badge badge-red" style="margin-left:auto;">Eliminated</span>' : '<span class="badge badge-green" style="margin-left:auto;">Survived</span>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="navigateTo('/')">Home</button>
        <button class="btn btn-primary btn-full" onclick="showSetup()">Play Again</button>
      </div>
    </div>
  `);

  showCongrats(sbWinners.length ? sbWinners : [m.title.replace(/[^a-zA-Z\s]/g,'').trim()], 'mafia');
}

// ── Init ──────────────────────────────────────────────────
showSetup();
