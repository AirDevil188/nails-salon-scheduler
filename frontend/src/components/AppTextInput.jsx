import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { theme } from "../theme";

export default function AppTextInput({ style, ...otherProps }) {
  return (
    <TextInput
      underlineColorAndroid={"transparent"}
      style={[styles.input, style]}
      {...otherProps}
      multiline={false}
    ></TextInput>
  );
}
const styles = StyleSheet.create({
  input: {
    shadowColor: theme.colorLightGrey,
    height: 50,
    backgroundColor: theme.colorWhite,
    borderRadius: 6,
    padding: 20,
    overflow: "hidden",
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 5,
  },
});
