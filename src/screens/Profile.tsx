import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/(tabs)";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function Profile({ navigation }: any) {
  const screenNavigation = useNavigation<NavProp>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigation.replace('LoginUser');
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, 'users/' + user.uid);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        console.log('Usuário não encontrado no banco');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigation]);

  async function handleLogout() {
    const auth = getAuth();
    await signOut(auth);
    navigation.replace('LoginUser');
  }

  if (loading) {
    return (
      <View style={estilos.center}>
        <ActivityIndicator size="large" color="#198d62"/>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={estilos.background}
      resizeMode="stretch"
    >
      <View style={estilos.container}>
        <Text style={estilos.title}>Perfil</Text>

        {userData ? (
          <View>
            <Text style={estilos.label}>Nome:</Text>
            <Text style={estilos.value}>{userData.name}</Text>

            <Text style={estilos.label}>Email:</Text>
            <Text style={estilos.value}>{userData.email}</Text>

            <Text style={estilos.label}>Telefone:</Text>
            <Text style={estilos.value}>{userData.cellphone}</Text>
          </View>
        ) : (
          <Text>Dados não encontrados</Text>
        )}

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={estilos.botao} onPress={() => screenNavigation.navigate("EditProfile")}>
            <Text style={estilos.textoBotao}>Alterar Dados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botao} onPress={screenNavigation.goBack}>
            <Text style={estilos.textoBotao}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botao} onPress={handleLogout}>
            <Text style={estilos.textoBotao}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    padding: 30
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
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
});


