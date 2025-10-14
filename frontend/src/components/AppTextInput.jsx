import { TextInput } from "react-native";

export default function AppTextInput({ style, ...otherProps }) {
  return <TextInput style={style} {...otherProps}></TextInput>;
}
