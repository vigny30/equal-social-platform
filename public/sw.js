const CACHE_NAME = 'equal-v1.0.0';
const STATIC_CACHE = 'equal-static-v1.0.0';
const DYNAMIC_CACHE = 'equal-dynamic-v1.0.0';
const IMAGE_CACHE = 'equal-images-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/create',
  '/explore',
  '/profile',
  '/duet',
  '/music',
  '/live',
  '/challenge',
  '/remix',
  '/manifest.json',
  '/app-icon.svg',
  '/placeholder-logo.png',
  '/splash-screen.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (except for fonts and APIs we control)
  if (!url.origin.includes(self.location.origin) && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Cache First for images
    if (isImage(url)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Strategy 3: Network First for API calls
    if (isApiCall(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Stale While Revalidate for pages
    if (isPageRequest(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Default: Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Service Worker: Fetch failed:', error);
    
    // Return offline fallback for pages
    if (isPageRequest(url)) {
      return await getOfflineFallback();
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|ico|svg)$/) ||
         url.pathname === '/manifest.json' ||
         STATIC_ASSETS.includes(url.pathname);
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);
}

function isApiCall(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co') ||
         url.hostname.includes('supabase.in');
}

function isPageRequest(url) {
  return url.pathname === '/' ||
         url.pathname.startsWith('/create') ||
         url.pathname.startsWith('/explore') ||
         url.pathname.startsWith('/profile') ||
         url.pathname.startsWith('/duet') ||
         url.pathname.startsWith('/music') ||
         url.pathname.startsWith('/live') ||
         url.pathname.startsWith('/challenge') ||
         url.pathname.startsWith('/remix');
}

async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE);
  return await cache.match('/') || new Response(
    '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Service Worker: Performing background sync');
  // Implement background sync logic here
  // This could include retrying failed API calls, uploading queued content, etc.
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/app-icon.svg',
    badge: '/app-icon.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/app-icon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/app-icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Equal', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/') || clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');