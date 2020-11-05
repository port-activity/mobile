export const defaultUserInfo = {
  email: '',
  firstName: '',
  id: null,
  lastName: '',
  modules: {},
  permissions: [],
  role: '',
  session: {},
  sessionId: null,
  signedJWTAuthToken: null,
};

export const defaultPortList = [
  { key: 'gavle', label: 'Gävle', value: 'gavle' },
  { key: 'rauma', label: 'Rauma', value: 'rauma' },
];

export const defaultRtaLocations = [{ key: 'outer_port_area', label: 'Outer Port Area', value: 'outer_port_area' }];

export const TAB_BAR_HEIGHT = 70;

/* Api response statuses */
export const STATUS_OK = 'ok';
export const STATUS_ERROR = 'error';
export const STATUS_AUTHENTICATION_FAILED = 'authentication_failed';
export const STATUS_SESSION_EXPIRED = 'session_expired';

export const DISABLE_VIBRATION_SETTING = 'disable_vibration';
