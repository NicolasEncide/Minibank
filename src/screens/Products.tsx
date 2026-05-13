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
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import React, { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import {
  productService,
  Product,
} from "../services/products_service";

export default function ListProducts() {
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    } else {
      Alert.alert("Excluir produto", "Tem certeza?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => handleDelete(id),
        },
      ]);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await productService.delete(id);
    } finally {
      setDeletingId(null);
    }
  }

  function formatPrice(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

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

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.edit}
            onPress={() =>
              navigation.navigate("FormProduct", { product: item })
            }
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

          <TouchableOpacity
            style={styles.add}
            onPress={() => navigation.navigate("FormProduct")}
          >
            <Text style={styles.btnText}>Cadastrar</Text>
          </TouchableOpacity>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id!}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={{ textAlign: "center" }}>
                Nenhum produto
              </Text>
            }
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
    marginBottom: 20,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  image: {
    width: "100%",
    height: 270,
    borderRadius: 10,
    marginBottom: 10,
  },

  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  name: { fontSize: 18, fontWeight: "bold" },

  price: { marginTop: 5, fontSize: 16 },

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