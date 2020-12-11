import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Native as Sentry } from 'sentry-expo';

export default async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    //console.log(await Notifications.getExpoPushTokenAsync(), `Push token: ${token}`);
    return token;
  } catch (error) {
    //console.log('Could not get push notification token');
    Sentry.captureException(error);
    console.log(error);
  }
  return null;
}
