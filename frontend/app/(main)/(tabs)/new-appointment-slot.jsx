// This screen exists only to reserve the tab slot.
import { useEffect } from "react";
import { router } from "expo-router";

export default function NewAppointmentSlot() {
  // Use useEffect to prevent the screen from ever loading/rendering
  useEffect(() => {
    router.replace("/new-appointment");
  }, []);

  return null;
}
