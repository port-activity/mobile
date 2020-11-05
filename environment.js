import { LOCALHOST, LOCALPORT, TRANSLATIONS_API_KEY } from '@env';
import Constants from 'expo-constants';

// TODO: update on new js releases
export const jsVersion = '1.1.10';

const localhost = LOCALHOST || '127.0.0.1';
const localport = LOCALPORT || '8000';
const API_VERSION = 'v1';

const ENV = {
  dev: {
    API_ENDPOINT: `http://${localhost}:${localport}`,
    NAMESPACE: 'common',
    PRELOAD_NAMESPACES: ['common', 'gavle', 'rauma'],
    SOCKETCLUSTER_HOST: localhost,
    SOCKETCLUSTER_PORT: 8002,
    SUPPORTED_LANGUAGES: ['en'],
    TRANSLATIONS_API_ENDPOINT: `http://${localhost}:${localport}`,
    TRANSLATIONS_API_KEY: TRANSLATIONS_API_KEY || '',
  }
};

export const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.dev;
};

export const getEnvironmentDescription = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) {
    return 'Development';
  }
  return 'Development';
};
