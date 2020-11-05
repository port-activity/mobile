import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const StyledInput = forwardRef((props, ref) => {
  const { Icon, iconStyle, imageContainerStyle, inputGroupStyle, inputLabelStyle, inputStyle, label, ...rest } = props;
  return (
    <View style={[styles.inputContainer, inputStyle]}>
      {props.label && <Text style={[styles.inputLabel, inputLabelStyle]}>{props.label}</Text>}
      <View style={[styles.inputGroup, inputGroupStyle]}>
        {Icon ? (
          <View style={[styles.imageContainer, imageContainerStyle]}>
            <Icon style={[styles.icon, iconStyle]} />
          </View>
        ) : null}
        <StyledTextInput forwardedRef={ref} {...rest} />
      </View>
    </View>
  );
});

StyledInput.propTypes = {
  Icon: PropTypes.func,
  iconStyle: PropTypes.object,
  imageContainerStyle: PropTypes.object,
  inputGroupStyle: PropTypes.object,
  inputLabelStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  label: PropTypes.string,
};

export const StyledTextInput = ({ forwardedRef, textInputStyle, ...rest }) => {
  return (
    <TextInput
      style={[styles.input, textInputStyle]}
      clearButtonMode="while-editing"
      underlineColorAndroid="transparent"
      ref={forwardedRef}
      {...rest}
    />
  );
};

StyledTextInput.propTypes = {
  forwardedRef: PropTypes.object,
  textInputStyle: PropTypes.object,
};

const styles = EStyleSheet.create({
  inputContainer: {
    marginBottom: '$gap',
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '$color_white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_lighter',
    borderRadius: '$border_radius',
  },
  imageContainer: {
    justifyContent: 'center',
    paddingLeft: '$gap_small',
    borderRadius: '$border_radius',
  },
  inputLabel: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    letterSpacing: '0.025rem',
    textTransform: 'uppercase',
    color: '$color_white',
    borderRadius: '$border_radius',
    marginBottom: '$gap_tinier',
  },
  input: {
    flexGrow: 1,
    '@media ios': {
      padding: '$gap_small',
    },
    '@media android': {
      paddingVertical: '$gap_tiny',
      paddingHorizontal: '$gap_small',
    },
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
  },
});
