/* ── Admin Panel ─────────────────────────────────────────── */

const ADMIN_CREDS_KEY = 'zionAdminCreds';
const DEFAULT_EMAIL   = 'zackariahlacey@gmail.com';
const DEFAULT_PIN     = '159591';

function getAdminCreds() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_CREDS_KEY));
    if (stored?.email && stored?.pin) return stored;
  } catch(_) {}
  return { email: DEFAULT_EMAIL, pin: DEFAULT_PIN };
}

function checkPassword() {
  const email = document.getElementById('emailInput')?.value?.trim().toLowerCase();
  const pin   = document.getElementById('pinInput')?.value?.trim();
  const creds = getAdminCreds();

  if (email === creds.email.toLowerCase() && pin === creds.pin) {
    sessionStorage.setItem('adminAuth', '1');
    document.getElementById('authGate').style.display = 'none';
    document.getElementById('adminMain').classList.remove('hidden');
    document.getElementById('adminMain').style.display = '';
    initAdmin();
    haptic('medium');
  } else {
    document.getElementById('authError').style.display = '';
    const pinEl = document.getElementById('pinInput');
    pinEl.style.animation = 'shake 0.4s ease';
    pinEl.value = '';
    setTimeout(() => { pinEl.style.animation = ''; }, 500);
    haptic('heavy');
  }
}

function initAdmin() {
  loadMrWhiteWords();
  loadJeopardyEditor();
  loadMafiaEditor();
  loadTabooEditor();
}

// ── Tab switching ───────────────────────────────────────────
function showTab(id, el) {
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.add('hidden'));
  document.getElementById(`tab-${id}`)?.classList.remove('hidden');
  document.querySelectorAll('#adminTabs .tab').forEach(t => t.classList.remove('active'));
  el?.classList.add('active');
}

// ── Section toggle ─────────────────────────────────────────
function toggleSection(id) {
  const body = document.getElementById(`${id}-body`);
  const chevron = document.getElementById(`${id}-chevron`);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : '';
  if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : '';
}

// ── Mr. White Word Editor ───────────────────────────────────
function loadMrWhiteWords() {
  const data = getGameData();
  const editor = document.getElementById('mw-pairs-editor');
  if (!editor) return;

  editor.innerHTML = ['easy','medium','hard'].map(d => `
    <div class="admin-section mb-3">
      <div class="admin-section-header" onclick="toggleSection('mw-${d}')">
        <div class="flex items-center gap-2">
          <span>${d === 'easy' ? '🌱' : d === 'medium' ? '⚡' : '🔥'}</span>
          <span class="font-bold" style="text-transform:capitalize;">${d}</span>
          <span class="badge badge-gold" id="mw-${d}-count">${data.mrWhite[d].length} pairs</span>
        </div>
        <svg id="mw-${d}-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="admin-section-body" id="mw-${d}-body">
        <div class="flex gap-2 mb-2" style="padding:0.4rem 0.5rem;background:var(--bg3);border-radius:var(--r-sm);">
          <span class="text-muted text-sm" style="flex:1;text-align:center;">Citizens' Word</span>
          <span class="text-muted text-sm" style="flex:1;text-align:center;">Mr. White's Word</span>
          <span style="width:28px;"></span>
        </div>
        <div class="words-container flex flex-col gap-1" id="mw-${d}-pairs"></div>
        <div class="flex gap-2 mt-3">
          <input class="input" placeholder="Citizens' word…" id="mw-${d}-word" style="flex:1;"
            onkeydown="if(event.key==='Enter')document.getElementById('mw-${d}-mrwhite').focus()"/>
          <input class="input" placeholder="Mr. White's word…" id="mw-${d}-mrwhite" style="flex:1;"
            onkeydown="if(event.key==='Enter')addWordPair('${d}')"/>
          <button class="btn btn-primary btn-sm" onclick="addWordPair('${d}')">Add</button>
        </div>
      </div>
    </div>
  `).join('');

  ['easy','medium','hard'].forEach(d => renderWordPairs(d, data.mrWhite[d]));
}

