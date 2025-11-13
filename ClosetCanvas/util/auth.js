import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'user_session_credentials';
/**
@param {string} accessToken
@param {string} uuid 
@param {boolean} hasCompletedQuestionnaire 
*/
export const saveCredentials = async (accessToken, uuid,hasCompletedQuestionnaire) => {
  const credentials = { accessToken, uuid, hasCompletedQuestionnaire };
  const credentialsString = JSON.stringify(credentials);
  // For web, SecureStore is not available, usin local storage
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      console.log('Credentials saved to localStorage (web)!');
    } catch (error) {
      console.error("localStorage save error:", error);
    }
    return;
  }

  // For native (iOS/Android)
  try {
    const credentialsString = JSON.stringify(credentials);
    await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsString);
    console.log('Credentials saved to SecureStore!');
  } catch (error) {
    console.error("SecureStore save error:", error);
  }
};
/**
@returns {Promise<{accessToken: string, uuid: string, hasCompletedQuestionnaire: boolean} | null>}
*/
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
/**
@param {boolean} status 
*/
export const updateQuestionnaireStatus = async (status) => {
  try {
    // Get the current data
    const currentCredentials = await getCredentials();

    if (currentCredentials) {
      await saveCredentials(
        currentCredentials.accessToken,
        currentCredentials.uuid,
        status 
      );
      console.log('Questionnaire status updated!');
    } else {
      console.error("Cannot update status: no credentials found.");
    }
  } catch (error) {
    console.error("Error updating questionnaire status:", error);
  }

};
