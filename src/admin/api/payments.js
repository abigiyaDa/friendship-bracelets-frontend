// project imports
import adminApi from 'services/adminApi';

const PAYMENTS_URL = '/payments/';
const ORDERS_URL = '/orders/';

export async function listPayments({ page = 1, pageSize = 10, search = '', status = '' } = {}) {
  const params = { page, page_size: pageSize };

  if (search) params.search = search;
  if (status) params.status = status;

  const { data } = await adminApi.get(PAYMENTS_URL, { params });
  return data;
}

export async function approvePayment(id) {
  const { data } = await adminApi.post(`${PAYMENTS_URL}${id}/approve/`);
  return data;
}

export async function rejectPayment(id) {
  const { data } = await adminApi.post(`${PAYMENTS_URL}${id}/reject/`);
  return data;
}

// Used by the review dialog to compare the paid amount with the expected deposit.
export async function getPaymentOrder(id) {
  const { data } = await adminApi.get(`${ORDERS_URL}${id}/`);
  return data;
}
