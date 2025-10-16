import api from "../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export function useValidateInvitation(invitationToken) {
  return useQuery({
    queryKey: ["validateToken", invitationToken],

    queryFn: async () => {
      try {
        const response = await api.get(
          `api/invitations/validate-token?token=${invitationToken}`
        );

        return response.data;
      } catch (err) {
        console.error("Error inside queryFn:", err);
        throw err;
      }
    },
    enabled: !!invitationToken,
    retry: false,
    staleTime: Infinity,
    cacheTime: 0,
  });
}
