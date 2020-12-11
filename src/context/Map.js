import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  getSeaChartMarkers as getApiSeaChartMarkers,
  getSeaChartVessels as getApiSeaChartVessels,
} from '../api/SeaChart';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import { AuthContext } from './Auth';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const { addEventsListener, authenticatedApiCall, removeEventsListener, socket } = useContext(AuthContext);
  const [seaChartMarkers, setSeaChartMarkers] = useState([]);
  const [seaChartVessels, setSeaChartVessels] = useState([]);

  useEffect(() => {
    addEventsListener('sea-chart-markers-changed', handleSeaChartMarkers);
    addEventsListener('sea-chart-vessels-changed', handleSeaChartVessels);

    return () => {
      removeEventsListener('sea-chart-markers-changed');
      removeEventsListener('sea-chart-vessels-changed');
    };
  }, [socket]);

  const getSeaChartMarkers = useCallback(async () => {
    const res = await authenticatedApiCall(getApiSeaChartMarkers);

    if (res && res.status === STATUS_OK) {
      const newSeaChartMarkers = res.data && Array.isArray(res.data) ? res.data : [];
      setSeaChartMarkers(newSeaChartMarkers);
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setSeaChartMarkers([]);
    }
    return res;
  }, [authenticatedApiCall, seaChartMarkers]);

  const getSeaChartVessels = useCallback(async () => {
    const res = await authenticatedApiCall(getApiSeaChartVessels);

    if (res && res.status === STATUS_OK) {
      const newSeaChartVessels = res.data && Array.isArray(res.data) ? res.data : [];

      // TODO: remove this, filters duplicates that are present on test server
      /*
      const filteredVessels = newSeaChartVessels.filter(
        (vessel, index, array) =>
          array.findIndex(
            (v) =>
              v.properties.imo === vessel.properties.imo &&
              v.properties.location_timestamp === vessel.properties.location_timestamp
          ) === index
      );*/

      setSeaChartVessels(newSeaChartVessels /*filteredVessels*/);
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setSeaChartVessels([]);
    }
    return res;
  }, [authenticatedApiCall, setSeaChartVessels]);

  const handleSeaChartMarkers = useCallback(
    (data) => {
      //console.log('sea-chart-markers event received: ', data);
      getSeaChartMarkers();
    },
    [getSeaChartMarkers]
  );

  const handleSeaChartVessels = useCallback(
    (data) => {
      //console.log('sea-chart-vessels event received: ', data);
      getSeaChartVessels();
    },
    [getSeaChartVessels]
  );

  const values = useMemo(
    () => ({
      seaChartMarkers,
      seaChartVessels,
      getSeaChartMarkers,
      getSeaChartVessels,
    }),
    [seaChartMarkers, seaChartVessels, getSeaChartMarkers, getSeaChartVessels]
  );

  return <MapContext.Provider value={values}>{children}</MapContext.Provider>;
};
