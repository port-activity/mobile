import { AsyncStorage } from 'react-native';
import { Native as Sentry } from 'sentry-expo';

import { defaultUserInfo } from '../utils/Constants';

export const getUserInfo = async () => {
  let userInfo = defaultUserInfo;
  try {
    const info = await AsyncStorage.getItem('userInfo');
    if (info) {
      userInfo = JSON.parse(info);
    }
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }

  return userInfo;
};

export const storeUserInfo = async (userInfo) => {
  try {
    return await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }
};

export const removeUserInfo = async () => {
  try {
    await AsyncStorage.removeItem('userInfo');
    // TODO: remove user selected language on logout?
    return AsyncStorage.removeItem('userLanguage');
  } catch (error) {
    Sentry.captureException(error);
    // pass
  }
};

export const getNamespace = async () => {
  try {
    return await AsyncStorage.getItem('namespace');
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }

  return null;
};

export const storeNamespace = async (namespace) => {
  try {
    return await AsyncStorage.setItem('namespace', namespace);
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }
};

export const removeNamespace = async () => {
  try {
    return await AsyncStorage.removeItem('namespace');
  } catch (error) {
    Sentry.captureException(error);
    // pass
  }
};

export const getSetting = async (setting) => {
  try {
    const value = await AsyncStorage.getItem(setting);
    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }

  return null;
};

export const setSetting = async (setting, value) => {
  try {
    return await AsyncStorage.setItem(setting, JSON.stringify(value));
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
    // pass
  }
};
