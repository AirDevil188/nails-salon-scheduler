import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../stores/useAuthStore";
import api from "../utils/axiosInstance";
import { appointmentKeys } from "../utils/queryKeys";

export default function useDeleteAppointment() {
  const { userInfo } = useAuthStore.getState();
  const role = userInfo.role;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (role === "admin") {
        const response = await api.delete(`/api/admin/appointments/${id}`);
        return response.data;
      }

      throw new Error("Unauthorized: Only admins can delete appointments.");
    },
    onSuccess: (appointmentId) => {
      // immediately removes the deleted appointment's data from memory.
      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(appointmentId),
      });

      // invalidate the whole list this forces the calendar and for example appt list to refetch
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    },
  });
}
