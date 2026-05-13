import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/(tabs)";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
    const navigation = useNavigation<NavProp>();

    return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <ImageBackground source={require("../../assets/images/background.png")} style={estilos.container} resizeMode="stretch">

          <View style={estilos.conteudo}>
            
            <Image
              source={require("../../assets/images/logo.png")}
              style={estilos.logo}
            />

            <Text style={estilos.subtitulo}>
              Seu controle financeiro simples e inteligente
            </Text>

          </View>

          <View style={estilos.areaBotao}>
            <View>
              <TouchableOpacity style={estilos.botao} onPress={() => navigation.navigate("LoginUser")}>
                <Text style={estilos.textoBotao}>Login</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity style={estilos.botao} onPress={() => navigation.navigate("RegisterUser")}>
                <Text style={estilos.textoBotao}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

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
    height: 400,
    resizeMode: "contain",
    marginTop: -130
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitulo: {
    fontSize: 22,
    textAlign: "center",
    marginTop: -120
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
  }
});