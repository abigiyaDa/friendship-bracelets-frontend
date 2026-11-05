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
import { useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import {
  createPickupLocation,
  deletePickupLocation,
  listPickupLocations,
  updatePickupLocation
} from 'admin/api/pickupLocations';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const SERVER_ERROR_FIELDS = ['name', 'area', 'details', 'is_active'];
const DETAILS_PREVIEW_LENGTH = 60;

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

const sortLocations = (items) =>
  [...items].sort(
    (a, b) =>
      String(a.area ?? '').localeCompare(String(b.area ?? '')) ||
      String(a.name ?? '').localeCompare(String(b.name ?? ''))
  );

const truncateDetails = (value) => {
  const text = String(value ?? '');

  return text.length > DETAILS_PREVIEW_LENGTH ? `${text.slice(0, DETAILS_PREVIEW_LENGTH)}…` : text;
};

// ==============================|| PICKUP LOCATION FORM DIALOG ||============================== //

function PickupLocationFormDialog({ open, location, onClose, onSaved, onFailed }) {
  const isEdit = Boolean(location);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: location?.name ?? '',
      area: location?.area ?? '',
      details: location?.details ?? '',
      is_active: location?.is_active ?? true
    }
  });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const saved = isEdit
        ? await updatePickupLocation(location.id, values)
        : await createPickupLocation(values);
      onSaved(saved, isEdit ? 'Pickup location updated.' : 'Pickup location created.');
    } catch (error) {
      applyServerErrors(error, setError);

      const message = getErrorMessage(error, 'Could not save the pickup location.');
      setFormError(message);
      onFailed(message);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit pickup location' : 'Add pickup location'}</DialogTitle>

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
              label="Area"
              required
              fullWidth
              error={Boolean(errors.area)}
              helperText={errors.area?.message}
              {...register('area', {
                required: 'Area is required.',
                maxLength: { value: 100, message: 'Area must be 100 characters or fewer.' }
              })}
            />

            <TextField
              label="Details"
              fullWidth
              multiline
              rows={3}
              error={Boolean(errors.details)}
              helperText={errors.details?.message || 'Optional.'}
              {...register('details', {
                maxLength: { value: 255, message: 'Details must be 255 characters or fewer.' }
              })}
            />

            <FormControlLabel
              control={<Switch {...register('is_active')} defaultChecked={location?.is_active ?? true} />}
              label="Active"
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
              'Create location'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ==============================|| ADMIN - PICKUP LOCATIONS ||============================== //

export default function PickupLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState({ open: false, location: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      setLocations(sortLocations(await listPickupLocations()));
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load pickup locations.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSaved = (saved, message) => {
    setLocations((prev) => sortLocations([...prev.filter((location) => location.id !== saved.id), saved]));
    setDialog({ open: false, location: null });
    notify(message, 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deletePickupLocation(deleteTarget.id);
      setLocations((prev) => prev.filter((location) => location.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify('Pickup location deleted.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not delete the pickup location.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <MainCard
        title="Pickup locations"
        content={false}
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => setDialog({ open: true, location: null })}
          >
            Add location
          </Button>
        }
      >
        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={fetchLocations}>
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
          <Table aria-label="pickup locations table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      No pickup locations yet. Add your first location.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow
                    key={location.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{location.id}</TableCell>

                    <TableCell component="th" scope="row">
                      {location.name}
                    </TableCell>

                    <TableCell>{location.area}</TableCell>

                    <TableCell>
                      {location.details ? (
                        <Tooltip title={location.details}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {truncateDetails(location.details)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={location.is_active ? 'Active' : 'Inactive'}
                        color={location.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Edit ${location.name}`}
                            onClick={() => setDialog({ open: true, location })}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${location.name}`}
                            onClick={() => setDeleteTarget(location)}
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
        <PickupLocationFormDialog
          open
          location={dialog.location}
          onClose={() => setDialog({ open: false, location: null })}
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
        <DialogTitle>Delete pickup location?</DialogTitle>
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
