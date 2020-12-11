import { Native as Sentry } from 'sentry-expo';
import socketClusterClient from 'socketcluster-client';

import { getEnvVars } from '../../environment';

const { SOCKETCLUSTER_HOST, SOCKETCLUSTER_PORT } = getEnvVars();

// TODO: Add authentication
const options = {
  hostname: SOCKETCLUSTER_HOST,
  port: SOCKETCLUSTER_PORT,
  secure: SOCKETCLUSTER_PORT === 443,
};

export const initSocket = async () => {
  // Initiate the connection to the server
  console.log('Creating socket');
  try {
    const socket = socketClusterClient.create(options);

    (async () => {
      const listener = await socket.listener('connect');
      while (true) {
        const packet = await listener.next();
        if (packet.done) break;
        console.log('Socket is connected');
      }
    })();

    (async () => {
      const listener = await socket.listener('error');
      while (true) {
        const packet = await listener.next();
        if (packet.done) break;
        console.log('Error with socket: ', packet.value);
      }
    })();

    (async () => {
      const listener = await socket.listener('subscribeStateChange');
      while (true) {
        const packet = await listener.next();
        if (packet.done) break;
        const { channel, newChannelState } = packet.value;
        console.log(`${channel} ${newChannelState}`);
      }
    })();

    return socket;
  } catch (error) {
    Sentry.captureException(error);
    console.log(error);
  }
  return null;
};

export const addDataEventListener = async (socket, channelName, callback) => {
  if (!socket) {
    console.log(`Cannot subscribe to ${channelName} data events without socket`);
    return;
  }

  if (!socket.isSubscribed(channelName, true)) {
    console.log(`Subscribing to ${channelName} data events`);
    try {
      const channel = socket.subscribe(channelName);
      await channel.listener('subscribe'); //.once();

      (async () => {
        while (true) {
          const packet = await channel.next();
          if (packet.done) break;
          callback(packet.value);
        }
      })();
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
    }
  }
};

export const authenticate = async (socket, token) => {
  if (socket && token) {
    try {
      const res = await socket.authenticate(token);
      if (res.authError) {
        //Sentry.captureMessage(res.authError);
        console.log(res.authError);
      }
      return res.isAuthenticated;
    } catch (error) {
      Sentry.withScope((scope) => {
        Sentry.setExtra('jwt', token);
        Sentry.captureException(error);
      });
      console.log(error);
      return false;
    }
  }
  // No authentication used
  return true;
};

export const removeEventListeners = (socket) => {
  if (socket) {
    const subscriptions = socket.subscriptions(true);
    subscriptions.forEach(async (subscription) => {
      await socket.unsubscribe(subscription);
      await socket.listener('unsubscribe').once();
    });
    console.log('All channels closed');
  }
};

export const removeEventListener = async (socket, channel) => {
  if (socket && channel) {
    await socket.unsubscribe(channel);
    console.log(`${channel} closed`);
  }
};

export const shutdownSocket = (socket) => {
  if (socket) {
    socket.closeAllChannels();
    socket.deauthenticate();
    socket.closeAllListeners();
    socket.disconnect();
    console.log('Socket closed');
  }
};
