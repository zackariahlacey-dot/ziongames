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
  document.querySelectorAll('#adminTabs .tab, #adminTabs2 .tab').forEach(t => t.classList.remove('active'));
  el?.classList.add('active');

  // Lazy-load editors
  if (id === 'charades') loadCharadesEditor();
  if (id === 'twentyq')  loadTwentyQEditor();
  if (id === 'headsup')  loadHeadsUpEditor();
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
      loadCharadesEditor();
      loadTwentyQEditor();
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
  loadCharadesEditor();
  loadTwentyQEditor();
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

// ── Charades Editor ──────────────────────────────────────────
const CHARADES_CATS = [
  { id: 'easy',         label: 'Easy',          icon: '🌱' },
  { id: 'hard',         label: 'Hard',          icon: '🔥' },
  { id: 'funny',        label: 'Funny',         icon: '😂' },
  { id: 'serious',      label: 'Serious',       icon: '🕊️' },
  { id: 'miracles',     label: 'Miracles',      icon: '✨' },
  { id: 'parables',     label: 'Parables',      icon: '📖' },
  { id: 'animals',      label: 'Animals',       icon: '🦁' },
  { id: 'oldTestament', label: 'Old Testament', icon: '📜' },
  { id: 'newTestament', label: 'New Testament', icon: '✝️' },
  { id: 'prophets',     label: 'Prophets',      icon: '👁️' },
];

function loadCharadesEditor() {
  const data = getGameData();
  const container = document.getElementById('charadesEditor');
  if (!container) return;

  container.innerHTML = CHARADES_CATS.map(cat => {
    const cards = data.charades?.[cat.id] || [];
    return `
      <div class="admin-section mb-3">
        <div class="admin-section-header" onclick="toggleSection('ch-${cat.id}')">
          <div class="flex items-center gap-2">
            <span>${cat.icon}</span>
            <span class="font-bold">${cat.label}</span>
            <span class="badge badge-gold" id="ch-${cat.id}-count">${cards.length} cards</span>
          </div>
          <svg id="ch-${cat.id}-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="admin-section-body" id="ch-${cat.id}-body" style="display:none;">
          <div class="flex flex-col gap-2 mb-3" id="ch-${cat.id}-list"></div>
          <div class="card" style="background:var(--bg3);padding:0.85rem;">
            <p class="input-label mb-2">Add Card</p>
            <input class="input mb-2" placeholder="Act description…" id="ch-${cat.id}-act"/>
            <input class="input mb-2" placeholder="Hint (optional)…" id="ch-${cat.id}-hint"/>
            <button class="btn btn-primary btn-sm btn-full" onclick="addCharadesCard('${cat.id}')">+ Add</button>
          </div>
        </div>
      </div>`;
  }).join('');

  CHARADES_CATS.forEach(cat => renderCharadesCards(cat.id, data.charades?.[cat.id] || []));
}

function renderCharadesCards(catId, cards) {
  const container = document.getElementById(`ch-${catId}-list`);
  const countEl = document.getElementById(`ch-${catId}-count`);
  if (!container) return;
  if (countEl) countEl.textContent = `${cards.length} cards`;
  container.innerHTML = cards.map((c, i) => `
    <div style="padding:0.65rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
      <div class="flex justify-between items-start gap-2 mb-1">
        <span class="text-sm font-bold" style="flex:1;">${c.act}</span>
        <button onclick="removeCharadesCard('${catId}',${i})" style="background:none;border:none;color:var(--text3);font-size:1.1rem;cursor:pointer;padding:0;line-height:1;flex-shrink:0;">×</button>
      </div>
      ${c.hint ? `<p class="text-sm text-muted">💡 ${c.hint}</p>` : ''}
    </div>
  `).join('');
}

function addCharadesCard(catId) {
  const actEl  = document.getElementById(`ch-${catId}-act`);
  const hintEl = document.getElementById(`ch-${catId}-hint`);
  const act  = actEl?.value?.trim();
  const hint = hintEl?.value?.trim();
  if (!act) { showToast('Enter an act description', 'error'); return; }

  const data = getGameData();
  if (!data.charades) data.charades = {};
  if (!data.charades[catId]) data.charades[catId] = [];
  data.charades[catId].push({ act, hint: hint || '' });
  saveGameData(data);
  renderCharadesCards(catId, data.charades[catId]);
  if (actEl) actEl.value = '';
  if (hintEl) hintEl.value = '';
  actEl?.focus();
  showToast('Card added', 'success');
}

