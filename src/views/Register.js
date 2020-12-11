import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { registerNewUser } from '../api/Auth';
import { AuthForm, AuthLink, AuthPortName, AuthSubTitle, AuthTitle, AuthView } from '../components/Authentication';
import StyledButton from '../components/Button';
import { StyledInput } from '../components/Input';
import { AuthContext } from '../context/Auth';

const RegisterScreen = () => {
  const { emitter, logIn, namespace, userInfo } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [registerSent, setRegisterSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { t } = useTranslation(namespace);
  //console.log('Register: ns=', t.ns);
  const navigation = useNavigation();
  const route = useRoute();

  const firstNameTextInputRef = useRef();
  const lastNameTextInputRef = useRef();
  const codeTextInputRef = useRef();
  const emailTextInputRef = useRef();
  const passwordTextInputRef = useRef();
  const confirmPasswordTextInputRef = useRef();

  const {
    params: { codeless, port },
  } = route;

  useEffect(() => {
    if (userInfo.sessionId) {
      setRegisterSent(true);
    }
  }, [userInfo]);

  const registerHandler = async () => {
    Keyboard.dismiss();
    if (firstName && lastName && (code || codeless) && email && password && confirmPassword) {
      if (!password.length) {
        return emitter.emit('showToast', {
          message: t('Password cannot be empty!'),
          duration: 5000,
          type: 'error',
        });
      }
      if (password === email) {
        return emitter.emit('showToast', {
          message: t('Password cannot be the same as username'),
          duration: 5000,
          type: 'error',
        });
      }
      if (password !== confirmPassword) {
        return emitter.emit('showToast', {
          message: t('Passwords do not match'),
          duration: 5000,
          type: 'error',
        });
      }
      setProcessing(true);
      const resp = await registerNewUser(firstName, lastName, code, email, password);
      setProcessing(false);
      if (resp && resp.session_id && resp.user) {
        logIn(resp);
      } else {
        let msg = t('There was an error processing your registration. Please try again.');
        if (resp && resp.error) {
          msg = resp.error;
        }
        emitter.emit('showToast', {
          message: msg,
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

  return !registerSent ? (
    <>
      <AuthView>
        <AuthForm>
          <AuthPortName>{t('Port of {{portname}}', { portname: port })}</AuthPortName>
          <AuthTitle>{t('Register')}</AuthTitle>
          <StyledInput
            keyboardType="default"
            label={t('First name')}
            onChangeText={(firstName) => setFirstName(firstName)}
            onSubmitEditing={() => {
              setFirstName(firstName.trim());
              lastNameTextInputRef.current.focus();
            }}
            ref={firstNameTextInputRef}
            returnKeyType="next"
            textContentType="givenName"
            value={firstName}
          />
          <StyledInput
            keyboardType="default"
            label={t('Last name')}
            onChangeText={(lastName) => setLastName(lastName)}
            onSubmitEditing={() => {
              setLastName(lastName.trim());
              if (codeless) {
                emailTextInputRef.current.focus();
              } else {
                codeTextInputRef.current.focus();
              }
            }}
            ref={lastNameTextInputRef}
            returnKeyType="next"
            textContentType="familyName"
            value={lastName}
          />
          {codeless ? null : (
            <StyledInput
              autoCapitalize="none"
              keyboardType="default"
              label={t('Code')}
              onChangeText={(code) => setCode(code)}
              onSubmitEditing={() => {
                setCode(code.trim());
                emailTextInputRef.current.focus();
              }}
              ref={codeTextInputRef}
              returnKeyType="next"
              textContentType="oneTimeCode"
              value={code}
            />
          )}
          <StyledInput
            autoCapitalize="none"
            keyboardType="email-address"
            label={t('Email / Username')}
            onChangeText={(email) => setEmail(email)}
            onSubmitEditing={() => {
              setEmail(email.trim());
              passwordTextInputRef.current.focus();
            }}
            ref={emailTextInputRef}
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
          />
          <StyledInput
            autoCapitalize="none"
            //blurOnSubmit={false}
            keyboardType="default"
            label={t('Password')}
            onChangeText={(password) => setPassword(password)}
            onEndEditing={() => {
              //confirmPasswordTextInputRef.current.focus();
            }}
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
            label={t('Confirm password')}
            keyboardType="default"
            onChangeText={(password) => setConfirmPassword(password)}
            onSubmitEditing={() => {
              setConfirmPassword(confirmPassword.trim());
              //Keyboard.dismiss();
            }}
            ref={confirmPasswordTextInputRef}
            returnKeyType="done"
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
          <StyledButton disabled={processing} onPress={() => registerHandler()} title={t('Register')} />
        </AuthForm>
        <AuthLink
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack();
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
        <AuthPortName>{t('Port of {{portname}}', { portname: port })}</AuthPortName>
        <AuthTitle>{t('Registration complete')}</AuthTitle>
        <AuthSubTitle multiline>{t('User account was successfully created.')}</AuthSubTitle>
      </AuthForm>
      <AuthLink onPress={() => navigation.goBack()}>{t('« Return to login')}</AuthLink>
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

export default RegisterScreen;
