import { apiCall, parseRespone } from './Auth';

const SLOT_RESERVATIONS_PATH = 'dashboard-slot-reservations?limit=100&offset=0';

export const getSlotReservations = async (sessionId) => {
  const response = await apiCall('get', SLOT_RESERVATIONS_PATH, null, sessionId);
  if (response) {
    return await parseRespone(response);
  }
  return null;
};