function removeCharadesCard(catId, idx) {
  const data = getGameData();
  const removed = data.charades?.[catId]?.splice(idx, 1)?.[0];
  saveGameData(data);
  renderCharadesCards(catId, data.charades?.[catId] || []);
  if (removed) showToast(`"${removed.act.slice(0,30)}…" removed`);
}

// ── 20 Questions Editor ──────────────────────────────────────
const TQ_CATS = [
  { id: 'people',   label: 'People',   icon: '👤' },
  { id: 'places',   label: 'Places',   icon: '🗺️' },
  { id: 'objects',  label: 'Objects',  icon: '🏺' },
  { id: 'events',   label: 'Events',   icon: '⚡' },
  { id: 'parables', label: 'Parables', icon: '📖' },
];

function loadTwentyQEditor() {
  const data = getGameData();
  const container = document.getElementById('twentyqEditor');
  if (!container) return;

  container.innerHTML = TQ_CATS.map(cat => {
    const cards = data.twentyQuestions?.[cat.id] || [];
    return `
      <div class="admin-section mb-3">
        <div class="admin-section-header" onclick="toggleSection('tq-${cat.id}')">
          <div class="flex items-center gap-2">
            <span>${cat.icon}</span>
            <span class="font-bold">${cat.label}</span>
            <span class="badge badge-gold" id="tq-${cat.id}-count">${cards.length} cards</span>
          </div>
          <svg id="tq-${cat.id}-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="admin-section-body" id="tq-${cat.id}-body" style="display:none;">
          <div class="flex flex-col gap-2 mb-3" id="tq-${cat.id}-list"></div>
          <div class="card" style="background:var(--bg3);padding:0.85rem;">
            <p class="input-label mb-2">Add Card</p>
            <input class="input mb-2" placeholder="Name (e.g. Moses)…" id="tq-${cat.id}-name"/>
            <input class="input mb-2" placeholder="Short description…" id="tq-${cat.id}-desc"/>
            <textarea class="input mb-2" rows="3" placeholder="3 facts, one per line…" id="tq-${cat.id}-facts"></textarea>
            <button class="btn btn-primary btn-sm btn-full" onclick="addTQCard('${cat.id}')">+ Add</button>
          </div>
        </div>
      </div>`;
  }).join('');

  TQ_CATS.forEach(cat => renderTQCards(cat.id, data.twentyQuestions?.[cat.id] || []));
}

function renderTQCards(catId, cards) {
  const container = document.getElementById(`tq-${catId}-list`);
  const countEl = document.getElementById(`tq-${catId}-count`);
  if (!container) return;
  if (countEl) countEl.textContent = `${cards.length} cards`;
  container.innerHTML = cards.map((c, i) => `
    <div style="padding:0.65rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
      <div class="flex justify-between items-start gap-2 mb-1">
        <span class="text-sm font-bold" style="flex:1;">${c.name}</span>
        <button onclick="removeTQCard('${catId}',${i})" style="background:none;border:none;color:var(--text3);font-size:1.1rem;cursor:pointer;padding:0;line-height:1;flex-shrink:0;">×</button>
      </div>
      <p class="text-sm text-muted mb-1">${c.description}</p>
      ${(c.facts||[]).map(f=>`<p class="text-sm" style="color:var(--text3);">✦ ${f}</p>`).join('')}
    </div>
  `).join('');
}

function addTQCard(catId) {
  const nameEl  = document.getElementById(`tq-${catId}-name`);
  const descEl  = document.getElementById(`tq-${catId}-desc`);
  const factsEl = document.getElementById(`tq-${catId}-facts`);
  const name  = nameEl?.value?.trim();
  const desc  = descEl?.value?.trim();
  const facts = (factsEl?.value || '').split('\n').map(f=>f.trim()).filter(Boolean).slice(0,3);
  if (!name) { showToast('Enter a name', 'error'); return; }
  if (!desc) { showToast('Enter a description', 'error'); return; }
  if (facts.length < 1) { showToast('Enter at least one fact', 'error'); return; }

  const data = getGameData();
  if (!data.twentyQuestions) data.twentyQuestions = {};
  if (!data.twentyQuestions[catId]) data.twentyQuestions[catId] = [];
  data.twentyQuestions[catId].push({ name, description: desc, facts });
  saveGameData(data);
  renderTQCards(catId, data.twentyQuestions[catId]);
  if (nameEl) nameEl.value = '';
  if (descEl) descEl.value = '';
  if (factsEl) factsEl.value = '';
  nameEl?.focus();
  showToast(`"${name}" added`, 'success');
}

