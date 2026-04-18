const CACHE = 'true-bible-games-v3';
const ASSETS = [
  '/index.html',
  '/css/styles.css',
  '/js/app.js', '/js/game-data.js', '/js/scoreboard.js',
  '/js/mr-white.js', '/js/mafia.js', '/js/jeopardy.js', '/js/taboo.js', '/js/admin.js',
  '/js/charades.js', '/js/twenty-questions.js', '/js/seven-up.js',
  '/games/mr-white.html', '/games/mafia.html', '/games/jeopardy.html', '/games/taboo.html',
  '/games/charades.html', '/games/twenty-questions.html', '/games/seven-up.html',
  '/admin/index.html', '/scoreboard.html', '/buzzer.html',
  '/icons/icon-192.svg', '/icons/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(url => c.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Navigation requests (HTML pages) — network first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request.url)
        .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Static assets — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request.url).catch(() => null);
    })
  );
});
