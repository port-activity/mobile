import { apiCall, parseRespone } from './Auth';

const NOTIFICATIONS_PATH = 'notifications';
const SEND_TIMESTAMP_PATH = 'timestamps';
const SEND_RTA_PATH = 'rta-web-form';

export const getNotifications = async (sessionId, limit = 100) => {
  const response = await apiCall('get', NOTIFICATIONS_PATH + `/${limit}`, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const sendNotification = async (sessionId, type, message, imo = null) => {
  const response = await apiCall(
    'post',
    NOTIFICATIONS_PATH,
    {
      type,
      message,
      ship_imo: imo,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return false;
};

export const sendTimestamp = async (sessionId, imo, vesselName, timeType, state, time, payload = {}) => {
  const response = await apiCall(
    'post',
    SEND_TIMESTAMP_PATH,
    {
      imo,
      vessel_name: vesselName,
      time_type: timeType,
      state,
      time,
      payload,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return false;
};

export const sendRTA = async (sessionId, portName, imo, rta, eta_min, eta_max, payload) => {
  const response = await apiCall(
    'post',
    SEND_RTA_PATH,
    {
      port: portName,
      imo,
      rta,
      eta_min,
      eta_max,
      payload,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return false;
};
