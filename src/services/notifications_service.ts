import { Platform } from "react-native";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import app, { auth, database } from "./connectionFirebase";
import { ref, update } from "firebase/database";

const VAPID_KEY = "BPh_EnjPXnrZFJi9WChFcXyEpsvzUtVVJbPtvUbOlejFQe087mQEQ4eoVbpty7GL0zm73CMHVXroLnRxrtHdqHo";

async function ensureServiceWorkerRegistration() {
  if (Platform.OS !== "web") return null;
  if (!("serviceWorker" in navigator)) return null;

  await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return navigator.serviceWorker.ready;
}

export async function registerFcmTokenForCurrentUser() {
  if (Platform.OS !== "web") {
    return { success: false, message: "FCM foi configurado para web neste projeto Expo." };
  }

  const user = auth.currentUser;
  if (!user) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const supported = await isSupported();
  if (!supported) {
    return { success: false, message: "FCM não suportado neste navegador." };
  }

  if (!("Notification" in globalThis)) {
    return { success: false, message: "Notificações indisponíveis." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { success: false, message: "Permissão de notificação negada." };
  }

  const serviceWorkerRegistration = await ensureServiceWorkerRegistration();
  const messaging = getMessaging(app);

  let token = "";

  try {
    token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
    });
  } catch {
    return {
      success: false,
      message: "Falha ao registrar o Service Worker para notificações push.",
    };
  }

  if (!token) {
    return { success: false, message: "Não foi possível gerar token FCM." };
  }

  await update(ref(database, `users/${user.uid}`), {
    fcmToken: token,
    fcmTokenUpdatedAt: new Date().toISOString(),
  });

  return { success: true, message: "Token FCM salvo com sucesso." };
}

export async function enableForegroundNotifications(handler?: (payload: unknown) => void) {
  if (Platform.OS !== "web") return null;

  const supported = await isSupported();
  if (!supported) return null;

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    if (handler) {
      handler(payload);
      return;
    }

    const notification = payload.notification;
    if (!notification || !("Notification" in globalThis)) return;

    if (Notification.permission === "granted") {
      new Notification(notification.title ?? "Nova notificação", {
        body: notification.body,
      });
    }
  });
}
