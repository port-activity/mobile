import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import EStyleSheet from 'react-native-extended-stylesheet';

import { AuthForm, AuthTitle, AuthView } from '../components/Authentication';
import StyledButton from '../components/Button';
import StyledSelect from '../components/Select';
import { AuthContext } from '../context/Auth';
import { defaultPortList } from '../utils/Constants';
import { getPortName } from '../utils/Helpers';
import LoginScreen from './Login';

const SelectPortScreen = () => {
  const { namespace, setNamespace } = useContext(AuthContext);
  const [port, setPort] = useState(null);
  const { t } = useTranslation(namespace);
  //console.log(`Select port: t-ns: ${t.ns}, t-lng: ${t.lng}`);

  const portName = getPortName(port);

  return namespace && namespace !== 'common' ? (
    <LoginScreen port={portName} />
  ) : (
    <AuthView>
      <AuthForm style={styles.form}>
        <AuthTitle style={styles.title}>{t('Select Port')}</AuthTitle>
        <StyledSelect
          label={t('Select Port')}
          placeHolder={t('Select Port')}
          items={defaultPortList}
          onValueChange={(value) => setPort(value)}
          value={port}
        />
        <StyledButton
          onPress={() => {
            setNamespace(port);
          }}
          title={t('Continue')}
        />
      </AuthForm>
    </AuthView>
  );
};

const styles = EStyleSheet.create({
  form: {
    marginBottom: 0,
  },
  title: {
    marginBottom: '$gap',
  },
});

export default SelectPortScreen;
