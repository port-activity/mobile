import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import { Native as Sentry } from 'sentry-expo';

import { getEnvVars } from '../../environment';
import { STATUS_AUTHENTICATION_FAILED, STATUS_ERROR, STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';

const { API_ENDPOINT } = getEnvVars();

const LOGIN_PATH = 'login';
const VALIDATE_SESSION_PATH = 'session';
const REGISTER_PATH = 'register';
const CODELESS_REGISTER_PATH = 'codeless-register';
const PUBLIC_SETTINGS_PATH = 'public-settings?name=';
const REGISTER_PUSH_TOKEN_PATH = 'register-push-token';
const REQUEST_PASSWORD_RESET_PATH = 'request-password-reset';
const RESET_PASSWORD_PATH = 'reset-password';

export const PUBLIC_SETTINGS_KEY_CODELESS_REGISTRATION = 'codeless_registration_module';

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
    try {
      const resp = await response.json();
      if (response.status === 200) {
        return resp;
      }
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (resp && resp.error) {
        console.log('Error: ', resp.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return null;
};

export const validateSession = async (sessionId) => {
  const response = await apiCall('get', VALIDATE_SESSION_PATH, null, sessionId);
  if (response) {
    try {
      const resp = await response.json();
      if (response.status === 200) {
        return resp;
      }
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (resp && resp.error) {
        console.log('Error: ', resp.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return null;
};

export const getPublicSettingsForKey = async (key) => {
  if (!key) {
    console.error('Error: settings key missing');
    return null;
  }
  const response = await apiCall('get', `${PUBLIC_SETTINGS_PATH}${key}`, null, null);
  if (response) {
    try {
      const data = await response.json();
      if (response.status === 200) {
        if (data && data[key]) {
          return data[key];
        }
        console.log('Error: invalid public settings response');
      }
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (data && data.error) {
        console.log('Error: ', data.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return null;
};

export const registerNewUser = async (firstName, lastName, code, email, password) => {
  let response = null;
  if (code) {
    response = await apiCall('post', REGISTER_PATH, {
      first_name: firstName,
      last_name: lastName,
      code,
      email,
      password,
    });
  } else {
    response = await apiCall('post', CODELESS_REGISTER_PATH, {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });
  }
  if (response) {
    try {
      const resp = await response.json();
      if (response.status === 200) {
        return resp;
      }
      if (resp && resp.error) {
        return resp;
      }
    } catch (error) {
      Sentry.captureException(error);
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
    try {
      const resp = await response.json();
      if (response.status === 200) {
        if (!resp.error) {
          console.log('Push token registered');
        }
        return !resp.error;
      }
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (resp && resp.error) {
        console.log('Error: ', resp.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return false;
};

export const requestPasswordReset = async (email, port) => {
  const response = await apiCall('post', REQUEST_PASSWORD_RESET_PATH, {
    email,
    port,
  });
  if (response) {
    try {
      const resp = await response.json();
      if (response.status === 200) {
        return resp;
      }
      // TODO: remove logging, show success every time to prevent email phishing
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (resp && resp.error) {
        console.log('Error: ', resp.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return null;
};

export const resetPassword = async (password, token) => {
  const response = await apiCall('post', RESET_PASSWORD_PATH, {
    password,
    token,
  });
  if (response) {
    try {
      const resp = await response.json();
      if (response.status === 200) {
        return resp;
      }
      // TODO: remove logging, show success every time to prevent email phishing
      //console.log(`${response.url} failed, ok:${response.ok} status:${response.status} text:${response.statusText}`);
      if (resp && resp.error) {
        console.log('Error: ', resp.error);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  return null;
};
