import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { getEnvVars } from '../../environment';
import { resetPassword } from '../api/Auth';
import { AuthForm, AuthLink, AuthPortName, AuthSubTitle, AuthTitle, AuthView } from '../components/Authentication';
import StyledButton from '../components/Button';
import { StyledInput } from '../components/Input';
import { AuthContext } from '../context/Auth';
import { getPortName } from '../utils/Helpers';

const { NAMESPACE } = getEnvVars();

const ResetPasswordScreen = ({ emitter }) => {
  const { setNamespace } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const passwordTextInputRef = useRef();
  const confirmPasswordTextInputRef = useRef();

  const {
    params: { port, token, username },
  } = route;
  const { t } = useTranslation(port);
  const portName = getPortName(port);
  //console.log('ResetPassword: ns=', t.ns);

  const resetPasswordHandler = async () => {
    Keyboard.dismiss();
    if (confirmPassword && password && token) {
      if (password.length < 12) {
        return emitter.emit('showToast', {
          message: t('Password length must be at least 12 characters'),
          duration: 5000,
          type: 'error',
        });
      }
      if (password === username) {
        return emitter.emit('showToast', {
          message: t('Password cannot be the same as username'),
          duration: 5000,
          type: 'error',
        });
      }
      if (password !== confirmPassword) {
        return emitter.emit('showToast', {
          message: t('Passwords do not match'),
          duration: 2500,
          type: 'error',
        });
      }
      setProcessing(true);
      if (await resetPassword(password, token)) {
        setResetRequested(true);
        console.log('reset reqeuested');
      } else {
        emitter.emit('showToast', {
          message: t('There was an error processing your request. Please try again.'),
          duration: 2500,
          type: 'error',
        });
      }
      setProcessing(false);
    } else {
      emitter.emit('showToast', {
        message: t('Please fill in all fields'),
        duration: 2500,
        type: 'error',
      });
    }
  };

  return !resetRequested ? (
    <>
      <AuthView>
        <AuthForm>
          <AuthPortName>{t('Port of {{portname}}', { portname: portName })}</AuthPortName>
          <AuthTitle>{t('Reset Password')}</AuthTitle>
          <AuthSubTitle>{t('Please enter your new password')}</AuthSubTitle>
          <View pointerEvents="none">
            <StyledInput disabled textContentType="username" value={username} />
          </View>
          <StyledInput
            autoCapitalize="none"
            //blurOnSubmit={false}
            keyboardType="default"
            label={t('Password')}
            onChangeText={(password) => setPassword(password)}
            onSubmitEditing={() => {
              //Keyboard.dismiss();
              setPassword(password.trim());
              confirmPasswordTextInputRef.current.focus();
            }}
            ref={passwordTextInputRef}
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={password}
          />
          <StyledInput
            autoCapitalize="none"
            //blurOnSubmit={false}
            keyboardType="default"
            label={t('Confirm password')}
            onChangeText={(password) => setConfirmPassword(password)}
            onSubmitEditing={() => {
              //Keyboard.dismiss();
              setConfirmPassword(confirmPassword.trim());
            }}
            ref={confirmPasswordTextInputRef}
            returnKeyType="done"
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
          <StyledButton onPress={() => resetPasswordHandler()} title={t('Reset Password')} />
        </AuthForm>
        <AuthLink
          onPress={() => {
            Keyboard.dismiss();
            if (NAMESPACE === 'common') {
              setNamespace(port || 'common');
            }
            navigation.reset();
          }}>
          {t('« Return to login')}
        </AuthLink>
      </AuthView>
      {processing ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : null}
    </>
  ) : (
    <AuthView>
      <AuthForm>
        <AuthPortName>{t('Port of {{portname}}', { portname: portName })}</AuthPortName>
        <AuthTitle>{t('Reset Password')}</AuthTitle>
        <AuthSubTitle multiline>
          {t('Your password has now been reset. Please login with your new credentials')}
        </AuthSubTitle>
      </AuthForm>
      <AuthLink
        onPress={() => {
          if (NAMESPACE === 'common') {
            setNamespace(port || 'common');
          }
          navigation.reset();
        }}>
        {t('« Return to login')}
      </AuthLink>
    </AuthView>
  );
};

const styles = EStyleSheet.create({
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

export default ResetPasswordScreen;
