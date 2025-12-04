// CatchGBT Service Worker fuer optimales Caching und Performance
const CACHE_VERSION = 'catchgbt-v1.2.0';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  images: `${CACHE_VERSION}-images`,
};

// Assets die sofort gecacht werden sollen
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
];

Deno.serve((req) => {
  const swCode = `
    const CACHE_VERSION = '${CACHE_VERSION}';
    const CACHE_NAMES = ${JSON.stringify(CACHE_NAMES)};
    const PRECACHE_ASSETS = ${JSON.stringify(PRECACHE_ASSETS)};
    
    // Install Event - Precache wichtige Assets
    self.addEventListener('install', (event) => {
      console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
      event.waitUntil(
        caches.open(CACHE_NAMES.static).then((cache) => {
          console.log('[SW] Precaching static assets');
          return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
      );
    });
    
    // Activate Event - Alte Caches loeschen
    self.addEventListener('activate', (event) => {
      console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                console.log('[SW] Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              }
              return Promise.resolve();
            })
          );
        }).then(() => self.clients.claim())
      );
    });
    
    // Fetch Event - Intelligentes Caching
    self.addEventListener('fetch', (event) => {
      const { request } = event;
      const url = new URL(request.url);
      
      // Skip fuer non-GET Requests
      if (request.method !== 'GET') {
        return;
      }
      
      // Statische Assets - Cache First
      if (/\\.(js|css|woff2)$/.test(url.pathname)) {
        event.respondWith(
          caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request).then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAMES.static).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            });
          })
        );
        return;
      }
      
      // Bilder - Cache First mit laengerer Gueltigkeit
      if (/\\.(png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname)) {
        event.respondWith(
          caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request).then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAMES.images).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            }).catch(() => {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="#666">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
          })
        );
        return;
      }
      
      // API Calls - Network First mit Cache Fallback
      if (/\\/api\\//.test(url.pathname) || url.hostname.includes('supabase.co')) {
        event.respondWith(
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAMES.dynamic).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              return caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                  console.log('[SW] Serving from cache (offline):', url.pathname);
                  return cachedResponse;
                }
                return new Response(
                  JSON.stringify({ error: 'Offline', cached: false }),
                  { 
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
            })
        );
        return;
      }
      
      // HTML Pages - Network First
      if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
        event.respondWith(
          fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(CACHE_NAMES.dynamic).then((cache) => {
                cache.put(request, responseClone);
              });
              return response;
            })
            .catch(() => {
              return caches.match(request);
            })
        );
        return;
      }
      
      // Default - Network First
      event.respondWith(
        fetch(request).catch(() => caches.match(request))
      );
    });
    
    // Message Event fuer manuelle Cache-Verwaltung
    self.addEventListener('message', (event) => {
      if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
      }
      if (event.data === 'CLEAR_CACHE') {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          })
        );
      }
    });
  `;
  
  return new Response(swCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
});