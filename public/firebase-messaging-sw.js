// ==============================================================================
// FAMCARE360: Firebase Cloud Messaging Background Service Worker
// Path: public/firebase-messaging-sw.js
// ==============================================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Parse configuration from registration query parameters with fallback
const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: params.get("apiKey") || "AIzaSyCFd2u4rka1mMeTN_YVR3RUwOPFurGOmZQ",
  authDomain: params.get("authDomain") || "famcare360-10ce7.firebaseapp.com",
  projectId: params.get("projectId") || "famcare360-10ce7",
  storageBucket: params.get("storageBucket") || "famcare360-10ce7.firebasestorage.app",
  messagingSenderId: params.get("messagingSenderId") || "923121936031",
  appId: params.get("appId") || "1:923121936031:web:e7733ea2ebd05550cf64aa",
};

// Initialize Firebase compat app in worker scope
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// 1. Background Notification Handler (tab closed or app in background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background push payload received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'FAMCARE360 Health Alert';
  const body = payload.notification?.body || payload.data?.body || 'New family health update.';
  const link = payload.data?.link || payload.data?.click_action || '/';

  const notificationOptions = {
    body: body,
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    data: {
      link: link,
      receivedAt: Date.now(),
    },
    tag: payload.data?.tag || 'famcare360-notification',
    renotify: true,
  };

  self.registration.showNotification(title, notificationOptions);
});

// 2. Notification Click Handler: Focus or Open Window and Navigate
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no open tab is found, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
