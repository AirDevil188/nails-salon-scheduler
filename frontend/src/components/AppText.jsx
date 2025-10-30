import { Text, StyleSheet } from "react-native";
import { theme } from "../theme";

export default function AppText({
  children,
  style,
  numberOfLines,
  ...otherProps
}) {
  return (
    <Text
      style={(AppTextStyle.defaultText, style)}
      {...otherProps}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

export const AppTextStyle = StyleSheet.create({
  defaultText: {
    fontSize: 15,
    color: theme.colorBlack,
    fontFamily: "Inter-Regular",
  },
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Inter-Bold",
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Inter-Regular",
  },
  h3: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },
});
