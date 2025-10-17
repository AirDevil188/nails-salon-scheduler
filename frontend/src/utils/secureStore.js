import * as SecureStore from "expo-secure-store";

export async function saveToken(key, value) {
  await SecureStore.setItemAsync(key, value);
}
