/* ── Bible 20 Questions ────────────────────────────────────── */

const TQ = {
  selectedCategories: ['people','places','objects','events','parables'],
  phase: 'setup',
  deck: [],
  currentCard: null,
  questionsUsed: 0,
  groupWins: 0,
  thinkerWins: 0,
  streak: 0,
};

const TQ_CATEGORIES = [
  { id: 'people',   label: 'People',   icon: '👤', color: 'var(--blue)' },
  { id: 'places',   label: 'Places',   icon: '🗺️', color: 'var(--green)' },
  { id: 'objects',  label: 'Objects',  icon: '🏺', color: 'var(--gold2)' },
  { id: 'events',   label: 'Events',   icon: '⚡', color: 'var(--red)' },
  { id: 'parables', label: 'Parables', icon: '📖', color: 'var(--purple)' },
];

const root = document.getElementById('appRoot');
function render(html) {
  window.scrollTo(0,0);
  root.innerHTML = `<div class="container animate-fade-in" style="padding-top:1.5rem;padding-bottom:2rem;">${html}</div>`;
}

// ── Setup ────────────────────────────────────────────────────
function showSetup() {
  TQ.phase = 'setup';
  render(`
    <div class="stagger">
      <div class="text-center mb-4">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:float 4s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(212,160,23,0.4))">❓</span>
        <h2 class="font-serif text-gold2">Bible 20 Questions</h2>
        <p class="text-muted text-sm mt-1">One person knows. Everyone else guesses.</p>
      </div>

      <button class="btn btn-ghost btn-sm btn-full mb-3" onclick="showTQDirections()">📖 How to Play</button>

      <div class="card mb-4">
        <p class="input-label mb-3">Categories</p>
        <div class="flex flex-col gap-2">
          ${TQ_CATEGORIES.map(cat => {
            const active = TQ.selectedCategories.includes(cat.id);
            return `
              <button onclick="toggleTQCategory('${cat.id}')" id="tqcat-${cat.id}"
                style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;border-radius:var(--r-sm);border:1px solid ${active ? cat.color : 'var(--border)'};background:${active ? `color-mix(in srgb,${cat.color} 10%,transparent)` : 'var(--bg3)'};cursor:pointer;transition:all 0.15s;text-align:left;">
                <span style="font-size:1.2rem;">${cat.icon}</span>
                <span style="flex:1;font-size:0.9rem;font-weight:${active?'600':'400'};color:${active ? cat.color : 'var(--text2)'};">${cat.label}</span>
                <span style="font-size:0.8rem;color:var(--text3);">${(getGameData().twentyQuestions?.[cat.id]||[]).length} cards</span>
                ${active ? `<span style="font-size:0.75rem;color:${cat.color};">✓</span>` : ''}
              </button>`;
          }).join('')}
        </div>
      </div>

      ${TQ.groupWins + TQ.thinkerWins > 0 ? `
        <div class="card mb-4" style="background:rgba(212,160,23,0.06);border-color:rgba(212,160,23,0.2);">
          <p class="input-label mb-2">Session Score</p>
          <div class="flex justify-around">
            <div class="text-center">
              <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--green);">${TQ.groupWins}</p>
              <p class="text-muted text-sm">Group Wins</p>
            </div>
            <div class="text-center">
              <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--red);">${TQ.thinkerWins}</p>
              <p class="text-muted text-sm">Thinker Wins</p>
            </div>
            ${TQ.streak > 1 ? `
              <div class="text-center">
                <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--gold2);">${TQ.streak}🔥</p>
                <p class="text-muted text-sm">Streak</p>
              </div>` : ''}
          </div>
        </div>
      ` : ''}

      <button class="btn btn-primary btn-lg btn-full" onclick="drawTQCard()">
        🎲 Draw a Card
      </button>
    </div>
  `);
}

