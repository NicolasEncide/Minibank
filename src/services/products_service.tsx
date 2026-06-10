import { Product } from "../models/Product";

// URL do bin de produtos no JSONBin
const BIN_URL = "https://api.jsonbin.io/v3/b/6a28d92eda38895dfea43731"; 
const BIN_URL_LATEST = BIN_URL + "/latest";

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
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: Number(product.price) || 0,
    image: product.image ?? "",
    createdAt: product.createdAt,
  };
}

async function getAllRaw(): Promise<any[]> {
  const res = await fetch(BIN_URL_LATEST);
  if (!res.ok) throw new Error(`Erro ao buscar produtos (${res.status})`);
  const data = await res.json();
  return data.record?.products ?? [];
}

async function saveAllRaw(products: any[]): Promise<void> {
  await fetch(BIN_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products }),
  });
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const data = await getAllRaw();
    return data.map(normalizeProduct);
  },

  async getById(id: string): Promise<Product | undefined> {
    const data = await getAllRaw();
    const found = data.find((p: any) => String(p.id) === id);
    return found ? normalizeProduct(found) : undefined;
  },

  async create(product: Product): Promise<Product> {
    const products = await getAllRaw();
    const novo = {
      ...serializeProduct(product),
      id: String(Date.now()), // gera ID simples
      createdAt: new Date().toISOString(),
    };
    await saveAllRaw([...products, novo]);
    return normalizeProduct(novo);
  },

  async updateProduct(id: string, product: Product): Promise<Product> {
    const products = await getAllRaw();
    const atualizados = products.map((p: any) =>
      String(p.id) === id ? { ...serializeProduct(product), id } : p
    );
    await saveAllRaw(atualizados);
    const atualizado = atualizados.find((p: any) => String(p.id) === id);
    return normalizeProduct(atualizado);
  },

  async delete(id: string): Promise<void> {
    const products = await getAllRaw();
    const filtrados = products.filter((p: any) => String(p.id) !== id);
    await saveAllRaw(filtrados);
  },
};
