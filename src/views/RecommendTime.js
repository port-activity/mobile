import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import 'moment/min/locales';

import { sendRTA } from '../api/Notifications';
import StyledButton from '../components/Button';
import StyledDateTimePicker from '../components/DateTimePicker';
import { PortcallHeader } from '../components/PortcallTimeline';
import { ProcessingAwareView } from '../components/ProcessingAwareView';
import StyledSelect from '../components/Select';
import { AuthContext } from '../context/Auth';
import { defaultRtaLocations, STATUS_OK } from '../utils/Constants';
import { getPortName } from '../utils/Helpers';

const RecommendTimeScreen = ({ navigation, route }) => {
  const { authenticatedApiCall, emitter, userInfo } = useContext(AuthContext);
  const [rtaDateTime, setRtaDateTime] = useState(moment());
  // TODO: location setting disabled for now
  const [rtaLocation, setRtaLocation] = useState('outer_port_area');
  const [processing, setProcessing] = useState(false);
  const {
    params: { namespace, section },
  } = route;
  const { t } = useTranslation(namespace);
  const { ship } = section;

  const recommendTimeHandler = async () => {
    if (namespace && ship.imo && rtaDateTime /*&& rtaLocation*/) {
      setProcessing(true);
      /*
      console.log(
        ship.imo,
        rtaLocation,
        rtaDateTime
          .seconds(0)
          .milliseconds(0)
          .toISOString()
      );*/
      const res = await authenticatedApiCall(sendRTA, [
        getPortName(namespace),
        ship.imo,
        rtaDateTime.clone().utc().seconds(0).milliseconds(0).format('YYYY-MM-DDTHH:mm:ss+00:00'),
        rtaDateTime
          .clone()
          .utc()
          .subtract(30, 'minutes')
          .seconds(0)
          .milliseconds(0)
          .format('YYYY-MM-DDTHH:mm:ss+00:00'),
        rtaDateTime.clone().utc().add(30, 'minutes').seconds(0).milliseconds(0).format('YYYY-MM-DDTHH:mm:ss+00:00'),
        {
          email: userInfo.email,
        },
      ]);
      if (res && res.status === STATUS_OK) {
        emitter.emit('showToast', {
          message: t('RTA sent successfully'),
          duration: 2000,
        });
        setProcessing(false);
        navigation.goBack();
      } else {
        setProcessing(false);
        const message = res && res.message ? res.message : t('Please try again later');
        emitter.emit('showToast', {
          message: t('Error occured while sending RTA: {{message}}', { message }),
          duration: 5000,
          type: 'error',
        });
      }
    }
  };

  return (
    <ProcessingAwareView processing={processing} style={styles.container}>
      <PortcallHeader section={section} namespace={namespace} />
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Recommend time (RTA)</Text>
          <StyledSelect
            label={t('Location')}
            labelStyle={styles.selectLabel}
            placeHolder={t('Select timestamp type')}
            inputAndroidStyle={styles.disableText}
            inputIosStyle={styles.disableText}
            items={defaultRtaLocations.map(({ key, label, value }) => ({ key, label: t(label), value }))}
            onValueChange={(value) => setRtaLocation(value)}
            selectContainerStyle={styles.disabledContainer}
            selectPlaceholderStyle={styles.selectPlaceholder}
            value={rtaLocation}
            disabled
          />
          <StyledDateTimePicker
            inputLabelStyle={styles.selectLabel}
            dateTimeContainerStyle={styles.dateTimeContainer}
            onValueSelect={(value) => setRtaDateTime(value)}
            inputGroupStyle={styles.dateTimeInputGroup}
            t={t}
            value={rtaDateTime}
          />
          <View style={styles.timestamp}>
            <Text style={styles.time}>
              {rtaDateTime.clone().utc().seconds(0).milliseconds(0).format('YYYY-MM-DDTHH:mm:ss+00:00')} UTC
            </Text>
          </View>
          <StyledButton
            disabled={processing}
            onPress={() => recommendTimeHandler()}
            title={t('Recommend time')}
            buttonStyle={styles.send}
          />
          <StyledButton
            disabled={processing}
            onPress={() => {
              setProcessing(true);
              navigation.goBack();
            }}
            title={t('Cancel')}
            buttonStyle={styles.cancel}
            buttonTextStyle={styles.cancelText}
          />
        </View>
      </ScrollView>
    </ProcessingAwareView>
  );
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
  selectLabel: {
    color: '$color_grey_dark',
  },
  selectContainer: {
    borderColor: '$color_grey_light',
  },
  disabledContainer: {
    backgroundColor: '#ddd',
  },
  disableText: {
    color: '$color_grey',
  },
  selectPlaceholder: {
    color: '$color_grey',
  },
  dateTimeContainer: {
    marginBottom: '$gap_small',
  },
  dateTimeInputGroup: {
    borderColor: '$color_grey_light',
  },
  timestamp: {
    paddingHorizontal: '$gap_smaller',
    marginBottom: '$gap',
  },
  time: {
    fontFamily: 'Open Sans Italic',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    color: '$color_grey',
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
});

RecommendTimeScreen.propTypes = {
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

export default RecommendTimeScreen;
