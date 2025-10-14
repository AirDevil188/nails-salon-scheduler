import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import AppText, { AppTextStyle } from "../src/components/AppText";
import AppTextInput from "../src/components/AppTextInput";
import Logo from "../assets/logo.svg";
import AppButton from "../src/components/AppButton";
import { theme } from "../src/theme";

export default function SignIn() {
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
        <View style={styles.logoAndHeadingContainer}>
          <Logo width={200} height={200} />
        </View>
        <View style={styles.inputContainer}>
          <AppText style={[AppTextStyle.h1, styles.logoHeading]}>
            Login to your account
          </AppText>
          <AppTextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor={theme.colorLightGrey}
            keyboardType={"email-address"} // 💡 Best practice for email
            autoCapitalize="none"
          ></AppTextInput>
          <AppTextInput
            placeholder="Password"
            style={styles.input}
            inputMode={"password"}
            placeholderTextColor={theme.colorLightGrey}
            secureTextEntry={true}
            autoCapitalize="none"
          ></AppTextInput>
          <AppButton>Sign in</AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    // marginBottom: 30,
    alignItems: "center",
    flex: 0,
  },
  logoHeading: {
    fontSize: 24,
  },
  inputContainer: {
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 75,
    flex: 0,
    gap: 5,
  },
});
