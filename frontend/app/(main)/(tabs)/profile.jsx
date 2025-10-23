import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  View,
} from "react-native";

import useGetUserProfile from "..//..//..//src/hooks/useGetUserProfile";
import { SafeAreaView } from "react-native-safe-area-context";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import Feather from "@expo/vector-icons/Feather";

import useAuthStore from "../../../src/stores/useAuthStore";
import { disconnectSocket } from "../../../src/utils/socket";
import { useProfileStore } from "../../../src/stores/useProfileStore";
import api from "../../../src/utils/axiosInstance";
import { clearSecureStorage } from "../../../src/utils/secureStore";
import formatDate from "../../../src/utils/formatDate";
import { useTranslation } from "../../../src/hooks/useTranslation";
import { theme } from "../../../src/theme";
import AppText, { AppTextStyle } from "../../../src/components/AppText";
import { format } from "date-fns";

export default function IndexScreen() {
  const { data, isFetching, isFetched } = useGetUserProfile();
  const { userInfo, logout, preferredLanguage } = useAuthStore.getState();
  const { t } = useTranslation();
  const { profileData, setProfileData } = useProfileStore.getState();
  console.log(data);

  const handleLogOut = () => {
    // invalidate active refreshToken

    Alert.alert(t("logoutAlert"), "", [
      {
        text: t("yesPlaceholder"),
        onPress: async () => {
          const { refreshToken } = useAuthStore.getState();
          await api.delete("api/token/refresh/invalidate", {
            data: {
              refreshToken: refreshToken,
            },
          });
          await clearSecureStorage();
          logout();
          disconnectSocket();
          return router.replace("/sign-in");
        },
        style: "destructive",
      },
      { text: t("noPlaceholder"), style: "cancel" },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("deleteProfileAlert"), "", [
      {
        text: t("yesPlaceholder"),
        onPress: async () => {
          await clearSecureStorage();
          logout();
          return router.replace("/sign-in");
        },
        style: "destructive",
      },
      { text: t("noPlaceholder"), style: "cancel" },
    ]);
  };

  if (isFetched) {
    setProfileData(data.profile);
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.generalInformation}>
              <Image
                source={{ uri: data.profile.avatar }}
                style={styles.userAvatar}
              />

              <AppText style={[AppTextStyle.h2, styles.text]}>
                {data.profile.first_name + " " + data.profile.last_name}
              </AppText>
              <AppText style={[AppText.h3, styles.text]}>
                {t("createdPlaceholder")}

                {preferredLanguage === "sr"
                  ? formatDate(data.profile.createdAt)
                  : format(data.profile.createdAt, "MMM do, yyyy.")}
              </AppText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.generalProfileInformation}>
                <View style={styles.cardItem}>
                  <View style={styles.cardIconLabelContainer}>
                    <MaterialIcons
                      name="alternate-email"
                      size={24}
                      color="black"
                    />
                    <AppText style={AppTextStyle.defaultText}>
                      {t("emailPlaceholder")}
                    </AppText>
                  </View>
                  <View style={styles.valueContainer}>
                    <AppText style={{ width: "100%" }}>
                      {data.profile.email}
                    </AppText>
                  </View>
                </View>
                <View style={styles.cardItem}>
                  <View style={styles.cardIconLabelContainer}>
                    <Feather name="user" size={24} color="black" />
                    <AppText style={AppTextStyle.defaultText}>
                      {t("rolePlaceholder")}
                    </AppText>
                  </View>
                  <View style={styles.valueContainer}>
                    <AppText
                      style={(AppTextStyle.defaultText, [{ width: "100%" }])}
                    >
                      {preferredLanguage === "sr" && userInfo.role === "user"
                        ? "Korisnik"
                        : null}

                      {preferredLanguage === "en" && userInfo.role === "user"
                        ? "User"
                        : null}
                      {preferredLanguage === "en" ||
                      (preferredLanguage === "sr" && userInfo.role === "admin")
                        ? "Admin"
                        : null}
                    </AppText>
                  </View>
                </View>
              </View>
              <View style={styles.settings}>
                <Pressable
                  style={styles.cardButton}
                  onPress={() => console.log("pressed")}
                >
                  <View style={styles.cardItem}>
                    <View style={styles.cardIconLabelContainer}>
                      <MaterialIcons name="password" size={24} color="black" />
                      <AppText style={AppTextStyle.defaultText}>
                        {t("changePasswordPlaceholder")}
                      </AppText>
                    </View>
                    <View style={styles.valueContainer}>
                      <MaterialIcons
                        name="keyboard-arrow-right"
                        size={24}
                        color="black"
                      />
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  style={styles.cardButton}
                  onPress={handleDeleteAccount}
                >
                  <View style={styles.cardItem}>
                    <View style={styles.cardIconLabelContainer}>
                      <MaterialCommunityIcons
                        name="trash-can"
                        size={24}
                        color={theme.colorRedError}
                        style={{
                          paddingRight: 3,
                        }}
                      />
                      <AppText
                        style={[AppTextStyle.defaultText, styles.logout]}
                      >
                        {t("deleteProfilePlaceholder")}
                      </AppText>
                    </View>
                    <View style={styles.valueContainer}>
                      <MaterialIcons
                        name="keyboard-arrow-right"
                        size={24}
                        color={theme.colorRedError}
                      />
                    </View>
                  </View>
                </Pressable>
                <Pressable style={styles.cardButton} onPress={handleLogOut}>
                  <View style={styles.cardItem}>
                    <View style={styles.cardIconLabelContainer}>
                      <MaterialIcons
                        name="logout"
                        size={24}
                        color={theme.colorRedError}
                      />
                      <AppText
                        style={[AppTextStyle.defaultText, styles.logout]}
                      >
                        {t("logutPlaceholder")}
                      </AppText>
                    </View>
                    <View style={styles.valueContainer}>
                      <MaterialIcons
                        name="keyboard-arrow-right"
                        size={24}
                        color={theme.colorRedError}
                      />
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    marginBottom: -34,
    backgroundColor: "#1E1E1E",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE",
    alignItems: "center",
  },
  userAvatar: {
    alignSelf: "center",
    width: 200,
    height: 200,
  },
  generalInformation: {
    backgroundColor: "#1E1E1E",
    paddingTop: 20,
    paddingBottom: 40,
    width: "100%",
  },
  generalProfileInformation: {
    gap: 20,
    backgroundColor: "#F6F6F6",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  settings: {
    gap: 20,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#F6F6F6",
  },
  cardContent: {
    padding: 20,
    flex: 1,
    alignSelf: "stretch",
    gap: 20,
    shadowColor: "#1E1E1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "#FEFEFE",
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 5,
  },
  text: {
    textAlign: "center",
    color: "#fff",
  },
  cardIconLabelContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  logout: {
    color: theme.colorRedError,
    fontFamily: "Inter-Regular",
  },
  cardButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
