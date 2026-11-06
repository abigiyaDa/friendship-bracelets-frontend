import axios from 'axios';

// Public storefront client: no auth header and no refresh logic.
const customerApi = axios.create({
  baseURL: '/api'
});

export async function createOrder(payload) {
  const { data } = await customerApi.post('/orders/', payload);
  return data;
}

// Public payment submission: multipart form with method, transaction_ref and
// receipt. The server ignores any amount and records the order's deposit.
export async function createPayment(orderNumber, payload) {
  const { data } = await customerApi.post(
    `/orders/${encodeURIComponent(orderNumber)}/payments/`,
    payload
  );
  return data;
}

export default customerApi;
