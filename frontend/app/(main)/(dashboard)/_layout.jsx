import { Link, Tabs } from "expo-router";

import { theme } from "../../../src/theme";
import DrawerToggle from "../../../src/components/DrawerToggle";

export default function TabsLayout() {
  // mount listener for the profile
  // useSocketProfileLister();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        title: "Appointments",
        headerLeft: () => <DrawerToggle />,
      }}
    >
      <Tabs.Screen name="users" options={{ title: "Users" }} />
      <Tabs.Screen name="invitations" options={{ title: "Invitations" }} />
    </Tabs>
  );
}
