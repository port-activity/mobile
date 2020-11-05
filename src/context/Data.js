import moment from 'moment';
import React, { Component, createContext } from 'react';
import { AppState } from 'react-native';

import { getNotifications } from '../api/Notifications';
import { getSlotReservations } from '../api/Slots';
import { addDataEventListener, authenticate, initSocket, removeEventListeners, shutdownSocket } from '../api/Socket';
import {
  getAllLogisticsTimestamps,
  getPortcalls,
  getTimestampDefinitions,
  //getPortcall,
  searchPortcalls,
  searchShips,
  searchTrucks,
  setPinnedVessels,
  getVessels,
} from '../api/Timeline';
import NavigationService from '../navigation/NavigationService';
import { STATUS_OK, STATUS_SESSION_EXPIRED } from '../utils/Constants';
import {
  filterEventsForShip,
  markCurrentTimestamp,
  localSearchShips,
  sortPortCalls,
  getPinnedIndices,
  getFilteredNotifications,
} from '../utils/Data';
import {
  shouldShowNotification,
  notificationArraysAreEqual,
  markUnreadNotifications,
  setNotificationRead,
  copyNotificationState,
} from '../utils/Helpers';
import { withAuthContext } from './Auth';

const DataContext = createContext({
  currentPortcallIndex: 0,
  logisticsTimestamps: [],
  notifications: [],
  portCalls: [],
  pinnedVessels: [],
  pinnedVesselsIndices: null,
  timestampDefinitions: [],
  timestamps: null,
  vessel: null,
  vessels: { data: [] },
  slotReservations: [],
});

class DataProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPortcallIndex: 0,
      emitter: props.emitter,
      logisticsTimestamps: [],
      notifications: [],
      portCalls: [],
      // TODO: store to async storage
      pinnedVessels: [],
      pinnedVesselsIndices: null,
      timestampDefinitions: [],
      timestamps: null,
      vessel: null,
      vessels: [],
      slotReservations: [],
    };
    this.eventDataSource = null;
    this.latestNotificationTimestamp = moment.utc();
    this.socket = null;
    this.searchText = null;
  }

  componentDidMount() {
    const {
      hasPermission,
      userInfo: { id, signedJWTAuthToken },
    } = this.props;
    this.addEventsListeners(id, signedJWTAuthToken || null);
    if (hasPermission('add_manual_timestamp')) {
      this.getTimestampDefinitions();
    }
  }

  componentWillUnmount() {
    this.removeDataEventSource();
  }

  getPortcalls = async () => {
    const { authenticatedApiCall } = this.props;
    if (!this.searchText) {
      const res = await authenticatedApiCall(getPortcalls);
      if (res && res.status === STATUS_OK) {
        const pinnedVessels =
          res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels) ? res.data.pinned_vessels : [];
        const newPortCalls = res.data && res.data.portcalls ? sortPortCalls(pinnedVessels, res.data.portcalls) : [];
        this.setState({
          portCalls: newPortCalls,
          pinnedVessels,
          pinnedVesselsIndices: getPinnedIndices(newPortCalls, pinnedVessels),
        });
      } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
        this.setState({
          portCalls: [],
          pinnedVessels: [],
          pinnedVesselsIndices: null,
        });
      }
      return res;
    }
    return null;
  };

  getPortcall = async (imo, currentIndex) => {
    const { authenticatedApiCall } = this.props;
    // TODO: use single ship portcall fetch
    //const res = await authenticatedApiCall(getPortcall, [imo]);
    const res = await authenticatedApiCall(getPortcalls);
    if (res && res.status === STATUS_OK && res.data && res.data.portcalls) {
      const pinnedVessels =
        res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels) ? res.data.pinned_vessels : [];
      const newPortCalls = sortPortCalls(pinnedVessels, res.data.portcalls);
      const filtered = filterEventsForShip({ currentIndex, portCalls: newPortCalls, imo });
      // Don't try to mark current event from past indexes
      res.processed = filtered ? (currentIndex ? filtered : markCurrentTimestamp(filtered)) : null;
      this.setState({
        currentPortcallIndex: currentIndex,
        pinnedVessels,
        portCalls: newPortCalls,
        timestamps: res.processed,
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        currentPortcallIndex: currentIndex,
        timestamps: null,
        pinnedVessels: [],
      });
    }
    return res;
  };

  getAllLogisticsTimestamps = async (limit) => {
    const { authenticatedApiCall } = this.props;
    const res = await authenticatedApiCall(getAllLogisticsTimestamps, [limit]);
    if (res && res.status === STATUS_OK) {
      this.setState({
        logisticsTimestamps: res.data ? res.data : [],
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        logisticsTimestamps: [],
      });
    }
    return res;
  };

  getNotifications = async (limit) => {
    const { authenticatedApiCall } = this.props;
    const { isModuleEnabled } = this.props;
    const { notifications } = this.state;
    const res = await authenticatedApiCall(getNotifications, [limit]);
    if (res && res.status === STATUS_OK) {
      const filteredNotifications = getFilteredNotifications(
        res.data,
        isModuleEnabled('activity_module') ? null : 'port'
      );
      this.setState({
        notifications: filteredNotifications
          ? markUnreadNotifications(
              copyNotificationState(notifications, filteredNotifications),
              this.latestNotificationTimestamp
            )
          : [],
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        notifications: [],
      });
    }
    return res;
  };

  getTimestampDefinitions = async () => {
    const { authenticatedApiCall } = this.props;
    const res = await authenticatedApiCall(getTimestampDefinitions);
    if (res && res.status === STATUS_OK) {
      this.setState({
        timestampDefinitions: res.data ? res.data : [],
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        timestampDefinitions: [],
      });
    }
    return res;
  };

  search = async (type, text = '') => {
    const { authenticatedApiCall } = this.props;
    let res = null;
    this.searchText = text;

    if (type === 'ship') {
      if (text) {
        res = await authenticatedApiCall(searchShips, [text]);
      } else {
        return this.getPortcalls();
      }
      if (res && res.status === STATUS_OK) {
        const pinnedVessels =
          res.data && res.data.pinned_vessels && Array.isArray(res.data.pinned_vessels) ? res.data.pinned_vessels : [];
        // TODO: remove when actual endpoint is available
        res.data = localSearchShips(text, res.data.portcalls);
        this.setState({
          portCalls: res.data ? res.data : [],
          pinnedVessels,
          pinnedVesselsIndices: null,
        });
      } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
        this.setState({
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
  };

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  readCallback = (id) => {
    setTimeout(() => {
      const { notifications } = this.state;
      const newNotifications = setNotificationRead(notifications, id);
      if (!notificationArraysAreEqual(notifications, newNotifications)) {
        this.setState({
          notifications: newNotifications,
        });
      }
    }, 3000);
  };

  setLatestNotification = (timestamp) => {
    const { notifications } = this.state;
    if (moment(timestamp).isAfter(this.latestNotificationTimestamp)) {
      this.latestNotificationTimestamp = moment(timestamp);
    }

    const newNotifications = markUnreadNotifications(
      notifications,
      this.latestNotificationTimestamp,
      this.readCallback
    );
    if (!notificationArraysAreEqual(notifications, newNotifications)) {
      this.setState({
        notifications: newNotifications,
      });
    }
  };

  toggleShipPin = async (imo) => {
    const { authenticatedApiCall } = this.props;
    const { pinnedVessels, pinnedVesselsIndices, portCalls } = this.state;

    const newPinnedVessels = Array.from(pinnedVessels);
    const index = newPinnedVessels.indexOf(imo);
    if (index !== -1) {
      if (pinnedVesselsIndices && pinnedVesselsIndices.length === 2) {
        // 'Reset' flatlist to circumvent a bug in flatlist (change to [0,1] -> [0]
        // does not stick the item [0] before list is once renderer with null sticky indices)
        await this.setStateAsync({ pinnedVesselsIndices: null });
      }
      newPinnedVessels.splice(index, 1);
    } else {
      newPinnedVessels.push(imo);
    }

    const res = await authenticatedApiCall(setPinnedVessels, [newPinnedVessels]);
    if (res && res.status === STATUS_OK) {
      const newPortCalls = sortPortCalls(newPinnedVessels, portCalls);
      this.setState({
        pinnedVessels: newPinnedVessels,
        pinnedVesselsIndices: getPinnedIndices(newPortCalls, newPinnedVessels),
        portCalls: newPortCalls,
      });
    }
  };

  clearPinnedVessels = async () => {
    const { authenticatedApiCall } = this.props;
    const res = await authenticatedApiCall(setPinnedVessels, [[]]);
    if (res && res.status === STATUS_OK) {
      this.setState({
        pinnedVessels: [],
        pinnedVesselsIndices: null,
      });
    }
  };

  getVessels = async () => {
    const { authenticatedApiCall } = this.props;
    const res = await authenticatedApiCall(getVessels);
    if (res && res.status === STATUS_OK) {
      this.setState({
        vessels: res.data ? res.data : [],
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        vessels: { data: [] },
      });
    }
    return res;
  };

  addDataEventSource = async (signedJWTAuthToken) => {
    if (this.socket && this.socket.signedAuthToken !== signedJWTAuthToken) {
      // signedAuthToken has updated, reauthenticate
      if (!(await authenticate(this.socket, signedJWTAuthToken))) {
        this.removeDataEventSource(true);
      }
    }
    if (!this.socket) {
      this.socket = await initSocket();
      if (!(await authenticate(this.socket, signedJWTAuthToken))) {
        this.removeDataEventSource(true);
      }
    }
  };

  addEventsListeners = async (id, signedJWTAuthToken) => {
    const { isModuleEnabled } = this.props;
    // console.log('Adding to port call data event listener');
    await this.addDataEventSource(signedJWTAuthToken);

    if (isModuleEnabled('activity_module')) {
      // All changes
      await addDataEventListener(this.socket, 'portcalls-changed', this.handlePortCalls);
      // Pinned status has changed
      await addDataEventListener(this.socket, `portcalls-changed-${id}`, this.handlePortCalls);
    }
    if (isModuleEnabled('queue_module')) {
      // console.log("Adding queue listener");
      await addDataEventListener(this.socket, 'portcalls-changed', this.handleSlotReservations);
    }
    if (isModuleEnabled('logistics_module')) {
      await addDataEventListener(this.socket, 'logistics-changed', this.handleLogistics);
    }
    // All notifications
    await addDataEventListener(this.socket, 'notifications-changed', this.handleNotifications);
    // Notifications for pinned vessels
    await addDataEventListener(this.socket, `notifications-changed-${id}`, this.handlePinnedNotification);
  };

  removeDataEventSource = async (disconnect = false) => {
    if (this.socket) {
      console.log('Un-subscribing to port call data events');
      removeEventListeners(this.socket);
      if (disconnect) {
        shutdownSocket(this.socket);
        this.socket = null;
      }
    }
  };

  handlePortCalls = (data) => {
    //console.log('Event received: ', data);
    const currentRoute = NavigationService.getCurrentRoute();
    if (currentRoute && currentRoute.name) {
      switch (currentRoute.name) {
        case 'Activity':
          //console.log('Activity event');
          // return this.getPortcalls();
          break;
        case 'Vessel':
          if (currentRoute.params && currentRoute.params.section && currentRoute.params.section.ship) {
            //console.log('Vessel event');
            this.getPortcall(currentRoute.params.section.ship.imo, this.state.currentPortcallIndex);
          }
          break;
      }
    }
    // Update whole portcall data by default
    //console.log('Default event');
    this.getPortcalls();
    this.getSlotReservations();
  };

  handleSlotReservations = (data) => {
    // console.log('Event received: ', data);
    this.getSlotReservations();
  };

  handleLogistics = (data) => {
    //console.log('Event received: ', data);
    // Update whole logistics data by default
    this.getAllLogisticsTimestamps(100);
  };

  handleNotifications = (data) => {
    //console.log('Event received: ', data);
    const { userInfo } = this.props;
    const { pinnedVessels } = this.state;
    const params = data;
    // Show sticky notification only when foregrounded (i.e. push notification is ignored)
    if (params && AppState.currentState === 'active') {
      if (shouldShowNotification(pinnedVessels, { data: params }, userInfo.modules)) {
        this.state.emitter.emit('showToast', {
          message: params,
          duration: 0,
          type: 'notification',
        });
      }
    }
    // Update whole notifications data by default
    this.getNotifications(100);
  };

  handlePinnedNotification = (data) => {
    //console.log('Event received: ', data);
    const { userInfo } = this.props;
    const { pinnedVessels } = this.state;
    const params = data;
    // Show sticky notification only when foregrounded (i.e. push notification is ignored)
    if (params && AppState.currentState === 'active') {
      if (shouldShowNotification(pinnedVessels, { data: params }, userInfo.modules)) {
        this.state.emitter.emit('showToast', {
          message: params,
          duration: 0,
          type: 'notification',
        });
      }
    }
  };

  getSlotReservations = async () => {
    const { authenticatedApiCall } = this.props;
    const res = await authenticatedApiCall(getSlotReservations);

    if (res && res.status === STATUS_OK) {
      const newSlotReservations = res.data && res.data.data && Array.isArray(res.data.data) ? res.data.data : [];
      this.setState({
        slotReservations: newSlotReservations,
      });
    } else if (res && res.status !== STATUS_SESSION_EXPIRED) {
      this.setState({
        slotReservations: [],
      });
    }
    return res;
  };

  render() {
    return (
      <DataContext.Provider
        value={{
          ...this.state,
          addEventsListeners: this.addEventsListeners,
          clearPinnedVessels: this.clearPinnedVessels,
          getAllLogisticsTimestamps: this.getAllLogisticsTimestamps,
          getNotifications: this.getNotifications,
          getPortcalls: this.getPortcalls,
          getTimestampDefinitions: this.getTimestampDefinitions,
          getPortcall: this.getPortcall,
          getVessels: this.getVessels,
          removeDataEventSource: this.removeDataEventSource,
          search: this.search,
          setLatestNotification: this.setLatestNotification,
          toggleShipPin: this.toggleShipPin,
          getSlotReservations: this.getSlotReservations,
        }}>
        {this.props.children}
      </DataContext.Provider>
    );
  }
}

const withDataContext = (Component) => {
  return (props) => {
    return (
      <DataContext.Consumer>
        {({ ...rest }) => {
          return <Component {...props} {...rest} />;
        }}
      </DataContext.Consumer>
    );
  };
};

const AuthenticatedDataProvider = withAuthContext(DataProvider);

export { DataContext, AuthenticatedDataProvider as DataProvider, withDataContext };
