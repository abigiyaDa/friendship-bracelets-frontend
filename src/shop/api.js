import axios from 'axios';

// Public (no auth) client for the storefront. The Vite dev server proxies
// /api and /media to the Django backend (see vite.config.mjs).
const shopApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const MEDIA_ORIGIN = '';

const listAll = async (path, params = {}) => {
  const { data } = await shopApi.get(path, { params: { page_size: 100, ...params } });
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

export const listCategories = () => listAll('/categories/');
export const listColors = () => listAll('/colors/');
export const listPickupLocations = () => listAll('/pickup-locations/');

export const listProducts = (category) => listAll('/products/', category ? { category } : {});

export const getProduct = async (slug) => {
  const { data } = await shopApi.get(`/products/${slug}/`);
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await shopApi.post('/orders/', payload);
  return data;
};

export const lookupOrders = async (phone) => {
  const { data } = await shopApi.get('/orders/lookup/', { params: { phone } });
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

export const getOrder = async (orderNumber, phone) => {
  const { data } = await shopApi.get(`/orders/${orderNumber}/`, { params: { phone } });
  return data;
};

export const submitPayment = async (orderNumber, { method, transactionRef, receipt }) => {
  const form = new FormData();
  form.append('method', method);
  form.append('transaction_ref', transactionRef);
  form.append('receipt', receipt);

  const { data } = await shopApi.post(`/orders/${orderNumber}/payments/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// Receipt image URLs from the API are absolute (http://127.0.0.1:8000/media/...).
// Keep them as-is; <img> tags don't need CORS.
export default shopApi;
