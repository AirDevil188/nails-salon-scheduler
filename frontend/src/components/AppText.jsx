import { Text } from "react-native";

export default function AppText({ children, style, ...otherProps }) {
  return (
    <Text style={style} {...otherProps}>
      {children}
    </Text>
  );
}
