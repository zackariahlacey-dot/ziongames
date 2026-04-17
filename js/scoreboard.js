/* ── Scoreboard — shared data layer + congrats overlay ───── */

const SB_KEY = 'zionScoreboard';

const CONGRATS_VERSES = [
  { verse: '"Well done, good and faithful servant!"',                    ref: 'Matthew 25:21' },
  { verse: '"Be strong and courageous!"',                                ref: 'Joshua 1:9' },
  { verse: '"The joy of the Lord is your strength."',                   ref: 'Nehemiah 8:10' },
  { verse: '"I can do all this through him who gives me strength."',    ref: 'Philippians 4:13' },
  { verse: '"Greater is he that is in you, than he that is in the world."', ref: '1 John 4:4' },
  { verse: '"The Lord your God is with you, the Mighty Warrior who saves."', ref: 'Zephaniah 3:17' },
  { verse: '"Those who hope in the Lord will renew their strength."',   ref: 'Isaiah 40:31' },
  { verse: '"You are more than conquerors through him who loved us."',  ref: 'Romans 8:37' },
];

// ── Data helpers ────────────────────────────────────────────
function getScoreboard() {
  try { return JSON.parse(localStorage.getItem(SB_KEY)) || { players: {} }; }
  catch(_) { return { players: {} }; }
}

function saveScoreboard(sb) {
  try { localStorage.setItem(SB_KEY, JSON.stringify(sb)); } catch(_) {}
}

function recordWins(names, game) {
  const sb = getScoreboard();
  names.forEach(name => {
    if (!name?.trim()) return;
    const key = name.trim();
    if (!sb.players[key]) sb.players[key] = { wins: {}, total: 0 };
    sb.players[key].wins[game] = (sb.players[key].wins[game] || 0) + 1;
    sb.players[key].total     = (sb.players[key].total || 0) + 1;
    sb.players[key].lastWin   = Date.now();
  });
  saveScoreboard(sb);
}

function clearScoreboard() {
  saveScoreboard({ players: {} });
}

function getTopPlayers(limit = 50) {
  const sb = getScoreboard();
  return Object.entries(sb.players)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ── Congrats overlay ────────────────────────────────────────
let _congratsCb = null;

function showCongrats(winners, game, onContinue) {
  _congratsCb = onContinue || null;

  const verse      = pickRandom(CONGRATS_VERSES);
  const multi      = winners.length > 1;
  const winnerText = multi
    ? winners.slice(0, -1).join(', ') + ' & ' + winners[winners.length - 1]
    : winners[0];

  launchConfetti(120);
  haptic('heavy');

  const ov = document.createElement('div');
  ov.id = 'congratsOverlay';
  ov.style.cssText = [
    'position:fixed;inset:0;',
    'background:radial-gradient(ellipse at 50% 40%, #1a1000 0%, #0d1117 70%);',
    'z-index:5000;',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'padding:2rem;text-align:center;',
    'animation:fadeIn 0.35s ease;',
  ].join('');

  ov.innerHTML = `
    <div style="max-width:400px;width:100%;position:relative;z-index:1;">

      <!-- Trophy -->
      <div style="font-size:4.5rem;margin-bottom:0.75rem;
                  animation:bounce 1.4s ease-in-out infinite;
                  filter:drop-shadow(0 0 24px rgba(212,160,23,0.6));">🏆</div>

      <!-- Label -->
      <p style="font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;
                color:var(--text2);margin-bottom:0.4rem;">
        ${multi ? 'Winners' : 'Winner'}
      </p>

      <!-- Name(s) -->
      <h1 class="font-serif animate-pop-in"
          style="font-size:clamp(1.8rem,7vw,3rem);
                 background:linear-gradient(135deg,var(--gold2) 0%,var(--gold) 55%,#8b5e0a 100%);
                 -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
                 line-height:1.15;margin-bottom:1rem;">
        ${winnerText}
      </h1>

      <!-- Gold rule -->
      <div style="width:48px;height:2px;background:var(--gold);border-radius:1px;
                  margin:0 auto 1.25rem;opacity:0.5;"></div>

      <!-- Bible verse -->
      <p class="font-serif"
         style="font-size:0.95rem;color:var(--text);line-height:1.65;
                font-style:italic;margin-bottom:0.3rem;">
        ${verse.verse}
      </p>
      <p style="font-size:0.75rem;color:var(--text2);">${verse.ref}</p>

      <!-- Buttons -->
      <div class="flex flex-col gap-2 mt-4">
        <button class="btn btn-primary btn-lg btn-full"
                onclick="saveCongrats('${game}', ${JSON.stringify(winners)})">
          🏆 Save to Leaderboard
        </button>
        <button class="btn btn-ghost btn-full"
                onclick="dismissCongrats()">
          Skip →
        </button>
      </div>
    </div>

    <!-- Extra confetti layer particles -->
    <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden;">
      ${Array.from({length:12}).map(() => `
        <div style="position:absolute;
          left:${Math.random()*100}%;top:${Math.random()*100}%;
          width:${3+Math.random()*5}px;height:${3+Math.random()*5}px;
          background:var(--gold);border-radius:50%;opacity:${0.1+Math.random()*0.3};
          animation:float ${3+Math.random()*3}s ease-in-out infinite;
          animation-delay:${Math.random()*2}s;"></div>
      `).join('')}
    </div>
  `;

  document.body.appendChild(ov);
}

function saveCongrats(game, winners) {
  recordWins(winners, game);
  showToast('Saved to leaderboard! 🏆', 'success');
  haptic('heavy');
  dismissCongrats();
}

function dismissCongrats() {
  const ov = document.getElementById('congratsOverlay');
  if (ov) {
    ov.style.transition = 'opacity 0.3s ease';
    ov.style.opacity = '0';
    setTimeout(() => { ov.remove(); if (_congratsCb) { _congratsCb(); _congratsCb = null; } }, 300);
  } else {
    if (_congratsCb) { _congratsCb(); _congratsCb = null; }
  }
}
