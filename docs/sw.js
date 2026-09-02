/* Service worker for "מתי שבת בירוחם" */
const VERSION = 'v6';
const SHELL_CACHE = `shell-${VERSION}`;
const DATA_CACHE = `data-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// Relative to the SW scope, so this works both at the domain root and under
// a GitHub Pages project path (/shabbat-yerucham/docs/).
const SHELL = [
  './',
  './index.html',
  './times.html',
  './privacy.html',
  './terms.html',
  './app.js',
  './form-config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/sunset.gif',
  './icons/sunset-still.png',
  './icons/og-image.png',
];

const DATA_PATH = 'shabbat-times.json';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // addAll() rejects the whole batch on a single 404, which would leave the
    // SW uninstalled. Cache entries individually instead.
    await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, DATA_CACHE, RUNTIME_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

/** Serve from cache, refresh in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Shabbat times: cache-first for instant offline render, refreshed in the
  // background so a corrected luach still lands on the next visit.
  if (sameOrigin && url.pathname.endsWith(DATA_PATH)) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  // Pages: network-first so deploys are picked up, cache as the offline net.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put(request, res.clone());
        return res;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (
          (await cache.match(request, { ignoreSearch: true })) ||
          (await cache.match('./index.html')) ||
          Response.error()
        );
      }
    })());
    return;
  }

  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // Tailwind CDN and Google Fonts — without these cached the app is unusable
  // offline, so keep a runtime copy of whatever the pages actually pull.
  if (/(^|\.)(googleapis|gstatic|jsdelivr|tailwindcss)\.com$/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});
