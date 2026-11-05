// project imports
import adminApi from 'services/adminApi';

const COLORS_URL = '/colors/';

const toPayload = ({ name, hex_code, is_available }) => ({
  name,
  hex_code,
  is_available
});

// The admin list endpoint is unpaginated (plain array). Tolerate the
// paginated shape as well in case the backend changes its pagination class.
export async function listColors() {
  const { data } = await adminApi.get(COLORS_URL);
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createColor(values) {
  const { data } = await adminApi.post(COLORS_URL, toPayload(values));
  return data;
}

export async function updateColor(id, values) {
  const { data } = await adminApi.patch(`${COLORS_URL}${id}/`, toPayload(values));
  return data;
}

export async function deleteColor(id) {
  await adminApi.delete(`${COLORS_URL}${id}/`);
}
