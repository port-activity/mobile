import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getAllLogisticsTimestamps as getApiAllLogisticsTimestamps } from '../api/Timeline';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import { AuthContext } from './Auth';

export const LogisticsContext = createContext();

export const LogisticsProvider = ({ children }) => {
  const { addEventsListener, authenticatedApiCall, removeEventsListener, socket } = useContext(AuthContext);
  const [logisticsTimestamps, setLogisticsTimestamps] = useState([]);

  useEffect(() => {
    addEventsListener('logistics-changed', handleLogistics);

    return () => removeEventsListener('logistics-changed');
  }, [socket]);

  const getAllLogisticsTimestamps = useCallback(
    async (limit) => {
      const res = await authenticatedApiCall(getApiAllLogisticsTimestamps, [limit]);
      if (res && res.status === STATUS_OK) {
        setLogisticsTimestamps(res.data ? res.data : []);
      } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
        setLogisticsTimestamps([]);
      }
      return res;
    },
    [authenticatedApiCall, setLogisticsTimestamps]
  );

  const handleLogistics = useCallback(
    (data) => {
      //console.log('logistics event received: ', data);
      // Update whole logistics data by default
      getAllLogisticsTimestamps(100);
    },
    [getAllLogisticsTimestamps]
  );

  const values = useMemo(
    () => ({
      logisticsTimestamps,
      getAllLogisticsTimestamps,
    }),
    [logisticsTimestamps, getAllLogisticsTimestamps]
  );

  return <LogisticsContext.Provider value={values}>{children}</LogisticsContext.Provider>;
};
