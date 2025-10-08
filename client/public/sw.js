importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Firebase configuration - these should match your client-side config
const firebaseConfig = {
  apiKey: '<FIREBASE_API_KEY>',
  authDomain: '<FIREBASE_AUTH_DOMAIN>',
  projectId: '<FIREBASE_PROJECT_ID>',
  storageBucket: '<FIREBASE_STORAGE_BUCKET>',
  messagingSenderId: '<FIREBASE_MESSAGING_SENDER_ID>',
  appId: '<FIREBASE_APP_ID>',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages from Firebase
messaging.onBackgroundMessage(payload => {
  const notificationTitle =
    payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification',
    icon: payload.notification?.icon || payload.data?.icon || '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.tag || 'fcm-notification',
    data: {
      ...payload.data,
      source: 'fcm', // Mark as FCM notification
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // If app is not open, open it
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.link || self.location.origin;
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
