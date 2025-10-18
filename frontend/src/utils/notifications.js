import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export async function getDevicePushToken() {
  let token = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // 2. Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // if permission is denied log a warning and stop
  if (finalStatus !== "granted") {
    console.warn("Failed to get push token: Notification permissions denied!");
    return null;
  }
  // get the token
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token granted successfully");
  } catch (err) {
    console.log("Error when trying to retrive Expo push token:", err);
  }
  return token;
}
