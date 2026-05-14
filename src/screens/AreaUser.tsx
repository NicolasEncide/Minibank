import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "./Home";
import Profile from "./Profile";
import Products from "./Products";
import Cart from "./Cart";
import {
  enableForegroundNotifications,
  registerFcmTokenForCurrentUser,
} from "../services/notifications_service";

const Tab = createBottomTabNavigator();

export default function AreaUser() {
  useEffect(() => {
    registerFcmTokenForCurrentUser();

    let unsubscribe: null | (() => void) = null;

    enableForegroundNotifications().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Products") {
            iconName = "shirt";
          } else {
            iconName = "cart";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Products" component={Products} />
      <Tab.Screen name="Cart" component={Cart} options={{ title: "Carrinho" }} />
    </Tab.Navigator>
  );
}
