import { apiCall, parseRespone } from './Auth';

const PORTCALL_PATH = 'port-calls/by-imo';
const PORTCALLS_PATH = 'ongoing-port-calls';
const ALL_LOGISTICS_PATH = 'logistics-timestamps';
const SEARCH_PORT_CALLS_PATH = 'search-port-calls';
//const SEARCH_SHIPS_PATH = 'search-ships';
const SEARCH_TRUCKS_PATH = 'search-trucks';
const PINNED_VESSEL_IDS_PATH = 'pinned-vessel-ids';
const TIMESTAMP_DEFINITIONS_PATH = 'timestamp-definitions';
const VESSELS_PATH = 'vessels?limit=1000';

export const getPortcall = async (sessionId, imo) => {
  const response = await apiCall('get', PORTCALL_PATH + `/${imo}`, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const getTimestampDefinitions = async (sessionId) => {
  const response = await apiCall('get', TIMESTAMP_DEFINITIONS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const getPortcalls = async (sessionId) => {
  const response = await apiCall('get', PORTCALLS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const getAllLogisticsTimestamps = async (sessionId, limit = 1000) => {
  const response = await apiCall('get', ALL_LOGISTICS_PATH + `/${limit}`, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const searchPortcalls = async (sessionId, text) => {
  const response = await apiCall(
    'post',
    SEARCH_PORT_CALLS_PATH,
    {
      text,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const searchShips = async (sessionId, text) => {
  /*
  const response = await apiCall(
    'post',
    SEARCH_SHIPS_PATH,
    {
      text,
    },
    sessionId
  );*/
  const response = await apiCall('get', PORTCALLS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const searchTrucks = async (sessionId, text) => {
  const response = await apiCall(
    'post',
    SEARCH_TRUCKS_PATH,
    {
      text,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const setPinnedVessels = async (sessionId, vesselIds) => {
  const response = await apiCall(
    'put',
    PINNED_VESSEL_IDS_PATH,
    {
      vessel_ids: vesselIds,
    },
    sessionId
  );
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const getVessels = async (sessionId) => {
  const response = await apiCall('get', VESSELS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};
