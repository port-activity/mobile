import { useContext, useEffect } from 'react';

import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';
import NavigationService from '../navigation/NavigationService';
import { shouldShowNotification } from '../utils/Helpers';

const PushNotificationsListener = ({ notification = {} }) => {
  const { pinnedVessels, portCalls } = useContext(DataContext);
  const { emitter, isModuleEnabled, userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (notification.data && notification.data.type) {
      switch (notification.data.type) {
        case 'VESSEL':
          if (isModuleEnabled('activity_module')) {
            return handleVessel(notification);
          }
          break;
        case 'LOGISTICS':
          if (isModuleEnabled('logistics_module')) {
            return handleLogistics(notification);
          }
          break;
        case 'NOTIFICATION':
          return handleNotification(notification);
        case 'GENERAL':
          return handleGeneral(notification);
        default:
          break;
      }
    }
  }, [notification]);

  const handleVessel = (notification) => {
    if (notification.data.vessel_id) {
      const vesselImo = parseInt(notification.data.vessel_id, 10);
      navigateToVessel(vesselImo);
      if (shouldShowNotification(pinnedVessels, notification.data, userInfo.modules) && notification.data.data) {
        emitter.emit('showToast', {
          message: notification.data.data,
          duration: 0,
          type: 'notification',
          silent: true,
        });
      }
    }
  };

  const navigateToVessel = (vesselImo) => {
    let navigateToVessel = true;
    if (pinnedVessels && pinnedVessels.length) {
      navigateToVessel = ~pinnedVessels.indexOf(vesselImo);
    }
    if (navigateToVessel) {
      const currentRoute = NavigationService.getCurrentRoute();
      if (currentRoute && currentRoute.name && currentRoute.name === 'Vessel') {
        if (currentRoute.params && currentRoute.params.section && currentRoute.params.section.ship) {
          navigateToVessel = currentRoute.params.section.ship.imo !== vesselImo;
        }
      }
    }
    if (navigateToVessel) {
      const entry = portCalls.find((entry) => entry.ship.imo === vesselImo);
      if (entry) {
        NavigationService.navigate('ActivityStack', { screen: 'Vessel', params: { section: { ship: entry.ship } } });
      }
    }
  };

  const handleLogistics = (notification) => {
    NavigationService.navigate('LogisticsStack');
  };

  const handleGeneral = (notification) => {
    NavigationService.navigate('NotificationsStack');
  };

  const handleNotification = (notification) => {
    if (notification.data.data) {
      const { type, ship_imo } = notification.data.data;
      if (type && type === 'ship' && ship_imo) {
        if (isModuleEnabled('activity_module')) {
          navigateToVessel(parseInt(ship_imo, 10));
        }
      } else {
        NavigationService.navigate('NotificationsStack');
      }
      if (shouldShowNotification(pinnedVessels, notification.data, userInfo.modules)) {
        emitter.emit('showToast', {
          message: notification.data.data,
          duration: 0,
          type: 'notification',
          silent: true,
        });
      }
    }
  };

  return null;
};

export default PushNotificationsListener;
