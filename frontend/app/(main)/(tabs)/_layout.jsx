import { Link, Tabs } from "expo-router";

import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { theme } from "../../../src/theme";
import DrawerToggle from "../../../src/components/DrawerToggle";
import useLayoutStore from "../../../src/stores/useLayoutStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useTranslation } from "../../../src/hooks/useTranslation";
import FabButton from "../../../src/components/FabButton";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
  const isListView = useLayoutStore((state) => state.isListView);
  const toggleListView = useLayoutStore((state) => state.toggleListView);
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colorDarkPink,
        headerShown: true,
        headerLeft: () => <DrawerToggle />,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Fontisto name="female" size={size} color={color} />
          ),
          title: t("tabProfile"),
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
        name="notes"
        options={{
          title: t("tabNotes"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-appointment-slot"
        options={{
          title: "",
          tabBarButton: (props) => <FabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" size={size} color={color} />
          ),
          title: t("tabCalendar"),
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
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
