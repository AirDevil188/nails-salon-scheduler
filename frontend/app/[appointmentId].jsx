import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AppText from "../src/components/AppText";
import { useTranslation } from "../src/hooks/useTranslation";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { enUS, srLatn } from "date-fns/locale";
import useGetAppointmentDetails from "../src/hooks/useGetAppointmentDetails";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../src/theme";
import { useEffect, useState } from "react";
import { AppointmentEditHeader } from "../src/components/AppointmentHeaderEdit";
export default function AppointmentDetails() {
  const { appointmentId } = useLocalSearchParams();
  const [deleteEnable, setDeleteEnable] = useState(false);

  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();

  const { data, isLoading } = useGetAppointmentDetails(appointmentId);

  useEffect(() => {
    if (data && navigation && appointmentId) {
      const date = new Date();
      const start = new Date(data.startDateTime);
      if (date > start) {
        setDeleteEnable(false);
      } else {
        setDeleteEnable(true);
      }
      navigation.setOptions({
        title: data.title,

        headerRight: () => (
          <AppointmentEditHeader
            appointmentId={appointmentId}
            deleteEnable={deleteEnable}
          />
        ),
      });
    }
  }, [data, navigation, appointmentId, deleteEnable]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  let gradientColors;
  switch (data.status) {
    case "scheduled":
      gradientColors = theme.gradientScheduled;
      break;
    case "completed":
      gradientColors = theme.gradientCompleted;
      break;
    case "no_show":
      gradientColors = theme.gradientNoShow;
      break;
    case "canceled":
      gradientColors = theme.gradientCanceled;
      break;
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.cardContainer}>
        <LinearGradient style={styles.card} colors={gradientColors}>
          <View style={styles.cardTitle}>
            <AppText
              style={[
                styles.titlePlaceholder,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {t("appointmentDetailsTitle")}
            </AppText>
            <AppText
              style={[
                styles.title,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {data.title}
            </AppText>
          </View>
          <View style={styles.cardStatus}>
            <AppText
              style={[
                styles.statusPlaceholder,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {t("appointmentDetailsStatus")}
            </AppText>
            <AppText
              style={[
                styles.status,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {data.status === "scheduled"
                ? t("scheduleStatus")
                : data.status === "completed"
                  ? t("completeStatus")
                  : data.status === "canceled"
                    ? t("cancelStatus")
                    : t("noShowStatus")}
            </AppText>
          </View>
          <View style={styles.cardStartDateTime}>
            <AppText
              style={[
                styles.startDateTimePlaceholder,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {t("appointmentDetailsStartDateTime")}
            </AppText>
            <AppText
              style={[
                styles.startDateTime,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {currentLanguage === "sr"
                ? format(
                    new Date(data.startDateTime),
                    "EEEE, dd. MMM yyyy. 'u' HH:mm",
                    {
                      locale: srLatn,
                    }
                  )
                : format(
                    new Date(data.startDateTime),
                    "E, MMM do, yyyy 'at' h:mm a",
                    {
                      locale: enUS,
                    }
                  )}
            </AppText>
          </View>
          <View style={styles.cardEndDateTime}>
            <AppText
              style={[
                styles.endDateTimePlaceholder,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {t("appointmentDetailsEndDateTime")}
            </AppText>
            <AppText
              style={[
                styles.endDateTime,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {currentLanguage === "sr"
                ? format(
                    new Date(data.endDateTime),
                    "EEEE, dd. MMM yyyy. 'u' HH:mm",
                    { locale: srLatn }
                  )
                : format(
                    new Date(data.endDateTime),
                    "E, MMM do, yyyy 'at' h:mm a",
                    { locale: enUS }
                  )}
            </AppText>
          </View>
          <View style={styles.cardClient}>
            <AppText
              style={[
                styles.clientPlaceholder,
                data.status === "scheduled"
                  ? { color: "#924f22" }
                  : data.status === "completed"
                    ? { color: "#1e4720" }
                    : data.status === "canceled"
                      ? { color: "#57212163" }
                      : { color: theme.colorLightGrey },
              ]}
            >
              {t("appointmentDetailsUser")}
            </AppText>

            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/ddxkbe6lh/image/upload/v1760806079/nails_appointment_app/avatars/avatar_default_gehjeg.png", // placeholder
                }}
                width={100}
                height={100}
              />
              <AppText
                style={[
                  styles.client,
                  data.status === "scheduled"
                    ? { color: "#924f22" }
                    : data.status === "completed"
                      ? { color: "#1e4720" }
                      : data.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {data.external_client
                  ? data.external_client
                  : data.user?.first_name + " " + data.user?.last_name}
              </AppText>
            </View>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    padding: 20,
  },

  card: {
    padding: 20,
    shadowColor: "#1E1E1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 15,
  },
  cardTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 20,
    paddingBottom: 10,
  },
  cardStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
  },
  cardStartDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
  },
  cardEndDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
  },
  cardClient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
  },

  titlePlaceholder: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  statusPlaceholder: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  startDateTimePlaceholder: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  endDateTimePlaceholder: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  clientPlaceholder: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  client: {
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },
  title: {
    fontFamily: "Inter-Medium",
  },
  startDateTime: {
    fontFamily: "Inter-Medium",
  },
  endDateTime: {
    fontFamily: "Inter-Medium",
  },
  status: {
    fontFamily: "Inter-Medium",
  },
});
