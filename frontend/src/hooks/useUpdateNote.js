import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { noteKeys } from "../utils/queryKeys";
import useAuthStore from "../stores/useAuthStore";

export default function useUpdateNote() {
  const queryClient = useQueryClient();
  const { userInfo } = useAuthStore.getState();
  const { role } = userInfo;

  return useMutation({
    mutationKey: noteKeys.update,

    mutationFn: async (payload) => {
      const { id, ...updatedFields } = payload;

      if (role === "admin") {
        const response = await api.patch(`/api/admin/notes/${id}`, payload);
        return response.data.note;
      } else {
        throw Error("You are not authorized to to that");
      }
    },
    onSuccess: (noteUpdatedData, variables) => {
      const noteId = variables.id;

      queryClient.invalidateQueries({
        // Invalidate using the specific ID, allowing partial key match
        queryKey: noteKeys.detail(noteId),
      });
      // main note list (which uses list keys) is refreshed.
      queryClient.invalidateQueries({
        queryKey: noteKeys.list(),
      });
    },
    onError: (error) => {
      console.error("Note update failed:", error);
    },
  });
}
