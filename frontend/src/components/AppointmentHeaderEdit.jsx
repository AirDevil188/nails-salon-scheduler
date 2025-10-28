// src/components/AppointmentEditHeader.jsx
import { View, TouchableOpacity, Alert } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router"; // 🔑 Use hook here
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { useTranslation } from "../hooks/useTranslation";
import api from "../utils/axiosInstance";
import useDeleteAppointment from "../hooks/useDeleteAppointment";

export function AppointmentEditHeader({ appointmentId }) {
  const { t } = useTranslation();
  const deleteAppointmentMutation = useDeleteAppointment();
  if (!appointmentId) return null;

  const handleDelete = () => {
    Alert.alert(t("appointmentAlert"), "", [
      {
        text: t("yesPlaceholder"),
        onPress: async () => {
          deleteAppointmentMutation.mutate(appointmentId, {
            onSuccess: () => {
              router.back();
            },
          });
        },
        style: "destructive",
      },
      { text: t("noPlaceholder"), style: "cancel" },
    ]);
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        padding: 10,
        marginRight: 10,
      }}
    >
      <Link
        href={{
          pathname: "/update-appointment",
          params: { id: appointmentId },
        }}
        asChild
      >
        <TouchableOpacity style={{ backgroundColor: "transparent" }}>
          <MaterialIcons name="edit" size={24} color={theme.colorDarkPink} />
        </TouchableOpacity>
      </Link>

      <TouchableOpacity onPress={handleDelete}>
        <MaterialIcons name="delete" size={24} color={theme.colorDarkPink} />
      </TouchableOpacity>
    </View>
  );
}
