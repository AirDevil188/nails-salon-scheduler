import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import useAuthStore from "../src/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ActivityIndicator } from "react-native";
import { theme } from "../src/theme";
import { setAuthHeader } from "../src/utils/axiosInstance";
import { clearSecureStorage, getToken } from "../src/utils/secureStore";

const queryClient = new QueryClient();

export default function RootLayout() {
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
      const { login, logout, setIsLoading } = useAuthStore.getState();
      setIsLoading(true);
      try {
        // get tokens from expo-secure store
        const storedAccessToken = await getToken("accessToken");
        const storedRefreshToken = await getToken("refreshToken");
        const storedUserInfo = await getToken("userInfo");

        const userInfo = JSON.parse(storedUserInfo);

        setAuthHeader(storedAccessToken);

        // if storedAccessToken is present
        if (storedAccessToken) {
          login(storedAccessToken, storedRefreshToken, userInfo);
        }
      } catch (err) {
        logout();
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
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