function toggleTQCategory(id) {
  const idx = TQ.selectedCategories.indexOf(id);
  if (idx === -1) {
    TQ.selectedCategories.push(id);
  } else {
    if (TQ.selectedCategories.length === 1) { showToast('Select at least one category', 'error'); return; }
    TQ.selectedCategories.splice(idx, 1);
  }
  const cat = TQ_CATEGORIES.find(c => c.id === id);
  const active = TQ.selectedCategories.includes(id);
  const btn = document.getElementById(`tqcat-${id}`);
  if (btn && cat) {
    btn.style.border = `1px solid ${active ? cat.color : 'var(--border)'}`;
    btn.style.background = active ? `color-mix(in srgb,${cat.color} 10%,transparent)` : 'var(--bg3)';
    const label = btn.querySelector('span:nth-child(2)');
    if (label) { label.style.color = active ? cat.color : 'var(--text2)'; label.style.fontWeight = active ? '600' : '400'; }
    const check = btn.querySelector('span:last-child');
    if (active && !check?.textContent.includes('✓')) {
      btn.insertAdjacentHTML('beforeend', `<span style="font-size:0.75rem;color:${cat.color};">✓</span>`);
    } else if (!active && check?.textContent.includes('✓')) {
      check.remove();
    }
  }
}

function showTQDirections() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay center" id="tqDirOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:360px;max-height:85vh;overflow-y:auto;">
        <h3 class="font-serif text-gold2 mb-3 text-center">❓ How to Play</h3>
        <div class="flex flex-col gap-3 text-sm" style="color:var(--text2);line-height:1.6;">
          <div><p class="font-bold mb-1" style="color:var(--text);">The Basics</p>
            <p>One player is the Thinker. They look at the card privately and become that person, place, object, or event.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">The Group</p>
            <p>Everyone else asks yes/no questions. "Are you a person?" "Did you appear in the Old Testament?" The Thinker answers only Yes or No.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">The Counter</p>
            <p>The phone sits face-up in the middle showing the question counter. Tap the big + button after each question is asked.</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Winning</p>
            <p>If the group guesses correctly before 20 questions — they win! If the Thinker survives all 20 questions — the Thinker wins!</p></div>
          <div><p class="font-bold mb-1" style="color:var(--text);">Hint</p>
            <p>At question 15, a hint button appears. The Thinker can reveal one fact from the card publicly — use wisely!</p></div>
        </div>
        <button class="btn btn-ghost btn-full mt-4" onclick="document.getElementById('tqDirOverlay').remove()">Got it!</button>
      </div>
    </div>
  `);
}

// ── Draw card ─────────────────────────────────────────────────
function drawTQCard() {
  const data = getGameData();
  const pool = [];
  TQ.selectedCategories.forEach(catId => {
    (data.twentyQuestions?.[catId] || []).forEach(card => pool.push({ ...card, category: catId }));
  });
  if (!pool.length) { showToast('No cards found for selected categories', 'error'); return; }
  if (!TQ.deck.length || TQ.deck.every(c => TQ.currentCard && c.name === TQ.currentCard.name)) {
    TQ.deck = shuffle([...pool]);
  }
  TQ.currentCard = TQ.deck.pop() || pool[Math.floor(Math.random() * pool.length)];
  TQ.questionsUsed = 0;
  showTQThinkerPass();
}

// ── Thinker pass screen ──────────────────────────────────────
function showTQThinkerPass() {
  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;">
      <div class="card" style="max-width:340px;width:100%;padding:2.5rem 2rem;">
        <span style="font-size:4rem;display:block;margin-bottom:1rem;animation:bounce 2s infinite">🙈</span>
        <h2 class="font-serif text-gold2 mb-2">Choose a Thinker</h2>
        <p style="color:var(--text2);line-height:1.6;margin-bottom:2rem;">
          Pass the phone to one person — they will see the card.<br/>
          <span class="text-sm text-muted">Everyone else look away!</span>
        </p>
        <button class="btn btn-primary btn-full" onclick="showTQThinkerCard()">I'm the Thinker →</button>
      </div>
    </div>
  `);
}

