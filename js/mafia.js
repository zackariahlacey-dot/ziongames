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
  window.scrollTo(0,0); root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
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
  const template = getEffectiveDist(playerCount);
  const roleList = [];

  Object.entries(template).forEach(([roleId, count]) => {
    for (let i = 0; i < count; i++) roleList.push(roleId);
  });

  while (roleList.length < playerCount) roleList.push('disciple');

  return shuffle(roleList);
}

// ── Setup state ───────────────────────────────────────────
let _mfPlayerCount = 5;
let _mfCustomDist = null;

function getEffectiveDist(count) {
  if (_mfCustomDist) return { ..._mfCustomDist };
  const data = getGameData();
  return { ...(data.mafia.roleDistribution[Math.min(count, 12)] || data.mafia.roleDistribution[12]) };
}

function adjustCustomRole(role, delta) {
  if (!_mfCustomDist) _mfCustomDist = getEffectiveDist(_mfPlayerCount);
  _mfCustomDist[role] = Math.max(0, (_mfCustomDist[role] || 0) + delta);
  if (_mfCustomDist[role] === 0) delete _mfCustomDist[role];
  const total = Object.values(_mfCustomDist).reduce((a, b) => a + b, 0);
  Object.keys(ROLES).forEach(r => {
    const el = document.getElementById(`cr-${r}`);
    if (el) el.textContent = _mfCustomDist[r] || 0;
  });
  const tw = document.getElementById('crTotal');
  if (tw) { tw.textContent = `${total}/${_mfPlayerCount} roles assigned`; tw.style.color = total !== _mfPlayerCount ? 'var(--red)' : 'var(--green)'; }
  const rb = document.getElementById('crResetBtn');
  if (rb) rb.style.display = '';
}

function resetCustomRoles() {
  _mfCustomDist = null;
  const rolesEl = document.getElementById('rolesContent');
  if (rolesEl) rolesEl.innerHTML = buildRoleCustomizer(_mfPlayerCount);
  else renderMFSetup();
}

function buildRoleCustomizer(count) {
  const dist = getEffectiveDist(count);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return `
    <div class="flex flex-col gap-1">
      ${Object.keys(ROLES).map(role => {
        const r = ROLES[role];
        const val = dist[role] || 0;
        return `<div class="flex items-center gap-2" style="padding:0.4rem 0.25rem;">
          <span style="font-size:1.15rem;width:28px;text-align:center;">${r.icon}</span>
          <div style="flex:1;min-width:0;">
            <span style="font-size:0.85rem;font-weight:600;color:${r.color};">${r.name}</span>
            <span class="badge ${r.team==='good'?'badge-green':r.team==='evil'?'badge-red':'badge-blue'}" style="font-size:0.62rem;margin-left:0.3rem;">${r.team}</span>
          </div>
          <div class="flex items-center gap-1" style="flex-shrink:0;">
            <button onclick="adjustCustomRole('${role}',-1)" class="btn btn-ghost btn-sm btn-icon" style="width:30px;height:30px;font-size:1.1rem;">−</button>
            <span style="width:24px;text-align:center;font-weight:700;font-size:0.95rem;" id="cr-${role}">${val}</span>
            <button onclick="adjustCustomRole('${role}',1)" class="btn btn-ghost btn-sm btn-icon" style="width:30px;height:30px;font-size:1.1rem;">+</button>
          </div>
        </div>`;
      }).join('')}
      <div class="flex justify-between items-center mt-2 pt-2" style="border-top:1px solid var(--border);">
        <span class="text-sm font-bold" id="crTotal" style="color:${total !== count ? 'var(--red)' : 'var(--green)'};">${total}/${count} roles assigned</span>
        <button class="btn btn-ghost btn-sm" id="crResetBtn" onclick="resetCustomRoles()" style="margin-top:0.4rem;${_mfCustomDist ? '' : 'display:none;'}">Reset to Default</button>
      </div>
    </div>
  `;
}

