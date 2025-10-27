import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'user_session_credentials';

export const saveCredentials = async (accessToken, uuid) => {
  // For web, SecureStore is not available, usin local storage
  if (Platform.OS === 'web') {
    try {
      const credentials = { accessToken, uuid };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      console.log('Credentials saved to localStorage (web)!');
    } catch (error) {
      console.error("localStorage save error:", error);
    }
    return;
  }

  // For native (iOS/Android)
  try {
    const credentials = { accessToken, uuid };
    const credentialsString = JSON.stringify(credentials);
    await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsString);
    console.log('Credentials saved to SecureStore!');
  } catch (error) {
    console.error("SecureStore save error:", error);
  }
};

export const getCredentials = async () => {
  try {
    let resultString = null;
    
    if (Platform.OS === 'web') {
      resultString = localStorage.getItem(CREDENTIALS_KEY);
    } else {
      resultString = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    }

    if (resultString) {
      return JSON.parse(resultString);
    }
    return null;
  } catch (error) {
    console.error("Credential get error:", error);
    return null;
  }
};

export const removeCredentials = async () => {
  try {
    if (Platform.OS === 'web') {
        localStorage.removeItem(CREDENTIALS_KEY);
    } else {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    }
    console.log('Credentials removed!');
  } catch (error) {
    console.error("Credential remove error:", error);
  }
};