// ── Thinker sees card ────────────────────────────────────────
function showTQThinkerCard() {
  const card = TQ.currentCard;
  const cat = TQ_CATEGORIES.find(c => c.id === card.category);

  render(`
    <div style="min-height:70vh;display:flex;flex-direction:column;justify-content:center;padding:1.5rem;">
      <div class="card card-glow" style="padding:2rem 1.5rem;text-align:center;">
        <p class="text-muted text-sm mb-2" style="letter-spacing:0.1em;text-transform:uppercase;">Thinker Only — Keep Secret!</p>
        <span style="font-size:1.5rem;display:block;margin-bottom:0.5rem;">${cat?.icon || '❓'}</span>
        <span style="display:inline-block;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:color-mix(in srgb,${cat?.color||'var(--gold)'} 15%,transparent);color:${cat?.color||'var(--gold2)'};border:1px solid color-mix(in srgb,${cat?.color||'var(--gold)'} 30%,transparent);margin-bottom:1rem;">${cat?.label || ''}</span>
        <p style="font-family:var(--font-h);font-size:clamp(1.8rem,7vw,2.8rem);font-weight:700;background:linear-gradient(135deg,var(--gold2),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;margin-bottom:0.75rem;">${card.name}</p>
        <p class="text-muted text-sm mb-3">${card.description}</p>
        <div class="flex flex-col gap-1 mb-4">
          ${card.facts.map(f => `
            <div style="display:flex;align-items:flex-start;gap:0.5rem;text-align:left;padding:0.4rem 0.6rem;background:var(--bg3);border-radius:var(--r-sm);">
              <span style="color:var(--gold2);margin-top:0.1rem;">✦</span>
              <span class="text-sm" style="color:var(--text2);">${f}</span>
            </div>
          `).join('')}
        </div>
        <p class="text-muted text-sm mb-4">Memorize these facts — they may help you answer yes/no questions.</p>
        <button class="btn btn-primary btn-lg btn-full" onclick="showTQCounter()">I'm Ready — Start! →</button>
      </div>
    </div>
  `);
}

// ── Question counter ─────────────────────────────────────────
function showTQCounter() {
  TQ.questionsUsed = 0;
  renderTQCounter();
}

function renderTQCounter() {
  const q = TQ.questionsUsed;
  const counterClass = q >= 18 ? 'danger' : q >= 15 ? 'warning' : '';
  const hintUnlocked = q >= 15;
  const remaining = 20 - q;

  render(`
    <div class="stagger">
      <div class="card mb-3 text-center">
        <p class="text-muted text-sm mb-1" style="letter-spacing:0.1em;text-transform:uppercase;">Questions Asked</p>
        <p class="q-counter ${counterClass}" id="tqCounter">${q}</p>
        <p style="font-size:1rem;color:${remaining <= 3 ? 'var(--red)' : 'var(--text3)'};" id="tqRemaining">${remaining} remaining</p>
        <div class="progress-bar mt-3" style="height:8px;">
          <div class="progress-fill" id="tqProgressBar" style="width:${(q/20)*100}%;background:${q>=18?'var(--red)':q>=15?'#f59e0b':'var(--green)'};transition:all 0.3s;"></div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full mb-3" onclick="incrementTQ()" style="font-size:2rem;padding:1.25rem;letter-spacing:0.05em;" id="tqPlusBtn">
        + Question
      </button>

      ${hintUnlocked ? `
        <button class="btn btn-ghost btn-full mb-3" style="border-color:rgba(212,160,23,0.3);color:var(--gold2);" onclick="showTQHint()">
          💡 Reveal a Hint (question 15+)
        </button>
      ` : `
        <button class="btn btn-ghost btn-full mb-3" disabled style="opacity:0.35;" id="tqHintLock">
          💡 Hint unlocks at question 15
        </button>
      `}

      <div class="flex gap-2">
        <button class="btn btn-success btn-full" onclick="tqGroupGuessed()">✓ Group Guessed It!</button>
        <button class="btn btn-ghost btn-full" style="color:var(--red);border-color:rgba(248,113,113,0.3);" onclick="tqThinkerWins()">👑 20 Used — Reveal</button>
      </div>
    </div>
  `);
}

function incrementTQ() {
  if (TQ.questionsUsed >= 20) { tqThinkerWins(); return; }
  TQ.questionsUsed++;
  haptic('light');

  const counter = document.getElementById('tqCounter');
  const remaining = document.getElementById('tqRemaining');
  const bar = document.getElementById('tqProgressBar');
  const q = TQ.questionsUsed;
  const rem = 20 - q;

  if (counter) {
    counter.textContent = q;
    counter.className = `q-counter ${q >= 18 ? 'danger' : q >= 15 ? 'warning' : ''}`;
  }
  if (remaining) {
    remaining.textContent = `${rem} remaining`;
    remaining.style.color = rem <= 3 ? 'var(--red)' : 'var(--text3)';
  }
  if (bar) {
    bar.style.width = `${(q/20)*100}%`;
    bar.style.background = q >= 18 ? 'var(--red)' : q >= 15 ? '#f59e0b' : 'var(--green)';
  }

  if (q === 15) {
    const lockBtn = document.getElementById('tqHintLock');
    if (lockBtn) {
      lockBtn.outerHTML = `<button class="btn btn-ghost btn-full mb-3" style="border-color:rgba(212,160,23,0.3);color:var(--gold2);" onclick="showTQHint()">💡 Reveal a Hint</button>`;
    }
  }

  if (q >= 20) {
    haptic('heavy');
    setTimeout(() => tqThinkerWins(), 400);
  }
}

