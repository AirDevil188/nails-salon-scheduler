import { DrawerActions, useNavigation } from "@react-navigation/native";
import { theme } from "../theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable } from "react-native";
import useAuthStore from "../stores/useAuthStore";

export default function DrawerToggle() {
  const navigation = useNavigation();
  const { userInfo, isLoggedIn } = useAuthStore.getState();
  const { role } = userInfo;

  if (role === "user" || !isLoggedIn) {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 16 }}
    >
      <MaterialIcons
        name="admin-panel-settings"
        size={30}
        color={theme.colorBlue}
      />
    </Pressable>
  );
}
