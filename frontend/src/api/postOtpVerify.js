import { useQuery } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import useAuthStore from "../stores/useAuthStore";
import { router } from "expo-router";

export async function postOtpVerify(otpCode) {
  const { completeOtpStep, invitationToken } = useAuthStore.getState();

  //  if  invitation token is not found redirect
  if (!invitationToken) {
    console.error("No invitation token for OTP was found");
    router.replace("/sign-in");
    return;
  }

  // else if found fetch the data
  try {
    const response = await api.post(
      "/api/invitations/validate-verification-code",
      {
        token: invitationToken,
        code: otpCode,
        // eslint-disable-next-line prettier/prettier
      }
    );

    // if  response is okay
    if (response.status === 200) {
      completeOtpStep();
      router.replace("/invite-flow/final-registration");
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}
