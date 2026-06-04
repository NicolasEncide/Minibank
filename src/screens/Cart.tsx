import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import { cartService, CartData, CartItem } from "../services/cart_service";
import { ShippingMode } from "../services/shipping_service";
import { notifyCheckoutFinished, triggerSimpleNotification } from "../services/cart_notifications_service";

const EMPTY_CART: CartData = {
  items: [],
  shippingMode: "fixed",
  cep: "",
  region: "Fixo",
  couponCode: "",
  summary: {
    subtotal: 0,
    shipping: 15,
    discount: 0,
    total: 15,
  },
  updatedAt: "",
};

export default function Cart() {
  const [cart, setCart] = useState<CartData>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [cepInput, setCepInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [shippingMode, setShippingMode] = useState<ShippingMode>("fixed");

  const user = getAuth().currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    cartService.ensureCart(uid).finally(() => setLoading(false));

    const unsubscribe = cartService.listen(uid, (value) => {
      setCart(value);
      setShippingMode(value.shippingMode);
      setCepInput(value.cep);
      setCouponInput(value.couponCode);
    });

    return unsubscribe;
  }, [uid]);

  function formatPrice(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function withSave(action: () => Promise<void>, onSuccess?: () => Promise<void> | void) {
    if (!uid || saving) return;

    try {
      setSaving(true);
      await action();
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir a ação.";
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  }

  function confirmClear() {
    if (!uid) return;

    if (Platform.OS === "web") {
      if (window.confirm("Deseja limpar todo o carrinho?")) {
        withSave(() => cartService.clear(uid), async () => {
          await triggerSimpleNotification(uid, {
            title: "Carrinho limpo",
            body: "Todos os itens do seu carrinho foram removidos.",
            data: { type: "cart-cleared" },
          });
        });
      }
      return;
    }

    Alert.alert("Limpar carrinho", "Deseja remover todos os itens?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpar",
        style: "destructive",
        onPress: () =>
          withSave(() => cartService.clear(uid), async () => {
            await triggerSimpleNotification(uid, {
              title: "Carrinho limpo",
              body: "Todos os itens do seu carrinho foram removidos.",
              data: { type: "cart-cleared" },
            });
          }),
      },
    ]);
  }

  function getItemsCount() {
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  async function finalizeCart() {
    if (!uid) return;
    if (cart.items.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens antes de finalizar.");
      return;
    }

    const total = cart.summary.total;
    const itemsCount = getItemsCount();

    await withSave(
      async () => {
        await cartService.clear(uid);
      },
      async () => {
        await notifyCheckoutFinished(uid, total, itemsCount);
        Alert.alert("Sucesso", "Pedido finalizado e notificação enviada.");
      }
    );
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.card}>
        {item.product.image ? (
          <Image source={{ uri: item.product.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.product.name}</Text>
          <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
          <Text style={styles.smallText}>Subtotal do item: {formatPrice(item.product.price * item.quantity)}</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => withSave(() => cartService.decrementItem(uid!, item.productId))}
              disabled={saving}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantityValue}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => withSave(() => cartService.incrementItem(uid!, item.productId))}
              disabled={saving}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() =>
                withSave(() => cartService.removeItem(uid!, item.productId), async () => {
                  await triggerSimpleNotification(uid!, {
                    title: "Item removido",
                    body: `${item.product.name} foi removido do carrinho.`,
                    data: { type: "cart-item-removed", productId: item.productId },
                  });
                })
              }
              disabled={saving}
            >
              <Text style={styles.removeButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#198d62" />
        <Text>Carregando carrinho...</Text>
      </SafeAreaView>
    );
  }

  if (!uid) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Faça login para usar o carrinho.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={styles.container}
          resizeMode="stretch"
        >
          <Text style={styles.title}>Carrinho</Text>

          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.productId}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frete</Text>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, shippingMode === "fixed" && styles.modeButtonActive]}
                onPress={() => {
                  setShippingMode("fixed");
                  withSave(() => cartService.updateShipping(uid, "fixed", ""));
                }}
              >
                <Text style={styles.modeButtonText}>Fixo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, shippingMode === "region" && styles.modeButtonActive]}
                onPress={() => {
                  setShippingMode("region");
                  withSave(() => cartService.updateShipping(uid, "region", cepInput));
                }}
              >
                <Text style={styles.modeButtonText}>Por CEP</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CEP"
                value={cepInput}
                onChangeText={setCepInput}
                keyboardType="numeric"
                editable={shippingMode === "region"}
              />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => withSave(() => cartService.updateShipping(uid, shippingMode, cepInput))}
                disabled={saving}
              >
                <Text style={styles.actionButtonText}>Recalcular</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.smallText}>Região: {cart.region}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cupom</Text>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Digite o cupom"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  withSave(() => cartService.applyCoupon(uid, couponInput), async () => {
                    await triggerSimpleNotification(uid, {
                      title: "Cupom aplicado",
                      body: `Cupom ${couponInput.toUpperCase()} aplicado com sucesso.`,
                      data: { type: "coupon-applied", couponCode: couponInput.toUpperCase() },
                    });
                  })
                }
                disabled={saving}
              >
                <Text style={styles.actionButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>

            {cart.couponCode ? (
              <TouchableOpacity
                style={styles.removeCouponButton}
                onPress={() => withSave(() => cartService.removeCoupon(uid))}
                disabled={saving}
              >
                <Text style={styles.removeCouponText}>Remover cupom ({cart.couponCode})</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.smallText}>Cupons disponíveis: DESC10, MENOS20</Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>Subtotal: {formatPrice(cart.summary.subtotal)}</Text>
            <Text style={styles.summaryText}>Frete: {formatPrice(cart.summary.shipping)}</Text>
            <Text style={styles.summaryText}>Desconto: -{formatPrice(cart.summary.discount)}</Text>
            <Text style={styles.summaryTotal}>Total: {formatPrice(cart.summary.total)}</Text>

            <TouchableOpacity style={styles.clearButton} onPress={confirmClear} disabled={saving}>
              <Text style={styles.clearButtonText}>Limpar carrinho</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkoutButton} onPress={finalizeCart} disabled={saving}>
              <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 8,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
    fontSize: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    marginTop: 4,
    fontSize: 14,
  },
  quantityRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#198d62",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  quantityValue: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  removeButton: {
    marginLeft: "auto",
    backgroundColor: "#d63939",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#198d62",
    paddingVertical: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#198d62",
  },
  modeButtonText: {
    color: "#111",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  actionButton: {
    borderRadius: 8,
    backgroundColor: "#198d62",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  removeCouponButton: {
    marginTop: 8,
  },
  removeCouponText: {
    color: "#cc2f2f",
    fontWeight: "bold",
  },
  smallText: {
    marginTop: 8,
    color: "#444",
    fontSize: 12,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  summaryText: {
    marginBottom: 4,
  },
  summaryTotal: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 6,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: "#d63939",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: "#198d62",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
