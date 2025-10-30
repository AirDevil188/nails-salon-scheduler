import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
} from "react-native";

import useGetUserProfile from "..//..//..//src/hooks/useGetUserProfile";
import { SafeAreaView } from "react-native-safe-area-context";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";

import useAuthStore from "../../../src/stores/useAuthStore";
import { disconnectSocket } from "../../../src/utils/socket";
import api from "../../../src/utils/axiosInstance";
import { clearSecureStorage } from "../../../src/utils/secureStore";
import formatDate from "../../../src/utils/formatDate";
import { useTranslation } from "../../../src/hooks/useTranslation";
import { theme } from "../../../src/theme";
import AppText, { AppTextStyle } from "../../../src/components/AppText";
import { format } from "date-fns";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import useUploadProfileAvatar from "../../../src/hooks/useUploadProfileAvatar";

const IMAGE_TRANSFORMATIONS = "c_fill,w_150,h_150,g_center";

const getTransformedAvatarUrl = (fullUrl) => {
  // The required insertion point in the Cloudinary URL
  const insertionPoint = "image/upload/";

  if (fullUrl.includes(insertionPoint)) {
    // Replace 'image/upload/' with 'image/upload/[transformations]/'
    // This ensures the URL format is correct: .../upload/t_string/v1234/public_id
    return fullUrl.replace(
      insertionPoint,
      `image/upload/${IMAGE_TRANSFORMATIONS}/`
    );
  }

  // If the URL doesn't contain the expected upload segment, return it as is or the fallback
  return fullUrl;
};

export default function IndexScreen() {
  const { data, isFetching, isFetched } = useGetUserProfile();
  const { mutate: uploadAvatar, isPending } = useUploadProfileAvatar();
  const { userInfo, logout, preferredLanguage } = useAuthStore.getState();
  const { t } = useTranslation();

  // 3. Logic to handle opening the gallery and initiating the upload
  const pickImage = async () => {
    try {
      // NOTE: Cannot import external packages like ImagePicker here, but the call logic is correct.
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return Alert.alert("Enable photo access");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;

        uploadAvatar(imageUri, {
          onSuccess: (res) => {
            // Success handler in the mutation hook updates TanStack Query cache,
            // which causes currentProfile.avatar and the Image key to change.
          },
          onError: () => Alert.alert("Upload failed"),
        });
      }
    } catch (err) {
      console.error("Image Picker Error:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while opening the image picker."
      );
    }
  };

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
    const currentProfile = data.profile;

    // The input `currentProfile.avatar` is the unique, versioned path.
    const finalAvatarUrl = currentProfile.avatar
      ? getTransformedAvatarUrl(currentProfile.avatar)
      : "https://placehold.co/150";
    console.warn("FINAL AVATAR URL:", finalAvatarUrl);

    return (
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={{
            width: 48,
            height: 32,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          onLongPress={() => router.push(__DEV__ ? "/_sitemap" : "/")}
        />
        <ScrollView style={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.generalInformation}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: finalAvatarUrl }}
                  style={styles.userAvatar}
                  onError={(e) =>
                    console.log("Image failed to load:", e.nativeEvent.error)
                  }
                />
                <TouchableOpacity
                  style={styles.cameraIconContainer}
                  onPress={isPending ? null : pickImage}
                  disabled={isPending}
                >
                  <Feather name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

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
    marginBottom: -29,
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
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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
  avatarContainer: {
    position: "relative",

    alignSelf: "center",
    marginBottom: 10,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colorDarkPink,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colorWhite,
    zIndex: 10,
  },
});
