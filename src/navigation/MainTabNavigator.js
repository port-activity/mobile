import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, StackActions } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeaderTitle from '../components/HeaderTitle';
import { AuthContext } from '../context/Auth';
import { NotificationsContext } from '../context/Notifications';
import { HEADER_HEIGHT, TAB_BAR_HEIGHT } from '../utils/Constants';
import ActivityScreen from '../views/Activity';
import AddTimestampScreen from '../views/AddTimestamp';
import LogisticsScreen from '../views/Logistics';
import MapScreen from '../views/Map';
import NotificationsScreen from '../views/Notifications';
import ProfileScreen from '../views/Profile';
import QueueScreen from '../views/Queue';
import RecommendTimeScreen from '../views/RecommendTime';
import SendNotificationScreen from '../views/SendNotification';
import ShipInformationScreen from '../views/ShipInformation';
import VesselScreen from '../views/Vessel';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/*
const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});
*/

const defaultScreenOptions = ({ navigation, topInset }) => ({
  cardOverlayEnabled: true,
  gestureEnabled: true,
  headerLeft: () => null,
  headerRight: () => null,
  headerStyle: {
    backgroundColor: '#070D39',
    height: HEADER_HEIGHT + topInset,
  },
  headerTitle: () => <HeaderTitle />,
  headerTitleAlign: 'center',
  safeAreaInsets: {
    top: topInset, // Prevent header content jumping when rendering
  },
  ...TransitionPresets.SlideFromRightIOS,
});

const ActivityStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Activity';
        //console.log(routeName);
        if (routeName !== 'Activity') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: ActivityStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Activity"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Activity" component={ActivityScreen} options={{ headerTitle: () => <HeaderTitle /> }} />
      <Stack.Screen
        name="Vessel"
        component={VesselScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
      <Stack.Screen
        name="AddTimestamp"
        component={AddTimestampScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
      <Stack.Screen
        name="RecommendTime"
        component={RecommendTimeScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
      <Stack.Screen
        name="SendNotification"
        component={SendNotificationScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
      <Stack.Screen
        name="ShipInformation"
        component={ShipInformationScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
    </Stack.Navigator>
  );
};

const QueueStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Queue';
        if (routeName !== 'Queue') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: QueueStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Queue"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Queue" component={QueueScreen} options={{ headerTitle: () => <HeaderTitle /> }} />
    </Stack.Navigator>
  );
};

const LogisticsStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Logistics';
        if (routeName !== 'Logistics') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: LogisticsStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Logistics"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Logistics" component={LogisticsScreen} />
    </Stack.Navigator>
  );
};

const NotificationsStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Notifications';
        if (routeName !== 'Notifications') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: NotificationsStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Notifications"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="SendGlobalNotification"
        component={SendNotificationScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
    </Stack.Navigator>
  );
};

const MapStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Map';
        if (routeName !== 'Map') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: MapStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Map"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = ({ navigation, route }) => {
  const { topInset } = route.params;
  // Reset stack when navigating away
  useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Profile';
        if (routeName !== 'Profile') {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: ProfileStack,
          });
        }
      }),
    [navigation, route]
  );

  return (
    <Stack.Navigator
      headerMode="float"
      initialRouteName="Profile"
      screenOptions={(options) => defaultScreenOptions({ navigation: options.navigation, topInset })}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = ({ t }) => {
  const { isModuleEnabled } = useContext(AuthContext);
  const { newNotificationsCount } = useContext(NotificationsContext);
  const insets = useSafeAreaInsets();
  const [topInset] = useState(insets.top);

  return (
    <Tab.Navigator
      backBehavior="history"
      initialRouteName="ActivityStack"
      tabBarOptions={{
        activeTintColor: '#4990DD',
        labelPosition: 'below-icon',
        labelStyle: {
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          fontWeight: 'bold',
          fontSize: 10,
          lineHeight: 14,
          textAlign: 'center',
          color: '#4A4A4A',
          bottom: 8,
        },
        style: {
          height: TAB_BAR_HEIGHT + insets.bottom,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 2,
          elevation: 2,
          shadowColor: '#797979',
          shadowOpacity: 0.25,
        },
      }}>
      {isModuleEnabled('activity_module') ? (
        <Tab.Screen
          name="ActivityStack"
          component={ActivityStack}
          options={{
            tabBarLabel: t('Activity'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="anchor" size={32} color={color} />;
            },
            unmountOnBlur: false,
          }}
          initialParams={{ topInset }}
        />
      ) : null}
      {isModuleEnabled('queue_module') ? (
        <Tab.Screen
          name="QueueStack"
          component={QueueStack}
          options={{
            tabBarLabel: t('Queue'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="timetable" size={32} color={color} />;
            },
            unmountOnBlur: false,
          }}
          initialParams={{ topInset }}
        />
      ) : null}
      {isModuleEnabled('logistics_module') ? (
        <Tab.Screen
          name="LogisticsStack"
          component={LogisticsStack}
          options={{
            tabBarLabel: t('Logistics'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="truck" size={32} color={color} />;
            },
            unmountOnBlur: false,
          }}
          initialParams={{ topInset }}
        />
      ) : null}
      <Tab.Screen
        name="NotificationsStack"
        component={NotificationsStack}
        options={{
          tabBarLabel: t('Notifications'),
          tabBarIcon: ({ focused, color }) => {
            return <Ionicons name="ios-information-circle" size={32} color={color} />;
          },
          unmountOnBlur: false,
          tabBarBadge: newNotificationsCount > 0 ? newNotificationsCount : null,
          tabBarBadgeStyle: {
            backgroundColor: '#D0011C',
            fontFamily: 'Open Sans',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
            textTransform: 'uppercase',
            color: 'white',
          },
        }}
        initialParams={{ topInset }}
      />
      {isModuleEnabled('map_module') ? (
        <Tab.Screen
          name="MapStack"
          component={MapStack}
          options={{
            tabBarLabel: t('Map'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="map" size={32} color={color} />;
            },
            unmountOnBlur: false,
          }}
          initialParams={{ topInset }}
        />
      ) : null}
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarLabel: t('Settings'),
          tabBarIcon: ({ focused, color }) => {
            return <MaterialIcons name="settings" size={32} color={color} />;
          },
          unmountOnBlur: false,
        }}
        initialParams={{ topInset }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
