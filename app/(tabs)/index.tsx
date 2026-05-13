import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from "../../src/screens/HomeScreen";
import RegisterUser from "../../src/screens/RegisterUser";
import LoginUser from "../../src/screens/LoginUser";
import AreaUser from "../../src/screens/AreaUser";
import EditProfile from "../../src/screens/EditProfile";
import FormProduct from "../../src/screens/FormProduct";

export type RootStackParamList = {

  // Lista de telas a serem chamadas em sequência
  HomeScreen: undefined;
  RegisterUser: undefined;
  LoginUser: undefined;
  AreaUser: undefined;
  EditProfile: undefined;
  FormProduct: { product?: any };
}

const Stack = createStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen}/>
      <Stack.Screen name="RegisterUser" component={RegisterUser}/>
      <Stack.Screen name="LoginUser" component={LoginUser}/>
      <Stack.Screen name="AreaUser" component={AreaUser}/>
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="FormProduct" component={FormProduct}/>
    </Stack.Navigator>
  );
}