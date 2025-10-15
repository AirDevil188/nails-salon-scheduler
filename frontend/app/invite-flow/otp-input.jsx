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
import AppButton from "../../src/components/AppButton";
import { Link } from "expo-router";

export default function OtpInputScreen() {
  const { t } = useTranslation();
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
          <AppText style={(AppTextStyle.h1, styles.heading)}>
            {t("mainHeading")}
          </AppText>
        </View>
        <View style={styles.instructionContainer}>
          <AppText
            style={[AppTextStyle.h3, styles.instructionText]}
            multiline={true}
            numberOfLines={2}
          >
            Enter the verification code sent to
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
          />
        </View>
        <View style={styles.forgotPasswordContainer}>
          <AppText style={styles.forgotPasswordText}>
            Didn't get a code?
          </AppText>
          <AppText style={styles.link}>resend</AppText>
        </View>
        <View style={styles.buttonContainer}>
          <AppButton>Verify Invitation</AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",

    alignItems: "center",
    paddingTop: 90,
    gap: 5,
  },
  iconWrapper: {
    borderRadius: 100,
    alignSelf: "center",
    padding: 10,
    backgroundColor: theme.colorBlue,
  },
  emailIcon: {},
  mainHeadingContainer: {
    height: 100,

    flex: 0,
  },
  instructionContainer: {
    fontSize: 20,
    padding: 12,
    textAlignVertical: "top",
  },
  instructionText: {
    fontFamily: "Inter-Light",
    fontSize: 24,
  },
  instructionEmail: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
  },
  heading: {
    fontFamily: "Inter-Bold",
    fontSize: 35,
  },
  otpInputContainer: {
    flex: 1,
  },
  forgotPasswordContainer: {
    paddingTop: 15,
    gap: 5,
    flexDirection: "row",
  },
  forgotPasswordText: {
    fontSize: 20,
  },
  link: {
    color: theme.colorBlue,
    fontSize: 20,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    alignSelf: "stretch",
    padding: 20,
    marginBottom: 40,
  },
});
