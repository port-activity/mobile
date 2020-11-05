import moment from 'moment';
import * as Sentry from 'sentry-expo';

import { defaultPortList } from './Constants';

export const getUserInfoFromResponse = (sessionId, userInfo) => {
  if (userInfo && userInfo.user) {
    const userResp = {
      email: userInfo.user.email,
      firstName: userInfo.user.first_name,
      id: userInfo.user.id,
      lastName: userInfo.user.last_name,
      modules: userInfo.modules || {},
      permissions: userInfo.user.permissions || [],
      role: userInfo.user.role,
      session: userInfo.session || {},
      sessionId,
      signedJWTAuthToken: userInfo.jwt || null,
    };
    // TODO: don't send Personally Identifiable Information to sentry
    Sentry.setUser({
      id: userResp.id,
      username: userResp.email,
      modules: userResp.modules,
      permissions: userResp.permissions,
      role: userResp.role,
      sessionId: userResp.sessionId,
      session: userResp.session,
    });
    // Due to bug in sentrys setUser, only id and username are sent,
    // so tet the user info as extra data
    Sentry.setExtra('userInfo', {
      id: userResp.id,
      username: userResp.email,
      modules: userResp.modules,
      permissions: userResp.permissions,
      role: userResp.role,
      sessionId: userResp.sessionId,
      session: userResp.session,
    });
    return userResp;
  }
  return null;
};

export const getPortName = (namespace) => {
  let portName = '';
  const port = defaultPortList.find((port) => port.key === namespace);
  if (port) {
    portName = port.label;
  }
  return portName;
};

export const shouldShowNotification = (pinnedVessels, notificationData, modules) => {
  const activityEnabled = modules && modules['activity_module'] && modules['activity_module'] === 'enabled';
  if (pinnedVessels && pinnedVessels.length) {
    if (!notificationData) {
      // Don't show notifications unrelated to pinned ships
      return false;
    }
    if (notificationData.vessel_id) {
      // Portcall
      return ~pinnedVessels.indexOf(notificationData.vessel_id) && activityEnabled;
    } else if (notificationData.data) {
      // Notification
      const { type, ship, ship_imo } = notificationData.data;
      if (type === 'ship') {
        const vesselImo = (ship && ship.imo) || ship_imo;
        if (vesselImo) {
          return ~pinnedVessels.indexOf(vesselImo) && activityEnabled;
        }
      } else {
        // Show global notification always
        return true;
      }
    }
    // Don't show notifications unrelated to pinned ships
    return false;
  }
  // No pinned ships, show if module enabled
  if (notificationData && notificationData.vessel_id) {
    return activityEnabled;
  }
  if (notificationData && notificationData.data && notificationData.data.type === 'ship') {
    return activityEnabled;
  }
  // Show all notifications if no ships pinned
  return true;
};

export const notificationArraysAreEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  return b.filter((o) => !a.find((o2) => o.id === o2.id && o.state === o2.state)).length === 0;
};

export const markUnreadNotifications = (notifications, latestNotificationTimestamp, readCallback) => {
  const currentNotifications = JSON.parse(JSON.stringify(notifications));

  const newItems = currentNotifications.filter((obj) => moment(obj.created_at).isAfter(latestNotificationTimestamp));
  /*
  if (!newItems || !newItems.length) {
    return notifications;
  }*/
  return currentNotifications.map((notification) => {
    const newItem = newItems.find((entry) => entry.id === notification.id);
    if (newItem) {
      return {
        ...notification,
        state: 'unread',
      };
    } else {
      if (notification.state === 'unread') {
        notification.state = 'pending';
        if (readCallback) {
          readCallback(notification.id);
        }
      }
    }
    return notification;
  });
};

export const setNotificationRead = (notifications, id) => {
  if (!notifications) {
    return [];
  }
  const currentNotifications = JSON.parse(JSON.stringify(notifications));
  const item = currentNotifications.find((obj) => obj.id === id);
  if (item && item.state) {
    item.state = 'read';
  }
  return currentNotifications;
};

export const copyNotificationState = (currentNotifications, newNotifications) => {
  // Mutate the new list of notifications with states from old
  // to prevent resetting the notifications state on reload
  if (currentNotifications) {
    return newNotifications.map((notification) => {
      const item = currentNotifications.find((obj) => obj.id === notification.id);
      if (item && item.state && item.state === 'unread') {
        notification.state = item.state;
      }
      return notification;
    });
  }
  return newNotifications;
};
