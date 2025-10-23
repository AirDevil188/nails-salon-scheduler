import { Redirect, Stack } from "expo-router";
import useAuthStore from "../../src/stores/useAuthStore";

export default function RootLayout() {
  const { isLoggedIn, isSigningUp, isLoading, isOtpVerified } = useAuthStore();

  if (isLoggedIn) {
    <Redirect href={"/(tabs)"} />;
  }

  return (
    <Stack>
      <Stack.Protected guard={!isSigningUp && !isOtpVerified && !isLoggedIn}>
        <Stack.Screen
          name="[token]"
          options={{ title: "Verify Invitation", headerShown: false }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isSigningUp && !isOtpVerified && !isLoggedIn}>
        <Stack.Screen
          name="otp-input"
          options={{ title: "Enter Verification Code", headerShown: false }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isSigningUp && isOtpVerified}>
        <Stack.Screen
          name="final-registration"
          options={{ title: "Complete Your Account", headerShown: false }}
        />
      </Stack.Protected>
    </Stack>
  );
}
