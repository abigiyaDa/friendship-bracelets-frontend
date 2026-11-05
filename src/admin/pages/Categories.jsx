import { useCallback, useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import { createCategory, deleteCategory, listCategories, updateCategory } from 'admin/api/categories';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

const SERVER_ERROR_FIELDS = ['name', 'slug', 'image'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const thumbnailSx = {
  width: 44,
  height: 44,
  borderRadius: 1,
  objectFit: 'cover',
  display: 'block'
};

const asText = (value) => (Array.isArray(value) ? value.join(' ') : String(value ?? ''));

const getErrorMessage = (error, fallback) => {
  if (!error?.response) {
    return 'Unable to reach the server. Please try again.';
  }

  const data = error.response.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue) && firstValue.length) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
};

// Map DRF field errors onto the matching react-hook-form inputs.
const applyServerErrors = (error, setError) => {
  const data = error?.response?.data;

  if (!data || typeof data !== 'object' || Array.isArray(data)) return;

  SERVER_ERROR_FIELDS.forEach((field) => {
    if (data[field]) {
      setError(field, { type: 'server', message: asText(data[field]) });
    }
  });
};

const validateImage = (files) => {
  const file = files?.[0];

  if (!file) return true;
  if (file.type && !file.type.startsWith('image/')) return 'Choose an image file.';
  if (file.size > MAX_IMAGE_SIZE) return 'Image is too large (max 5 MB).';

  return true;
};

// ==============================|| CATEGORY FORM DIALOG ||============================== //

function CategoryFormDialog({ open, category, onClose, onSaved, onFailed }) {
  const isEdit = Boolean(category);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      image: null
    }
  });

  const selectedImage = watch('image')?.[0];

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const saved = isEdit ? await updateCategory(category.id, values) : await createCategory(values);
      onSaved(saved, isEdit ? 'Category updated.' : 'Category created.');
    } catch (error) {
      applyServerErrors(error, setError);

      const message = getErrorMessage(error, 'Could not save the category.');
      setFormError(message);
      onFailed(message);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit category' : 'Add category'}</DialogTitle>

        <DialogContent>
          <Stack sx={{ gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Name"
              required
              fullWidth
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name', {
                required: 'Name is required.',
                maxLength: { value: 100, message: 'Name must be 100 characters or fewer.' }
              })}
            />

            <TextField
              label="Slug"
              fullWidth
              error={Boolean(errors.slug)}
              helperText={errors.slug?.message || 'Optional. Generated from the name when left blank.'}
              {...register('slug', {
                maxLength: { value: 120, message: 'Slug must be 120 characters or fewer.' },
                validate: (value) =>
                  !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase letters, numbers and hyphens.'
              })}
            />

            <Stack sx={{ gap: 1 }}>
              <Typography variant="subtitle2">Image</Typography>

              {isEdit && category.image && !selectedImage && (
                <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                  <Box component="img" src={category.image} alt={category.name} sx={thumbnailSx} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Current image
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadOutlined />}
                  disabled={isSubmitting}
                >
                  {selectedImage ? 'Change image' : 'Choose image'}
                  <input type="file" hidden accept="image/*" {...register('image', { validate: validateImage })} />
                </Button>

                {selectedImage && (
                  <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                    {selectedImage.name}
                  </Typography>
                )}
              </Stack>

              {errors.image && <FormHelperText error>{errors.image.message}</FormHelperText>}

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                PNG, JPG or WebP, max 5 MB. Leave empty to keep the current image.
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create category'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ==============================|| ADMIN - CATEGORIES ||============================== //

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      setCategories(await listCategories());
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load categories.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaved = (saved, message) => {
    setCategories((prev) => {
      const next = prev.filter((category) => category.id !== saved.id);
      next.push(saved);
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setDialog({ open: false, category: null });
    notify(message, 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((category) => category.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify('Category deleted.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not delete the category.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <MainCard
        title="Categories"
        content={false}
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => setDialog({ open: true, category: null })}
          >
            Add category
          </Button>
        }
      >
        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={fetchCategories}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        <TableContainer
          sx={{
            width: '100%',
            overflowX: 'auto',
            '& td, & th': { whiteSpace: 'nowrap' }
          }}
        >
          <Table aria-label="categories table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      No categories yet. Add your first category.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      {category.image ? (
                        <Box component="img" src={category.image} alt={category.name} sx={thumbnailSx} />
                      ) : (
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.disabled',
                            fontSize: 11
                          }}
                        >
                          None
                        </Box>
                      )}
                    </TableCell>

                    <TableCell component="th" scope="row">
                      {category.name}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {category.slug}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => setDialog({ open: true, category })}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${category.name}`}
                            onClick={() => setDeleteTarget(category)}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {dialog.open && (
        <CategoryFormDialog
          open
          category={dialog.category}
          onClose={() => setDialog({ open: false, category: null })}
          onSaved={handleSaved}
          onFailed={(message) => notify(message, 'error')}
        />
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={deleting ? undefined : () => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
