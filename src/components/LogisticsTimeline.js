import { Entypo } from '@expo/vector-icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const LogisticsEvent = memo(({ event, namespace }) => {
  const left = event.direction === 'In';

  return (
    <View style={styles.eventContainer}>
      {left ? <LogisticsTimestamp event={event} namespace={namespace} /> : <View style={styles.placeholder} />}
      {left ? <View style={styles.placeholder} /> : <LogisticsTimestamp event={event} namespace={namespace} />}
    </View>
  );
});

LogisticsEvent.propTypes = {
  event: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
};

// TOOO: Evaluate if memo is unnecessary
const LogisticsTimestamp = memo(({ event, namespace }) => {
  const { t } = useTranslation(namespace);
  const left = event.direction === 'In';
  const nationality = event.front_license_plates.length > 0 ? event.front_license_plates[0].nationality : t('N/A');
  const regNo =
    event.front_license_plates.length > 0
      ? event.front_license_plates[0].number.replace(/(^\w{3})(\d{3})/, '$1-$2')
      : t('N/A');

  return (
    <View style={styles.timestampContainer}>
      <View style={styles.timestampKeyContainer}>
        <Text style={styles.keyText}>{left ? t('Arrived') : t('Departed')}</Text>
        <Text style={styles.keyText} />
        <Text style={styles.keyText}>{t('Nationality')}</Text>
        <Text style={styles.keyText}>{t('Reg No.')}</Text>
      </View>
      <View style={styles.timestampValueContainer}>
        <Text style={styles.keyValue}>{moment(event.time).fromNow()}</Text>
        <Text style={[styles.keyValue, styles.time]}>
          {
            // TODO Use proper regional time formatting.
            moment(event.time).format('DD.MM.YYYY HH:mm')
          }
        </Text>
        <Text style={styles.keyValue}>{nationality}</Text>
        <Text style={styles.keyValue}>{regNo}</Text>
      </View>
    </View>
  );
});

LogisticsTimestamp.propTypes = {
  event: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
};

export const LogisticsItemSeparator = memo(() => {
  return (
    <View style={styles.itemSeparatorContainer}>
      <Entypo name="dots-two-vertical" size={16} color="#C4C4C4" />
    </View>
  );
});

const styles = EStyleSheet.create({
  eventContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timestampContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '$color_white',

    borderRadius: '$border_radius',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.15,

    paddingHorizontal: '$gap',
    paddingVertical: '$gap_smaller',
  },
  placeholder: {
    width: '25%',
  },
  timestampKeyContainer: {
    flexDirection: 'column',
    marginRight: '$gap_small',
  },
  timestampValueContainer: {
    flexDirection: 'column',
  },
  keyText: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
    textTransform: 'uppercase',
    letterSpacing: '0.025rem',
    marginBottom: '$gap_tiny',
  },
  keyValue: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
    marginBottom: '$gap_tiny',
  },
  time: {
    fontFamily: 'Open Sans Italic',
    color: '$color_grey',
  },
  itemSeparatorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
