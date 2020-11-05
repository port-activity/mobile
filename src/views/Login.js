import { useNavigation, useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { getEnvVars } from '../../environment';
import { login, registerPushToken } from '../api/Auth';
import { AuthForm, AuthLink, AuthPortName, AuthTitle, AuthView } from '../components/Authentication';
import StyledButton from '../components/Button';
import { StyledInput } from '../components/Input';
import Loader from '../components/Loader';
import { AuthContext } from '../context/Auth';
import { getPortName } from '../utils/Helpers';
import registerForPushNotificationsAsync from '../utils/PushNotifications';

const { NAMESPACE } = getEnvVars();

const LoginScreen = ({ port = '' }) => {
  const { emitter, logIn, namespace, setNamespace, userInfo } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const { t } = useTranslation(namespace);
  //console.log('Login: ns=', t.ns);
  const navigation = useNavigation();
  // This hook returns `true` if the screen is focused, `false` otherwise
  const isFocused = useIsFocused();

  const usernameTextInputRef = useRef();
  const passwordTextInputRef = useRef();

  const loginHandler = async () => {
    Keyboard.dismiss();
    if (email && password) {
      setProcessing(true);
      const resp = await login(email, password);
      if (resp && resp.session_id && resp.user) {
        // If push notifications are not yet registered, try now
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          registerPushToken(resp.session_id, pushToken);
        }
        setProcessing(false);
        logIn(resp);
      } else {
        setProcessing(false);
        emitter.emit('showToast', {
          message: t('Invalid E-mail or password. Please try again.'),
          duration: 5000,
          type: 'error',
        });
      }
    } else {
      emitter.emit('showToast', {
        message: t('Please fill in all fields'),
        duration: 5000,
        type: 'error',
      });
    }
  };

  const portName = port ? port : getPortName(namespace);

  if (!isFocused) {
    // Render dummy components when focus is lost to fix strong password suggestions on iOS
    // caused by react navigation stack (it does not unmount inactive components and IOS can
    // interact with them).
    return !userInfo.sessionId ? (
      <>
        <AuthView>
          <AuthForm>
            <AuthPortName>{t('Port of {{portname}}', { portname: portName })}</AuthPortName>
            <AuthTitle>{t('Login')}</AuthTitle>
            <StyledInput label={t('Email')} />
            <StyledInput label={t('Password')} />
            <StyledButton title={t('Login')} buttonStyle={styles.login} />
            <StyledButton title={t('Register as a New User')} buttonStyle={styles.register} />
          </AuthForm>
          {NAMESPACE === 'common' ? (
            <AuthLink linkStyle={styles.selectPortLink}>{t('Back to port selection')}</AuthLink>
          ) : null}
          <AuthLink>{t('Forgot your password?')}</AuthLink>
        </AuthView>
        {processing ? (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : null}
      </>
    ) : (
      <Loader />
    );
  }

  return !userInfo.sessionId ? (
    <>
      <AuthView>
        <AuthForm>
          <AuthPortName>{t('Port of {{portname}}', { portname: portName })}</AuthPortName>
          <AuthTitle>{t('Login')}</AuthTitle>
          <StyledInput
            autoCapitalize="none"
            autoCompleteType="email"
            keyboardType="email-address"
            label={t('Email')}
            onChangeText={(email) => setEmail(email)}
            onSubmitEditing={() => {
              setEmail(email.trim());
              passwordTextInputRef.current.focus();
            }}
            ref={usernameTextInputRef}
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
          />
          <StyledInput
            autoCapitalize="none"
            autoCompleteType="password"
            keyboardType="default"
            label={t('Password')}
            onChangeText={(password) => setPassword(password)}
            onSubmitEditing={() => setPassword(password.trim())}
            ref={passwordTextInputRef}
            returnKeyType="done"
            secureTextEntry
            textContentType="password"
            value={password}
          />
          <StyledButton
            buttonStyle={styles.login}
            disabled={processing}
            onPress={() => loginHandler()}
            title={t('Login')}
          />
          <StyledButton
            buttonStyle={styles.register}
            onPress={() => {
              Keyboard.dismiss();
              navigation.navigate('Register', { port: portName });
            }}
            title={t('Register as a New User')}
          />
        </AuthForm>
        {NAMESPACE === 'common' ? (
          <AuthLink
            linkStyle={styles.selectPortLink}
            onPress={() => {
              Keyboard.dismiss();
              setNamespace('common');
            }}>
            {t('Back to port selection')}
          </AuthLink>
        ) : null}
        <AuthLink
          onPress={() => {
            Keyboard.dismiss();
            navigation.navigate('ForgotPassword', { port: portName });
          }}>
          {t('Forgot your password?')}
        </AuthLink>
      </AuthView>
      {processing ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : null}
    </>
  ) : (
    <Loader />
  );
};

const styles = EStyleSheet.create({
  login: {
    marginBottom: '$gap',
  },
  register: {
    backgroundColor: '$color_secondary',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#747D7D',
  },
  selectPortLink: {
    marginBottom: '$gap',
  },
  continue: {
    marginVertical: '$gap',
  },
  processing: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: '$color_grey_lighter',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

LoginScreen.propTypes = {
  port: PropTypes.string,
};

export default LoginScreen;
