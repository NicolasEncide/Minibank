/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBjO1bAM10G8JBA-oZd2hXRIGoLdxfpBsU",
  authDomain: "minibank-738e2.firebaseapp.com",
  projectId: "minibank-738e2",
  storageBucket: "minibank-738e2.firebasestorage.app",
  messagingSenderId: "295861826545",
  appId: "1:295861826545:web:d10b4a9610aed771960a50",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.notification?.title || "Minibank";
  const notificationOptions = {
    body: payload?.notification?.body || "Você recebeu uma nova notificação.",
    data: payload?.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
