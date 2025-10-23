import { Link, Tabs } from "expo-router";

import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { theme } from "../../../src/theme";
import DrawerToggle from "../../../src/components/DrawerToggle";
import { useState } from "react";
import useLayoutStore from "../../../src/stores/useLayoutStore";

export default function TabsLayout() {
  const isListView = useLayoutStore((state) => state.isListView);
  const toggleListView = useLayoutStore((state) => state.toggleListView);

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
                <MaterialIcons
                  name="edit"
                  size={24}
                  color={theme.colorDarkPink}
                />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Calendar",
          headerRight: () => (
            <Pressable style={{ marginRight: 18 }} onPress={toggleListView}>
              {isListView ? (
                <FontAwesome
                  name="calendar"
                  size={24}
                  color={theme.colorDarkPink}
                />
              ) : (
                <MaterialIcons
                  name="format-list-bulleted"
                  size={24}
                  color={theme.colorDarkPink}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="notes" options={{ title: "Notes" }} />
    </Tabs>
  );
}
