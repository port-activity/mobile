import React from 'react';
import { Platform, StatusBar } from 'react-native';

// TODO: due to bug in expo the StatusBar styles have no effect in android if app.json
// does not have something like the following under android key:
// "androidStatusBar": {
//  "backgroundColor": "#fff",
//  "barStyle": "light-content"
//},
// However, the problem using this setting in app.json is that it causes additional
// margin below bottom tab bar in standalone build. Fix should arrive with SDK 37

export const DarkStatusBar = () => {
  if (Platform.OS === 'ios') {
    return <StatusBar barStyle="dark-content" />;
  }
  return <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />;
};

export const LightStatusBar = () => {
  if (Platform.OS === 'ios') {
    return <StatusBar barStyle="light-content" />;
  }
  return <StatusBar barStyle="light-content" backgroundColor="#070D39" translucent />;
};
