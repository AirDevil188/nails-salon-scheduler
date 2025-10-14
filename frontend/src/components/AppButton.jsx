import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../theme";

export default function AppButton({ children, style, ...otherProps }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.defaultButton,
        style,

        pressed && styles.pressed,
      ]}
      {...otherProps}
    >
      {typeof children === "string" ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: theme.colorBlue,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  text: {
    fontFamily: "Inter-Bold",
    color: theme.colorWhite,
    fontSize: 18,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
