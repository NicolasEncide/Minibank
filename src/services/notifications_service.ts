import { Platform } from "react-native";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { auth, database } from "./connectionFirebase";
import { ref, update } from "firebase/database";
import app from "./connectionFirebase";

const VAPID_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;

export async function registerFcmTokenForCurrentUser() {
  if (Platform.OS !== "web") {
    return { success: false, message: "FCM no cliente foi habilitado para web neste projeto Expo." };
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

  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
  });

  if (!token) {
    return { success: false, message: "Não foi possível gerar token FCM." };
  }

  await update(ref(database, `users/${user.uid}`), {
    fcmToken: token,
    fcmTokenUpdatedAt: new Date().toISOString(),
  });

  return { success: true, message: "Token FCM salvo com sucesso." };
}

export async function enableForegroundNotifications(handler?: (payload: any) => void) {
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
