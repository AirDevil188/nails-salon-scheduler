import { Link, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import useAuthStore from "../src/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../src/theme";
import api, { setAuthHeader } from "../src/utils/axiosInstance";
import {
  clearSecureStorage,
  getToken,
  saveToken,
} from "../src/utils/secureStore";
import { connectSocket } from "../src/utils/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../src/hooks/useTranslation";
import { AppointmentEditHeader } from "../src/components/AppointmentHeaderEdit";
import SocketInitializer from "../src/components/SocketInitializer";
import * as SecureStore from "expo-secure-store";
import AntDesign from "@expo/vector-icons/AntDesign";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    "Inter-Light": require("../assets/fonts/Inter-Light.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-Italic": require("../assets/fonts/Inter-Italic.ttf"),
    "Inter-MediumItalic": require("../assets/fonts/Inter-MediumItalic.ttf"),
    "Inter-BoldItalic": require("../assets/fonts/Inter-BoldItalic.ttf"),
  });
  const { isLoggedIn, isSigningUp, isLoading } = useAuthStore();

  let refreshInterval;

  let appState = AppState.currentState;

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        try {
          const storedRefreshToken = await getToken("refreshToken");
          if (storedRefreshToken) {
            await attemptSilentRefresh(storedRefreshToken);
            console.log("Token refreshed on app resume.");
          }
        } catch (err) {
          if (err.message === "TOKEN_EXPIRED") {
            console.warn("Refresh token expired on resume. Logging out.");
            useAuthStore.getState().logout();
            await clearSecureStorage();
          } else if (err.message === "NETWORK_ERROR") {
            console.warn(
              "Network issue on resume, retry later. User stays logged in."
            );
          } else {
            console.error("Unhandled error during resume token refresh:", err);
            useAuthStore.getState().logout();
            await clearSecureStorage();
          }
        }
      }
      appState = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const startPeriodicRefresh = async () => {
    // Clear any existing interval
    if (refreshInterval) clearInterval(refreshInterval);

    const refreshRate = 12 * 60 * 1000; // 12 minutes (access token expires in 15min)

    refreshInterval = setInterval(async () => {
      try {
        const storedRefreshToken = await getToken("refreshToken");
        if (storedRefreshToken) {
          await attemptSilentRefresh(storedRefreshToken);
          console.log("Periodic silent refresh successful.");
        }
      } catch (err) {
        if (err.message === "TOKEN_EXPIRED") {
          console.warn("Refresh token expired. Logging out.");
          useAuthStore.getState().logout();
          await clearSecureStorage();
          clearInterval(refreshInterval);
        } else if (err.message === "NETWORK_ERROR") {
          console.warn(
            "Network issue during periodic refresh. Will retry later."
          );
        } else {
          console.error("Unhandled error during periodic refresh:", err);
          useAuthStore.getState().logout();
          await clearSecureStorage();
          clearInterval(refreshInterval);
        }
      }
    }, refreshRate);
  };

  const attemptSilentRefresh = async (storedRefreshToken) => {
    try {
      const response = await api.post("/api/token/refresh", {
        refreshToken: storedRefreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data;

      // Update SecureStore with new tokens
      await SecureStore.setItemAsync("accessToken", newAccessToken);
      await SecureStore.setItemAsync("refreshToken", newRefreshToken);

      const { login } = useAuthStore.getState();
      const storedUserInfo = await getToken("userInfo");
      const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

      setAuthHeader(newAccessToken);
      login(newAccessToken, newRefreshToken, userInfo);
      connectSocket(newAccessToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      // Differentiate between error causes
      if (error.response) {
        if (error.response.status === 401) {
          // Refresh token invalid or expired
          throw new Error("TOKEN_EXPIRED");
        } else {
          // Other backend issues
          throw new Error("REFRESH_FAILED");
        }
      } else if (error.request) {
        // Network / timeout issues
        throw new Error("NETWORK_ERROR");
      } else {
        // Unknown unexpected error
        throw new Error("UNKNOWN_ERROR");
      }
    }
  };
  useEffect(() => {
    const initializeAuth = async () => {
      const { login, setIsLoading, logout } = useAuthStore.getState();
      setIsLoading(true);

      try {
        const storedAccessToken = await getToken("accessToken");
        const storedRefreshToken = await getToken("refreshToken");
        const storedUserInfo = await getToken("userInfo");
        const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

        if (storedAccessToken && storedRefreshToken && userInfo) {
          try {
            // Try to silently refresh the tokens
            const { accessToken: freshAccessToken } =
              await attemptSilentRefresh(storedRefreshToken);

            connectSocket(freshAccessToken);

            startPeriodicRefresh();
          } catch (refreshErr) {
            if (refreshErr.message === "TOKEN_EXPIRED") {
              console.warn(
                "Silent refresh failed on startup: refresh token expired. Logging out."
              );
              logout();
              await clearSecureStorage();
            } else if (refreshErr.message === "NETWORK_ERROR") {
              console.warn(
                "Network issue during startup refresh. Keeping user logged in until reconnection."
              );
              // You can optionally retry after delay or show offline banner
            } else {
              console.error(
                "Unhandled error during startup token refresh:",
                refreshErr
              );
              logout();
              await clearSecureStorage();
            }
          }
        } else {
          logout();
          await clearSecureStorage();
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        logout();
        await clearSecureStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
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
                  presentation: "fullScreenModal",
                  headerLeft: () => {
                    return (
                      <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign
                          name="arrow-left"
                          size={24}
                          color={theme.colorDarkPink}
                        />
                      </TouchableOpacity>
                    );
                  },
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="notes/[noteId]"
                options={{ headerShown: true }}
              ></Stack.Screen>
              <Stack.Screen
                name="update-note"
                options={{ headerTitle: t("noteUpdateTitle") }}
              ></Stack.Screen>
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
