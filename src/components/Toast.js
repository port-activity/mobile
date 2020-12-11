import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Animated, Dimensions, Text, ViewPropTypes } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '../utils/Constants';
import { getPortName } from '../utils/Helpers';
import { useGetState, useAsyncSetState } from '../utils/UseAsyncSetState';

const { height } = Dimensions.get('window');

const Toast = forwardRef((props, ref) => {
  const {
    defaultCloseDelay = 0,
    fadeOutDuration = 500,
    fadeInDuration = 500,
    opacity = 1,
    placement = 'bottom',
    position = TAB_BAR_HEIGHT,
    textStyle,
    toastStyle,
  } = props;

  const initState = {
    animation: null,
    isShowing: false,
    opacityValue: new Animated.Value(opacity),
    textOrElement: '',
    timer: null,
  };

  const [state, setStateAsync] = useAsyncSetState(initState);
  const getState = useGetState(state);

  const { isShowing, opacityValue, textOrElement } = state;
  const [toastTop, setToastTop] = useState(position);
  const [closeCallback, setCloseCallback] = useState(null);

  useEffect(() => {
    const currentAnimation = getState().animation;
    if (currentAnimation) {
      currentAnimation.stop();
    }
    const currentTimer = getState().timer;
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    return () => {
      if (currentAnimation) {
        currentAnimation.stop();
      }
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
    };
  }, []);

  const onLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    if (placement === 'bottom') {
      setToastTop(height + position);
    }
  }, []);

  const show = async (textOrComponent, duration = 0, callback = null) => {
    if (!textOrComponent) {
      return;
    }
    const oldTimer = getState().timer;
    if (oldTimer) {
      clearTimeout(oldTimer);
    }
    const oldAnimation = getState().animation;
    if (oldAnimation) {
      oldAnimation.stop();
    }
    const newAnimation = Animated.timing(opacityValue, {
      toValue: opacity,
      duration: fadeInDuration,
      useNativeDriver: true,
    });
    await setStateAsync((s) => ({
      ...s,
      //animation: newAnimation,
      isShowing: true,
      textOrElement: textOrComponent,
      timer: null,
    }));

    newAnimation.start(async () => {
      if (duration > 0) {
        await close(duration, callback, true);
      } else {
        setCloseCallback(() => callback);
      }
    });
  };

  const close = async (duration = -1, callback = null, forceShow = false) => {
    if (!getState().isShowing && !forceShow) {
      return;
    }
    const oldTimer = getState().timer;
    if (oldTimer) {
      clearTimeout(oldTimer);
    }
    const oldAnimation = getState().animation;
    if (oldAnimation) {
      oldAnimation.stop();
    }

    let delay = duration;
    let fadeOut = fadeOutDuration;
    if (delay <= 0) {
      // Toast tapped, close immediately
      delay = defaultCloseDelay;
      fadeOut = 0;
    }

    const newAnimation = Animated.timing(opacityValue, {
      toValue: 0.0,
      duration: fadeOut,
      useNativeDriver: true,
    });
    const newTimer = setTimeout(async () => {
      newAnimation.start(async () => {
        if (callback) {
          callback();
        }
        await setStateAsync((s) => ({
          ...s,
          isShowing: false,
        }));
      });
    }, delay);
    await setStateAsync((s) => ({
      ...s,
      animation: newAnimation,
      timer: newTimer,
    }));
  };

  // Allow calling of functions
  ref.current = { close, show };

  const onToastTap = async () => {
    await close(0, closeCallback);
    setCloseCallback(null);
  };

  let pos = 0;
  switch (placement) {
    case 'center':
      pos = height / 2 + toastTop;
      break;
    case 'top':
      pos = toastTop;
      break;
    case 'bottom':
    default:
      pos = height - toastTop;
      break;
  }

  //console.log(state);

  return isShowing ? (
    <View style={[styles.container, { top: pos }]} onLayout={onLayout}>
      <TouchableWithoutFeedback style={styles.touchable} onPress={onToastTap}>
        <Animated.View style={[styles.content, { opacity: opacityValue }, toastStyle]}>
          {React.isValidElement(textOrElement) ? (
            textOrElement
          ) : (
            <Text style={[styles.text, textStyle]}>{textOrElement}</Text>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  ) : null;
});

