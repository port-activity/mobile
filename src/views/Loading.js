import React, { useEffect, useContext } from 'react';

//import { AppLoading } from 'expo';
import { getEnvVars } from '../../environment';
import { registerPushToken, validateSession } from '../api/Auth';
import Loader from '../components/Loader';
import { AuthContext } from '../context/Auth';
import { defaultUserInfo } from '../utils/Constants';
import { getUserInfo, getNamespace } from '../utils/DeviceStorage';
import { getUserInfoFromResponse } from '../utils/Helpers';
import registerForPushNotificationsAsync from '../utils/PushNotifications';

const { NAMESPACE } = getEnvVars();

const LoadingScreen = () => {
  const { setUserInfo, setNamespace } = useContext(AuthContext);
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    let userInfo = await getUserInfo();
    const namespace = await getNamespace();
    if (namespace) {
      setNamespace(namespace);
    }
    //console.log(userInfo);

    if (userInfo && userInfo.sessionId) {
      // Make request to verify session
      userInfo = getUserInfoFromResponse(userInfo.sessionId, await validateSession(userInfo.sessionId));
    }

    if (!userInfo) {
      userInfo = defaultUserInfo;
      setNamespace(NAMESPACE);
    }

    const pushToken = await registerForPushNotificationsAsync();
    if (userInfo.sessionId && pushToken) {
      registerPushToken(userInfo.sessionId, pushToken);
    }
    setUserInfo(userInfo);
  };

  //return <AppLoading />;
  return <Loader />;
};

export default LoadingScreen;
