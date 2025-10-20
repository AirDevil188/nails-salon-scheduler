import React from "react";
import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { theme } from "../theme";

const AppTextInput = React.forwardRef(
  (
    {
      style,
      value,
      onChange,
      onBlur,
      onSubmitEditing,
      onChangeText,
      ...otherProps
    },
    ref
  ) => {
    // 👈 'ref' is the second argument, no semicolon needed here
    return (
      <TextInput
        ref={ref}
        underlineColorAndroid={"transparent"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, style]}
        {...otherProps}
        onChangeText={onChangeText}
        multiline={false}
      />
    );
  }
); // 👈 Semicolon should be here

AppTextInput.displayName = "AppTextInput";
export default AppTextInput;

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
