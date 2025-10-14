import { Pressable, Text, StyleSheet } from "react-native";

export default function AppButton({ children, style, ...otherProps }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.defaultButton,
        style,

        pressed && style.pressed,
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
    backgroundColor: "#007AFF", // A standard blue color
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  text: {
    color: "#fff", // White text color
    fontSize: 18,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85, // Simple visual feedback when pressed
  },
});
