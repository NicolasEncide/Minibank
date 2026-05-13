import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image, TextInput} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/(tabs)";
import { auth } from "../services/connectionFirebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function LoginUser() {

  const navigation = useNavigation<NavProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  async function login(): Promise<void> {

    if (!email || !password) {
      setMessage("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Email inválido");
      return;
    }

    if (password.length < 6) {
      setMessage("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("AreaUser");
      
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

            <Text style={estilos.titulo}>Logar</Text>

            
            {message !== "" && (
              <Text style={[estilos.message,{color: message.includes("sucesso") ? "#00aa00" : "#ff0000"}]}>
                {message}
              </Text>
            )}

            <TextInput
              placeholder="Email"
              placeholderTextColor="#666"
              style={estilos.input}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Senha"
              placeholderTextColor="#666"
              style={estilos.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

          </View>

          <View style={estilos.areaBotao}>

            <TouchableOpacity style={estilos.botao} onPress={login}>
              <Text style={estilos.textoBotao}>Acessar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={estilos.link}>Voltar</Text>
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
    padding: 30
  },

  conteudo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    width: 400,
    height: 200,
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40
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
    width: "100%"
  },

  areaBotao: {
    width: "100%",
    marginBottom: 70
  },

  botao: {
    backgroundColor: "#198d62",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold"
  },

  link: {
    textAlign: "center",
    fontSize: 16,
    color: "#12d38c",
    fontWeight: "bold"
  }
});