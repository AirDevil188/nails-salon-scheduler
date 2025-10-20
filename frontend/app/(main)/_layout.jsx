import { Drawer } from "expo-router/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import DrawerToggle from "../../src/components/DrawerToggle";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: true, headerLeft: () => <DrawerToggle /> }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Home",
          title: "Main",
          headerShown: false,
          drawerIcon: () => (
            <MaterialIcons name="home" size={24} color="black" />
          ),
        }}
      />
      <Drawer.Screen
        name="(dashboard)"
        options={{
          headerShown: false,
          drawerLabel: "Admin Dashboard",
          title: "Dashboard",
          drawerIcon: () => (
            <MaterialIcons name="dashboard" size={24} color="black" />
          ),
        }}
      />
    </Drawer>
  );
}
