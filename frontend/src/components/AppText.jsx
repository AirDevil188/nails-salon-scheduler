import { Text, StyleSheet } from "react-native";

export default function AppText({ children, style, ...otherProps }) {
  return (
    <Text style={(AppTextStyle.defaultText, style)} {...otherProps}>
      {children}
    </Text>
  );
}

export const AppTextStyle = StyleSheet.create({
  defaultText: {
    fontSize: 16,
    color: "#333",
  },
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  h3: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
  },
});
