import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import AppText, { AppTextStyle } from "../../src/components/AppText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppOtpInput from "../../src/components/AppOtpInput";

import { theme } from "../../src/theme";
import { useTranslation } from "../../src/hooks/useTranslation";
import { Link } from "expo-router";
import { usePostOtpVerify } from "../../src/hooks/usePostOtpVerify";

export default function OtpInputScreen() {
  const { t, currentLanguage } = useTranslation();
  const { mutate, error, isPending } = usePostOtpVerify();

  const handleOtpFilled = (otpCode) => {
    if (!isPending) {
      mutate(otpCode);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrapper}>
          <MaterialIcons
            name="email"
            size={55}
            color={theme.colorLightBlue}
            style={styles.emailIcon}
          />
        </View>
        <View style={styles.mainHeadingContainer}>
          <AppText
            style={[
              AppTextStyle.h1,
              currentLanguage === "sr" ? styles.heading_sr : styles.heading,
            ]}
          >
            {t("mainHeading")}
          </AppText>
        </View>
        <View style={styles.instructionContainer}>
          <AppText
            style={[AppTextStyle.h3, styles.instructionText]}
            multiline={true}
            numberOfLines={2}
          >
            {t("informationText")}
          </AppText>
          <AppText
            style={[AppTextStyle.h3, styles.instructionEmail]}
            multiline={true}
            numberOfLines={2}
          >
            example@gmail.com
          </AppText>
        </View>
        <View style={styles.otpInputContainer}>
          <AppOtpInput
            length={6}
            caretColor={theme.colorPink}
            slotTextStyles={{ color: theme.colorBlack }}
            slotStyles={{ borderColor: theme.colorLightGrey }}
            focusedSlotStyles={{ borderColor: theme.colorBlue }}
            focusedSlotTextStyles={{ color: theme.colorBlack }}
            onFilled={handleOtpFilled}
          />
        </View>
        <View style={styles.forgotPasswordContainer}>
          <AppText style={styles.forgotPasswordText}>{t("codeText")}</AppText>
          <Link href={"/final-registration"} style={styles.link}>
            {t("resendLink")}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,

    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",

    alignItems: "center",
    paddingTop: 45,
    gap: 5,
  },
  iconWrapper: {
    marginVertical: 10,
    borderRadius: 100,
    alignSelf: "center",
    padding: 10,
    backgroundColor: theme.colorBlue,
  },
  emailIcon: {},
  mainHeadingContainer: {
    paddingVertical: 20,
    flex: 0,
  },
  instructionContainer: {
    fontSize: 20,
    paddingVertical: 12,
    padding: 12,
    textAlignVertical: "top",
  },
  instructionText: {
    fontFamily: "Inter-Light",
    fontSize: 22,
  },
  instructionEmail: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
  },
  heading: {
    fontFamily: "Inter-Bold",
    fontSize: 35,
  },
  heading_sr: {
    fontSize: 28,
  },
  otpInputContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  forgotPasswordContainer: {
    paddingTop: 15,
    gap: 5,
    flexDirection: "row",
  },
  forgotPasswordText: {
    fontSize: 18,
  },
  link: {
    color: theme.colorBlue,
    fontSize: 18,
    textDecorationLine: "underline",
  },
});
