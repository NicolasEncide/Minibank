import { database } from "./connectionFirebase";
import { Product } from "../models/Product";
import { get, off, onValue, ref, runTransaction, set, update } from "firebase/database";
import { shippingService, ShippingMode } from "./shipping_service";

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartCoupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  expiresAt?: string;
  active: boolean;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface CartData {
  items: CartItem[];
  shippingMode: ShippingMode;
  cep: string;
  region: string;
  couponCode: string;
  summary: CartSummary;
  updatedAt: string;
}

const COUPONS: CartCoupon[] = [
  {
    code: "DESC10",
    type: "percent",
    value: 10,
    expiresAt: "2099-12-31T23:59:59.000Z",
    active: true,
  },
  {
    code: "MENOS20",
    type: "fixed",
    value: 20,
    expiresAt: "2099-12-31T23:59:59.000Z",
    active: true,
  },
];

function getCartPath(uid: string) {
  return `carts/${uid}`;
}

function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function getCoupon(code: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  return COUPONS.find((coupon) => coupon.code === normalized) ?? null;
}

function calculateSubtotal(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
}

function calculateShipping(shippingMode: ShippingMode, cep: string) {
  if (shippingMode === "fixed") {
    return {
      shipping: shippingService.getFixedShippingValue(),
      region: "Fixo",
      cep: "",
    };
  }

  const result = shippingService.calculateByCep(cep);

  return {
    shipping: result.shipping,
    region: result.region,
    cep: result.cep,
  };
}

function calculateDiscount(subtotal: number, couponCode: string) {
  const coupon = getCoupon(couponCode);

  if (!coupon || !coupon.active) return 0;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 0;

  if (coupon.type === "percent") {
    return (subtotal * coupon.value) / 100;
  }

  return coupon.value;
}

function normalizeCart(raw: Partial<CartData> | null | undefined): CartData {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const shippingMode = raw?.shippingMode === "region" ? "region" : "fixed";
  const cep = raw?.cep ?? "";
  const couponCode = normalizeCouponCode(raw?.couponCode ?? "");

  const subtotal = calculateSubtotal(items);
  const shippingResult = calculateShipping(shippingMode, cep);
  const hasItems = items.length > 0;
  const shipping = hasItems ? shippingResult.shipping : 0;
  const discount = hasItems ? Math.min(calculateDiscount(subtotal, couponCode), subtotal) : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  return {
    items,
    shippingMode,
    cep: shippingResult.cep,
    region: shippingResult.region,
    couponCode,
    summary: {
      subtotal,
      shipping,
      discount,
      total,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function getNormalizedCart(uid: string) {
  const cartRef = ref(database, getCartPath(uid));
  const snapshot = await get(cartRef);
  return normalizeCart(snapshot.val());
}

export const cartService = {
  getAvailableCoupons() {
    return COUPONS;
  },

  validateCoupon(code: string, subtotal: number) {
    const normalized = normalizeCouponCode(code);
    const coupon = getCoupon(normalized);

    if (!coupon) {
      return { valid: false, message: "Cupom não encontrado." };
    }

    if (!coupon.active) {
      return { valid: false, message: "Cupom inativo." };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "Cupom expirado." };
    }

    return { valid: true, message: "Cupom aplicado com sucesso." };
  },

  async ensureCart(uid: string) {
    const cartRef = ref(database, getCartPath(uid));

    await runTransaction(cartRef, (current) => {
      if (current) {
        return normalizeCart(current);
      }

      return normalizeCart({
        items: [],
        shippingMode: "fixed",
        cep: "",
        couponCode: "",
      });
    });
  },

  listen(uid: string, callback: (cart: CartData) => void) {
    const cartRef = ref(database, getCartPath(uid));

    onValue(cartRef, (snapshot) => {
      const value = snapshot.val();
      callback(
        normalizeCart(
          value ?? {
            items: [],
            shippingMode: "fixed",
            cep: "",
            couponCode: "",
          }
        )
      );
    });

    return () => off(cartRef);
  },

  async addItem(uid: string, product: Product, quantity = 1) {
    const productId = product.id;

    if (!productId) {
      throw new Error("Produto inválido para o carrinho.");
    }

    const cartRef = ref(database, getCartPath(uid));

    await runTransaction(cartRef, (current) => {
      const cart = normalizeCart(current);
      const existing = cart.items.find((item) => item.productId === productId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          product,
          quantity,
        });
      }

      return normalizeCart(cart);
    });
  },

  async incrementItem(uid: string, productId: string) {
    const cartRef = ref(database, getCartPath(uid));

    await runTransaction(cartRef, (current) => {
      const cart = normalizeCart(current);
      const existing = cart.items.find((item) => item.productId === productId);

      if (!existing) return cart;

      existing.quantity += 1;
      return normalizeCart(cart);
    });
  },

  async decrementItem(uid: string, productId: string) {
    const cartRef = ref(database, getCartPath(uid));

    await runTransaction(cartRef, (current) => {
      const cart = normalizeCart(current);
      const existing = cart.items.find((item) => item.productId === productId);

      if (!existing) return cart;

      if (existing.quantity <= 1) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
      } else {
        existing.quantity -= 1;
      }

      return normalizeCart(cart);
    });
  },

  async removeItem(uid: string, productId: string) {
    const cartRef = ref(database, getCartPath(uid));

    await runTransaction(cartRef, (current) => {
      const cart = normalizeCart(current);
      cart.items = cart.items.filter((item) => item.productId !== productId);
      return normalizeCart(cart);
    });
  },

  async clear(uid: string) {
    const cartRef = ref(database, getCartPath(uid));
    await set(
      cartRef,
      normalizeCart({
        items: [],
        shippingMode: "fixed",
        cep: "",
        couponCode: "",
      })
    );
  },

  async applyCoupon(uid: string, couponCode: string) {
    const cartRef = ref(database, getCartPath(uid));
    const cart = await getNormalizedCart(uid);
    const validation = cartService.validateCoupon(couponCode, cart.summary.subtotal);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    await update(
      cartRef,
      normalizeCart({
        ...cart,
        couponCode: normalizeCouponCode(couponCode),
      })
    );
  },

  async removeCoupon(uid: string) {
    const cartRef = ref(database, getCartPath(uid));
    const cart = await getNormalizedCart(uid);

    await update(
      cartRef,
      normalizeCart({
        ...cart,
        couponCode: "",
      })
    );
  },

  async updateShipping(uid: string, shippingMode: ShippingMode, cep: string) {
    const cartRef = ref(database, getCartPath(uid));
    const cart = await getNormalizedCart(uid);

    await update(
      cartRef,
      normalizeCart({
        ...cart,
        shippingMode,
        cep,
      })
    );
  },
};
