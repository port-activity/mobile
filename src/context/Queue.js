import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getSlotReservations as getApiSlotReservations } from '../api/Slots';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import { AuthContext } from './Auth';

export const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { addEventsListener, authenticatedApiCall, removeEventsListener, socket } = useContext(AuthContext);
  const [slotReservations, setSlotReservations] = useState([]);

  useEffect(() => {
    addEventsListener('queue-portcalls-changed', handleSlotReservations);

    return () => removeEventsListener('queue-portcalls-changed');
  }, [socket]);

  const getSlotReservations = useCallback(async () => {
    const res = await authenticatedApiCall(getApiSlotReservations);

    if (res && res.status === STATUS_OK) {
      const newSlotReservations = res.data && res.data.data && Array.isArray(res.data.data) ? res.data.data : [];
      setSlotReservations(newSlotReservations);
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setSlotReservations([]);
    }
    return res;
  }, [authenticatedApiCall, setSlotReservations]);

  const handleSlotReservations = useCallback(
    (data) => {
      //console.log('slot-reservations event received: ', data);
      getSlotReservations();
    },
    [getSlotReservations]
  );

  const data = useMemo(
    () => ({
      slotReservations,
      getSlotReservations,
    }),
    [slotReservations, getSlotReservations]
  );

  return <QueueContext.Provider value={data}>{children}</QueueContext.Provider>;
};
