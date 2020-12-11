import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import 'moment/min/locales';

import { sendTimestamp } from '../api/Notifications';
import StyledButton from '../components/Button';
import StyledDateTimePicker from '../components/DateTimePicker';
import { PortcallHeader } from '../components/PortcallTimeline';
import { ProcessingAwareView } from '../components/ProcessingAwareView';
import StyledSelect from '../components/Select';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';
import { STATUS_OK } from '../utils/Constants';

const AddTimestampScreen = ({ navigation, route }) => {
  const { authenticatedApiCall, emitter } = useContext(AuthContext);
  const { timestampDefinitions } = useContext(DataContext);
  const [timestampDateTime, setTimestampDateTime] = useState(moment());
  const [timestampType, setTimestampType] = useState(null);
  const [processing, setProcessing] = useState(false);

  const {
    params: { namespace, section },
  } = route;
  const { t } = useTranslation(namespace);
  const { ship } = section;

  const addTimestampHandler = async () => {
    if ((ship.imo || ship.vessel_name) && timestampType && timestampDateTime) {
      setProcessing(true);
      const result = timestampDefinitions.find((def) => def.name === timestampType);
      if (!result) {
        setProcessing(false);
        return;
      }
      /*
      console.log(
        ship.imo,
        hip.vessel_name,
        result.time_type,
        result.state,
        timestampDateTime
          .clone()
          .seconds(0)
          .milliseconds(0)
          .toISOString()
      );*/
      const res = await authenticatedApiCall(sendTimestamp, [
        ship.imo,
        ship.vessel_name,
        result.time_type,
        result.state,
        timestampDateTime.clone().seconds(0).milliseconds(0).toISOString(),
      ]);
      if (res && res.status === STATUS_OK) {
        emitter.emit('showToast', {
          message: t('Timestamp added successfully'),
          duration: 2000,
        });
        setProcessing(false);
        navigation.goBack();
      } else {
        setProcessing(false);
        const message = res && res.message ? res.message : t('Please try again later');
        emitter.emit('showToast', {
          message: t('Error occured while adding timestamp: {{message}}', { message }),
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
          <Text style={styles.title}>Add new timestamp</Text>
          <StyledSelect
            label={t('Timestamp type')}
            labelStyle={styles.selectLabel}
            placeHolder={t('Select timestamp type')}
            items={timestampDefinitions.map((def) => ({ key: def.id, label: t(def.name), value: def.name }))}
            onValueChange={(value) => setTimestampType(value)}
            selectContainerStyle={styles.selectContainer}
            selectPlaceholderStyle={styles.selectPlaceholder}
            value={timestampType}
          />
          <StyledDateTimePicker
            inputLabelStyle={styles.selectLabel}
            dateTimeContainerStyle={styles.dateTimeContainer}
            onValueSelect={(value) => setTimestampDateTime(value)}
            inputGroupStyle={styles.dateTimeInputGroup}
            t={t}
            value={timestampDateTime}
          />
          <View style={styles.timestamp}>
            <Text style={styles.time}>
              {timestampDateTime.clone().utc().seconds(0).milliseconds(0).format('YYYY-MM-DDTHH:mm:ss+00:00')} UTC
            </Text>
          </View>
          <StyledButton
            disabled={processing}
            onPress={() => addTimestampHandler()}
            title={t('Add timestamp')}
            buttonStyle={styles.add}
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
  add: {
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

AddTimestampScreen.propTypes = {
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

export default AddTimestampScreen;
