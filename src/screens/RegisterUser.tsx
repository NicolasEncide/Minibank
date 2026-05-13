import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/(tabs)";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../services/connectionFirebase";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function RegisterUser() {
  const navigation = useNavigation<NavProp>();

  const [name, setName] = useState("");
  const [cellphone, setCellPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");


function formatPhone(value: string) {

  let cleaned = value.replace(/\D/g, "");

  cleaned = cleaned.slice(0, 11);

  if (cleaned.length > 0) {
    cleaned = cleaned.replace(/^(\d{2})(\d)/g, "($1) $2");
  }

  if (cleaned.length > 10) {
    cleaned = cleaned.replace(/(\d{5})(\d)/, "$1-$2");
  } else {
    cleaned = cleaned.replace(/(\d{4})(\d)/, "$1-$2");
  }

  return cleaned;
}

  async function Register() {

    if (!name || !email || !password || !cellphone) {
      setMessage("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Email inválido");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/.test(password)) {
      setMessage("Senha deve ter no mínimo 6 caracteres, 1 número, 1 letra maiúscula, 1 letra minúsucla e 1 caractere especial");
      return;
    }

    if (cellphone.replace(/\D/g, "").length < 11) {
      setMessage("Telefone inválido");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (user) {
        await set(ref(database, "users/" + user.uid), {
          uid: user.uid,
          name,
          cellphone,
          email,
          createdAt: new Date().toISOString(),
        });
      }

      setMessage("Usuário cadastrado com sucesso!");

      // limpar campos
      setName("");
      setCellPhone("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigation.navigate("LoginUser");
      }, 800);
      
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={estilos.container}
          resizeMode="stretch"
        >
          <View style={estilos.conteudo}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={estilos.logo}
            />

            <Text style={estilos.titulo}>Criar Conta</Text>

            {message !== "" && (
              <Text style={[estilos.message,{color: message.includes("sucesso") ? "#00aa00" : "#ff0000"}]}>
                {message}
              </Text>
            )}

            <TextInput
              placeholder="Nome completo"
              placeholderTextColor="#666"
              style={estilos.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#666"
              style={estilos.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Telefone"
              placeholderTextColor="#666"
              style={estilos.input}
              value={cellphone}
              onChangeText={(text) => setCellPhone(formatPhone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <TextInput
              placeholder="Senha"
              placeholderTextColor="#666"
              style={estilos.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={estilos.areaBotao}>
            <TouchableOpacity style={estilos.botao} onPress={Register}>
              <Text style={estilos.textoBotao}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("LoginUser")}>
              <Text style={estilos.link}>Já tenho uma conta</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    padding: 30,
  },

  conteudo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 400,
    height: 200,
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#000",
    borderWidth: 4,
    fontSize: 18,
    marginBottom: 20,
    width: "100%",
  },

  areaBotao: {
    width: "100%",
    marginBottom: 70,
  },

  botao: {
    backgroundColor: "#198d62",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    fontSize: 16,
    color: "#12d38c",
    fontWeight: "bold",
  }
});