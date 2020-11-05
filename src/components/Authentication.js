import { Logo } from '@assets/images';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AuthView = ({ children, viewStyles, ...rest }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.view, viewStyles]}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollView}
          enableOnAndroid
          enableAutomaticScroll={Platform.OS === 'ios'}
          keyboardOpeningTime={0}
          //resetScrollToCoords={{ x: 0, y: 0 }}
          viewIsInsideTabBar
          keyboardShouldPersistTaps="handled">
          <AuthContainer {...rest}>{children}</AuthContainer>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

AuthView.propTypes = {
  children: PropTypes.node,
  viewStyles: PropTypes.object,
};

export const AuthLogo = (props) => {
  return <Logo height={80} width={80} style={[styles.logo, props.logoStyle]} />;
};

AuthLogo.propTypes = {
  logoStyle: PropTypes.object,
};

export const AuthContainer = ({ children, containerStyle, ...rest }) => {
  return (
    <View style={containerStyle}>
      <AuthLogo {...rest} />
      {children}
    </View>
  );
};

AuthContainer.propTypes = {
  children: PropTypes.node,
  containerStyle: PropTypes.object,
};

export const AuthForm = (props) => {
  return <View style={[styles.form, props.style]}>{props.children}</View>;
};

AuthForm.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export const AuthPortName = ({ children, style, ...rest }) => {
  return (
    <Text style={[styles.portName, style]} {...rest}>
      {children}
    </Text>
  );
};

AuthPortName.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export const AuthTitle = ({ children, style, ...rest }) => {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
};

AuthTitle.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export const AuthSubTitle = ({ children, style, ...rest }) => {
  return (
    <Text style={[styles.subtitle, style]} {...rest}>
      {children}
    </Text>
  );
};

AuthSubTitle.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export const AuthLink = ({ children, linkStyle, linkTextStyle, ...rest }) => {
  return (
    <View style={[styles.link, linkStyle]}>
      <Text style={[styles.linkText, linkTextStyle]} {...rest}>
        {children}
      </Text>
    </View>
  );
};

AuthLink.propTypes = {
  children: PropTypes.node,
  linkStyle: PropTypes.object,
  linkTextStyle: PropTypes.object,
};

const styles = EStyleSheet.create({
  $drawable_width: '100% - $gap_big',
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  view: {
    flex: 1,
    backgroundColor: '$color_white',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    paddingHorizontal: '$gap',
  },
  scrollView: {
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: '$gap_big',
  },
  form: {
    backgroundColor: '$color_secondary',
    shadowOffset: '$shadow_offset',
    shadowRadius: '$shadow_radius',
    elevation: '$elevation',
    shadowColor: '$shadow_color',
    shadowOpacity: '$shadow_opacity',
    borderRadius: '$border_radius_big',
    paddingHorizontal: '$gap',
    paddingVertical: '$gap',
    marginBottom: '$gap_small',
  },
  portName: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_normal',
    lineHeight: '$line_height',
    letterSpacing: '0.05rem',
    textTransform: 'uppercase',
    color: '$color_tertiary',
    marginBottom: '$gap_small',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_white',
    marginBottom: '$gap_smaller',
  },
  subtitle: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    lineHeight: '$line_height',
    color: '$color_white',
    marginBottom: '$gap_smaller',
  },
  link: {
    left: '$gap',
    width: '$drawable_width - $gap_big',
  },
  linkText: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    lineHeight: '$line_height',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    color: '$color_grey',
  },
});
