import { CommonActions } from '@react-navigation/native';
import * as React from 'react';

export const isMountedRef = React.createRef();
export const navigationRef = React.createRef();

function navigate(routeName, params = {}) {
  if (isMountedRef.current && navigationRef.current) {
    //navigationRef.current.navigate(routeName, params);
    //navigationRef.current.reset();
    navigationRef.current.dispatch(CommonActions.navigate(routeName, params));
  }
}

function getCurrentRoute() {
  if (isMountedRef.current && navigationRef.current) {
    const state = navigationRef.current.getRootState();
    let route = state.routes[state.index].state;
    while (route && route.routes) {
      route = route.routes[route.index];
    }
    return route;
  }
  return '';
}

export default {
  getCurrentRoute,
  navigate,
};
