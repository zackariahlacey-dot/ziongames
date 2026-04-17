/* Shared app utilities */

// ─── PWA registration ──────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ─── Toast notifications ───────────────────────────────────
function showToast(msg, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Confetti ──────────────────────────────────────────────
function launchConfetti(count = 60) {
  const colors = ['#d4a017','#e8c547','#4ade80','#60a5fa','#a78bfa','#f0e6d3'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ─── Avatar initials ────────────────────────────────────────
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Random pick ────────────────────────────────────────────
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Timer utility ─────────────────────────────────────────
class GameTimer {
  constructor(seconds, onTick, onEnd) {
    this.total = seconds;
    this.remaining = seconds;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.interval = null;
  }
  start() {
    this.interval = setInterval(() => {
      this.remaining--;
      this.onTick(this.remaining);
      if (this.remaining <= 0) { this.stop(); this.onEnd(); }
    }, 1000);
  }
  stop()  { clearInterval(this.interval); this.interval = null; }
  reset() { this.stop(); this.remaining = this.total; }
  isRunning() { return this.interval !== null; }
}

// ─── SVG timer ring ─────────────────────────────────────────
function buildTimerRing(el, total, remaining) {
  const r = 36, c = 2 * Math.PI * r;
  const frac = remaining / total;
  const urgent = remaining <= 10;
  el.innerHTML = `
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r="${r}" fill="none" stroke="var(--border)" stroke-width="4"/>
      <circle cx="44" cy="44" r="${r}" fill="none"
        stroke="${urgent ? 'var(--red)' : 'var(--gold)'}"
        stroke-width="4"
        stroke-dasharray="${c}"
        stroke-dashoffset="${c * (1 - frac)}"
        stroke-linecap="round"
        style="transition:stroke-dashoffset 0.9s linear;"/>
    </svg>
    <span class="timer-text">${remaining}</span>
  `;
  el.classList.toggle('urgent', urgent);
}

// ─── Page transition ─────────────────────────────────────────
function navigateTo(url) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.22s ease';
  setTimeout(() => { window.location.href = url; }, 200);
}

// ─── Haptic feedback (if available) ─────────────────────────
function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  const patterns = { light: [10], medium: [20], heavy: [30, 20, 30] };
  navigator.vibrate(patterns[type] || [10]);
}

// ─── Fade in on load ─────────────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
  });
});