// ── SCREEN: Setup ─────────────────────────────────────────
function showSetup() {
  MF.phase = 'setup';
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

      <div class="flex gap-2 mb-3">
        <button class="btn btn-ghost btn-sm" style="flex:1;" onclick="showMFDirections()">📖 How to Play</button>
        <button class="btn btn-ghost btn-sm" style="flex:1;" onclick="showRolesGuide()">🎭 All Roles</button>
      </div>

      <div class="card mb-3" style="padding:1.5rem;">
        <p class="input-label mb-3 text-center">Number of Players</p>
        <div class="flex items-center justify-center gap-4">
          <button class="btn btn-secondary btn-icon" onclick="adjustMFCount(-1)" style="font-size:1.5rem;">−</button>
          <span id="mfCountDisplay" style="font-size:2rem;font-weight:700;font-family:var(--font-h);color:var(--text);min-width:3rem;text-align:center;">${_mfPlayerCount}</span>
          <button class="btn btn-secondary btn-icon" onclick="adjustMFCount(1)" style="font-size:1.5rem;">+</button>
        </div>
        <p class="text-muted text-center text-sm mt-3">5 to 12 players</p>
      </div>

      <div class="card mb-4">
        <button onclick="toggleMFRoles()" style="width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0;text-align:left;">
          <p class="input-label" style="margin:0;">Role Distribution</p>
          <span id="rolesArrow" style="font-size:0.85rem;color:var(--text3);">▸ Customize</span>
        </button>
        <div id="rolesContent" style="display:none;margin-top:0.75rem;">
          ${buildRoleCustomizer(_mfPlayerCount)}
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="startGame()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        Start Game
      </button>
    </div>
  `);
}

function adjustMFCount(delta) {
  _mfPlayerCount = Math.max(5, Math.min(12, _mfPlayerCount + delta));
  _mfCustomDist = null;
  const countEl = document.getElementById('mfCountDisplay');
  const rolesEl = document.getElementById('rolesContent');
  if (countEl) {
    countEl.textContent = _mfPlayerCount;
    if (rolesEl && rolesEl.style.display !== 'none') rolesEl.innerHTML = buildRoleCustomizer(_mfPlayerCount);
  } else {
    renderMFSetup();
  }
}

function toggleMFRoles() {
  const content = document.getElementById('rolesContent');
  const arrow = document.getElementById('rolesArrow');
  if (!content) return;
  const open = content.style.display !== 'none';
  content.style.display = open ? 'none' : '';
  if (arrow) arrow.textContent = open ? '▸ Customize' : '▾ Customize';
}

function showMFDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay" id="mfDirOverlay" onclick="if(event.target.id==='mfDirOverlay')this.remove()">
      <div class="modal" style="max-height:80vh;overflow-y:auto;">
        <div class="modal-handle"></div>
        <h3 class="font-serif text-gold2 mb-3">🦅 How to Play — Biblical Mafia</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.7;">
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🎯 Goal</p>
            <p><strong style="color:var(--green);">Good team:</strong> find and eliminate all False Prophets before being outnumbered.<br/>
            <strong style="color:var(--red);">Evil team:</strong> eliminate enough faithful players to take the majority.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🌙 Night Phase</p>
            <p>Everyone closes their eyes. The narrator wakes each special role one at a time. Evil players secretly choose someone to eliminate. The Prophet inspects a player, the Healer protects one.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">☀️ Day Phase</p>
            <p>Dawn reveals who was eliminated overnight. Everyone discusses and debates. Then all living players vote — the person with the most votes is eliminated and their role is revealed.</p>
          </div>
          <div>
            <p class="font-bold mb-1" style="color:var(--text);">🏆 Winning</p>
            <p>Good wins when all evil is gone. Evil wins when evil players equal or outnumber good. The Wanderer wins by surviving to the final 3.</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('mfDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
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
  if (_mfCustomDist) {
    const total = Object.values(_mfCustomDist).reduce((a, b) => a + b, 0);
    if (total !== _mfPlayerCount) { showToast(`Role total (${total}) must equal player count (${_mfPlayerCount})`, 'error'); return; }
  }

  const roles = assignRoles(_mfPlayerCount);
  MF.players = roles.map((role, i) => ({ name: `Player ${i + 1}`, role, alive: true, protected: false }));
  MF.night = 1;
  MF.nightActions = {};
  MF.nightResults = [];
  MF.lastHealerTarget = -1;
  MF.dayVotes = {};

  showMFPassScreen(0);
}

// ── SCREEN: Pass Phone ─────────────────────────────────────
function showMFPassScreen(idx) {
  MF.revealIdx = idx;

  render(`
    <div class="stagger text-center" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;">
      <span style="font-size:4rem;display:block;margin-bottom:1rem;animation:bounce 2s infinite">🙈</span>
      <h2 class="font-serif text-gold2 mb-2">Pass the Phone</h2>
      <p class="text-muted mb-4">Hand the device to <strong style="color:var(--text);">Player ${idx + 1}</strong>.<br/><span class="text-sm">Everyone else look away!</span></p>
      <button class="btn btn-primary btn-lg" style="width:100%;max-width:300px;" onclick="showRoleReveal(${idx})">
        I'm Ready →
      </button>
      <div class="progress-bar mt-4" style="max-width:300px;width:100%;">
        <div class="progress-fill" style="width:${(idx / MF.players.length) * 100}%"></div>
      </div>
    </div>
  `);
}

// ── SCREEN: Role Reveal ────────────────────────────────────
function showRoleReveal(idx) {
  const p = MF.players[idx];
  const r = ROLES[p.role];

  render(`
    <div class="stagger text-center">
      <p class="text-muted text-sm mb-1">Player ${idx + 1} of ${MF.players.length}</p>
      <h2 class="font-serif text-gold2 mb-4">${p.name}</h2>

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
            <div class="role-card-back" style="background:${r.bg};border-color:${r.border};">
              <span style="font-size:2.5rem;margin-bottom:0.5rem;">${r.icon}</span>
              <p style="font-size:1.5rem;font-weight:700;color:${r.color};font-family:var(--font-h);">${r.name}</p>
              <span class="badge ${r.team==='good'?'badge-green':r.team==='evil'?'badge-red':'badge-blue'} mt-1 mb-2">${r.team}</span>
              <p class="text-sm" style="color:var(--text2);line-height:1.5;">${getRoleDesc(p.role)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="progress-bar"><div class="progress-fill" style="width:${((idx + 1) / MF.players.length) * 100}%"></div></div>
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
      btn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showMFPassScreen(${nextIdx})">
        Pass to ${MF.players[nextIdx].name} →
      </button>`;
    } else {
      btn.innerHTML = `<button class="btn btn-primary btn-full" onclick="showNarratorHandoff()">
        All Roles Seen →
      </button>`;
    }
    container.appendChild(btn);
  }, 1000);
}

// ── SCREEN: Narrator Handoff ───────────────────────────────
function showNarratorHandoff() {
  const roleGroups = {};
  MF.players.forEach(p => {
    if (!roleGroups[p.role]) roleGroups[p.role] = [];
    roleGroups[p.role].push(p.name);
  });

  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3" style="background:linear-gradient(135deg,rgba(212,160,23,0.12),transparent);">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;animation:float 4s ease-in-out infinite;">📜</span>
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.1em;text-transform:uppercase;">Narrator Only</p>
        <h2 class="font-serif text-gold2 mb-2">Take the Phone Back</h2>
        <p style="color:var(--text2);line-height:1.6;">Everyone has seen their role.<br/><strong style="color:var(--text);">Collect the phone</strong> before continuing.</p>
      </div>

      <div class="card mb-4" style="text-align:left;">
        <p class="input-label mb-3">🔒 Role Sheet (Narrator Only)</p>
        <div class="flex flex-col gap-2">
          ${Object.entries(roleGroups).map(([role, names]) => {
            const r = ROLES[role];
            return `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;background:${r.bg};border:1px solid ${r.border};border-radius:var(--r-sm);">
              <span style="font-size:1.2rem;">${r.icon}</span>
              <div style="flex:1;">
                <span style="font-weight:700;font-size:0.85rem;color:${r.color};">${r.name}</span>
                <span class="badge ${r.team==='good'?'badge-green':r.team==='evil'?'badge-red':'badge-blue'}" style="font-size:0.6rem;margin-left:0.4rem;">${r.team}</span>
                <p class="text-sm text-muted mt-0" style="margin-top:0.2rem;">${names.join(', ')}</p>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <p class="text-muted text-sm mb-3">Make sure you have the phone. Players should not see the next screen.</p>
      <button class="btn btn-primary btn-lg btn-full" onclick="beginFirstNight()">
        🌙 Begin Night 1
      </button>
    </div>
  `);
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

      <div class="card mb-3">
        <button onclick="toggleNightRoleSheet()" style="width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0;text-align:left;">
          <p class="input-label" style="margin:0;">🔒 Narrator Role Sheet</p>
          <span id="nightSheetArrow" style="font-size:0.85rem;color:var(--text3);">▸ Show</span>
        </button>
        <div id="nightSheetContent" style="display:none;margin-top:0.75rem;">
          <div class="flex flex-col gap-2">
            ${MF.players.map(p => {
              const r = ROLES[p.role];
              return `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.4rem 0.6rem;background:${p.alive ? r.bg : 'var(--bg3)'};border:1px solid ${p.alive ? r.border : 'var(--border)'};border-radius:var(--r-sm);opacity:${p.alive ? '1' : '0.4'};">
                <span style="font-size:1rem;">${r.icon}</span>
                <span style="flex:1;font-size:0.85rem;font-weight:600;color:${p.alive ? r.color : 'var(--text3)'};">${p.name}</span>
                <span style="font-size:0.8rem;color:var(--text3);">${r.name}</span>
                ${!p.alive ? '<span class="badge badge-red" style="font-size:0.6rem;">Dead</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showNightActions()">
        Begin Guided Night →
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
let _narratorCb = null;

function showNightActions() {
  nightActionQueue = [];
  const roleOrder = ['judge','prophet','healer','false_prophet','pharaoh','sorcerer'];
  roleOrder.forEach(role => {
    const player = MF.players.find(p => p.alive && p.role === role);
    if (player) nightActionQueue.push({ role, player });
  });
  nightQueueIdx = 0;

  // Show "all eyes closed" screen before any roles wake
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;background:var(--bg2);">
        <span style="font-size:3.5rem;display:block;margin-bottom:1rem;animation:float 4s ease-in-out infinite;">🌙</span>
        <p class="text-muted text-sm mb-2" style="letter-spacing:0.12em;text-transform:uppercase;">Narrator Mode</p>
        <h2 class="font-serif text-gold2 mb-3">Night Begins</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          Instruct everyone to <strong style="color:var(--text);">close their eyes</strong>.<br/>
          <span class="text-sm text-muted">Confirm everyone is asleep, then continue.</span>
        </p>
        <button class="btn btn-primary btn-full" onclick="processNightQueue()">
          Everyone's Eyes Are Closed →
        </button>
      </div>
    </div>
  `);
}

function processNightQueue() {
  if (nightQueueIdx >= nightActionQueue.length) {
    showAllAwakeTransition(() => resolveNight());
    return;
  }
  const { role, player } = nightActionQueue[nightQueueIdx];

  // Judge skip if already used
  if (role === 'judge' && MF.players.find(p => p.role === 'judge')?.judgeUsed) {
    nightQueueIdx++;
    processNightQueue();
    return;
  }

  showNarratorWake(role, player, () => showNightActionScreen(role, player));
}

function showNarratorWake(role, player, cb) {
  _narratorCb = cb;
  const r = ROLES[role];
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <p class="text-muted text-sm mb-3" style="letter-spacing:0.1em;text-transform:uppercase;">All Others — Keep Eyes Closed</p>
        <span style="font-size:3.5rem;display:block;margin-bottom:0.75rem;">${r.icon}</span>
        <h2 class="font-serif mb-2" style="color:${r.color};">${r.name}</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          <strong style="color:var(--text);">${player.name}</strong>, open your eyes quietly.
        </p>
        <button class="btn btn-primary btn-full" onclick="continueNarrator()">I'm Awake →</button>
      </div>
    </div>
  `);
}

function showNarratorSleep(role, player, cb) {
  _narratorCb = cb;
  const r = ROLES[role];
  let pct = 100;
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;background:var(--bg2);">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;opacity:0.5;">${r.icon}</span>
        <h2 class="font-serif mb-3" style="color:var(--text3);">${r.name}</h2>
        <p style="color:var(--text3);margin-bottom:2rem;line-height:1.5;">
          ${player.name}, <strong style="color:var(--text2);">close your eyes</strong> and go back to sleep.
        </p>
        <div class="progress-bar"><div id="sleepBar" class="progress-fill" style="width:100%;background:var(--text3);"></div></div>
      </div>
    </div>
  `);
  const iv = setInterval(() => {
    pct -= 5;
    const bar = document.getElementById('sleepBar');
    if (bar) bar.style.width = Math.max(0, pct) + '%';
    if (pct <= 0) {
      clearInterval(iv);
      if (_narratorCb) { const c = _narratorCb; _narratorCb = null; c(); }
    }
  }, 75);
}

function showAllAwakeTransition(cb) {
  _narratorCb = cb;
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <span style="font-size:3rem;display:block;margin-bottom:1rem;animation:bounce 1.5s infinite;">☀️</span>
        <h2 class="font-serif text-gold2 mb-3">Night Is Over</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          Tell everyone to <strong style="color:var(--text);">open their eyes</strong>. Dawn is breaking.
        </p>
        <button class="btn btn-primary btn-full" onclick="continueNarrator()">Everyone's Awake →</button>
      </div>
    </div>
  `);
}

function continueNarrator() {
  if (_narratorCb) { const c = _narratorCb; _narratorCb = null; c(); }
}

function showNightActionScreen(role, player) {
  if (role === 'sorcerer') { showSorcererStep1(player); return; }

  const r = ROLES[role];
  const alive = MF.players.filter(p => p.alive);
  const alivePlayers = alive.filter(p => p.name !== player.name);

  let instruction = '';
  let targetFilter = alivePlayers;

  if (role === 'prophet')  instruction = 'Choose one player to inspect. You will learn if they are Good or Evil.';
  if (role === 'healer')   instruction = `Choose one player to protect tonight. ${MF.lastHealerTarget >= 0 ? `You cannot protect ${MF.players[MF.lastHealerTarget]?.name} again.` : ''}`;
  if (role === 'judge')    instruction = 'Once per game: choose one player to block tonight — nullifying their action. Or skip.';
  if (role === 'false_prophet' || role === 'pharaoh') instruction = 'Choose a faithful player to eliminate tonight.';

  if (role === 'healer' && MF.lastHealerTarget >= 0) {
    targetFilter = alivePlayers.filter(p => MF.players.indexOf(p) !== MF.lastHealerTarget);
  }
  const isMafia = ['false_prophet','pharaoh'].includes(role);
  if (isMafia) {
    targetFilter = alive.filter(p => p.role !== 'false_prophet' && p.role !== 'pharaoh' && p.role !== 'sorcerer');
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
        <button class="btn btn-ghost btn-full mb-2" onclick="skipNightAction('${role}')">Skip (No Action)</button>
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

// ── Sorcerer two-step redirect ──────────────────────────────
let _sorcererFrom = -1;

function showSorcererStep1(player) {
  const r = ROLES['sorcerer'];
  const alive = MF.players.filter(p => p.alive);
  const targets = alive.filter(p => p !== player);
  _sorcererFrom = -1;

  render(`
    <div class="stagger text-center">
      <div class="night-screen card card-glow p-3 mb-4">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">${r.icon}</span>
        <h2 class="font-serif mb-1" style="color:${r.color};">Sorcerer Awakens</h2>
        <p class="text-sm" style="color:var(--text2);">${player.name}, wake up quietly.</p>
      </div>
      <div class="card mb-3">
        <p class="text-sm text-center mb-1" style="color:var(--text2);">Step 1 of 2</p>
        <p class="text-sm text-center mb-3" style="color:var(--text2);">Choose a player whose <strong style="color:var(--text);">action you will redirect</strong>.</p>
        <div class="flex flex-col gap-2">
          ${targets.map(p => {
            const pi = MF.players.indexOf(p);
            return `<button class="vote-btn" id="src-from-${pi}" onclick="selectSorcererFrom(${pi})">
              <div class="avatar">${getInitials(p.name)}</div>
              <span>${p.name}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
    </div>
  `);
}

function selectSorcererFrom(fromIdx) {
  _sorcererFrom = fromIdx;
  const sorcerer = MF.players.find(p => p.role === 'sorcerer' && p.alive);
  const r = ROLES['sorcerer'];
  const fromPlayer = MF.players[fromIdx];
  const alive = MF.players.filter(p => p.alive);
  const targets = alive.filter(p => p !== sorcerer && MF.players.indexOf(p) !== fromIdx);

  render(`
    <div class="stagger text-center">
      <div class="night-screen card card-glow p-3 mb-4">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">${r.icon}</span>
        <h2 class="font-serif mb-1" style="color:${r.color};">Sorcerer — Step 2</h2>
        <p class="text-sm" style="color:var(--text2);">Redirecting <strong style="color:var(--text);">${fromPlayer.name}</strong>'s action to…</p>
      </div>
      <div class="card mb-3">
        <p class="text-sm text-center mb-1" style="color:var(--text2);">Step 2 of 2</p>
        <p class="text-sm text-center mb-3" style="color:var(--text2);">Choose the <strong style="color:var(--text);">new target</strong> for ${fromPlayer.name}'s action.</p>
        <div class="flex flex-col gap-2" id="nightTargets">
          ${targets.map(p => {
            const pi = MF.players.indexOf(p);
            return `<button class="vote-btn" id="src-to-${pi}" onclick="selectSorcererTo(${pi})">
              <div class="avatar">${getInitials(p.name)}</div>
              <span>${p.name}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <button class="btn btn-ghost btn-full mb-2" onclick="showSorcererStep1(MF.players.find(p=>p.role==='sorcerer'&&p.alive))">← Back</button>
      <div class="card hidden animate-slide-up" id="nightConfirm">
        <p class="text-sm text-center text-muted mb-2">Confirm redirect?</p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="clearNightSelection()">Change</button>
          <button class="btn btn-primary btn-full" onclick="confirmSorcererAction()">Confirm & Sleep</button>
        </div>
      </div>
    </div>
  `);
}

function selectSorcererTo(toIdx) {
  selectedNightTarget = toIdx;
  document.querySelectorAll('#nightTargets .vote-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById(`src-to-${toIdx}`)?.classList.add('selected');
  document.getElementById('nightConfirm')?.classList.remove('hidden');
  haptic('light');
}

function confirmSorcererAction() {
  if (_sorcererFrom === -1 || selectedNightTarget === -1) { showToast('Select both players', 'error'); return; }
  haptic('medium');
  MF.nightActions['sorcerer'] = { from: _sorcererFrom, to: selectedNightTarget };
  const current = nightActionQueue[nightQueueIdx];
  nightQueueIdx++;
  showNarratorSleep('sorcerer', current.player, () => processNightQueue());
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
  const current = nightActionQueue[nightQueueIdx];
  nightQueueIdx++;
  showNarratorSleep(current.role, current.player, () => processNightQueue());
}

function confirmNightAction(role) {
  if (selectedNightTarget === -1) { showToast('Select a target first', 'error'); return; }
  haptic('medium');

  if (role === 'judge') {
    const judge = MF.players.find(p => p.role === 'judge');
    if (judge) judge.judgeUsed = true;
  }

  if (role === 'false_prophet' || role === 'pharaoh') {
    MF.nightActions['mafia'] = selectedNightTarget;
  } else {
    MF.nightActions[role] = selectedNightTarget;
  }

  const current = nightActionQueue[nightQueueIdx];
  nightQueueIdx++;
  showNarratorSleep(current.role, current.player, () => processNightQueue());
}

// ── Resolve night ───────────────────────────────────────────
function resolveNight() {
  MF.nightResults = [];
  const actions = MF.nightActions;

  // 1. Sorcerer redirect — swap another player's action target
  if (actions.sorcerer && actions.sorcerer.from !== undefined) {
    const { from, to } = actions.sorcerer;
    const redirectedRole = MF.players[from]?.role;
    if (redirectedRole === 'prophet')  actions.prophet = to;
    else if (redirectedRole === 'healer') actions.healer = to;
    else if (redirectedRole === 'judge')  actions.judge = to;
    else if (redirectedRole === 'false_prophet' || redirectedRole === 'pharaoh') actions.mafia = to;
  }

  // 2. Judge block — nullify the blocked player's action entirely
  if (actions.judge !== null && actions.judge !== undefined) {
    const blockedRole = MF.players[actions.judge]?.role;
    if (blockedRole === 'prophet')  actions.prophet = null;
    else if (blockedRole === 'healer') actions.healer = null;
    else if (blockedRole === 'false_prophet' || blockedRole === 'pharaoh') actions.mafia = null;
    else if (blockedRole === 'sorcerer') actions.sorcerer = null;
  }

  // 3. Reset protections
  MF.players.forEach(p => { p.protected = false; });

  // 4. Healer protects
  if (actions.healer !== null && actions.healer !== undefined) {
    MF.players[actions.healer].protected = true;
    MF.lastHealerTarget = actions.healer;
  }

  // 5. Mafia kills
  if (actions.mafia !== null && actions.mafia !== undefined) {
    const target = MF.players[actions.mafia];
    if (target && !target.protected && target.alive) {
      target.alive = false;
      MF.nightResults.push({ type: 'eliminated', name: target.name, role: target.role });
    } else if (target?.protected) {
      MF.nightResults.push({ type: 'protected', name: target.name });
    } else {
      MF.nightResults.push({ type: 'blocked' });
    }
  }

  // 6. Prophet result — Pharaoh deceives the prophet, appearing as Good
  if (actions.prophet !== null && actions.prophet !== undefined) {
    const target = MF.players[actions.prophet];
    const r = ROLES[target?.role];
    const apparentTeam = target?.role === 'pharaoh' ? 'good' : r?.team;
    const apparentIcon = target?.role === 'pharaoh' ? ROLES['disciple'].icon : r?.icon;
    MF.nightActions['prophetResult'] = { name: target?.name, team: apparentTeam, icon: apparentIcon };
  }

  MF.night++;

  // Check win conditions before showing dawn
  const winCheck = checkWinCondition();
  if (winCheck) { showGameOver(winCheck); return; }

  showNarratorNightSummary();
}

// ── SCREEN: Narrator Night Summary (private) ───────────────
function showNarratorNightSummary() {
  const actions = MF.nightActions;
  const results = MF.nightResults;
  const prophetResult = actions['prophetResult'];
  const prophet = MF.players.find(p => p.role === 'prophet' && p.alive);

  const eliminated = results.find(r => r.type === 'eliminated');
  const protected_ = results.find(r => r.type === 'protected');
  const blocked = results.find(r => r.type === 'blocked');

  const mafiaTarget = actions.mafia !== undefined && actions.mafia !== null ? MF.players[actions.mafia]?.name : null;
  const healerTarget = actions.healer !== undefined && actions.healer !== null ? MF.players[actions.healer]?.name : null;
  const judgeTarget = actions.judge !== undefined && actions.judge !== null ? MF.players[actions.judge]?.name : null;
  const sorcererRedirect = (actions.sorcerer && actions.sorcerer.from !== undefined)
    ? `${MF.players[actions.sorcerer.from]?.name} → ${MF.players[actions.sorcerer.to]?.name}` : null;

  render(`
    <div class="stagger">
      <div class="card card-glow mb-4 p-3 text-center" style="background:linear-gradient(135deg,rgba(212,160,23,0.12),transparent);">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">📜</span>
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.1em;text-transform:uppercase;">Narrator Only</p>
        <h2 class="font-serif text-gold2 mb-1">Night ${MF.night - 1} Results</h2>
        <p class="text-muted text-sm">Read this privately, then announce to the group.</p>
      </div>

      <div class="card mb-3 flex flex-col gap-2" style="gap:0.6rem;">
        ${eliminated ? `
          <div style="padding:0.6rem 0.75rem;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:var(--r-sm);">
            <p style="font-size:0.8rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.2rem;">Eliminated</p>
            <p style="font-weight:700;color:var(--red);">💀 ${eliminated.name} <span style="font-weight:400;color:var(--text2);font-size:0.85rem;">(${ROLES[eliminated.role]?.name})</span></p>
          </div>` : protected_ ? `
          <div style="padding:0.6rem 0.75rem;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.3);border-radius:var(--r-sm);">
            <p style="font-size:0.8rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.2rem;">Healer Saved</p>
            <p style="font-weight:700;color:var(--green);">🌿 ${protected_.name} was targeted but survived</p>
          </div>` : `
          <div style="padding:0.6rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
            <p style="color:var(--text2);font-size:0.9rem;">✦ No elimination tonight${blocked ? ' — Mafia was blocked' : ''}</p>
          </div>`}

        ${mafiaTarget ? `
          <div style="padding:0.5rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
            <p style="font-size:0.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.1rem;">Mafia targeted</p>
            <p style="font-size:0.9rem;color:var(--text2);">${mafiaTarget}</p>
          </div>` : ''}

        ${healerTarget ? `
          <div style="padding:0.5rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
            <p style="font-size:0.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.1rem;">Healer protected</p>
            <p style="font-size:0.9rem;color:var(--text2);">${healerTarget}</p>
          </div>` : ''}

        ${judgeTarget ? `
          <div style="padding:0.5rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
            <p style="font-size:0.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.1rem;">Judge blocked</p>
            <p style="font-size:0.9rem;color:var(--text2);">${judgeTarget}</p>
          </div>` : ''}

        ${sorcererRedirect ? `
          <div style="padding:0.5rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
            <p style="font-size:0.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.1rem;">Sorcerer redirected</p>
            <p style="font-size:0.9rem;color:var(--text2);">${sorcererRedirect}</p>
          </div>` : ''}

        ${prophetResult && prophet ? `
          <div style="padding:0.5rem 0.75rem;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.3);border-radius:var(--r-sm);">
            <p style="font-size:0.75rem;color:var(--blue);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.1rem;">👁️ Prophet (${prophet.name}) inspected</p>
            <p style="font-size:0.9rem;color:var(--text2);">${prophetResult.icon} ${prophetResult.name} — <strong style="color:${prophetResult.team==='evil'?'var(--red)':prophetResult.team==='good'?'var(--green)':'var(--text2)'};">${prophetResult.team.toUpperCase()}</strong></p>
          </div>` : ''}
      </div>

      <button class="btn btn-primary btn-lg btn-full" onclick="showDawnReveal()">
        ☀️ Announce to Group
      </button>
    </div>
  `);
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
  const alive = MF.players.filter(p => p.alive);

  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <span class="phase-banner phase-day" style="display:inline-block;margin-bottom:0.75rem;">☀️ Day ${MF.night - 1}</span>
        <h2 class="font-serif text-gold2 mb-1">Open Discussion</h2>
        <p class="text-muted text-sm">Discuss freely. Accuse, question, and defend — then vote.</p>
      </div>

      <div class="card mb-4">
        <p class="input-label mb-2">Living Players (${alive.length})</p>
        <div class="flex flex-wrap gap-1">
          ${alive.map(p => `
            <span style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.3rem 0.7rem;background:var(--bg3);border:1px solid var(--border);border-radius:999px;font-size:0.85rem;">
              <span class="avatar" style="width:22px;height:22px;font-size:0.65rem;">${getInitials(p.name)}</span>
              ${p.name}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="card mb-3" style="text-align:left;">
        <button onclick="toggleNarratorSheet()" style="width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0;text-align:left;">
          <p class="input-label" style="margin:0;">🔒 Narrator Role Sheet</p>
          <span id="narratorSheetArrow" style="font-size:0.85rem;color:var(--text3);">▸ Show</span>
        </button>
        <div id="narratorSheetContent" style="display:none;margin-top:0.75rem;">
          <div class="flex flex-col gap-2">
            ${MF.players.map(p => {
              const r = ROLES[p.role];
              return `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.4rem 0.6rem;background:${p.alive ? r.bg : 'var(--bg3)'};border:1px solid ${p.alive ? r.border : 'var(--border)'};border-radius:var(--r-sm);opacity:${p.alive ? '1' : '0.45'};">
                <span style="font-size:1rem;">${r.icon}</span>
                <span style="flex:1;font-size:0.85rem;font-weight:600;color:${p.alive ? r.color : 'var(--text3)'};">${p.name}</span>
                <span style="font-size:0.8rem;color:var(--text3);">${r.name}</span>
                ${!p.alive ? '<span class="badge badge-red" style="font-size:0.6rem;">Dead</span>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full mb-2" onclick="showVotingRound()">
        ⚖️ Begin Voting Round
      </button>
      <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip Vote (No Elimination)</button>
    </div>
  `);
}

// ── SCREEN: Live Voting Tally ──────────────────────────────
let _dayVoteTally = {};

function showVotingRound() {
  _dayVoteTally = {};
  MF.players.filter(p => p.alive).forEach(p => { _dayVoteTally[MF.players.indexOf(p)] = 0; });
  renderVotingRound();
}

function renderVotingRound() {
  const alive = MF.players.filter(p => p.alive);
  const totalVotes = Object.values(_dayVoteTally).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(0, ...Object.values(_dayVoteTally));
  const leaders = Object.entries(_dayVoteTally).filter(([, v]) => v === maxVotes && maxVotes > 0);
  const isTie = leaders.length > 1;
  const leaderIdx = !isTie && leaders.length === 1 ? parseInt(leaders[0][0]) : -1;

  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <span class="phase-banner phase-day" style="display:inline-block;margin-bottom:0.5rem;">⚖️ Day ${MF.night - 1} — Voting</span>
        <p class="text-muted text-sm mt-1">Tap <strong style="color:var(--green);">＋</strong> for each vote cast. Total: <strong style="color:var(--text);" id="vt-total">${totalVotes}</strong></p>
      </div>

      <div class="card mb-3">
        <div class="flex flex-col gap-2">
          ${alive.map(p => {
            const pi = MF.players.indexOf(p);
            const votes = _dayVoteTally[pi] || 0;
            const isLeader = votes === maxVotes && maxVotes > 0;
            return `
              <div id="vt-row-${pi}" style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:${isLeader ? 'rgba(248,113,113,0.1)' : 'var(--bg3)'};border:1px solid ${isLeader ? 'rgba(248,113,113,0.3)' : 'var(--border)'};border-radius:var(--r-sm);transition:all 0.2s;">
                <div class="avatar">${getInitials(p.name)}</div>
                <span style="flex:1;font-weight:600;">${p.name}</span>
                <span style="font-family:var(--font-h);font-size:1.5rem;font-weight:700;min-width:32px;text-align:center;color:${isLeader ? 'var(--red)' : 'var(--text2)'};" id="vt-${pi}">${votes}</span>
                <div class="flex gap-1">
                  <button onclick="adjustVote(${pi}, -1)" class="btn btn-ghost btn-sm btn-icon" style="width:34px;height:34px;">−</button>
                  <button onclick="adjustVote(${pi}, 1)" class="btn btn-ghost btn-sm btn-icon" style="width:34px;height:34px;background:rgba(74,222,128,0.12);color:var(--green);">＋</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div id="vt-action">
        ${maxVotes > 0 ? isTie ? `
          <div class="card mb-3" style="background:var(--bg3);">
            <p class="text-center text-sm" style="color:var(--text2);">⚖️ Tie — call a revote or skip</p>
          </div>
          <button class="btn btn-primary btn-full mb-2" onclick="showVotingRound()">🔁 Revote</button>
          <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>
        ` : `
          <div class="card mb-3 card-elevated" style="background:rgba(248,113,113,0.08);border-color:rgba(248,113,113,0.3);">
            <p class="text-center font-bold" style="color:var(--red);">💀 ${MF.players[leaderIdx].name} leads with ${maxVotes} vote${maxVotes > 1 ? 's' : ''}</p>
          </div>
          <button class="btn btn-danger btn-lg btn-full mb-2" onclick="confirmVoteElimination(${leaderIdx})">
            ⚖️ Eliminate ${MF.players[leaderIdx].name}
          </button>
          <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>
        ` : `
          <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>
        `}
      </div>
    </div>
  `);
}

function adjustVote(playerIdx, delta) {
  const alive = MF.players.filter(p => p.alive);
  const totalBefore = Object.values(_dayVoteTally).reduce((a, b) => a + b, 0);
  if (delta > 0 && totalBefore >= alive.length) { showToast(`Max ${alive.length} votes (one per player)`, 'error'); return; }
  _dayVoteTally[playerIdx] = Math.max(0, (_dayVoteTally[playerIdx] || 0) + delta);
  const totalVotes = Object.values(_dayVoteTally).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(0, ...Object.values(_dayVoteTally));
  const leaders = Object.entries(_dayVoteTally).filter(([, v]) => v === maxVotes && maxVotes > 0);
  const isTie = leaders.length > 1;
  const leaderIdx = !isTie && leaders.length === 1 ? parseInt(leaders[0][0]) : -1;

  // Update in-place — no scroll reset
  const totalEl = document.getElementById('vt-total');
  if (totalEl) totalEl.textContent = totalVotes;

  alive.forEach(p => {
    const pi = MF.players.indexOf(p);
    const votes = _dayVoteTally[pi] || 0;
    const isLeader = votes === maxVotes && maxVotes > 0;
    const row = document.getElementById(`vt-row-${pi}`);
    const numEl = document.getElementById(`vt-${pi}`);
    if (row) { row.style.background = isLeader ? 'rgba(248,113,113,0.1)' : 'var(--bg3)'; row.style.borderColor = isLeader ? 'rgba(248,113,113,0.3)' : 'var(--border)'; }
    if (numEl) { numEl.textContent = votes; numEl.style.color = isLeader ? 'var(--red)' : 'var(--text2)'; }
  });

  const actionEl = document.getElementById('vt-action');
  if (!actionEl) return;
  if (maxVotes === 0) {
    actionEl.innerHTML = `<button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>`;
  } else if (isTie) {
    actionEl.innerHTML = `
      <div class="card mb-3" style="background:var(--bg3);"><p class="text-center text-sm" style="color:var(--text2);">⚖️ Tie — call a revote or skip</p></div>
      <button class="btn btn-primary btn-full mb-2" onclick="showVotingRound()">🔁 Revote</button>
      <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>`;
  } else {
    actionEl.innerHTML = `
      <div class="card mb-3 card-elevated" style="background:rgba(248,113,113,0.08);border-color:rgba(248,113,113,0.3);">
        <p class="text-center font-bold" style="color:var(--red);">💀 ${MF.players[leaderIdx].name} leads with ${maxVotes} vote${maxVotes > 1 ? 's' : ''}</p>
      </div>
      <button class="btn btn-danger btn-lg btn-full mb-2" onclick="confirmVoteElimination(${leaderIdx})">⚖️ Eliminate ${MF.players[leaderIdx].name}</button>
      <button class="btn btn-ghost btn-full" onclick="skipDayElim()">Skip — No Elimination</button>`;
  }
  haptic('light');
}

function confirmVoteElimination(playerIdx) {
  haptic('heavy');
  const target = MF.players[playerIdx];
  target.alive = false;
  const win = checkWinCondition();
  if (win) { showGameOver(win); return; }
  showDayElimResult(target);
}

function toggleNightRoleSheet() {
  const content = document.getElementById('nightSheetContent');
  const arrow = document.getElementById('nightSheetArrow');
  if (!content) return;
  const open = content.style.display !== 'none';
  content.style.display = open ? 'none' : '';
  if (arrow) arrow.textContent = open ? '▸ Show' : '▾ Hide';
}

function toggleNarratorSheet() {
  const content = document.getElementById('narratorSheetContent');
  const arrow = document.getElementById('narratorSheetArrow');
  if (!content) return;
  const open = content.style.display !== 'none';
  content.style.display = open ? 'none' : '';
  if (arrow) arrow.textContent = open ? '▸ Show' : '▾ Hide';
}

function skipDayElim() {
  showNightPhase();
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
