import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  TextInput,
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import React, { useEffect, useMemo, useState } from "react";

import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

import { productService } from "../services/products_service";
import { Product } from "../models/Product";
import { cartService } from "../services/cart_service";

export default function ListProducts() {
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = productService.listen((products) => {
      setProducts(products);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function confirmDelete(id: string) {
    if (Platform.OS === "web") {
      if (window.confirm("Tem certeza que deseja excluir?")) {
        handleDelete(id);
      }
      return;
    }

    Alert.alert("Excluir produto", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await productService.delete(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddToCart(product: Product) {
    if (!product.id) {
      Alert.alert("Erro", "Produto inválido.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Atenção", "Faça login para adicionar itens ao carrinho.");
      return;
    }

    try {
      setAddingId(product.id);
      await cartService.addItem(user.uid, product, 1);
      Alert.alert("Sucesso", "Produto adicionado ao carrinho.");
    } catch {
      Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
    } finally {
      setAddingId(null);
    }
  }

  function formatPrice(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const filteredProducts = useMemo(() => {
    const min = minPrice ? Number(minPrice.replace(",", ".")) : null;
    const max = maxPrice ? Number(maxPrice.replace(",", ".")) : null;

    return products.filter((product) => {
      const matchesName = searchName
        ? product.name.toLowerCase().includes(searchName.toLowerCase())
        : true;

      const matchesCategory = searchCategory
        ? product.category.toLowerCase().includes(searchCategory.toLowerCase())
        : true;

      const matchesMin = Number.isFinite(min) && min !== null ? product.price >= min : true;
      const matchesMax = Number.isFinite(max) && max !== null ? product.price <= max : true;

      return matchesName && matchesCategory && matchesMin && matchesMax;
    });
  }, [products, searchName, searchCategory, minPrice, maxPrice]);

  function renderItem({ item }: { item: Product }) {
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: "#999" }}>Sem imagem</Text>
          </View>
        )}

        <Text style={styles.name}>{item.name}</Text>
        <Text>Categoria: {item.category}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text>{item.description}</Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
          disabled={addingId === item.id}
        >
          {addingId === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Adicionar ao carrinho</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.edit}
            onPress={() => navigation.navigate("FormProduct", { product: item })}
          >
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.delete}
            onPress={() => confirmDelete(item.id!)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Excluir</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#198d62" />
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={styles.container}
        >
          <Text style={styles.title}>Produtos</Text>

          <TouchableOpacity style={styles.add} onPress={() => navigation.navigate("FormProduct")}>
            <Text style={styles.btnText}>Cadastrar</Text>
          </TouchableOpacity>

          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Buscar por nome"
              value={searchName}
              onChangeText={setSearchName}
            />

            <TextInput
              style={styles.filterInput}
              placeholder="Categoria"
              value={searchCategory}
              onChangeText={setSearchCategory}
            />

            <View style={styles.priceFiltersRow}>
              <TextInput
                style={[styles.filterInput, styles.priceFilter]}
                placeholder="Preço mín"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.filterInput, styles.priceFilter]}
                placeholder="Preço máx"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id!}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<Text style={{ textAlign: "center" }}>Nenhum produto encontrado</Text>}
          />
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  add: {
    backgroundColor: "#198d62",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filterInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  priceFiltersRow: {
    flexDirection: "row",
    gap: 8,
  },
  priceFilter: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 18, fontWeight: "bold" },
  price: { marginTop: 5, fontSize: 16 },
  cartButton: {
    backgroundColor: "#198d62",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  edit: {
    flex: 1,
    backgroundColor: "#ffaa00",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  delete: {
    flex: 1,
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
