import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { userKeys } from "../utils/queryKeys";
import useAuthStore from "../stores/useAuthStore";
import { socket } from "../utils/socket";

export const useSocketProfileLister = () => {
  //get the client instance
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleProfileUpdate = (data) => {
      const updatedProfileData = data.profile;

      //  Directly update the TanStack Query cache for the profile key

      queryClient.setQueryData(userKeys.profile, (oldData) => {
        // merge the new profile data with the existing cached data (if any)

        return {
          ...oldData,

          ...updatedProfileData,
        };
      });

      //  Update the authStore for the  language change

      const { setLanguage } = useAuthStore.getState();

      if (updatedProfileData.preferredLanguage) {
        setLanguage(updatedProfileData.preferredLanguage);
      }
    };

    // for user
    socket.on("user:userProfileUpdated", handleProfileUpdate);

    return () => {
      socket.off("user:userProfileUpdated", handleProfileUpdate);
    };
  }, [queryClient]);
};
