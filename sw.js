const CACHE_NAME = 'matchday-v41';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=41',
  './app.js?v=41',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// Install Event - cache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS).catch((err) => {
        console.error('[Service Worker] Cache addAll failed: ', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache: ', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network-first with cache fallback (to ensure live updates are preferred but offline works)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/remote http resources (ignore chrome-extension, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the newly retrieved resources
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If resource not in cache, let it fail
        });
      })
  );
});

// Listen to Native Web Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'MatchDay Alert', body: 'New World Cup Update!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'MatchDay Alert', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open new window
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
