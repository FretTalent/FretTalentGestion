// FretTalent Service Worker — Notifications Push & Support Mobile PWA

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Réception des Notifications Push en direct
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'FretTalent - Nouvelle notification';
    const options = {
      body: data.body || 'Vous avez reçu un message ou une opportunité de recrutement.',
      icon: data.icon || '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/dashboard/candidate',
      },
      actions: data.actions || [
        { action: 'open', title: 'Voir sur FretTalent' },
        { action: 'close', title: 'Fermer' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Erreur lecture notification push SW:', err);
  }
});

// Clic sur la notification push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/dashboard/candidate';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
