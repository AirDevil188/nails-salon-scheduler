// src/components/AppointmentEditHeader.jsx
import { View, TouchableOpacity } from "react-native";
import { Link, useLocalSearchParams } from "expo-router"; // 🔑 Use hook here
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme";

export function AppointmentEditHeader({ appointmentId }) {
  console.error(appointmentId);
  // 🔑 Access the ID via the route segment name

  if (!appointmentId) return null;

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
        // 🛑 Pass the ID as a query parameter named 'id' to the target screen
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

      {/* Delete button (static link, adjust href if necessary) */}
      <Link href={"/edit-profile"} asChild>
        <TouchableOpacity>
          <MaterialIcons name="delete" size={24} color={theme.colorDarkPink} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
