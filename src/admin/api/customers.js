// project imports
import adminApi from 'services/adminApi';

const CUSTOMERS_URL = '/customers/';

export async function listCustomers({ page = 1, pageSize = 10, search = '' } = {}) {
  const params = { page, page_size: pageSize };

  if (search) params.search = search;

  const { data } = await adminApi.get(CUSTOMERS_URL, { params });
  return data;
}

export async function getCustomer(id) {
  const { data } = await adminApi.get(`${CUSTOMERS_URL}${id}/`);
  return data;
}

// Only full_name, email and telegram_username are writable (phone is read-only).
export async function updateCustomer(id, values) {
  const { data } = await adminApi.patch(`${CUSTOMERS_URL}${id}/`, values);
  return data;
}
