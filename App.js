import Images from '@assets/images';
import { SENTRY_DSN } from '@env';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import mitt from 'mitt';
import React, { Suspense, useState, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from 'sentry-expo';

//import { enableScreens } from 'react-native-screens';
import { jsVersion } from './environment';
import i18n from './i18n'; // eslint-disable-line
import Loader from './src/components/Loader';
import theme from './src/components/Theme';
import UpdatesListener from './src/components/UpdatesListener';
import AuthProvider, { AuthContext } from './src/context/Auth';
import AppNavigator from './src/navigation/AppNavigator';
import cacheAssetsAsync from './src/utils/CacheAssetsAsync';
import ErrorBoundary from './src/views/AppError';
import LoadingScreen from './src/views/Loading';

Sentry.init({
  debug: !!SENTRY_DSN && !Constants.manifest.releaseChannel,
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: true,
  environment: Constants.manifest.releaseChannel || 'development',
});
Sentry.setRelease(Constants.manifest.revisionId);
Sentry.setTags({
  'release-channel': Constants.manifest.releaseChannel || 'default',
  nativeBuildVersion: Constants.nativeBuildVersion || 'N/A',
  version: Constants.manifest.version,
  expoSDK: Constants.manifest.sdkVersion,
  jsVersion,
});

//enableScreens();

EStyleSheet.build(theme);

const App = ({ skipLoadingScreen }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [notification, setNotification] = useState({});
  const [emitter] = useState(mitt());

  useEffect(() => {
    loadAssetsAsync();
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('Notifications', {
        name: 'Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    const notificationSubscription = Notifications.addNotificationReceivedListener(handleNotification);

    return () => notificationSubscription.remove();
  }, []);

  const loadAssetsAsync = async () => {
    // TODO: Orientation lock forced until landscape modes are done
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    if (Platform.OS === 'ios') {
      const iosVersion = parseInt(Platform.Version.match(/^([0-9]+)\./)[1], 10);
      if (iosVersion < 13) {
        // can't set lockPlatformAsync since app crashes for older ios versions
      } else {
        await ScreenOrientation.lockPlatformAsync({ screenOrientationArrayIOS: ['PORTRAIT_UP'] });
      }
    }

    //await ScreenOrientation.unlockAsync();
    try {
      await cacheAssetsAsync({
        images: Object.values(Images),
        fonts: [
          {
            'Open Sans': require('./assets/fonts/Open_Sans/OpenSans-Regular.ttf'),
            'Open Sans Bold': require('./assets/fonts/Open_Sans/OpenSans-Bold.ttf'),
            'Open Sans Italic': require('./assets/fonts/Open_Sans/OpenSans-Italic.ttf'),
          },
        ],
      });
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: App.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      );
      Sentry.captureException(e);
      console.log(e.message);
    } finally {
      setAppIsReady(true);
    }
  };

  const handleNotification = (notification) => {
    //console.log(notification);
    // for now dismiss all notifications if the app is foregrounded
    if (Platform.OS === 'android' && AppState.currentState === 'active' && notification.origin === 'received') {
      Notifications.dismissNotificationAsync(notification.notificationId);
    }

    if (notification.origin === 'selected') {
      // Only handle push notification when clicked
      setNotification(notification);
    }
  };

  return (
    <SafeAreaProvider>
      <Suspense fallback={<Loader />}>
        <ErrorBoundary>
          <AuthProvider emitter={emitter}>
            <AuthContext.Consumer>
              {({ namespace, userInfo }) => {
                if ((userInfo && appIsReady) || skipLoadingScreen) {
                  return (
                    <>
                      <AppNavigator
                        emitter={emitter}
                        namespace={namespace}
                        notification={notification}
                        userInfo={userInfo}
                      />
                      <UpdatesListener />
                    </>
                  );
                } else {
                  return <LoadingScreen />;
                }
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ErrorBoundary>
      </Suspense>
    </SafeAreaProvider>
  );
};

export default App;
