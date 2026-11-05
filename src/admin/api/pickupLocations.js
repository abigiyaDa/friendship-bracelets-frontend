// project imports
import adminApi from 'services/adminApi';

const PICKUP_LOCATIONS_URL = '/pickup-locations/';

const toPayload = ({ name, area, details, is_active }) => ({
  name: name ?? '',
  area: area ?? '',
  details: details ?? '',
  is_active: Boolean(is_active)
});

// The admin list endpoint is unpaginated (plain array). Tolerate the
// paginated shape as well in case the backend changes its pagination class.
export async function listPickupLocations() {
  const { data } = await adminApi.get(PICKUP_LOCATIONS_URL);
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createPickupLocation(values) {
  const { data } = await adminApi.post(PICKUP_LOCATIONS_URL, toPayload(values));
  return data;
}

export async function updatePickupLocation(id, values) {
  const { data } = await adminApi.patch(`${PICKUP_LOCATIONS_URL}${id}/`, toPayload(values));
  return data;
}

export async function deletePickupLocation(id) {
  await adminApi.delete(`${PICKUP_LOCATIONS_URL}${id}/`);
}
