import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import React, { useState } from "react";

import { useNavigation, useRoute } from "@react-navigation/native";

import { productService } from "../services/products_service";
import { Product } from "../models/Product";

export default function FormProduct() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editingProduct = route.params?.product || null;

  const [name, setName] = useState(editingProduct?.name || "");
  const [category, setCategory] = useState(editingProduct?.category || "");
  const [description, setDescription] = useState(editingProduct?.description || "");

  const [price, setPrice] = useState(
    editingProduct?.price ? formatSavedPrice(editingProduct.price) : ""
  );

  const [image, setImage] = useState(editingProduct?.image || "");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function formatCurrency(value: string) {
    const numeric = value.replace(/\D/g, "");
    const number = Number(numeric) / 100;

    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatSavedPrice(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function handleSave() {
    if (saving) return;

    if (!name.trim() || !category.trim() || !description.trim()) {
      setMessage("Preencha todos os campos");
      return;
    }

    const numericPrice = Number(price.replace(/\D/g, "")) / 100;

    if (!numericPrice || numericPrice <= 0) {
      setMessage("Preço inválido");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const data: Product = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: numericPrice,
        image: image.trim(),
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);

        setMessage("Produto atualizado com sucesso!");
      } else {
        await productService.create(data);

        setMessage("Produto cadastrado com sucesso!");

        setName("");
        setCategory("");
        setDescription("");
        setPrice("");
        setImage("");
      }

      setTimeout(() => navigation.goBack(), 800);
    } catch {
      setMessage("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={styles.container}
          resizeMode="stretch"
        >
          <View style={styles.content}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />

            <Text style={styles.title}>
              {editingProduct ? "Editar Produto" : "Cadastrar Produto"}
            </Text>

            {message !== "" && (
              <Text
                style={[
                  styles.message,
                  {
                    color: message.includes("sucesso")
                      ? "#00aa00"
                      : "#ff0000",
                  },
                ]}
              >
                {message}
              </Text>
            )}

            <TextInput
              placeholder="Nome"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Categoria"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
            />

            <TextInput
              placeholder="Preço"
              style={styles.input}
              value={price}
              onChangeText={(text) => setPrice(formatCurrency(text))}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Descrição"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              placeholder="URL da imagem (opcional)"
              style={styles.input}
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.areaButton}>
            <TouchableOpacity
              style={[styles.button, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {editingProduct ? "Salvar Alterações" : "Cadastrar"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={navigation.goBack}
              disabled={saving}
            >
              <Text style={styles.buttonText}>Voltar</Text>
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
    padding: 30,
    justifyContent: "space-between",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 400,
    height: 200,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },

  message: {
    fontSize: 16,
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 15,
    width: "100%",
  },

  areaButton: {
    marginBottom: 50,
  },

  button: {
    backgroundColor: "#198d62",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
