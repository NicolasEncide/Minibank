import { Product } from "../models/Product";

const BASE_URL = process.env.EXPO_PUBLIC_MOCKAPI_BASE_URL ?? "";
const RESOURCE = process.env.EXPO_PUBLIC_MOCKAPI_PRODUCTS_RESOURCE ?? "products";

function getResourceUrl(id?: string) {
  if (!BASE_URL) {
    throw new Error(
      "MockAPI não configurado. Defina EXPO_PUBLIC_MOCKAPI_BASE_URL no arquivo .env."
    );
  }

  const base = BASE_URL.replace(/\/+$/, "");
  const path = id ? `${RESOURCE}/${id}` : RESOURCE;

  return `${base}/${path}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição (${response.status}).`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeProduct(raw: any): Product {
  return {
    id: raw?.id != null ? String(raw.id) : undefined,
    name: raw?.name ?? "",
    category: raw?.category ?? "",
    description: raw?.description ?? "",
    price: Number(raw?.price) || 0,
    image: raw?.image ?? "",
    createdAt: raw?.createdAt,
  };
}

function serializeProduct(product: Product) {
  return {
    name: product.name,
    category: product.category,
    description: product.description,
    price: Number(product.price) || 0,
    image: product.image ?? "",
  };
}

export const productService = {
  isConfigured() {
    return Boolean(BASE_URL);
  },

  async getAll(): Promise<Product[]> {
    const data = await request<any[]>(getResourceUrl());

    if (!Array.isArray(data)) return [];

    return data.map(normalizeProduct);
  },

  async getById(id: string): Promise<Product> {
    const data = await request<any>(getResourceUrl(id));
    return normalizeProduct(data);
  },

  async create(product: Product): Promise<Product> {
    const body = JSON.stringify({
      ...serializeProduct(product),
      createdAt: new Date().toISOString(),
    });

    const data = await request<any>(getResourceUrl(), {
      method: "POST",
      body,
    });

    return normalizeProduct(data);
  },

  async updateProduct(id: string, product: Product): Promise<Product> {
    const data = await request<any>(getResourceUrl(id), {
      method: "PUT",
      body: JSON.stringify(serializeProduct(product)),
    });

    return normalizeProduct(data);
  },

  async delete(id: string): Promise<void> {
    await request<void>(getResourceUrl(id), { method: "DELETE" });
  },
};
