import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import AppText, { AppTextStyle } from "../../src/components/AppText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppOtpInput from "../../src/components/AppOtpInput";

import { theme } from "../../src/theme";
import { useTranslation } from "../../src/hooks/useTranslation";
import { Link } from "expo-router";
import { usePostOtpVerify } from "../../src/hooks/usePostOtpVerify";
import useAuthStore from "../../src/stores/useAuthStore";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function OtpInputScreen() {
  const { t, currentLanguage } = useTranslation();
  const { mutate, error, isError, isPending } = usePostOtpVerify();
  const { invitationEmail } = useAuthStore.getState();
  const [errorMessage, setErrorMessage] = useState(null);

  const { height } = Dimensions.get("window");
  const smallScreen = height < 700;

  useEffect(() => {
    if (error && error.response) {
      // set the error message
      const customMessage = error.response.data.statusErrMessage;
      setErrorMessage(customMessage);
      console.log(customMessage);
    } else {
      // clear if successful
      setErrorMessage(null);
    }
  }, [error]);

  const handleOtpFilled = (otpCode) => {
    if (!isPending) {
      console.log(isPending);
      // clear any of the error messages
      setErrorMessage(null);
      mutate(otpCode);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Use 'padding' for iOS
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
              size={smallScreen ? 30 : 50}
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
          <View
            style={[
              styles.instructionContainer,
              smallScreen
                ? styles.instructionContainerSmallScreen
                : styles.instructionContainerLargeScreen,
            ]}
          >
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
              {invitationEmail}
            </AppText>
          </View>
          <View style={styles.otpInputContainer}>
            <AppOtpInput
              length={6}
              caretColor={theme.colorPink}
              slotTextStyles={{ color: theme.colorBlack }}
              slotStyles={{
                borderColor: errorMessage
                  ? theme.colorRedError
                  : theme.colorLightGrey,
              }}
              focusedSlotStyles={{
                borderColor: errorMessage
                  ? theme.colorRedError
                  : theme.colorBlue,
              }}
              focusedSlotTextStyles={{ color: theme.colorBlack }}
              onFilled={handleOtpFilled}
            />
            <View style={styles.errorMessageContainer}>
              <AppText
                style={[
                  styles.errorMessage,
                  smallScreen
                    ? styles.errorMessageSmall
                    : styles.errorMessageLarge,
                ]}
              >
                {errorMessage ? errorMessage : null}
              </AppText>
            </View>
          </View>
          <View style={styles.forgotPasswordContainer}>
            <AppText style={styles.forgotPasswordText}>{t("codeText")}</AppText>
            <Link href={"/final-registration"} style={styles.link}>
              {t("resendLink")}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    // paddingVertical: 20,
    flex: 0,
  },
  instructionContainer: {
    padding: 12,
    textAlignVertical: "top",
  },

  instructionContainerLargeScreen: {
    fontSize: 20,
    paddingVertical: 12,
  },

  instructionContainerSmallScreen: {
    fontSize: 18,
    paddingVertical: 9,
    padding: 12,
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
  errorMessageContainer: {
    alignSelf: "center",
  },
  errorMessage: {
    color: theme.colorRedError,
  },
  errorMessageLarge: {
    paddingVertical: 10,
    fontSize: 20,
  },

  errorMessageSmall: {
    paddingTop: 8,
    fontSize: 15,
  },
  forgotPasswordContainer: {
    paddingVertical: 25,
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
