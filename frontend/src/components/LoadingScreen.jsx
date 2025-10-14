import { View, Text } from "react-native";
import AppText from "./AppText";

export default function LoadingScreen({ message, style, ...otherProps }) {
  return (
    <View>
      <AppText style={style} {...otherProps}>
        {message}
      </AppText>
    </View>
  );
}
