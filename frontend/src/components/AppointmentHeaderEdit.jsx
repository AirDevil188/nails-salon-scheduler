// src/components/AppointmentEditHeader.jsx
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Link, router, useSegments } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";
import { useTranslation } from "../hooks/useTranslation";
import api from "../utils/axiosInstance";
import useDeleteAppointment from "../hooks/useDeleteAppointment";
import { useState } from "react";
import useDeleteNote from "../hooks/useDeleteNote";

export function AppointmentEditHeader({ appointmentId, deleteEnable }) {
  const segments = useSegments();
  const noteScreen = segments.includes("notes");

  const { t } = useTranslation();
  const deleteAppointmentMutation = useDeleteAppointment();
  const deleteNoteMutation = useDeleteNote();
  if (!appointmentId) return null;

  const handleDelete = () => {
    Alert.alert(!noteScreen ? t("appointmentAlert") : t("noteAlert"), "", [
      {
        text: t("yesPlaceholder"),
        onPress: async () => {
          if (!noteScreen) {
            deleteAppointmentMutation.mutate(appointmentId, {
              onSuccess: () => {
                router.back();
              },
            });
          } else {
            deleteNoteMutation.mutate(appointmentId, {
              onSuccess: () => {
                router.back();
              },
            });
          }
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
        href={
          !noteScreen
            ? { pathname: "/update-appointment", params: { id: appointmentId } }
            : { pathname: "/update-note", params: { noteId: appointmentId } }
        }
        asChild
      >
        <TouchableOpacity style={{ backgroundColor: "transparent" }}>
          <MaterialIcons name="edit" size={24} color={theme.colorDarkPink} />
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        onPress={handleDelete}
        disabled={deleteEnable ? false : true}
      >
        <MaterialIcons
          name="delete"
          size={24}
          color={deleteEnable ? theme.colorDarkPink : "#cccccc"}
        />
      </TouchableOpacity>
    </View>
  );
}
