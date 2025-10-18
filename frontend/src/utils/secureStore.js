import * as SecureStore from "expo-secure-store";

const secureStoreKeys = ["accessToken", "refreshToken", "userInfo"];
export async function saveToken(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export async function getToken(key) {
  return await SecureStore.getItemAsync(key);
}

export async function saveUserInfo(key, value) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function clearSecureStorage() {
  console.log("Clearing all session keys from SecureStore...");

  const removalPromises = secureStoreKeys.map((key) => {
    console.log(`Removing key: ${key}`);
    return SecureStore.deleteItemAsync(key);
  });

  try {
    await Promise.all(removalPromises);
    console.log("Successfully cleared all session data from SecureStore.");
  } catch (error) {
    console.error("Error clearing SecureStore:", error);
  }
}
