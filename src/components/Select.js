import { Arrow } from '@assets/images';
import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import RNPickerSelect from 'react-native-picker-select';

const StyledSelect = ({ label, placeHolder, ...props }) => (
  <View style={[styles.select, props.selectViewStyle]}>
    {label && <Text style={[styles.selectLabel, props.labelStyle]}>{label}</Text>}
    <RNPickerSelect
      style={{
        headlessAndroidContainer: {
          ...styles.selectContainer,
          ...props.selectContainerStyle,
        },
        iconContainer: {
          ...styles.selectArrow,
          ...props.selectArrowStyle,
        },
        inputIOSContainer: {
          ...styles.selectContainer,
          ...props.selectContainerStyle,
        },
        placeholder: {
          ...styles.selectPlaceholder,
          ...props.selectPlaceholderStyle,
        },
        inputAndroid: {
          ...styles.inputAndroid,
          ...props.inputAndroidStyle,
        },
        inputIOS: {
          ...styles.inputIos,
          ...props.inputIosStyle,
        },
      }}
      Icon={() => {
        return <Arrow height={10} width={15} style={[styles.chevron, props.chevronStyle]} />;
      }}
      placeholder={{
        label: placeHolder,
        value: null,
      }}
      useNativeAndroidPickerStyle={false}
      {...props}
    />
  </View>
);

const styles = EStyleSheet.create({
  $chevron_height: '0.625rem',
  $chevron_width: '0.9375rem',
  $input_height: '1.25rem',
  $chevron_vertical_mid: '$chevron_height / 2',
  /* TODO: depends on the font size */
  $container_height: '$input_height + $gap',
  $container_vertical_mid: '$container_height / 2',
  select: {
    marginBottom: '$gap',
  },
  selectContainer: {
    backgroundColor: '$color_white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_lighter',
    borderRadius: '$border_radius',
    color: '$color_near_black',
    '@media ios': {
      padding: '$gap_small',
      /* Padding for chevron */
      paddingRight: '$gap_small + $chevron_width',
    },
    '@media android': {
      height: '$container_height',
    },
  },
  inputAndroid: {
    /* Fix for android TextInput & container height */
    height: '$container_height',
    /* Padding for chevron */
    paddingRight: '$gap_small + $chevron_width',
    marginLeft: '$gap_small',
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
  },
  inputIos: {
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
  },
  selectArrow: {
    '@media ios': {
      right: '$gap_small',
    },
    '@media android': {
      right: '$gap_tinier + $gap_small',
    },
    top: '$container_vertical_mid - $chevron_vertical_mid',
    color: '$color_tertiary',
  },
  selectPlaceholder: {
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
  },
  selectLabel: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    lineHeight: '$line_height',
    letterSpacing: '0.025rem',
    textTransform: 'uppercase',
    color: '$color_white',
    borderRadius: '$border_radius',
    marginBottom: '$gap_tinier',
  },
  chevron: {
    height: '$chevron_height',
    width: '$chevron_width',
  },
});

StyledSelect.propTypes = {
  chevronStyle: PropTypes.object,
  inputAndroidStyle: PropTypes.object,
  inputIosStyle: PropTypes.object,
  label: PropTypes.string,
  labelStyle: PropTypes.object,
  placeHolder: PropTypes.string,
  selectArrowStyle: PropTypes.object,
  selectContainerStyle: PropTypes.object,
  selectPlaceholderStyle: PropTypes.object,
  selectViewStyle: PropTypes.object,
};

export default StyledSelect;
