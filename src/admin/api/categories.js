// project imports
import adminApi from 'services/adminApi';

const CATEGORIES_URL = '/categories/';

const toFormData = ({ name, slug, image }) => {
  const data = new FormData();
  data.append('name', name ?? '');

  if (slug) data.append('slug', slug);

  // The file input registers a FileList; accept a plain File too.
  const file = typeof File !== 'undefined' && image instanceof File ? image : image?.[0];
  if (file) data.append('image', file);

  return data;
};

// The admin list endpoint is unpaginated (plain array). Tolerate the
// paginated shape as well in case the backend changes its pagination class.
export async function listCategories() {
  const { data } = await adminApi.get(CATEGORIES_URL);
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createCategory(values) {
  const { data } = await adminApi.post(CATEGORIES_URL, toFormData(values), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function updateCategory(id, values) {
  const { data } = await adminApi.patch(`${CATEGORIES_URL}${id}/`, toFormData(values), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function deleteCategory(id) {
  await adminApi.delete(`${CATEGORIES_URL}${id}/`);
}
