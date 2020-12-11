import moment from 'moment';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getNotifications as getApiNotifications } from '../api/Notifications';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import { getFilteredNotifications } from '../utils/Data';
import {
  shouldShowNotification,
  notificationArraysAreEqual,
  markUnreadNotifications,
  setNotificationRead,
  copyNotificationState,
} from '../utils/Helpers';
import { AuthContext } from './Auth';
import { DataContext } from './Data';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const {
    addEventsListener,
    authenticatedApiCall,
    emitter,
    isModuleEnabled,
    removeEventsListener,
    socket,
    userInfo,
  } = useContext(AuthContext);
  const { pinnedVessels } = useContext(DataContext);
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const latestNotificationTimestamp = useRef(moment.utc());

  useEffect(() => {
    // All notifications
    addEventsListener('notifications-changed', handleNotifications);
    // Notifications for pinned vessels
    addEventsListener(`notifications-changed-${userInfo.id}`, handlePinnedNotification);

    return () => {
      removeEventsListener('notifications-changed');
      removeEventsListener(`notifications-changed-${userInfo.id}`);
    };
  }, [socket]);

  useEffect(() => {
    setNewNotificationsCount(
      notifications
        ? notifications.filter((obj) => obj.state === 'unread' && obj.sender.email !== userInfo.email).length
        : 0
    );
  }, [notifications, userInfo]);

  const getNotifications = useCallback(
    async (limit) => {
      const res = await authenticatedApiCall(getApiNotifications, [limit]);
      if (res && res.status === STATUS_OK) {
        const filteredNotifications = getFilteredNotifications(
          res.data,
          isModuleEnabled('activity_module') ? null : 'port'
        );
        setNotifications(
          filteredNotifications
            ? markUnreadNotifications(
                copyNotificationState(notifications, filteredNotifications),
                latestNotificationTimestamp.current
              )
            : []
        );
      } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
        setNotifications([]);
      }
      return res;
    },
    [authenticatedApiCall, isModuleEnabled, latestNotificationTimestamp, notifications, setNotifications]
  );

  const readCallback = useCallback(
    (id) => {
      setTimeout(() => {
        const newNotifications = setNotificationRead(notifications, id);
        if (!notificationArraysAreEqual(notifications, newNotifications)) {
          setNotifications(newNotifications);
        }
      }, 3000);
    },
    [notifications, setNotifications]
  );

  const setLatestNotification = useCallback(
    async (timestamp) => {
      if (moment(timestamp).isAfter(latestNotificationTimestamp.current)) {
        latestNotificationTimestamp.current = moment(timestamp);
      }
      const newNotifications = markUnreadNotifications(
        notifications,
        latestNotificationTimestamp.current,
        readCallback
      );
      if (!notificationArraysAreEqual(notifications, newNotifications)) {
        setNotifications(newNotifications);
      }
    },
    [latestNotificationTimestamp, notifications, readCallback, setNotifications]
  );

  const handleNotifications = useCallback(
    (data) => {
      //console.log('notifications event received: ', data);
      const params = data;
      // Show sticky notification only when foregrounded (i.e. push notification is ignored)
      if (params && AppState.currentState === 'active') {
        if (shouldShowNotification(pinnedVessels, { data: params }, userInfo.modules)) {
          emitter.emit('showToast', {
            message: params,
            duration: 0,
            type: 'notification',
          });
        }
      }
      // Update whole notifications data by default
      getNotifications(100);
    },
    [emitter, getNotifications, userInfo]
  );

  const handlePinnedNotification = useCallback(
    (data) => {
      //console.log('pinned notification event received: ', data);
      const params = data;
      // Show sticky notification only when foregrounded (i.e. push notification is ignored)
      if (params && AppState.currentState === 'active') {
        if (shouldShowNotification(pinnedVessels, { data: params }, userInfo.modules)) {
          emitter.emit('showToast', {
            message: params,
            duration: 0,
            type: 'notification',
          });
        }
      }
    },
    [emitter, pinnedVessels, shouldShowNotification, userInfo]
  );

  const values = useMemo(
    () => ({
      latestNotificationTimestamp: latestNotificationTimestamp.current,
      newNotificationsCount,
      notifications,
      getNotifications,
      setLatestNotification,
    }),
    [latestNotificationTimestamp.current, newNotificationsCount, notifications, getNotifications, setLatestNotification]
  );

  return <NotificationsContext.Provider value={values}>{children}</NotificationsContext.Provider>;
};
