import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Platform, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { sendNotification } from '../api/Notifications';
import StyledButton from '../components/Button';
import { StyledInput } from '../components/Input';
import { PortcallHeader } from '../components/PortcallTimeline';
import { ProcessingAwareView } from '../components/ProcessingAwareView';
import { AuthContext } from '../context/Auth';
import { STATUS_OK } from '../utils/Constants';
import { getPortName } from '../utils/Helpers';

const SendNotificationScreen = ({ navigation, route }) => {
  const { authenticatedApiCall, emitter } = useContext(AuthContext);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const {
    params: { namespace, section },
  } = route;
  const { t } = useTranslation(namespace);
  const { ship } = section;

  const sendNotificationHandler = async () => {
    if (notificationMessage) {
      Keyboard.dismiss();
      //console.log((ship && ship.imo) || 'port', notificationMessage);
      setProcessing(true);
      const res = await authenticatedApiCall(sendNotification, [
        ship ? 'ship' : 'port',
        notificationMessage,
        ship ? ship.imo : null,
      ]);
      if (res && res.status === STATUS_OK) {
        emitter.emit('showToast', {
          message: t('Notification sent successfully'),
          duration: 2000,
        });
        navigation.goBack();
      } else {
        setProcessing(false);
        const message = res && res.message ? res.message : t('Please try again later');
        emitter.emit('showToast', {
          message: t('Error occured while sending message: {{message}}', { message }),
          duration: 5000,
          type: 'error',
        });
      }
    }
  };

  return (
    <ProcessingAwareView processing={processing} style={styles.container}>
      {ship ? <PortcallHeader section={section} namespace={namespace} /> : <PortHeader namespace={namespace} />}
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollStyle}
        enableOnAndroid
        enableAutomaticScroll={Platform.OS === 'ios'}
        keyboardOpeningTime={0}
        viewIsInsideTabBar
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Send notification</Text>
          <StyledInput
            label={t('Notification message')}
            inputGroupStyle={styles.inputGroup}
            inputLabelStyle={styles.inputLabel}
            textInputStyle={styles.textInput}
            keyboardType="default"
            blurOnSubmit={false}
            multiline
            numberOfLines={4}
            onChangeText={(text) => setNotificationMessage(text)}
          />
          <StyledButton
            disabled={processing}
            onPress={() => sendNotificationHandler()}
            title={t('Send notification')}
            buttonStyle={styles.send}
          />
          <StyledButton
            disabled={processing}
            onPress={() => {
              Keyboard.dismiss();
              setProcessing(true);
              navigation.goBack();
            }}
            title={t('Cancel')}
            buttonStyle={styles.cancel}
            buttonTextStyle={styles.cancelText}
          />
        </View>
      </KeyboardAwareScrollView>
    </ProcessingAwareView>
  );
};

const PortHeader = ({ namespace }) => {
  const { t } = useTranslation(namespace);
  return (
    <View style={styles.portHeader}>
      <Text style={styles.portHeaderTitle}>{t('Global notification')}</Text>
      <Text style={styles.portHeaderDescription}>
        {t('Notification will be sent to all actors at port of {{portname}}', { portname: getPortName(namespace) })}
      </Text>
    </View>
  );
};

PortHeader.propTypes = {
  namespace: PropTypes.string.isRequired,
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$color_grey_lighter',
    flex: 1,
  },
  content: {
    padding: '$gap',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_black',
    marginBottom: '$gap',
  },
  scrollStyle: {
    flexGrow: 1,
  },
  inputGroup: {
    borderColor: '$color_grey_light',
  },
  inputLabel: {
    color: '$color_grey_dark',
  },
  textInput: {
    lineHeight: '$line_height',
    textAlignVertical: 'top',
    paddingTop: '$gap_small',
    height: '4 * $line_height',
  },
  send: {
    marginBottom: '$gap',
  },
  cancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$color_grey',
    shadowColor: 'transparent',
    elevation: 0,
  },
  cancelText: {
    color: '$color_tertiary',
  },
  portHeader: {
    backgroundColor: '$color_white',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.15,
    paddingHorizontal: '$gap',
    paddingVertical: '$gap_smaller',
    borderBottomColor: '$color_grey_light',
    borderBottomWidth: 1,
  },
  portHeaderTitle: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    color: '$color_grey_dark',
    marginBottom: '$gap_tinier',
  },
  portHeaderDescription: {
    color: '$color_grey',
    marginBottom: '$gap_tinier',
  },
});

SendNotificationScreen.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      section: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default SendNotificationScreen;