function renderWordPairs(difficulty, pairs) {
  const container = document.getElementById(`mw-${difficulty}-pairs`);
  const countEl   = document.getElementById(`mw-${difficulty}-count`);
  if (!container) return;
  if (countEl) countEl.textContent = `${pairs.length} pairs`;

  container.innerHTML = pairs.map((p, i) => `
    <div class="flex gap-2 items-center" style="padding:0.35rem 0.5rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
      <span class="text-sm" style="flex:1;font-weight:600;">${p.word}</span>
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;opacity:0.4;"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      <span class="text-sm" style="flex:1;color:var(--red);">${p.mrWhite}</span>
      <button onclick="removeWordPair('${difficulty}',${i})" style="background:none;border:none;color:var(--text3);font-size:1.1rem;cursor:pointer;padding:0 0.25rem;line-height:1;" title="Remove">×</button>
    </div>
  `).join('');
}

function addWordPair(difficulty) {
  const wordEl  = document.getElementById(`mw-${difficulty}-word`);
  const mwEl    = document.getElementById(`mw-${difficulty}-mrwhite`);
  const word    = wordEl?.value?.trim();
  const mrWhite = mwEl?.value?.trim();
  if (!word || !mrWhite) { showToast('Enter both words', 'error'); return; }

  const data = getGameData();
  data.mrWhite[difficulty].push({ word, mrWhite });
  saveGameData(data);
  renderWordPairs(difficulty, data.mrWhite[difficulty]);
  wordEl.value = ''; mwEl.value = '';
  wordEl.focus();
  showToast(`"${word} / ${mrWhite}" added`, 'success');
}

function removeWordPair(difficulty, idx) {
  const data = getGameData();
  const removed = data.mrWhite[difficulty].splice(idx, 1)[0];
  saveGameData(data);
  renderWordPairs(difficulty, data.mrWhite[difficulty]);
  showToast(`"${removed.word}" pair removed`);
}

// ── Jeopardy Editor ─────────────────────────────────────────
function loadJeopardyEditor() {
  const data = getGameData();
  renderJeopardyCats(data.jeopardy.categories);
}

function renderJeopardyCats(cats) {
  const container = document.getElementById('jeopardyCatList');
  if (!container) return;

  container.innerHTML = cats.map((cat, ci) => `
    <div class="admin-section">
      <div class="admin-section-header" onclick="toggleSection('jcat-${ci}')">
        <div class="flex items-center gap-2">
          <input class="input" value="${cat.name}" style="flex:1;background:transparent;border:none;padding:0;font-weight:700;color:var(--gold2);"
            oninput="updateCatName(${ci},this.value)" onclick="event.stopPropagation()" placeholder="Category name"/>
        </div>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteCategory(${ci})">✕</button>
      </div>
      <div class="admin-section-body" id="jcat-${ci}-body">
        <div class="flex flex-col gap-3" id="jcat-${ci}-questions">
          ${cat.questions.map((q, qi) => questionEditRow(ci, qi, q)).join('')}
        </div>
        <button class="btn btn-ghost btn-sm btn-full mt-2" onclick="addQuestion(${ci})">
          + Add Question
        </button>
      </div>
    </div>
  `).join('');
}

function questionEditRow(ci, qi, q) {
  return `
    <div class="card" style="padding:0.85rem;" id="jq-${ci}-${qi}">
      <div class="flex justify-between items-center mb-2">
        <span class="badge badge-gold">$${q.value}</span>
        <div class="flex gap-1">
          <input class="input" type="number" value="${q.value}" style="width:80px;padding:0.3rem 0.5rem;font-size:0.85rem;"
            oninput="updateQuestion(${ci},${qi},'value',parseInt(this.value)||0)"/>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteQuestion(${ci},${qi})" style="width:32px;height:32px;">✕</button>
        </div>
      </div>
      <div class="input-group mb-2">
        <label class="input-label">Question</label>
        <textarea class="input" rows="2" placeholder="Question text…"
          oninput="updateQuestion(${ci},${qi},'question',this.value)">${q.question}</textarea>
      </div>
      <div class="input-group">
        <label class="input-label">Answer</label>
        <input class="input" placeholder="Answer (in Jeopardy form)…" value="${q.answer}"
          oninput="updateQuestion(${ci},${qi},'answer',this.value)"/>
      </div>
    </div>
  `;
}

