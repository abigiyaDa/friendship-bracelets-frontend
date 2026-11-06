// project imports
import adminApi from 'services/adminApi';

const ORDERS_URL = '/orders/';

export async function listOrders({ page = 1, pageSize = 10, search = '', status = '' } = {}) {
  const params = { page, page_size: pageSize };

  if (search) params.search = search;
  if (status) params.status = status;

  const { data } = await adminApi.get(ORDERS_URL, { params });
  return data;
}

export async function getOrder(id) {
  const { data } = await adminApi.get(`${ORDERS_URL}${id}/`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await adminApi.patch(`${ORDERS_URL}${id}/status/`, { status });
  return data;
}
