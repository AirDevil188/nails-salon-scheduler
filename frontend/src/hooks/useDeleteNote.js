import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../stores/useAuthStore";
import api from "../utils/axiosInstance";
import { noteKeys } from "../utils/queryKeys";

export default function useDeleteNote() {
  const { userInfo } = useAuthStore.getState();
  const role = userInfo.role;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (role === "admin") {
        const response = await api.delete(`/api/admin/notes/${id}`);
        return response.data;
      }

      throw new Error("Unauthorized: Only admins can delete appointments.");
    },
    onSuccess: (noteId) => {
      // immediately removes the deleted appointment's data from memory.
      queryClient.removeQueries({
        queryKey: noteKeys.detail(noteId),
      });

      // invalidate the whole list this forces the calendar and for example appt list to refetch
      queryClient.invalidateQueries({
        queryKey: noteKeys.list(),
      });
    },
  });
}
