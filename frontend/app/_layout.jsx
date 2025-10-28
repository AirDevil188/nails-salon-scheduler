import { Link, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import useAuthStore from "../src/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../src/theme";
import { setAuthHeader } from "../src/utils/axiosInstance";
import { clearSecureStorage, getToken } from "../src/utils/secureStore";
import { connectSocket } from "../src/utils/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../src/hooks/useTranslation";
import { AppointmentEditHeader } from "../src/components/AppointmentHeaderEdit";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    // 💡 Map the font family name (your choice) to the local file path
    "Inter-Light": require("../assets/fonts/Inter-Light.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-Italic": require("../assets/fonts/Inter-Italic.ttf"),
    "Inter-MediumItalic": require("../assets/fonts/Inter-MediumItalic.ttf"),
    "Inter-BoldItalic": require("../assets/fonts/Inter-BoldItalic.ttf"),
    // Add any other weights you plan to use
  });
  const { isLoggedIn, isSigningUp, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const { login, setIsLoading } = useAuthStore.getState();
      setIsLoading(true);
      try {
        // get tokens from expo-secure store
        const storedAccessToken = await getToken("accessToken");
        const storedRefreshToken = await getToken("refreshToken");
        const storedUserInfo = await getToken("userInfo");

        const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

        // if storedAccessToken is present
        if (storedAccessToken && storedRefreshToken && userInfo) {
          setAuthHeader(storedAccessToken);

          login(storedAccessToken, storedRefreshToken, userInfo);
          connectSocket(storedAccessToken);
        }
      } catch (err) {
        useAuthStore.getState().logout();
        await clearSecureStorage();
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <ActivityIndicator
        animating={true}
        color={theme.colorBlue}
        size={"large"}
      />
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <React.Fragment>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Protected guard={isLoggedIn}>
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen
                name="edit-profile"
                options={{
                  title: "Edit Profile",
                  presentation: "modal",
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="[appointmentId]"
                options={{
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="new-appointment"
                options={{
                  headerTitle: t("appointmentModalTitle"),
                  presentation: "modal",
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="update-appointment"
                options={{
                  headerTitle: t("appointmentModalUpdateTitle"),
                  presentation: "modal",
                  headerShown: true,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn && !isSigningUp}>
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Screen name="invite-flow" options={{ headerShown: false }} />
          </Stack>
        </React.Fragment>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
