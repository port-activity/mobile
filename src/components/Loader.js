import { LogoInverted } from '@assets/images';
import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LightStatusBar } from './StatusBar';

const Loader = () => {
  const [rotateValue] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [rotateValue]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 0.15, 0.5, 0.65, 1],
    outputRange: ['0deg', '-5deg', '180deg', '175deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.view}>
      <LightStatusBar />
      <Animated.View style={{ ...styles.logo, transform: [{ rotate: spin }] }}>
        <LogoInverted height={128} width={128} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = EStyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '$color_primary',
  },
  logo: {
    alignSelf: 'center',
  },
});

export default Loader;