function updateCatName(ci, val) {
  const data = getGameData();
  if (data.jeopardy.categories[ci]) data.jeopardy.categories[ci].name = val;
  saveGameData(data);
}

function updateQuestion(ci, qi, field, val) {
  const data = getGameData();
  if (data.jeopardy.categories[ci]?.questions[qi]) {
    data.jeopardy.categories[ci].questions[qi][field] = val;
  }
  saveGameData(data);
}

function deleteQuestion(ci, qi) {
  const data = getGameData();
  data.jeopardy.categories[ci]?.questions?.splice(qi, 1);
  saveGameData(data);
  renderJeopardyCats(data.jeopardy.categories);
  showToast('Question deleted');
}

function addQuestion(ci) {
  const data = getGameData();
  const cat = data.jeopardy.categories[ci];
  const lastVal = cat.questions.length ? cat.questions[cat.questions.length - 1].value + 100 : 100;
  cat.questions.push({ value: lastVal, question: '', answer: '' });
  saveGameData(data);

  const container = document.getElementById(`jcat-${ci}-questions`);
  if (container) {
    const qi = cat.questions.length - 1;
    const div = document.createElement('div');
    div.innerHTML = questionEditRow(ci, qi, cat.questions[qi]);
    container.appendChild(div.firstElementChild);
  }
  showToast('Question added');
}

function deleteCategory(ci) {
  if (!confirm('Delete this category?')) return;
  const data = getGameData();
  data.jeopardy.categories.splice(ci, 1);
  saveGameData(data);
  renderJeopardyCats(data.jeopardy.categories);
  showToast('Category deleted');
}

function addJeopardyCategory() {
  const data = getGameData();
  data.jeopardy.categories.push({
    name: 'New Category',
    questions: [
      { value: 100, question: '', answer: '' },
      { value: 200, question: '', answer: '' },
      { value: 300, question: '', answer: '' },
      { value: 400, question: '', answer: '' },
      { value: 500, question: '', answer: '' },
    ]
  });
  saveGameData(data);
  renderJeopardyCats(data.jeopardy.categories);
  showToast('Category added');
}

// ── Mafia Role Editor ───────────────────────────────────────
function loadMafiaEditor() {
  const data = getGameData();
  renderMafiaEditor(data.mafia);
}

const ROLE_DISPLAY = {
  disciple:      { name: 'Disciple',      icon: '🙏', team: 'good',    color: 'var(--green)' },
  prophet:       { name: 'Prophet',       icon: '👁️',  team: 'good',    color: 'var(--blue)' },
  healer:        { name: 'Healer',        icon: '🌿', team: 'good',    color: 'var(--green)' },
  judge:         { name: 'Judge',         icon: '⚖️',  team: 'good',    color: 'var(--gold)' },
  false_prophet: { name: 'False Prophet', icon: '🐍', team: 'evil',    color: 'var(--red)' },
  pharaoh:       { name: 'Pharaoh',       icon: '👑', team: 'evil',    color: 'var(--red)' },
  sorcerer:      { name: 'Sorcerer',      icon: '🔮', team: 'evil',    color: 'var(--purple)' },
  wanderer:      { name: 'Wanderer',      icon: '🦅', team: 'neutral', color: 'var(--text2)' },
};

function renderMafiaEditor(mafia) {
  const container = document.getElementById('mafiaRoleEditor');
  if (!container) return;

  const playerCounts = Object.keys(mafia.roleDistribution).map(Number).sort((a,b)=>a-b);

  container.innerHTML = `
    <div class="card mb-2">
      <p class="text-sm text-muted">Select a player count to edit the role distribution:</p>
      <div class="flex flex-wrap gap-1 mt-2">
        ${playerCounts.map(n => `
          <button class="btn btn-ghost btn-sm" onclick="showMafiaDistEditor(${n})" id="mdBtn-${n}">${n}P</button>
        `).join('')}
      </div>
    </div>
    <div id="mafiaDistEditor"></div>
  `;
}

