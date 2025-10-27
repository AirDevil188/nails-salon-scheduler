import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "../theme";
import AppText from "./AppText";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import Entypo from "@expo/vector-icons/Entypo";
import { useTranslation } from "../hooks/useTranslation";
import { formatAppointmentNumber } from "../utils/formatAppointmentNumber";
import React from "react";

const AppointmentCard = React.memo(({ item, handleOnPress }) => {
  const { t } = useTranslation();

  let gradientColors;
  switch (item.status) {
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
  // Render individual appointment details
  return (
    <Pressable onPress={() => handleOnPress(item)}>
      <View style={styles.itemCard}>
        <View style={styles.itemBorderAndTime}>
          <AppText style={styles.cardTimeHeader}>
            {format(new Date(item.startDateTime), "HH:mm")}
          </AppText>
          <View style={styles.horizontalLine} />
        </View>
        <LinearGradient colors={gradientColors} style={[styles.cardInner]}>
          <View style={styles.headingContainer}>
            <View style={styles.cardTitleContainer}>
              <AppText
                style={[
                  styles.itemTitle,
                  item.status === "scheduled"
                    ? { color: "#924f22" }
                    : item.status === "completed"
                      ? { color: "#1e4720" }
                      : item.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {item.title}
              </AppText>
            </View>
            <View style={styles.apptNumberContainer}>
              <AppText
                style={[
                  styles.itemNumber,
                  item.status === "scheduled"
                    ? { color: "#924f22" }
                    : item.status === "completed"
                      ? { color: "#1e4720" }
                      : item.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {formatAppointmentNumber(item.appNumber)}
              </AppText>
            </View>
            <View style={styles.iconContainer}>
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={
                  item.status === "scheduled"
                    ? "#924f22"
                    : item.status === "completed"
                      ? "#1e4720"
                      : item.status === "canceled"
                        ? "#57212163"
                        : theme.colorLightGrey
                }
              />
            </View>
          </View>
          <View style={styles.cardStatusTimeContainer}>
            <View style={styles.cardTime}>
              <AppText
                style={[
                  styles.itemTime,
                  item.status === "scheduled"
                    ? { color: "#924f22" }
                    : item.status === "completed"
                      ? { color: "#1e4720" }
                      : item.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {format(new Date(item.startDateTime), "HH:mm")} -
                {format(new Date(item.endDateTime), "HH:mm")}
              </AppText>
            </View>
            <View style={styles.iconContainer}>
              <Entypo
                name="dot-single"
                size={24}
                color={
                  item.status === "scheduled"
                    ? "#924f22"
                    : item.status === "completed"
                      ? "#1e4720"
                      : item.status === "canceled"
                        ? "#57212163"
                        : theme.colorLightGrey
                }
              />
            </View>
            <View style={styles.cardStatus}>
              <AppText
                style={[
                  styles.itemStatus,
                  item.status === "scheduled"
                    ? { color: "#924f22" }
                    : item.status === "completed"
                      ? { color: "#1e4720" }
                      : item.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {item.status === "scheduled"
                  ? t("scheduleStatus")
                  : item.status === "completed"
                    ? t("completeStatus")
                    : item.status === "canceled"
                      ? t("cancelStatus")
                      : t("noShowStatus")}
              </AppText>
            </View>
            <View style={styles.iconContainer}>
              <Entypo
                name="dot-single"
                size={24}
                color={
                  item.status === "scheduled"
                    ? "#924f22"
                    : item.status === "completed"
                      ? "#1e4720"
                      : item.status === "canceled"
                        ? "#57212163"
                        : theme.colorLightGrey
                }
              />
            </View>
            <View>
              <AppText
                style={[
                  styles.itemClient,
                  item.status === "scheduled"
                    ? { color: "#924f22" }
                    : item.status === "completed"
                      ? { color: "#1e4720" }
                      : item.status === "canceled"
                        ? { color: "#57212163" }
                        : { color: theme.colorLightGrey },
                ]}
              >
                {item.external_client
                  ? item.external_client
                  : item.user.first_name + " " + item.user.last_name}
              </AppText>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
});

AppointmentCard.displayName = "AppointmentCard";

const styles = StyleSheet.create({
  cardTimeHeader: {
    fontSize: 14,
    fontFamily: "Inter-Light",
  },
  headingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemBorderAndTime: {
    flexDirection: "row",
    width: "100%",
  },
  itemCard: {
    paddingVertical: 15,
    gap: 3,
  },
  cardInner: {
    marginHorizontal: 25,
    padding: 22,
    borderRadius: 15,
    gap: 15,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "black",
    flex: 1,
    alignSelf: "center",
  },
  itemTitle: {
    alignSelf: "flex-start",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
    overflow: "hidden",
  },
  itemTime: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },

  itemNumber: {
    fontSize: 17,
    fontFamily: "Inter-Medium",
  },
  itemStatus: {
    fontFamily: "Inter-Medium",
  },
  itemClient: {
    fontFamily: "Inter-Medium",
  },

  cardTitleContainer: {
    flexDirection: "row",
  },
  cardStatusTimeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default AppointmentCard;
