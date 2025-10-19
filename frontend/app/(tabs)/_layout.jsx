import { Link, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Protected guard={true}>
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      </Tabs.Protected>
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
