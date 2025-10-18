import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { theme } from "../theme";

export default function AppTextInput({
  style,
  value,
  onChange,
  onBlur,
  ...otherProps
}) {
  return (
    <TextInput
      underlineColorAndroid={"transparent"}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      style={[styles.input, style]}
      {...otherProps}
      multiline={false}
    ></TextInput>
  );
}
const styles = StyleSheet.create({
  input: {
    shadowColor: theme.colorLightGrey,
    color: theme.colorBlack,
    height: 50,
    backgroundColor: theme.colorWhite,
    borderRadius: 6,
    padding: 20,
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
