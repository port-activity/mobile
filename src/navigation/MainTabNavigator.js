import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Constants from 'expo-constants';
import React, { useContext } from 'react';
import { useSafeArea } from 'react-native-safe-area-context';

import { IconWithBadge } from '../components/BadgeIcon';
import HeaderTitle from '../components/HeaderTitle';
import { AuthContext } from '../context/Auth';
import { TAB_BAR_HEIGHT } from '../utils/Constants';
import ActivityScreen from '../views/Activity';
import AddTimestampScreen from '../views/AddTimestamp';
import LogisticsScreen from '../views/Logistics';
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

const defaultScreenOptions = ({ navigation }) => ({
  cardOverlayEnabled: true,
  gestureEnabled: true,
  headerLeft: () => null,
  headerRight: () => null,
  headerStyle: {
    backgroundColor: '#070D39',
    height: 64 + Constants.statusBarHeight,
  },
  headerTitle: () => <HeaderTitle />,
  headerTitleAlign: 'center',
  safeAreaInsets: {
    top: Constants.statusBarHeight, // Prevent header content jumping when rendering
  },
  ...TransitionPresets.SlideFromRightIOS,
});

const ActivityStack = ({ navigation, route }) => {
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        if (route.state && route.state.index) {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: route.state,
          });
        }
      }),
    [navigation, route.state]
  );

  return (
    <Stack.Navigator headerMode="float" initialRouteName="Activity" screenOptions={defaultScreenOptions}>
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
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        if (route.state && route.state.index) {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: route.state,
          });
        }
      }),
    [navigation, route.state]
  );

  return (
    <Stack.Navigator headerMode="float" initialRouteName="Queue" screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Queue" component={QueueScreen} options={{ headerTitle: () => <HeaderTitle /> }} />
    </Stack.Navigator>
  );
};

const LogisticsStack = ({ navigation, route }) => {
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        if (route.state && route.state.index) {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: route.state,
          });
        }
      }),
    [navigation, route.state]
  );

  return (
    <Stack.Navigator headerMode="float" initialRouteName="Logistics" screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Logistics" component={LogisticsScreen} />
    </Stack.Navigator>
  );
};

const NotificationsStack = ({ navigation, route }) => {
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        if (route.state && route.state.index) {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: route.state,
          });
        }
      }),
    [navigation, route.state]
  );

  return (
    <Stack.Navigator headerMode="float" initialRouteName="Notifications" screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="SendGlobalNotification"
        component={SendNotificationScreen}
        options={{ headerTitle: () => <HeaderTitle showBackButton /> }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = ({ navigation, route }) => {
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        //console.log('tab pressed');
        if (route.state && route.state.index) {
          //console.log(route);
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: route.state,
          });
        }
      }),
    [navigation, route.state]
  );

  return (
    <Stack.Navigator headerMode="float" initialRouteName="Profile" screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = ({ t }) => {
  const { isModuleEnabled } = useContext(AuthContext);
  const insets = useSafeArea();
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
              return <MaterialCommunityIcons name="anchor" size={32} color={color} style={{ top: 3 }} />;
            },
            unmountOnBlur: false,
          }}
        />
      ) : null}
      {isModuleEnabled('queue_module') ? (
        <Tab.Screen
          name="QueueStack"
          component={QueueStack}
          options={{
            tabBarLabel: t('Queue'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="timetable" size={32} color={color} style={{ top: 3 }} />;
            },
            unmountOnBlur: false,
          }}
        />
      ) : null}
      {isModuleEnabled('logistics_module') ? (
        <Tab.Screen
          name="LogisticsStack"
          component={LogisticsStack}
          options={{
            tabBarLabel: t('Logistics'),
            tabBarIcon: ({ focused, color }) => {
              return <MaterialCommunityIcons name="truck" size={32} color={color} style={{ top: 3 }} />;
            },
            unmountOnBlur: false,
          }}
        />
      ) : null}
      <Tab.Screen
        name="NotificationsStack"
        component={NotificationsStack}
        options={{
          tabBarLabel: t('Notifications'),
          tabBarIcon: ({ focused, color }) => {
            const iconName = 'ios-information-circle';
            return <IconWithBadge IconClass={Ionicons} name={iconName} size={32} color={color} />;
          },
          unmountOnBlur: false,
        }}
      />
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
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
