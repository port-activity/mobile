import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';

export const IconWithBadge = ({ IconClass, name, color, size }) => {
  const { notifications } = useContext(DataContext);
  const { userInfo } = useContext(AuthContext);

  const notificationCount = notifications
    ? notifications.filter((obj) => obj.state === 'unread' && obj.sender.email !== userInfo.email).length
    : 0;

  return (
    <View style={[{ width: size, height: size }, styles.view]}>
      <IconClass name={name} size={size} color={color} />
      {notificationCount > 0 && (
        <View style={styles.notification}>
          <Text style={styles.title}>{notificationCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = EStyleSheet.create({
  view: {
    margin: '$gap_tinier',
  },
  notification: {
    position: 'absolute',
    right: -5,
    top: -2,
    backgroundColor: '$color_error',
    borderRadius: '$border_radius_big',
    width: 19,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    textTransform: 'uppercase',
    color: '$color_white',
  },
});

IconWithBadge.propTypes = {
  color: PropTypes.string.isRequired,
  IconClass: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  notificationCount: PropTypes.number,
  size: PropTypes.number.isRequired,
};
