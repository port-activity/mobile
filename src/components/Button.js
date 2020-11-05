import PropTypes from 'prop-types';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const StyledButton = ({ buttonStyle, buttonTextStyle, onPress, title, ...rest }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]} {...rest}>
      <Text style={[styles.buttonText, buttonTextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = EStyleSheet.create({
  button: {
    backgroundColor: '$color_tertiary',
    shadowOffset: '$shadow_offset',
    shadowRadius: '$shadow_radius',
    elevation: '$elevation',
    shadowColor: '$shadow_color',
    shadowOpacity: '$shadow_opacity',
    borderRadius: '$border_radius',
    padding: '$gap_small',
  },
  buttonText: {
    color: '$color_white',
    textAlign: 'center',
    alignSelf: 'center',
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_normal',
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
  },
});

StyledButton.propTypes = {
  buttonStyle: PropTypes.object,
  buttonTextStyle: PropTypes.object,
  onPress: PropTypes.func,
  title: PropTypes.string,
};

export default StyledButton;
