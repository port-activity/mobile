import moment from 'moment';
import PropTypes from 'prop-types';
import React, { memo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { AuthContext } from '../context/Auth';
import { getPortName } from '../utils/Helpers';

export const NotificationsEvent = memo(({ item }) => {
  const { namespace, userInfo } = useContext(AuthContext);

  return (
    <View style={styles.eventContainer}>
      <Notification item={item} namespace={namespace} userInfo={userInfo} />
    </View>
  );
});

NotificationsEvent.propTypes = {
  item: PropTypes.object.isRequired,
};

// TOOO: Evaluate if memo is unnecessary
const Notification = memo(({ item, namespace, userInfo }) => {
  const { t } = useTranslation(namespace);
  const { created_at, message, type, sender, ship, ship_imo } = item;
  let name = '';
  if (type === 'ship') {
    name = (ship && ship.vessel_name) || `IMO #${ship_imo}`;
  } else {
    name = t('Port of {{portname}}', { portname: getPortName(namespace) });
  }

  const newItem =
    item.state && (item.state === 'unread' || item.state === 'pending') && sender.email !== userInfo.email;

  return (
    <View style={styles.notificationContainer}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, newItem ? styles.newItem : null]}>{message}</Text>
        <Text style={[styles.sender, newItem ? styles.newItem : null]}>
          {t('Sent by {{sender}} at {{from}}', { sender: sender.email, from: name })}
        </Text>
        <Text style={styles.time} />
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>
          {
            // TODO Use proper regional time formatting.
            moment(created_at).format('DD.MM.YYYY HH:mm')
          }
        </Text>
      </View>
    </View>
  );
});

Notification.propTypes = {
  item: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
  userInfo: PropTypes.object.isRequired,
};

const styles = EStyleSheet.create({
  eventContainer: {
    flex: 1,
    marginBottom: '$gap',
  },
  notificationContainer: {
    //flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '$color_white',

    borderRadius: '$border_radius',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.15,

    padding: '$gap_small',
  },
  textContainer: {
    flex: 1,
  },
  timeContainer: {
    marginLeft: '$gap_small',
    alignSelf: 'flex-end',
  },
  title: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    color: '$color_grey_dark',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  sender: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  newItem: {
    fontFamily: 'Open Sans Bold',
  },
  time: {
    alignSelf: 'flex-end',
    fontFamily: 'Open Sans Italic',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey',
    marginBottom: '$gap_tiny',
    paddingTop: '$gap_small',
  },
});
