import React from 'react';
import { render } from 'react-native-testing-library';
import * as Sentry from 'sentry-expo';

import App from '../App';

jest.mock('expo', () => ({
  AppLoading: 'AppLoading',
  Linking: {
    makeUrl: jest.fn(),
  },
  Notifications: {
    addListener: jest.fn(),
  },
}));

global.Sentry = Sentry;
jest.mock('sentry-expo');

jest.mock('../environment', () => ({
  DEV_API_ENDPOINT: 'DEV_API_ENDPOINT',
  DEV_SOCKETCLUSTER_HOST: 'DEV_SOCKETCLUSTER_HOST',
  DEV_SOCKETCLUSTER_PORT: 'DEV_SOCKETCLUSTER_PORT',
  DEV_TILE_SERVER: 'DEV_TILE_SERVER',
  DEV_TILE_TEMPLATE: 'DEV_TILE_TEMPLATE',
  DEV_TRANSLATIONS_API_ENDPOINT: 'DEV_TRANSLATIONS_API_ENDPOINT',
  TRANSLATIONS_API_KEY: 'TRANSLATIONS_API_KEY',
  NAMESPACE: 'common',
  getEnvVars: () => {
    return {
      NAMESPACE: 'common',
    };
  },
  getEnvironmentDescription: jest.fn(),
}));

jest.mock('../src/navigation/AppNavigator', () => 'AppNavigator');
jest.mock('../i18n', () => 'i18n');
jest.mock('react-native-screens');
jest.useFakeTimers();

describe('App', () => {
  jest.useFakeTimers();
  it(`renders the loading screen`, async () => {
    const tree = render(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders the root without loading screen`, async () => {
    const tree = render(<App skipLoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
