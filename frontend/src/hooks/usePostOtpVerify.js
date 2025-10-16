import { useMutation } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import useAuthStore from "../stores/useAuthStore";
import { router } from "expo-router";

export function usePostOtpVerify() {
  const { invitationToken, completeOtpStep } = useAuthStore.getState();

  // use tanstack query to send the data

  return useMutation({
    mutationFn: async (otpCode) => {
      if (!invitationToken) {
        throw new Error("Missing Invitation Token");
      }
      const response = await api.post(
        "api/invitations/validate-verification-code",
        {
          token: invitationToken,
          code: otpCode,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // call completeOtpStep func from zustand store and mark isOtpVerified as true
      completeOtpStep();
      router.replace("/invite-flow/final-registration");
    },
    onError: (err) => {},
  });
}
