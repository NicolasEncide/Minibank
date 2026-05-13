import { database } from "./connectionFirebase";
import {
  ref,
  push,
  get,
  update,
  remove,
  onValue,
  off,
} from "firebase/database";

export interface Product {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  createdAt?: string;
}

const PATH = "products";

export const productService = {
  async create(product: Product) {
    const productRef = ref(database, PATH);

    await push(productRef, {
      ...product,
      createdAt: new Date().toISOString(),
    });
  },

  async getAll(): Promise<Product[]> {
    const snapshot = await get(ref(database, PATH));
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data).map(([id, value]) => ({
      id,
      ...(value as Product),
    }));
  },

  listen(callback: (products: Product[]) => void) {
    const productsRef = ref(database, PATH);

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        callback([]);
        return;
      }

      const products = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Product),
      }));

      callback(products);
    });

    return () => off(productsRef);
  },

  async updateProduct(id: string, product: Product) {
    const productRef = ref(database, `${PATH}/${id}`);
    await update(productRef, product);
  },

  async delete(id: string) {
    const productRef = ref(database, `${PATH}/${id}`);
    await remove(productRef);
  },
};