function showTQHint() {
  const card = TQ.currentCard;
  const hint = card.facts[Math.floor(Math.random() * card.facts.length)];
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay center" id="tqHintOverlay">
      <div class="modal center-modal animate-pop-in" style="max-width:340px;">
        <p class="text-muted text-sm mb-2 text-center" style="letter-spacing:0.08em;text-transform:uppercase;">Hint — Read Aloud</p>
        <div class="card" style="background:rgba(212,160,23,0.08);border-color:rgba(212,160,23,0.25);margin-bottom:1.5rem;">
          <p style="color:var(--gold2);font-size:1rem;line-height:1.6;text-align:center;">💡 "${hint}"</p>
        </div>
        <button class="btn btn-primary btn-full" onclick="document.getElementById('tqHintOverlay').remove()">Got it</button>
      </div>
    </div>
  `);
}

// ── Outcomes ─────────────────────────────────────────────────
function tqGroupGuessed() {
  TQ.groupWins++;
  TQ.streak++;
  haptic('heavy');
  showTQReveal('group');
}

function tqThinkerWins() {
  TQ.thinkerWins++;
  TQ.streak = 0;
  haptic('medium');
  showTQReveal('thinker');
}

function showTQReveal(winner) {
  const card = TQ.currentCard;
  const cat = TQ_CATEGORIES.find(c => c.id === card.category);
  const groupWon = winner === 'group';

  render(`
    <div class="stagger text-center">
      <div class="card card-glow mb-4 p-3" style="background:linear-gradient(135deg,${groupWon?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.08)'},transparent);">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;animation:bounce 2s infinite;">${groupWon?'🎉':'👑'}</span>
        <h2 class="font-serif mb-1" style="color:${groupWon?'var(--green)':'var(--red)'};">${groupWon ? 'Group Wins!' : 'Thinker Wins!'}</h2>
        <p class="text-muted text-sm">${groupWon ? `Guessed in ${TQ.questionsUsed} question${TQ.questionsUsed!==1?'s':''}` : '20 questions — mystery survived!'}</p>
      </div>

      <div class="card mb-4">
        <p class="text-muted text-sm mb-1" style="text-transform:uppercase;letter-spacing:0.08em;">The Answer Was</p>
        <span style="font-size:1.2rem;display:block;margin-bottom:0.4rem;">${cat?.icon||'❓'}</span>
        <p style="font-family:var(--font-h);font-size:2rem;font-weight:700;color:var(--gold2);margin-bottom:0.5rem;">${card.name}</p>
        <p class="text-muted text-sm mb-3">${card.description}</p>
        <div class="flex flex-col gap-1">
          ${card.facts.map(f => `
            <div style="display:flex;align-items:flex-start;gap:0.5rem;text-align:left;padding:0.35rem 0.5rem;background:var(--bg3);border-radius:var(--r-sm);">
              <span style="color:var(--gold2);margin-top:0.1rem;flex-shrink:0;">✦</span>
              <span class="text-sm" style="color:var(--text2);">${f}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mb-4" style="background:rgba(212,160,23,0.06);border-color:rgba(212,160,23,0.2);">
        <div class="flex justify-around">
          <div class="text-center">
            <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--green);">${TQ.groupWins}</p>
            <p class="text-muted text-sm">Group</p>
          </div>
          <div class="text-center">
            <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--red);">${TQ.thinkerWins}</p>
            <p class="text-muted text-sm">Thinker</p>
          </div>
          ${TQ.streak > 1 ? `
            <div class="text-center">
              <p style="font-size:1.8rem;font-family:var(--font-h);font-weight:700;color:var(--gold2);">${TQ.streak}🔥</p>
              <p class="text-muted text-sm">Streak</p>
            </div>` : ''}
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-ghost btn-full" onclick="showSetup()">Change Categories</button>
        <button class="btn btn-primary btn-full" onclick="drawTQCard()">Next Card →</button>
      </div>
    </div>
  `);
}

// ── Init ─────────────────────────────────────────────────────
showSetup();
