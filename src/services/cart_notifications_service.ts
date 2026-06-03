import { Platform } from "react-native";
import { push, ref } from "firebase/database";
import { database } from "./connectionFirebase";

const PUSH_WEBHOOK_URL = process.env.EXPO_PUBLIC_PUSH_WEBHOOK_URL;
const PUSH_WEBHOOK_SECRET = process.env.EXPO_PUBLIC_PUSH_WEBHOOK_SECRET;

type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function showBrowserNotification(payload: NotificationPayload) {
  if (Platform.OS !== "web") return;
  if (!("Notification" in globalThis)) return;
  if (Notification.permission !== "granted") return;

  new Notification(payload.title, {
    body: payload.body,
    data: payload.data,
  });
}

async function sendWebhookPush(uid: string, payload: NotificationPayload) {
  if (!PUSH_WEBHOOK_URL) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (PUSH_WEBHOOK_SECRET) {
    headers.Authorization = "Bearer " + PUSH_WEBHOOK_SECRET;
  }

  await fetch(PUSH_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      uid,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }),
  });
}

export async function triggerSimpleNotification(uid: string, payload: NotificationPayload) {
  await push(ref(database, `users/${uid}/notificationEvents`), {
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    createdAt: new Date().toISOString(),
  });

  await showBrowserNotification(payload);
  await sendWebhookPush(uid, payload);
}

export async function notifyCheckoutFinished(uid: string, total: number, itemsCount: number) {
  await triggerSimpleNotification(uid, {
    title: "Compra finalizada",
    body: `Pedido com ${itemsCount} item(ns) finalizado. Total: R$ ${total.toFixed(2)}.`,
    data: {
      type: "checkout-finished",
      total: total.toFixed(2),
      itemsCount: String(itemsCount),
    },
  });
}
