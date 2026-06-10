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

  await showBrowserNotification(payload);
  await sendWebhookPush(uid, payload);
  await saveNotificationToApi(uid, payload);
}

async function saveNotificationToApi(uid: string, payload: NotificationPayload) {
  try {
    // URL pública do bin de notificações
    const BIN_URL = "https://api.jsonbin.io/v3/b/6a28d99cf5f4af5e29d5bebf";
    const BIN_URL_LATEST = BIN_URL + "/latest";

    // Primeiro busca todas as notificações já salvas
    const res = await fetch(BIN_URL_LATEST);
    const data = await res.json();
    const notificacoes = data.record?.notifications ?? [];

    // Adiciona a nova notificação
    const novaLista = [
      ...notificacoes,
      {
        uid,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        createdAt: new Date().toISOString(),
      },
    ];

    // Atualiza o bin inteiro
    await fetch(BIN_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: novaLista }),
    });
  } catch (error) {
    console.error("Erro ao salvar notificação no JSONBin:", error);
  }
}

async function saveOrderToApi(uid: string, order: any) {
  try {
    // URL pública do bin de pedidos
    const BIN_URL = "https://api.jsonbin.io/v3/b/6a28d9b9f5f4af5e29d5bf0b";
    const BIN_URL_LATEST = BIN_URL + "/latest";

    // Busca todos os pedidos já salvos
    const res = await fetch(BIN_URL_LATEST);
    const data = await res.json();
    const carts = data.record?.carts ?? [];

    // Adiciona o novo pedido
    const novaLista = [
      ...carts,
      {
        uid,
        ...order,
        createdAt: new Date().toISOString(),
      },
    ];

    // Atualiza o bin inteiro
    await fetch(BIN_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carts: novaLista }),
    });
  } catch (error) {
    console.error("Erro ao salvar pedido no JSONBin:", error);
  }
}



export async function notifyCheckoutFinished(uid: string, total: number, itemsCount: number, items: any[]) {
  await triggerSimpleNotification(uid, {
    title: "Compra finalizada",
    body: `Pedido com ${itemsCount} item(ns) finalizado. Total: R$ ${total.toFixed(2)}.`,
    data: {
      type: "checkout-finished",
      total: total.toFixed(2),
      itemsCount: String(itemsCount),
    },
  });

  await saveOrderToApi(uid, {
  total: total.toFixed(2),
  itemsCount,
  items
  });
}
