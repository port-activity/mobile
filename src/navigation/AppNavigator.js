import { NavigationContainer, useLinking } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as Sentry from 'sentry-expo';

import { getEnvVars } from '../../environment';
import PushNotificationsListener from '../components/PushNotificationsListener';
import { DarkStatusBar, LightStatusBar } from '../components/StatusBar';
import { DataProvider } from '../context/Data';
import { navigationRef, isMountedRef } from '../navigation/NavigationService';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
const { SOCKETCLUSTER_HOST } = getEnvVars();

const prefix = Linking.makeUrl('/');
// TODO: according to react navigation specs Linking.makeUrl('/') should be enough,
// but apparently cold start produces exps:// path and warm start https:// in standalone app
const host = `https://${SOCKETCLUSTER_HOST}/`;
const expHost = `exps://${SOCKETCLUSTER_HOST}/`;

const AppNavigator = ({ emitter, namespace, notification, userInfo }) => {
  const { i18n } = useTranslation(namespace);
  // useTranslation does not change namespace (and t) properly here
  // for already loaded namespaces, so get t from i18n
  const t = i18n.getFixedT(i18n.language, namespace);
  //console.log(`t-ns: ${t.ns}, t-lng: ${t.lng}`);

  // TODO: define all paths
  const { getInitialState } = useLinking(navigationRef, {
    prefixes: [prefix, host, expHost],
    config: {
      ResetPassword: 'reset-password',
    },
  });

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  useEffect(() => {
    isMountedRef.current = true;

    return () => (isMountedRef.current = false);
  }, []);

  useEffect(() => {
    Promise.race([
      getInitialState(),
      new Promise((resolve) =>
        // Timeout in 150ms if `getInitialState` doesn't resolve
        // Workaround for https://github.com/facebook/react-native/issues/25675
        setTimeout(resolve, 150)
      ),
    ])
      .catch((error) => Sentry.captureException(error))
      .then((state) => {
        if (state !== undefined) {
          setInitialState(state);
        }
        setIsReady(true);
      });
  }, [getInitialState]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <NavigationContainer initialState={initialState} ref={navigationRef}>
        {userInfo && userInfo.sessionId ? (
          <DataProvider>
            <LightStatusBar />
            <MainTabNavigator t={t} />
            <PushNotificationsListener notification={notification} />
          </DataProvider>
        ) : (
          <>
            <DarkStatusBar />
            <AuthNavigator />
          </>
        )}
      </NavigationContainer>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$color_white',
  },
});

export default AppNavigator;
