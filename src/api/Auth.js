import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import * as Sentry from 'sentry-expo';

import { getEnvVars } from '../../environment';
import { STATUS_AUTHENTICATION_FAILED, STATUS_ERROR, STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';

const { API_ENDPOINT } = getEnvVars();

const LOGIN_PATH = 'login';
const VALIDATE_SESSION_PATH = 'session';
const REGISTER_PATH = 'register';
const REGISTER_PUSH_TOKEN_PATH = 'register-push-token';
const REQUEST_PASSWORD_RESET_PATH = 'request-password-reset';
const RESET_PASSWORD_PATH = 'reset-password';

export const apiCall = async (method, path, data, sessionId) => {
  if (path.match(/^\//)) {
    Sentry.captureMessage('Paths must not begin with slash "/"');
    throw new Error('Paths must not begin with slash "/"');
  }
  const url = `${API_ENDPOINT}/${path}`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
    headers['ClientTimeZone'] = Localization.timezone;
  }
  const body = data ? JSON.stringify(data) : null;
  try {
    return await fetch(url, {
      method,
      headers,
      body,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.warn(error);
    return null;
  }
};

export const parseRespone = async (response) => {
  if (!response) {
    return { status: STATUS_ERROR, data: null };
  }
  let resp = null;
  try {
    resp = await response.json();
  } catch (error) {
    Sentry.captureException(error);
    console.warn(error);
    return null;
  }
  if (response.status === 200) {
    return { status: STATUS_OK, data: resp };
  } else if (~[401, 403].indexOf(response.status)) {
    //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
    return { status: STATUS_AUTHENTICATION_FAILED, data: [] };
  } else if (~[440].indexOf(response.status)) {
    //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
    return { status: STATUS_SESSION_EXPIRED, data: [] };
  } else if (resp && resp.error) {
    Sentry.captureMessage(resp.error);
    console.log('Error: ', resp.error);
    return { status: STATUS_ERROR, data: [], message: resp.error };
  } else {
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return null;
};

export const login = async (email, password) => {
  const response = await apiCall('post', LOGIN_PATH, {
    email,
    password,
  });
  if (response) {
    if (response.status === 200) {
      return await response.json();
    }
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return null;
};

export const validateSession = async (sessionId) => {
  const response = await apiCall('get', VALIDATE_SESSION_PATH, null, sessionId);
  if (response) {
    if (response.status === 200) {
      return await response.json();
    }
    //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
    const resp = await response.json();
    if (resp && resp.error) {
      console.log('Error: ', resp.error);
    }
  }
  return null;
};

export const registerNewUser = async (firstName, lastName, code, email, password) => {
  const response = await apiCall('post', REGISTER_PATH, {
    first_name: firstName,
    last_name: lastName,
    code,
    email,
    password,
  });
  if (response) {
    if (response.status === 200) {
      return await response.json();
    }
    // TODO: remove logging
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return null;
};

export const registerPushToken = async (sessionId, pushToken) => {
  console.log('Trying to register push token');
  const response = await apiCall(
    'post',
    REGISTER_PUSH_TOKEN_PATH,
    {
      installation_id: Constants.installationId,
      platform: Object.keys(Constants.platform)[0],
      push_token: pushToken,
    },
    sessionId
  );
  if (response) {
    if (response.status === 200) {
      const status = await response.json();
      if (!status.error) {
        console.log('Push token registered');
      }
      return !status.error;
    }
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return false;
};

export const requestPasswordReset = async (email, port) => {
  const response = await apiCall('post', REQUEST_PASSWORD_RESET_PATH, {
    email,
    port,
  });
  if (response) {
    if (response.status === 200) {
      return await response.json();
    }
    // TODO: remove logging, show success every time to prevent email phishing
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return null;
};

export const resetPassword = async (password, token) => {
  const response = await apiCall('post', RESET_PASSWORD_PATH, {
    password,
    token,
  });
  if (response) {
    if (response.status === 200) {
      return await response.json();
    }
    // TODO: remove logging, show success every time to prevent email phishing
    console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
  }
  return null;
};
