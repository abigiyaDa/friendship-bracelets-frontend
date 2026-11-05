import { useCallback, useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
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
import { Controller, useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import { createColor, deleteColor, listColors, updateColor } from 'admin/api/colors';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const SERVER_ERROR_FIELDS = ['name', 'hex_code', 'is_available'];
const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const HEX_MESSAGE = 'Use a hex code like #FF00AA.';

const swatchSx = {
  width: 28,
  height: 28,
  borderRadius: '6px',
  border: '1px solid',
  borderColor: 'divider',
  flexShrink: 0
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

// ==============================|| COLOR FORM DIALOG ||============================== //

function ColorFormDialog({ open, color, onClose, onSaved, onFailed }) {
  const isEdit = Boolean(color);
  const [formError, setFormError] = useState('');

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: color?.name ?? '',
      hex_code: color?.hex_code ?? '',
      is_available: color?.is_available ?? true
    }
  });

  const watchedHex = watch('hex_code');
  const hasValidHex = HEX_PATTERN.test(watchedHex ?? '');

  const onSubmit = async (values) => {
    setFormError('');

    const payload = {
      name: values.name.trim(),
      hex_code: values.hex_code.trim(),
      is_available: values.is_available
    };

    try {
      const saved = isEdit ? await updateColor(color.id, payload) : await createColor(payload);
      onSaved(saved, isEdit ? 'Color updated.' : 'Color created.');
    } catch (error) {
      applyServerErrors(error, setError);

      const message = getErrorMessage(error, 'Could not save the color.');
      setFormError(message);
      onFailed(message);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit color' : 'Add color'}</DialogTitle>

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
                maxLength: { value: 50, message: 'Name must be 50 characters or fewer.' }
              })}
            />

            <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
              <Box
                aria-hidden
                sx={{
                  ...swatchSx,
                  width: 40,
                  height: 40,
                  mt: 1,
                  bgcolor: hasValidHex ? watchedHex : 'grey.100'
                }}
              />

              <TextField
                label="Hex code"
                required
                fullWidth
                placeholder="#FF00AA"
                error={Boolean(errors.hex_code)}
                helperText={errors.hex_code?.message || 'Include the leading #, for example #FF00AA.'}
                {...register('hex_code', {
                  required: 'Hex code is required.',
                  pattern: { value: HEX_PATTERN, message: HEX_MESSAGE }
                })}
              />

              <Box
                component="input"
                type="color"
                aria-label="Pick color"
                value={hasValidHex ? watchedHex : '#FFFFFF'}
                onChange={(event) =>
                  setValue('hex_code', event.target.value.toUpperCase(), {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }
                sx={{
                  width: 48,
                  height: 40,
                  mt: 1,
                  p: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
            </Stack>

            <Controller
              name="is_available"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  }
                  label={field.value ? 'Available' : 'Unavailable'}
                />
              )}
            />
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
              'Create color'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ==============================|| ADMIN - COLORS ||============================== //

export default function Colors() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState({ open: false, color: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchColors = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      setColors(await listColors());
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load colors.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const handleSaved = (saved, message) => {
    setColors((prev) => {
      const next = prev.filter((color) => color.id !== saved.id);
      next.push(saved);
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setDialog({ open: false, color: null });
    notify(message, 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteColor(deleteTarget.id);
      setColors((prev) => prev.filter((color) => color.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify('Color deleted.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not delete the color.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <MainCard
        title="Colors"
        content={false}
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => setDialog({ open: true, color: null })}
          >
            Add color
          </Button>
        }
      >
        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={fetchColors}>
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
          <Table aria-label="colors table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Available</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : colors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      No colors yet. Add your first color.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                colors.map((color) => (
                  <TableRow
                    key={color.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{color.id}</TableCell>

                    <TableCell>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Box sx={{ ...swatchSx, bgcolor: color.hex_code || 'grey.100' }} />
                        <Typography variant="body2">{color.hex_code || '—'}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell component="th" scope="row">
                      {color.name}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={color.is_available ? 'Available' : 'Unavailable'}
                        color={color.is_available ? 'success' : 'default'}
                        size="small"
                        variant={color.is_available ? 'filled' : 'outlined'}
                        sx={
                          color.is_available
                            ? undefined
                            : { bgcolor: 'grey.200', color: 'text.secondary' }
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Edit ${color.name}`}
                            onClick={() => setDialog({ open: true, color })}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${color.name}`}
                            onClick={() => setDeleteTarget(color)}
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
        <ColorFormDialog
          open
          color={dialog.color}
          onClose={() => setDialog({ open: false, color: null })}
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
        <DialogTitle>Delete color?</DialogTitle>
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
