import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import Logo from "../assets/logo.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import AppButton from "../src/components/AppButton";
import AppTextInput from "../src/components/AppTextInput";
import AppText, { AppTextStyle } from "../src/components/AppText";
import { theme } from "../src/theme";
import { useTranslation } from "../src/hooks/useTranslation";

export default function SignIn() {
  const { t, currentLanguage } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps={"handled"}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <AppText style={[AppTextStyle.h1, styles.logoHeading]}>
              {t("signInHeading")}
            </AppText>
            <AppTextInput
              placeholder={t("emailPlaceholder")}
              style={styles.input}
              placeholderTextColor={theme.colorLightGrey}
              keyboardType={"email-address"}
              autoCapitalize="none"
            ></AppTextInput>
            <AppTextInput
              placeholder={t("passwordPlaceholder")}
              style={styles.input}
              inputMode={"password"}
              placeholderTextColor={theme.colorLightGrey}
              secureTextEntry={true}
              autoCapitalize="none"
            ></AppTextInput>
            <AppButton>{t("singInButton")}</AppButton>
          </View>
          <View style={styles.logoAndHeadingContainer}>
            <Logo width={300} height={300} />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  logoAndHeadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoHeading: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
  },
  inputContainer: {
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
    gap: 10,
  },
});
