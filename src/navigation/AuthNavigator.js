import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

import ForgotPasswordScreen from '../views/ForgotPassword';
import LoginScreen from '../views/Login';
import RegisterScreen from '../views/Register';
import ResetPasswordScreen from '../views/ResetPassword';
import SelectPortScreen from '../views/SelectPort';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SelectPort"
      headerMode="none"
      screenOptions={{
        cardOverlayEnabled: true,
        gestureEnabled: true,
        ...TransitionPresets.SlideFromRightIOS,
      }}>
      <Stack.Screen
        name="SelectPort"
        component={SelectPortScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