function showMafiaDistEditor(count) {
  document.querySelectorAll('[id^="mdBtn-"]').forEach(b => {
    b.classList.toggle('btn-primary', b.id === `mdBtn-${count}`);
    b.classList.toggle('btn-ghost', b.id !== `mdBtn-${count}`);
  });

  const data = getGameData();
  const dist = data.mafia.roleDistribution[count] || {};
  const allRoles = Object.keys(ROLE_DISPLAY);

  document.getElementById('mafiaDistEditor').innerHTML = `
    <div class="card animate-fade-in">
      <p class="input-label mb-2">${count} Players — Role Counts</p>
      <div class="flex flex-col gap-2">
        ${allRoles.map(role => {
          const r = ROLE_DISPLAY[role];
          const val = dist[role] || 0;
          return `
            <div class="flex items-center gap-2" style="padding:0.5rem 0;border-bottom:1px solid var(--border);">
              <span style="font-size:1.2rem;width:28px;">${r.icon}</span>
              <span style="flex:1;color:${r.color};">${r.name}</span>
              <div class="flex items-center gap-1">
                <button onclick="changeMafiaCount('${role}',${count},-1)" class="btn btn-ghost btn-sm btn-icon" style="width:30px;height:30px;">−</button>
                <span style="width:24px;text-align:center;font-weight:700;" id="mc-${role}-${count}">${val}</span>
                <button onclick="changeMafiaCount('${role}',${count},1)" class="btn btn-ghost btn-sm btn-icon" style="width:30px;height:30px;">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-muted text-sm">Total: <span id="mafiaTotal-${count}">${Object.values(dist).reduce((a,b)=>a+b,0)}</span> / ${count}</span>
      </div>
    </div>
  `;
}

function changeMafiaCount(role, count, delta) {
  const data = getGameData();
  if (!data.mafia.roleDistribution[count]) data.mafia.roleDistribution[count] = {};
  const dist = data.mafia.roleDistribution[count];
  dist[role] = Math.max(0, (dist[role] || 0) + delta);
  if (dist[role] === 0) delete dist[role];
  saveGameData(data);

  const el = document.getElementById(`mc-${role}-${count}`);
  if (el) el.textContent = dist[role] || 0;

  const total = Object.values(dist).reduce((a,b) => a+b, 0);
  const totalEl = document.getElementById(`mafiaTotal-${count}`);
  if (totalEl) totalEl.textContent = total;
  totalEl?.parentElement?.classList.toggle('text-red', total !== count);
  totalEl && (totalEl.style.color = total !== count ? 'var(--red)' : '');
}

// ── Credentials change ─────────────────────────────────────
function changeCredentials() {
  const email = document.getElementById('newEmailInput')?.value?.trim();
  const pin1  = document.getElementById('newPinInput')?.value?.trim();
  const pin2  = document.getElementById('newPinConfirm')?.value?.trim();

  if (!email || !email.includes('@')) { showToast('Enter a valid email', 'error'); return; }
  if (!pin1) { showToast('Enter a PIN', 'error'); return; }
  if (pin1 !== pin2) { showToast('PINs do not match', 'error'); return; }

  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify({ email, pin: pin1 }));
  showToast('Credentials updated!', 'success');
  document.getElementById('newEmailInput').value = '';
  document.getElementById('newPinInput').value = '';
  document.getElementById('newPinConfirm').value = '';
}

// ── Export / Import ─────────────────────────────────────────
function exportData() {
  const data = getGameData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zion-games-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      saveGameData(parsed);
      showToast('Data imported!', 'success');
      loadMrWhiteWords();
      loadJeopardyEditor();
      loadMafiaEditor();
    } catch(_) {
      showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ── Reset ───────────────────────────────────────────────────
function showResetConfirm() {
  const html = `
    <div class="overlay center" id="resetOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:340px;">
        <div class="text-center mb-3">
          <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">⚠️</span>
          <h3 class="font-serif text-gold2 mb-1">Reset All Data?</h3>
          <p class="text-muted text-sm">This will restore all game content to defaults. This cannot be undone.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-full" onclick="document.getElementById('resetOverlay').remove()">Cancel</button>
          <button class="btn btn-danger btn-full" onclick="resetAllData()">Reset</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function resetAllData() {
  saveGameData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  document.getElementById('resetOverlay')?.remove();
  showToast('Data reset to defaults', 'success');
  loadMrWhiteWords();
  loadJeopardyEditor();
  loadMafiaEditor();
  loadTabooEditor();
  haptic('heavy');
}

// ── Taboo Card Editor ────────────────────────────────────────
function loadTabooEditor() {
  const data = getGameData();
  renderTabooCards(data.taboo?.cards || []);
}

function renderTabooCards(cards) {
  const container = document.getElementById('tabooCardList');
  if (!container) return;
  container.innerHTML = cards.map((card, ci) => tabooCardRow(card, ci)).join('');
}

function tabooCardRow(card, ci) {
  return `
    <div class="admin-section" id="tc-${ci}">
      <div class="admin-section-header" onclick="toggleSection('tc-${ci}')">
        <div class="flex items-center gap-2" style="flex:1;overflow:hidden;">
          <span style="font-size:1rem;">📖</span>
          <span class="font-bold" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--gold2);">${card.word || 'Untitled card'}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge badge-red" style="font-size:0.65rem;">${card.taboo?.length || 0} forbidden</span>
          <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;min-height:28px;font-size:0.8rem;"
            onclick="event.stopPropagation();deleteTabooCard(${ci})">✕</button>
        </div>
      </div>
      <div class="admin-section-body" id="tc-${ci}-body">
        <div class="input-group mb-2">
          <label class="input-label">Word / Phrase</label>
          <input class="input" value="${card.word}" placeholder="e.g. Moses"
            oninput="updateTabooCard(${ci},'word',this.value)"/>
        </div>
        <div class="input-group">
          <label class="input-label">Forbidden Words <span class="text-muted">(one per line, max 5)</span></label>
          <textarea class="input" rows="5" placeholder="Egypt&#10;Pharaoh&#10;Exodus&#10;Red Sea&#10;Commandments"
            oninput="updateTabooTaboo(${ci},this.value)">${(card.taboo || []).join('\n')}</textarea>
        </div>
      </div>
    </div>
  `;
}

function updateTabooCard(ci, field, val) {
  const data = getGameData();
  if (data.taboo?.cards?.[ci]) {
    data.taboo.cards[ci][field] = val;
    saveGameData(data);
    // Update header label live
    const header = document.querySelector(`#tc-${ci} .font-bold`);
    if (header && field === 'word') header.textContent = val || 'Untitled card';
  }
}

function updateTabooTaboo(ci, raw) {
  const words = raw.split('\n').map(w => w.trim()).filter(Boolean).slice(0, 5);
  const data = getGameData();
  if (data.taboo?.cards?.[ci]) {
    data.taboo.cards[ci].taboo = words;
    saveGameData(data);
    const badge = document.querySelector(`#tc-${ci} .badge-red`);
    if (badge) badge.textContent = `${words.length} forbidden`;
  }
}

function deleteTabooCard(ci) {
  const data = getGameData();
  data.taboo.cards.splice(ci, 1);
  saveGameData(data);
  renderTabooCards(data.taboo.cards);
  showToast('Card deleted');
}

function addTabooCard() {
  const data = getGameData();
  if (!data.taboo) data.taboo = { timerSeconds: 60, cards: [] };
  data.taboo.cards.push({ word: '', taboo: ['', '', '', '', ''] });
  saveGameData(data);
  renderTabooCards(data.taboo.cards);
  // Scroll to and open the new card
  const ci = data.taboo.cards.length - 1;
  setTimeout(() => {
    const el = document.getElementById(`tc-${ci}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector('input')?.focus();
  }, 100);
  showToast('Card added');
}

// ── Init ──────────────────────────────────────────────────
if (sessionStorage.getItem('adminAuth') === '1') {
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('adminMain').classList.remove('hidden');
  document.getElementById('adminMain').style.display = '';
  initAdmin();
}