function removeTQCard(catId, idx) {
  const data = getGameData();
  const removed = data.twentyQuestions?.[catId]?.splice(idx, 1)?.[0];
  saveGameData(data);
  renderTQCards(catId, data.twentyQuestions?.[catId] || []);
  if (removed) showToast(`"${removed.name}" removed`);
}

// ── Heads Up Editor ───────────────────────────────────────────
const HU_ADMIN_CATS = [
  { id: 'people',   label: 'Bible People',   icon: '👤' },
  { id: 'places',   label: 'Bible Places',   icon: '🏛️' },
  { id: 'stories',  label: 'Bible Stories',  icon: '📖' },
  { id: 'miracles', label: 'Miracles',       icon: '✨' },
  { id: 'books',    label: 'Books of Bible', icon: '📜' },
  { id: 'animals',  label: 'Bible Animals',  icon: '🦁' },
  { id: 'parables', label: 'Parables',       icon: '🌱' },
  { id: 'objects',  label: 'Sacred Objects', icon: '⚗️' },
];

function loadHeadsUpEditor() {
  const data = getGameData();
  const container = document.getElementById('headsUpEditor');
  if (!container) return;

  container.innerHTML = HU_ADMIN_CATS.map(cat => {
    const words = data.headsUp?.[cat.id] || [];
    return `
      <div class="admin-section mb-3">
        <div class="admin-section-header" onclick="toggleSection('hu-${cat.id}')">
          <div class="flex items-center gap-2">
            <span>${cat.icon}</span>
            <span class="font-bold">${cat.label}</span>
            <span class="badge badge-gold" id="hu-${cat.id}-count">${words.length} words</span>
          </div>
          <svg id="hu-${cat.id}-chevron" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="admin-section-body" id="hu-${cat.id}-body" style="display:none;">
          <div class="flex flex-col gap-1 mb-3" id="hu-${cat.id}-list"></div>
          <div class="card" style="background:var(--bg3);padding:0.85rem;">
            <p class="input-label mb-2">Add Word</p>
            <div class="flex gap-2">
              <input class="input flex-1" placeholder="e.g. Moses…" id="hu-${cat.id}-input"
                onkeydown="if(event.key==='Enter')addHUWord('${cat.id}')"/>
              <button class="btn btn-primary btn-sm" onclick="addHUWord('${cat.id}')">+ Add</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  HU_ADMIN_CATS.forEach(cat => renderHUWords(cat.id, data.headsUp?.[cat.id] || []));
}

function renderHUWords(catId, words) {
  const container = document.getElementById(`hu-${catId}-list`);
  const countEl   = document.getElementById(`hu-${catId}-count`);
  if (!container) return;
  if (countEl) countEl.textContent = `${words.length} words`;
  container.innerHTML = words.map((w, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.45rem 0.65rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-sm);">
      <span class="text-sm">${w}</span>
      <button onclick="removeHUWord('${catId}',${i})" style="background:none;border:none;color:var(--text3);font-size:1.1rem;cursor:pointer;padding:0;line-height:1;">×</button>
    </div>
  `).join('');
}

function addHUWord(catId) {
  const input = document.getElementById(`hu-${catId}-input`);
  const word  = input?.value?.trim();
  if (!word) { showToast('Enter a word', 'error'); return; }

  const data = getGameData();
  if (!data.headsUp)         data.headsUp         = {};
  if (!data.headsUp[catId])  data.headsUp[catId]  = [];
  data.headsUp[catId].push(word);
  saveGameData(data);
  renderHUWords(catId, data.headsUp[catId]);
  if (input) input.value = '';
  input?.focus();
  showToast(`"${word}" added`, 'success');
}

function removeHUWord(catId, idx) {
  const data    = getGameData();
  const removed = data.headsUp?.[catId]?.splice(idx, 1)?.[0];
  saveGameData(data);
  renderHUWords(catId, data.headsUp?.[catId] || []);
  if (removed) showToast(`"${removed}" removed`);
}

// ── Init ──────────────────────────────────────────────────
if (sessionStorage.getItem('adminAuth') === '1') {
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('adminMain').classList.remove('hidden');
  document.getElementById('adminMain').style.display = '';
  initAdmin();
}
