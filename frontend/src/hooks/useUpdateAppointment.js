import useAuthStore from "../stores/useAuthStore";
import api from "../utils/axiosInstance";
import { appointmentKeys } from "../utils/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { userInfo } = useAuthStore.getState();
  const role = userInfo?.role;

  return useMutation({
    mutationKey: appointmentKeys.update,

    mutationFn: async (payload) => {
      const { id, ...updatedFields } = payload;

      if (role === "admin") {
        const response = await api.patch(
          `/api/admin/appointments/${id}`,
          updatedFields
        );
        console.error(response);
        return response.data.appointment;
      }
    },
    onSuccess: (updatedAppointmentData, variables) => {
      const appointmentId = variables.id;

      queryClient.invalidateQueries({
        // Invalidate using the specific ID, allowing partial key match
        queryKey: appointmentKeys.detail(appointmentId),
      });
      // main appointment list (which uses list keys) is refreshed.
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    },
    onError: (error) => {
      console.error("Appointment update failed:", error);
    },
  });
}
