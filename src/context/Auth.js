import React, { Component, createContext } from 'react';
import { withTranslation } from 'react-i18next';
import { Vibration } from 'react-native';

import { getEnvVars } from '../../environment';
import { ErrorToast, FormattedNotification, NotificationToast, SuccessToast } from '../components/Toast';
import {
  defaultUserInfo,
  STATUS_AUTHENTICATION_FAILED,
  STATUS_SESSION_EXPIRED,
  DISABLE_VIBRATION_SETTING,
} from '../utils/Constants';
import {
  removeUserInfo,
  storeUserInfo,
  removeNamespace,
  storeNamespace,
  getSetting,
  setSetting,
} from '../utils/DeviceStorage';
import { getUserInfoFromResponse } from '../utils/Helpers';

const { NAMESPACE } = getEnvVars();

const AuthContext = createContext({
  disableVibration: false,
  emitter: null,
  namespace: NAMESPACE,
  userInfo: null,
});

class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disableVibration: false,
      emitter: props.emitter,
      namespace: NAMESPACE,
      userInfo: null,
    };
    this.notificationToast = React.createRef();
    this.errorToast = React.createRef();
    this.successToast = React.createRef();
  }

  componentDidMount() {
    // Subscribe to toast events
    this.state.emitter.on('showToast', this.showToast);
    this.getSettings();
  }

  componentWillUnmount() {
    this.state.emitter.off('showToast', this.showToast);
  }

  getSettings = async () => {
    const vibrate = await getSetting(DISABLE_VIBRATION_SETTING);
    this.setState({
      disableVibration: vibrate,
    });
  };

  logIn = (userInfo) => {
    const user = getUserInfoFromResponse(userInfo.session_id, userInfo);
    this.setState({
      userInfo: user,
    });
    storeUserInfo(user);
    storeNamespace(this.state.namespace);
  };

  logOut = () => {
    console.log('logout');
    this.setState({
      namespace: NAMESPACE,
      userInfo: defaultUserInfo,
    });
    removeUserInfo();
    removeNamespace();
  };

  setUserInfo = (userInfo) => {
    this.setState({
      userInfo,
    });
  };

  setNamespace = (ns) => {
    this.setState({
      namespace: ns,
    });
  };

  hasPermission = (permission) => {
    const { userInfo } = this.state;
    if (userInfo && userInfo.permissions.length) {
      return ~userInfo.permissions.indexOf(permission);
    }
    return false;
  };

  isModuleEnabled = (module) => {
    const { userInfo } = this.state;
    if (userInfo && userInfo.modules) {
      return userInfo.modules[module] && userInfo.modules[module] === 'enabled';
    }
    return false;
  };

  setDisableVibration = async (value) => {
    const { disableVibration } = this.state;
    if (value !== disableVibration) {
      this.setState({
        disableVibration: value,
      });
      await setSetting(DISABLE_VIBRATION_SETTING, value);
    }
  };

  authenticatedApiCall = async (func, params = []) => {
    const { i18n } = this.props;
    const { namespace } = this.state;

    const res = await func(this.state.userInfo.sessionId, ...params);
    if (res && res.status === STATUS_SESSION_EXPIRED) {
      setTimeout(() => {
        this.logOut();
      }, 100);
    } else if (res && res.status === STATUS_AUTHENTICATION_FAILED) {
      // withTranslation() HOC does not change namespace (and t) properly here
      // for already loaded namespaces, so get t from i18n
      const t = i18n.getFixedT(i18n.language, namespace);
      this.errorToast.current.show(
        t('Access is denied. You may not have the appropriate permissions to access the resource'),
        2500
      );
    }
    return res;
  };

  showToast = (params) => {
    const { disableVibration } = this.state;
    if (params.type === 'error' && this.errorToast.current) {
      if (!disableVibration && !params.silent) {
        Vibration.vibrate(300);
      }
      this.errorToast.current.show(params.message, params.duration, params.callback);
    } else if (params.type === 'notification' && this.notificationToast.current) {
      const { sender } = params.message;
      if (this.state.userInfo && sender.email !== this.state.userInfo.email) {
        if (!disableVibration && !params.silent) {
          Vibration.vibrate(300);
        }
        this.notificationToast.current.show(
          <FormattedNotification data={params.message} namespace={this.state.namespace} />,
          params.duration,
          params.callback
        );
      }
    } else if (this.successToast.current) {
      this.successToast.current.show(params.message, params.duration, params.callback);
    }
  };

  render() {
    return (
      <AuthContext.Provider
        value={{
          ...this.state,
          authenticatedApiCall: this.authenticatedApiCall,
          getUserInfoFromResponse: this.getUserInfoFromResponse,
          hasPermission: this.hasPermission,
          isModuleEnabled: this.isModuleEnabled,
          logIn: this.logIn,
          logOut: this.logOut,
          setDisableVibration: this.setDisableVibration,
          setNamespace: this.setNamespace,
          setUserInfo: this.setUserInfo,
        }}>
        {this.props.children}
        <NotificationToast ref={this.notificationToast} />
        <ErrorToast ref={this.errorToast} />
        <SuccessToast ref={this.successToast} />
      </AuthContext.Provider>
    );
  }
}

const withAuthContext = (Component) => {
  return (props) => {
    return (
      <AuthContext.Consumer>
        {({ ...rest }) => {
          return <Component {...props} {...rest} />;
        }}
      </AuthContext.Consumer>
    );
  };
};

export { AuthContext, withAuthContext };
export default withTranslation()(AuthProvider);
