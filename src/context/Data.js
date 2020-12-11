import React, { createContext, useCallback, useContext, useEffect, useMemo, /*useRef,*/ useState } from 'react';

import {
  getPortcalls as getApiPortcalls,
  getTimestampDefinitions as getApiTimestampDefinitions,
  searchPortcalls,
  searchShips,
  searchTrucks,
  setPinnedVessels as setApiPinnedVessels,
  getVessels as getApiVessels,
} from '../api/Timeline';
import NavigationService from '../navigation/NavigationService';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import {
  filterEventsForShip,
  markCurrentTimestamp,
  localSearchShips,
  sortPortCalls,
  getPinnedIndices,
} from '../utils/Data';
import { AuthContext } from './Auth';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const {
    addEventsListener,
    authenticatedApiCall,
    emitter,
    hasPermission,
    removeEventsListener,
    //removeDataEventSource,
    socket,
    userInfo,
  } = useContext(AuthContext);

  const [portcallState, setPortcallState] = useState({
    currentPortcallIndex: 0,
    portCalls: [],
    pinnedVessels: [],
    pinnedVesselsIndices: null,
    timestamps: null,
  });
  const [timestampDefinitions, setTimestampDefinitions] = useState([]);
  const [vessels, setVessels] = useState([]);
  //const searchText = useRef(null);

  useEffect(() => {
    if (hasPermission('add_manual_timestamp')) {
      getTimestampDefinitions();
    }

    // All changes
    addEventsListener('portcalls-changed', handlePortCalls);
    // Pinned status has changed
    addEventsListener(`portcalls-changed-${userInfo.id}`, handlePortCalls);

    return () => {
      removeEventsListener('portcalls-changed');
      removeEventsListener(`portcalls-changed-${userInfo.id}`);

      // TODO: shutdown socket when data provider is unmounted?
      //removeDataEventSource();
    };
  }, [socket]);

  const getPortcalls = useCallback(async () => {
    //if (!searchText.current) {
    const res = await authenticatedApiCall(getApiPortcalls);
    if (res && res.status === STATUS_OK) {
      const newPinnedVessels =
        res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels) ? res.data.pinned_vessels : [];
      const newPortCalls = res.data && res.data.portcalls ? sortPortCalls(newPinnedVessels, res.data.portcalls) : [];

      setPortcallState({
        ...portcallState,
        portCalls: newPortCalls,
        pinnedVessels: newPinnedVessels,
        pinnedVesselsIndices: getPinnedIndices(newPortCalls, newPinnedVessels),
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setPortcallState({
        ...portcallState,
        portCalls: [],
        pinnedVessels: [],
        pinnedVesselsIndices: null,
      });
    }
    return res;
    //}
    //return null;
  }, [authenticatedApiCall, portcallState, /*searchText.current,*/ setPortcallState]);

  const getPortcall = useCallback(
    async (imo, currentIndex) => {
      // TODO: use single ship portcall fetch
      //const res = await authenticatedApiCall(getApiPortcall, [imo]);
      const res = await authenticatedApiCall(getApiPortcalls);
      if (res && res.status === STATUS_OK && res.data && res.data.portcalls) {
        const newPinnedVessels =
          res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels) ? res.data.pinned_vessels : [];
        const newPortCalls = sortPortCalls(newPinnedVessels, res.data.portcalls);
        const filtered = filterEventsForShip({ currentIndex, portCalls: newPortCalls, imo });
        // Don't try to mark current event from past indexes
        res.processed = filtered ? (currentIndex ? filtered : markCurrentTimestamp(filtered)) : null;

        setPortcallState({
          ...portcallState,
          currentPortcallIndex: currentIndex,
          portCalls: newPortCalls,
          pinnedVessels: newPinnedVessels,
          timestamps: res.processed,
        });
      } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
        setPortcallState({
          ...portcallState,
          currentPortcallIndex: currentIndex,
          pinnedVessels: [],
          timestamps: null,
        });
      }
      return res;
    },
    [authenticatedApiCall, portcallState, setPortcallState]
  );

  const getTimestampDefinitions = useCallback(async () => {
    const res = await authenticatedApiCall(getApiTimestampDefinitions);
    if (res && res.status === STATUS_OK) {
      setTimestampDefinitions(res.data ? res.data : []);
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setTimestampDefinitions([]);
    }
    return res;
  }, [authenticatedApiCall, setTimestampDefinitions]);

  const search = useCallback(
    async (type, text = '') => {
      let res = null;
      //searchText.current = text;

      if (type === 'ship') {
        if (text) {
          res = await authenticatedApiCall(searchShips, [text]);
        } else {
          return getPortcalls();
        }
        if (res && res.status === STATUS_OK) {
          const newPinnedVessels =
            res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels)
              ? res.data.pinned_vessels
              : [];
          // TODO: remove when actual endpoint is available
          res.data = localSearchShips(text, res.data.portcalls);

          setPortcallState({
            ...portcallState,
            portCalls: res.data ? res.data : [],
            pinnedVessels: newPinnedVessels,
            pinnedVesselsIndices: null,
          });
        } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
          setPortcallState({
            ...portcallState,
            portCalls: [],
            pinnedVesselsIndices: null,
          });
        }
      } else if (type === 'port-call') {
        res = await authenticatedApiCall(searchPortcalls, [text]);
      } else if (type === 'truck') {
        res = await authenticatedApiCall(searchTrucks, [text]);
      }
      return res;
    },
    [authenticatedApiCall, getPortcalls, portcallState, /*searchText,*/ setPortcallState]
  );

  const toggleShipPin = useCallback(
    async (imo) => {
      const newPinnedVessels = Array.from(portcallState.pinnedVessels);
      const index = newPinnedVessels.indexOf(imo);
      if (index !== -1) {
        if (portcallState.pinnedVesselsIndices && portcallState.pinnedVesselsIndices.length === 2) {
          // 'Reset' flatlist to circumvent a bug in flatlist (change to [0,1] -> [0]
          // does not stick the item [0] before list is once renderer with null sticky indices)
          setPortcallState({
            ...portcallState,
            pinnedVessels: null,
          });
        }
        newPinnedVessels.splice(index, 1);
      } else {
        newPinnedVessels.push(imo);
      }

      const res = await authenticatedApiCall(setApiPinnedVessels, [newPinnedVessels]);
      if (res && res.status === STATUS_OK) {
        const newPortCalls = sortPortCalls(newPinnedVessels, portcallState.portCalls);
        setPortcallState({
          ...portcallState,
          portCalls: newPortCalls,
          pinnedVessels: newPinnedVessels,
          pinnedVesselsIndices: getPinnedIndices(newPortCalls, newPinnedVessels),
        });
      }
    },
    [authenticatedApiCall, portcallState, setPortcallState]
  );

  const clearPinnedVessels = useCallback(async () => {
    const res = await authenticatedApiCall(setApiPinnedVessels, [[]]);
    if (res && res.status === STATUS_OK) {
      setPortcallState({
        ...portcallState,
        pinnedVessels: [],
        pinnedVesselsIndices: null,
      });
    }
  }, [authenticatedApiCall, portcallState]);

  const getVessels = useCallback(async () => {
    const res = await authenticatedApiCall(getApiVessels);
    if (res && res.status === STATUS_OK) {
      setVessels(res.data ? res.data : []);
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      setVessels([]);
    }
    return res;
  }, [authenticatedApiCall, setVessels]);

  const handlePortCalls = useCallback(
    (data) => {
      //console.log('portcalls event received: ', data);
      const currentRoute = NavigationService.getCurrentRoute();
      if (currentRoute && currentRoute.name) {
        switch (currentRoute.name) {
          case 'Activity':
            //console.log('Activity event');
            // return getPortcalls();
            break;
          case 'Vessel':
            if (currentRoute.params && currentRoute.params.section && currentRoute.params.section.ship) {
              //console.log('Vessel event');
              getPortcall(currentRoute.params.section.ship.imo, portcallState.currentPortcallIndex);
            }
            break;
        }
      }
      // Update whole portcall data by default
      //console.log('Default event');
      getPortcalls();
    },
    [getPortcalls, portcallState]
  );

  const values = useMemo(
    () => ({
      currentPortcallIndex: portcallState.currentPortcallIndex,
      emitter,
      portCalls: portcallState.portCalls,
      pinnedVessels: portcallState.pinnedVessels,
      pinnedVesselsIndices: portcallState.pinnedVesselsIndices,
      timestampDefinitions,
      timestamps: portcallState.timestamps,
      vessels,
      clearPinnedVessels,
      getPortcalls,
      getTimestampDefinitions,
      getPortcall,
      getVessels,
      search,
      toggleShipPin,
    }),
    [
      emitter,
      portcallState,
      timestampDefinitions,
      vessels,
      clearPinnedVessels,
      getPortcalls,
      getTimestampDefinitions,
      getPortcall,
      getVessels,
      search,
      toggleShipPin,
    ]
  );

  return <DataContext.Provider value={values}>{children}</DataContext.Provider>;
};
