import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { appointmentKeys } from "../utils/queryKeys";
import { socket } from "../utils/socket";

export const useAdminSocketListener = (shouldListen) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shouldListen || !socket) return;

    const handleAppointmentData = (appointment) => {
      if (!appointment || !appointment.id) return;

      // Update detail cache
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id, "admin"),
        appointment
      );

      // Update list cache
      queryClient.setQueryData(appointmentKeys.list(), (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return [appointment];
        const exists = oldData.some((a) => a.id === appointment.id); // check if the appt is already in cache

        return exists
          ? oldData.map((a) => (a.id === appointment.id ? appointment : a))
          : // if the appt exists return old data keep all other appt unchanged
            [appointment, ...oldData];
        // else prepend new appt to the list and return the old one
      });

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
        exact: false,
      });
      console.log(
        `[Socket Admin] Appointment created/updated ID: ${appointment.id}`
      );
    };

    const handleAppointmentDeleted = (appointmentId) => {
      if (!appointmentId) return;

      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(appointmentId, "admin"),
      });
      // of an admin has a detail view open for  appointment it clears it immediately.

      queryClient.setQueryData(
        appointmentKeys.list(),
        (oldData) => oldData?.filter((a) => a.id !== appointmentId) || []
      );
      // updates the cached list of appointments to remove the deleted one.

      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
        exact: false,
      });
      console.log(`[Socket Admin] Appointment deleted ID: ${appointmentId}`);
    };

    // Attach listeners
    socket.on("admin:appointment:created", handleAppointmentData);
    socket.on("admin:appointment:updated", handleAppointmentData);
    socket.on("admin:appointment:deleted", handleAppointmentDeleted);

    // Cleanup
    return () => {
      socket.off("admin:appointment:created", handleAppointmentData);
      socket.off("admin:appointment:updated", handleAppointmentData);
      socket.off("admin:appointment:deleted", handleAppointmentDeleted);
      console.log("[Socket Admin] Listener cleanup done");
    };
  }, [queryClient, shouldListen]);
};
