import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, TouchableOpacity, TextInput } from "react-native";
import { getAuth, updateEmail } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/(tabs)";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function EditProfile({ navigation }: any) {
  const screenNavigation = useNavigation<NavProp>();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

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

  useEffect(() => {
  if (!user) {
    navigation.replace("LoginUser");
    return;
  }

  const db = getDatabase();
  const userRef = ref(db, "users/" + user.uid);

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setName(data.name);
        setEmail(data.email);
        setCellphone(data.cellphone);
      }
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, [user]);

  async function handleUpdate() {
    if (!name || !email || !cellphone) {
      setMessage("Preencha todos os campos");
      return;
    }

    try {
      const db = getDatabase();

      // atualizar email no auth
      if (user && user.email !== email) {
        await updateEmail(user, email);
      }

      // atualizar email no database
      await update(ref(db, "users/" + user?.uid), {
        name,
        email,
        cellphone,
      });


      setMessage("Perfil atualizado com sucesso!");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <View style={estilos.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={estilos.container}
      resizeMode="stretch"
    >
      <View style={estilos.conteudo}>

        <Ionicons style={estilos.icon} name="person-circle-outline" size={100} color="#000" />

        <Text style={estilos.titulo}>Editar Perfil</Text>

        {message !== "" && (
          <Text
            style={[
              estilos.message,
              {
                color: message.includes("sucesso")
                  ? "#00aa00"
                  : "#ff0000",
              }
            ]}
          >
            {message}
          </Text>
        )}

        <TextInput
          placeholder="Nome completo"
          style={estilos.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email"
          style={estilos.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Telefone"
          style={estilos.input}
          value={cellphone}
          onChangeText={(text) => setCellphone(formatPhone(text))}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <View style={estilos.areaBotao}>
        <TouchableOpacity style={estilos.botao} onPress={handleUpdate}>
          <Text style={estilos.textoBotao}>Salvar alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botao} onPress={screenNavigation.goBack}>
          <Text style={estilos.textoBotao}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 30,
  },

  icon: {
    alignSelf: "center",
    marginBottom: 10,
  },

  conteudo: {
    flex: 1,
    justifyContent: "center",
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
    marginBottom: 50,
  },

  botao: {
    backgroundColor: "#198d62",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});