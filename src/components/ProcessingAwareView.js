import PropTypes from 'prop-types';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const ProcessingAwareView = ({ children, processing, ...rest }) => {
  return (
    <View {...rest}>
      {children}
      {processing ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : null}
    </View>
  );
};

ProcessingAwareView.propTypes = {
  children: PropTypes.node,
  viewStyles: PropTypes.object,
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
