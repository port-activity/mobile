import { apiCall, parseRespone } from './Auth';

const SEA_CHART_MARKERS_PATH = 'sea-chart/markers';
const SEA_CHART_VESSELS_PATH = 'sea-chart/vessels';

export const getSeaChartMarkers = async (sessionId) => {
  const response = await apiCall('get', SEA_CHART_MARKERS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};

export const getSeaChartVessels = async (sessionId) => {
  const response = await apiCall('get', SEA_CHART_VESSELS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};
