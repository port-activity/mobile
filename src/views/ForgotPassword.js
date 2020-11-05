import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { requestPasswordReset } from '../api/Auth';
import { AuthForm, AuthLink, AuthPortName, AuthSubTitle, AuthTitle, AuthView } from '../components/Authentication';
import StyledButton from '../components/Button';
import { StyledInput } from '../components/Input';
import { AuthContext } from '../context/Auth';

const ForgotPasswordScreen = () => {
  const { emitter, namespace } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { t } = useTranslation(namespace);
  //console.log('ForgotPassword: ns=', t.ns);
  const navigation = useNavigation();
  const route = useRoute();

  const requestPasswordResetHandler = async () => {
    Keyboard.dismiss();
    if (email) {
      setProcessing(true);
      if (await requestPasswordReset(email, namespace)) {
        setResetRequested(true);
        console.log('reset reqeuested');
      } else {
        emitter.emit('showToast', {
          message: t('There was an error processing your request. Please try again.'),
          duration: 5000,
          type: 'error',
        });
      }
      setProcessing(false);
    } else {
      emitter.emit('showToast', {
        message: t('Please fill in E-mail'),
        duration: 5000,
        type: 'error',
      });
    }
  };

  const {
    params: { port },
  } = route;

  return !resetRequested ? (
    <>
      <AuthView>
        <AuthForm>
          <AuthPortName>{t('Port of {{portname}}', { portname: port })}</AuthPortName>
          <AuthTitle>{t('Forgot password?')}</AuthTitle>
          <AuthSubTitle>{t('Please enter your e-mail address.')}</AuthSubTitle>
          <StyledInput
            autoCapitalize="none"
            autoCompleteType="email"
            keyboardType="email-address"
            label={t('Email')}
            onChangeText={(email) => setEmail(email)}
            onSubmitEditing={() => setEmail(email.trim())}
            returnKeyType="done"
            textContentType="emailAddress"
            value={email}
          />
          <StyledButton
            disabled={processing}
            onPress={() => requestPasswordResetHandler()}
            title={t('Request Password Reset')}
          />
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
        <AuthTitle>{t('Forgot password?')}</AuthTitle>
        <AuthSubTitle multiline>
          {t('An email with instructions on how to reset your password will be sent to you.')}
        </AuthSubTitle>
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

export default ForgotPasswordScreen;
