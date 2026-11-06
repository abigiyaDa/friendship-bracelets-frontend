// project imports
import adminApi from 'services/adminApi';
import { listOrders } from 'admin/api/orders';
import { listPayments } from 'admin/api/payments';

const STATS_URL = '/stats/';

export async function getStats() {
  const { data } = await adminApi.get(STATS_URL);
  return data;
}

export async function getPendingPayments(limit = 5) {
  const data = await listPayments({ page: 1, pageSize: limit, status: 'pending' });
  return data?.results ?? [];
}

export async function getRecentOrders(limit = 5) {
  const data = await listOrders({ page: 1, pageSize: limit });
  return data?.results ?? [];
}
