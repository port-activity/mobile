import {
  DEV_API_ENDPOINT,
  DEV_SOCKETCLUSTER_HOST,
  DEV_SOCKETCLUSTER_PORT,
  DEV_TILE_SERVER,
  DEV_TILE_TEMPLATE,
  DEV_TRANSLATIONS_API_ENDPOINT,
  TRANSLATIONS_API_KEY,
} from '@env';
import Constants from 'expo-constants';

// TODO: update on new js releases
export const jsVersion = '1.2.2';

const apiEndpoint = DEV_API_ENDPOINT || 'http://127.0.0.1:8000';
const socketClusterHost = DEV_SOCKETCLUSTER_HOST || '127.0.0.1';
const socketClusterPort = DEV_SOCKETCLUSTER_PORT || '8002';
const tileServer = DEV_TILE_SERVER || 'http://127.0.0.1:8000';
const tileTemplate = DEV_TILE_TEMPLATE || '/tile/{z}/{x}/{y}.png';
const translationsApiEndpoint = DEV_TRANSLATIONS_API_ENDPOINT || 'http://127.0.0.1:8000';
const translationsApiKey = TRANSLATIONS_API_KEY || '';

const API_VERSION = 'v1';

const ENV = {
  dev: {
    API_ENDPOINT: apiEndpoint,
    NAMESPACE: 'common',
    PRELOAD_NAMESPACES: ['common', 'gavle', 'rauma'],
    SOCKETCLUSTER_HOST: socketClusterHost,
    SOCKETCLUSTER_PORT: parseInt(socketClusterPort, 10),
    SUPPORTED_LANGUAGES: ['en'],
    TILE_SERVER: tileServer,
    TILE_TEMPLATE: tileTemplate,
    TRANSLATIONS_API_ENDPOINT: translationsApiEndpoint,
    TRANSLATIONS_API_KEY: translationsApiKey,
  },
};

export const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'testing') {
    return ENV.testing;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'qa-gavle') {
    return ENV['qa-gavle'];
  } else if (env === 'prod-gavle') {
    return ENV['prod-gavle'];
  } else if (env === 'qa-rauma') {
    return ENV['qa-rauma'];
  } else if (env === 'prod-rauma') {
    return ENV['prod-rauma'];
  }
  return ENV.dev;
};

export const getEnvironmentDescription = (env = Constants.manifest.releaseChannel) => {
  if (__DEV__) {
    return 'Development';
  } else if (env === 'testing') {
    return 'Testing';
  } else if (env === 'staging') {
    return 'Staging';
  } else if (env === 'qa-gavle') {
    return 'Gävle QA';
  } else if (env === 'prod-gavle') {
    return 'Gävle production';
  } else if (env === 'qa-rauma') {
    return 'Rauma QA';
  } else if (env === 'prod-rauma') {
    return 'Rauma production';
  }
  return 'Development';
};
