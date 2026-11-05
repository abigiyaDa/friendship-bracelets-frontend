// project imports
import adminApi from 'services/adminApi';

const PRODUCTS_URL = '/products/';

const toFormData = ({
  category,
  name,
  slug,
  description,
  price,
  is_special,
  allows_custom_colors,
  allows_name_text,
  max_name_length,
  lead_time_days,
  is_active,
  color_ids,
  uploaded_images
}) => {
  const data = new FormData();
  const appendBoolean = (key, value) => data.append(key, value ? 'true' : 'false');

  data.append('category', category ?? '');
  data.append('name', name ?? '');

  if (slug) data.append('slug', slug);

  data.append('description', description ?? '');
  data.append('price', price ?? '');

  appendBoolean('is_special', is_special);
  appendBoolean('allows_custom_colors', allows_custom_colors);
  appendBoolean('allows_name_text', allows_name_text);
  appendBoolean('is_active', is_active);

  if (allows_name_text && max_name_length !== '' && max_name_length != null) {
    data.append('max_name_length', max_name_length);
  }

  if (lead_time_days !== '' && lead_time_days != null) {
    data.append('lead_time_days', lead_time_days);
  }

  // The backend reads repeated keys into a list for both of these fields.
  (Array.isArray(color_ids) ? color_ids : []).forEach((id) => data.append('color_ids', id));
  (Array.isArray(uploaded_images) ? uploaded_images : []).forEach((file) => data.append('uploaded_images', file));

  return data;
};

export async function listProducts({ page = 1, pageSize = 10, search = '', status = '', category = '' } = {}) {
  const params = { page, page_size: pageSize };

  if (search) params.search = search;
  if (status) params.is_active = status;
  if (category !== '' && category != null) params.category = category;

  const { data } = await adminApi.get(PRODUCTS_URL, { params });
  return data;
}

export async function getProduct(id) {
  const { data } = await adminApi.get(`${PRODUCTS_URL}${id}/`);
  return data;
}

export async function createProduct(values) {
  const { data } = await adminApi.post(PRODUCTS_URL, toFormData(values), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function updateProduct(id, values) {
  const { data } = await adminApi.patch(`${PRODUCTS_URL}${id}/`, toFormData(values), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

// DELETE deactivates the product on the backend; it is never hard-deleted.
export async function deactivateProduct(id) {
  await adminApi.delete(`${PRODUCTS_URL}${id}/`);
}

export async function restoreProduct(id) {
  const { data } = await adminApi.patch(`${PRODUCTS_URL}${id}/`, { is_active: true });
  return data;
}

// Used only when clearing every color: multipart PATCH drops an empty list.
export async function replaceProductColors(id, colorIds) {
  const { data } = await adminApi.put(`${PRODUCTS_URL}${id}/colors/`, { color_ids: colorIds });
  return data;
}

// ---------- product images ----------

export async function uploadProductImage(productId, file, extra = {}) {
  const data = new FormData();
  data.append('image', file);

  if (extra.is_primary != null) data.append('is_primary', extra.is_primary ? 'true' : 'false');
  if (extra.sort_order != null) data.append('sort_order', extra.sort_order);

  const response = await adminApi.post(`${PRODUCTS_URL}${productId}/images/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
}

export async function updateProductImage(productId, imageId, values) {
  const { data } = await adminApi.patch(`${PRODUCTS_URL}${productId}/images/${imageId}/`, values);
  return data;
}

export async function deleteProductImage(productId, imageId) {
  await adminApi.delete(`${PRODUCTS_URL}${productId}/images/${imageId}/`);
}
