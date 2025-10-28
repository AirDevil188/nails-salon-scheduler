import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { appointmentKeys } from "../utils/queryKeys";
import { socket } from "../utils/socket";

export const useSocketAppointmentListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const removeAppointmentFromCache = (deletedAppointmentId) => {
      if (!deletedAppointmentId) return;

      // physically delete the specific detail record from the cache
      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(deletedAppointmentId),
      });

      // manually update the list cache to remove the item instantly
      queryClient.setQueryData(appointmentKeys.list(), (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return [];

        // Filter out the deleted appointment
        return oldData.filter((appt) => appt.id !== deletedAppointmentId);
      });

      // Invalidate list queries for a safe background refetch on filtered views
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });
    };

    // creation and update handle data
    const handleAppointmentData = (data) => {
      const newAppointment = data.appointment;

      if (!newAppointment || !newAppointment.id) return;

      // invalidate the list query (for filtered lists)
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });

      // update the single-appointment detail query
      queryClient.setQueryData(
        appointmentKeys.detail(newAppointment.id),
        newAppointment
      );

      // update the un-filtered list cache (for instant display)
      queryClient.setQueryData(appointmentKeys.list(), (oldData) => {
        if (!oldData || !Array.isArray(oldData)) {
          return [newAppointment];
        }

        const isExisting = oldData.some(
          (appt) => appt.id === newAppointment.id
        );

        if (isExisting) {
          // if it exists, map and replace the old version with the new one
          return oldData.map((appt) =>
            appt.id === newAppointment.id ? newAppointment : appt
          );
        }

        // Prepend it to the list (new item)
        return [newAppointment, ...oldData];
      });
    };

    // handle User Deletion Event ---
    const handleUserDeleted = (appointmentId) => {
      removeAppointmentFromCache(appointmentId);
    };

    socket.on("appointment:created", handleAppointmentData);
    socket.on("user:appointment:deleted", handleUserDeleted);

    return () => {
      socket.off("appointment:created", handleAppointmentData);
      socket.off("user:appointment:deleted", handleUserDeleted);
    };
  }, [queryClient]);
};
