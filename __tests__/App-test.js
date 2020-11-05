import React from 'react';
import renderer from 'react-test-renderer';

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

jest.mock('../environment', () => ({
  LOCALHOST: 'LOCALHOST',
  LOCALPORT: 'LOCALPORT',
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

describe('App', () => {
  jest.useFakeTimers();
  it(`renders the loading screen`, async () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders the root without loading screen`, async () => {
    const tree = renderer.create(<App skipLoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