Toast.propTypes = {
  fadeInDuration: PropTypes.number,
  fadeOutDuration: PropTypes.number,
  opacity: PropTypes.number,
  placement: PropTypes.oneOf(['top', 'center', 'bottom']),
  position: PropTypes.number,
  textStyle: Text.propTypes.style,
  toastStyle: ViewPropTypes.style,
};

export const NotificationToast = forwardRef((props, ref) => {
  const { placement, position } = props;
  const insets = useSafeAreaInsets();
  let pos = position;
  if (typeof pos === 'undefined') {
    pos = TAB_BAR_HEIGHT + 8 + insets.bottom;
  }

  return <Toast placement={placement} position={pos} ref={ref} />;
});

NotificationToast.propTypes = {
  placement: PropTypes.oneOf(['top', 'center', 'bottom']),
  position: PropTypes.number,
};

export const ErrorToast = forwardRef((props, ref) => {
  const { placement, position } = props;
  const insets = useSafeAreaInsets();
  let pos = position;
  if (typeof pos === 'undefined') {
    pos = TAB_BAR_HEIGHT + 8 + insets.bottom;
  }

  return <Toast placement={placement} position={pos} ref={ref} toastStyle={styles.errorToast} />;
});

ErrorToast.propTypes = {
  placement: PropTypes.oneOf(['top', 'center', 'bottom']),
  position: PropTypes.number,
};

export const SuccessToast = forwardRef((props, ref) => {
  const { placement, position } = props;
  const insets = useSafeAreaInsets();
  let pos = position;
  if (typeof pos === 'undefined') {
    pos = TAB_BAR_HEIGHT + 8 + insets.bottom;
  }

  return <Toast placement={placement} position={pos} ref={ref} toastStyle={styles.successToast} />;
});

SuccessToast.propTypes = {
  placement: PropTypes.oneOf(['top', 'center', 'bottom']),
  position: PropTypes.number,
};

export const FormattedNotification = ({ data, namespace }) => {
  const { t } = useTranslation(namespace);
  const { created_at, message, type, sender, ship, ship_imo } = data;
  let name = '';
  if (type === 'ship') {
    name = (ship && ship.vessel_name) || ship_imo;
  } else {
    name = t('Port of {{portname}}', { portname: getPortName(namespace) });
  }

  return (
    <View style={styles.notificationView}>
      <Text style={styles.notificationTime}>
        {
          // TODO Use proper regional time formatting.
          moment(created_at).format('DD.MM.YYYY HH:mm')
        }
      </Text>
      <Text style={styles.notificationText}>{message}</Text>
      <Text style={styles.notificationSender}>
        {t('Sent by {{sender}} at {{from}}', { sender: sender.email, from: name })}
      </Text>
    </View>
  );
};

const styles = EStyleSheet.create({
  $max_width: '100% - $gap_big',
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    elevation: 999,
    alignItems: 'center',
    zIndex: 10000,
  },
  touchable: {
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '$color_grey_lighter',
    borderWidth: 1.4,
    borderStyle: 'solid',
    borderColor: '$color_tertiary',
    borderRadius: '$border_radius',
    maxWidth: '$max_width',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.15,
    padding: '$gap',
  },
  text: {
    color: '$color_near_black',
  },
  errorToast: {
    borderColor: '$color_error',
    backgroundColor: '#fff1f0',
  },
  successToast: {
    borderColor: '#407505',
    backgroundColor: '#f6ffed',
  },
  notificationView: {
    flex: 1,
    width: '$max_width - $gap_big',
  },
  notificationText: {
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  notificationTime: {
    fontFamily: 'Open Sans Italic',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_grey_dark',
    marginBottom: '$gap_small',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  notificationSender: {
    marginTop: '$gap_small',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_grey_dark',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
});
