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
import api, { setAuthHeader } from "../src/utils/axiosInstance";
import { clearSecureStorage, getToken } from "../src/utils/secureStore";
import { connectSocket } from "../src/utils/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../src/hooks/useTranslation";
import { AppointmentEditHeader } from "../src/components/AppointmentHeaderEdit";
import SocketInitializer from "../src/components/SocketInitializer";
import * as SecureStore from "expo-secure-store"; // Assuming this is imported

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

  // Helper to perform the token refresh logic during startup
  const attemptSilentRefresh = async (storedRefreshToken) => {
    // NOTE: This logic assumes 'api' is available in this scope.

    const response = await api.post("/api/token/refresh", {
      refreshToken: storedRefreshToken,
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    // Update SecureStore with new tokens
    await SecureStore.setItemAsync("accessToken", newAccessToken);
    await SecureStore.setItemAsync("refreshToken", newRefreshToken);

    // Update state/headers with the new tokens
    const { login } = useAuthStore.getState();
    const storedUserInfo = await getToken("userInfo"); // Re-retrieve or pass userInfo
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

    setAuthHeader(newAccessToken);
    login(newAccessToken, newRefreshToken, userInfo);

    return newAccessToken;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { login, setIsLoading, logout } = useAuthStore.getState();
      setIsLoading(true);

      let storedAccessToken = null;
      let storedRefreshToken = null;
      let userInfo = null;

      try {
        // get stored tokens form expo-secure
        storedAccessToken = await getToken("accessToken");
        storedRefreshToken = await getToken("refreshToken");
        const storedUserInfo = await getToken("userInfo");
        userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

        // check if the required tokens and userInfo are initialized
        if (storedAccessToken && storedRefreshToken && userInfo) {
          try {
            // try to get a brand new refresh token
            const freshAccessToken =
              await attemptSilentRefresh(storedRefreshToken);

            // connect the socket with that fresh return token
            connectSocket(freshAccessToken);
          } catch (refreshErr) {
            // if refresh fails force logout
            console.warn(
              "Silent refresh failed on startup. Tokens were too old/revoked.",
              refreshErr
            );
            logout();
            await clearSecureStorage();
          }
        } else {
          // No valid session found, logout
          logout();
          await clearSecureStorage();
        }
      } catch (err) {
        // catch all unexpected errors during storage access
        logout();
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
      {isLoggedIn && <SocketInitializer />}
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
              <Stack.Screen
                name="new-note"
                options={{
                  headerTitle: t("notesCreateHeaderTitle"),
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
