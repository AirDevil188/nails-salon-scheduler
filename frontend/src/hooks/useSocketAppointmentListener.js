import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { appointmentKeys } from "../utils/queryKeys";
import { socket } from "../utils/socket";

export const useSocketAppointmentListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleAppointmentData = (appointment) => {
      if (!appointment || !appointment.id) return;

      // update detailCache
      queryClient.setQueryData(
        appointmentKeys.detail(appointment.id),
        appointment
      );

      queryClient.setQueryData(appointmentKeys.list(), (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return [appointment];
        const exists = oldData.some((a) => a.id === appointment.id);
        // if the appt exists return the existing one
        return exists
          ? oldData.map((a) => (a.id === appointment.id ? appointment : a))
          : // return the old list
            [appointment, ...oldData];
        // prepend the new one and keep the old data
      });

      queryClient.invalidateQueries({ queryKey: appointmentKeys.list() });
      console.log(
        `[Socket User] Appointment created/updated ID: ${appointment.id}`
      );
    };

    const handleAppointmentDeleted = (appointmentId) => {
      if (!appointmentId) return;

      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(appointmentId),
      });
      // remove instantly appt if in detail view don't wait for refetch

      queryClient.setQueryData(
        appointmentKeys.list(),
        (oldData) => oldData?.filter((a) => a.id !== appointmentId) || []
      );

      // find the deleted one one remove it from cache

      queryClient.invalidateQueries({ queryKey: appointmentKeys.list() });
      console.log(`[Socket User] Appointment deleted ID: ${appointmentId}`);
    };

    // attach listeners
    socket.on("user:appointment:created", handleAppointmentData);
    socket.on("user:appointment:updated", handleAppointmentData);
    socket.on("user:appointment:deleted", handleAppointmentDeleted);

    // cleanup
    return () => {
      socket.off("user:appointment:created", handleAppointmentData);
      socket.off("user:appointment:updated", handleAppointmentData);
      socket.off("user:appointment:deleted", handleAppointmentDeleted);
      console.log("[Socket User] Listener cleanup done");
    };
  }, [queryClient]);
};
