export const filterEventsForShip = ({ currentIndex, portCalls, imo }) => {
  const res = portCalls.find((portCall) => {
    if (portCall.ship.imo === imo) {
      return portCall.portcalls;
    }
  });
  if (res && res.portcalls && res.portcalls[currentIndex]) {
    const events = res.portcalls[currentIndex].events.filter((event) => event.timestamps.length);
    return {
      ship: res.ship,
      // Reverse past events here (current index > 0)
      events: currentIndex ? events.reverse() : events,
    };
  }
  return null;
};

export const markCurrentTimestamp = ({ ship, events }) => {
  let currentEvent = null;
  let allTimestamps = [];
  let hasPrevious = false;
  events.forEach((event) => {
    allTimestamps = allTimestamps.concat(event.timestamps);
  });
  allTimestamps.forEach((timestamp) => {
    if (timestamp.time) {
      if (!currentEvent) {
        // Mark intially first timestamp with time as current
        currentEvent = timestamp;
      } else if (timestamp.time_type === 'Actual' && new Date(timestamp.time).getTime() <= Date.now()) {
        currentEvent = timestamp;
        hasPrevious = true;
      } else if (new Date(timestamp.time).getTime() <= Date.now() && hasPrevious) {
        currentEvent = timestamp;
      } else {
        hasPrevious = false;
      }
    } else {
      hasPrevious = false;
    }
  });
  return {
    ship,
    events: events
      .map((event) => {
        const actualIndex = event.timestamps.findIndex(
          (timestamp) =>
            timestamp.state === currentEvent.state &&
            timestamp.time_type === currentEvent.time_type &&
            timestamp.time === currentEvent.time
        );
        if (actualIndex >= 0) {
          const current = {
            ...event.timestamps[actualIndex],
            isCurrent: true,
          };
          event.timestamps.splice(actualIndex, 1, current);
        }
        return event;
      })
      .reverse(),
  };
};

export const sortPortCalls = (pinnedVessels, portCalls) => {
  let newPortCalls = JSON.parse(JSON.stringify(portCalls));

  // TODO: decide sorting parameters
  //newPortCalls = newPortCalls.sort((a, b) => a.ship.vessel_name > b.ship.vessel_name);
  newPortCalls = newPortCalls.sort((a, b) => a.ship.next_event.ts > b.ship.next_event.ts);

  if (pinnedVessels.length) {
    // Re-order list
    pinnedVessels
      .slice()
      .reverse()
      .forEach((imo) => {
        const foundIndex = newPortCalls.findIndex((entry) => entry.ship.imo === imo);
        if (foundIndex > 0) {
          const portCall = newPortCalls.splice(foundIndex, 1);
          newPortCalls.unshift(portCall[0]);
        }
      });
  }

  return newPortCalls;
};

export const localSearchShips = (text, data) => {
  if (text) {
    if (data) {
      const found = data.filter((entry) => {
        return Object.values(entry.ship).find((value) => {
          return value && String(value).toLowerCase().includes(text.toLowerCase());
        });
      });
      return found.sort((a, b) => a.ship.vessel_name > b.ship.vessel_name);
    }
    return [];
  }
  //return data;
  return null;
};

export const getPinnedIndices = (portCalls, pinnedVessels) => {
  return pinnedVessels.length
    ? portCalls.reduce((acc, section, index) => {
        if (~pinnedVessels.indexOf(section.ship.imo)) {
          acc.push(index);
        }
        return acc;
      }, [])
    : null;
};

export const getFilteredNotifications = (notifications, filter) => {
  if (!notifications) {
    return [];
  }
  if (!filter) {
    return notifications;
  }
  return notifications.filter((notification) => notification.type === filter);
};

export const localSearchMap = (text, data) => {
  if (text) {
    if (data) {
      const found = data.filter((entry) => {
        return Object.values(entry.properties).find((value) => {
          return value && String(value).toLowerCase().includes(text.toLowerCase());
        });
      });
      return found.sort((a, b) => a.properties.name > b.properties.name);
    }
    return [];
  }
  //return data;
  return [];
};
