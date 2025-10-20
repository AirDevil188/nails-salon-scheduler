import { Link, Tabs } from "expo-router";

import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { theme } from "../../../src/theme";
import DrawerToggle from "../../../src/components/DrawerToggle";

export default function TabsLayout() {
  // mount listener for the profile
  // useSocketProfileLister();
  return (
    <Tabs
      screenOptions={{ headerShown: true, headerLeft: () => <DrawerToggle /> }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerRight: () => (
            <Link href={"/edit-profile"} asChild>
              <Pressable style={{ marginRight: 18 }}>
                <MaterialIcons name="edit" size={24} color="black" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ title: "Calendar" }} />
      <Tabs.Screen name="notes" options={{ title: "Notes" }} />
    </Tabs>
  );
}
