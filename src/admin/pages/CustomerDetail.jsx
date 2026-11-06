import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useForm } from 'react-hook-form';

// project imports
import MainCard from 'components/MainCard';
import { getCustomer, updateCustomer } from 'admin/api/customers';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import { formatDate, formatDateTime, formatMoney } from 'admin/utils/format';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';

const SERVER_ERROR_FIELDS = ['full_name', 'email', 'telegram_username'];

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

// Telegram values arrive both as "@naolda" and "AbigiyaDa".
const normalizeTelegram = (value) => String(value ?? '').trim().replace(/^@+/, '');

const EmptyValue = () => (
  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
    &mdash;
  </Typography>
);

const InfoRow = ({ label, children }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    sx={{ gap: { xs: 0.5, sm: 2 }, alignItems: { xs: 'flex-start', sm: 'baseline' } }}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 140 }}>
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Stack>
);

// ==============================|| CUSTOMER EDIT DIALOG ||============================== //

function CustomerEditDialog({ open, customer, onClose, onSaved, onFailed }) {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      full_name: customer.full_name ?? '',
      email: customer.email ?? '',
      telegram_username: normalizeTelegram(customer.telegram_username)
    }
  });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const saved = await updateCustomer(customer.id, {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        telegram_username: normalizeTelegram(values.telegram_username)
      });

      onSaved(saved);
    } catch (error) {
      applyServerErrors(error, setError);

      const message = getErrorMessage(error, 'Could not save the customer.');
      setFormError(message);
      onFailed(message);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit customer</DialogTitle>

        <DialogContent>
          <Stack sx={{ gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Full name"
              required
              fullWidth
              autoFocus
              error={Boolean(errors.full_name)}
              helperText={errors.full_name?.message}
              {...register('full_name', {
                required: 'Full name is required.',
                maxLength: { value: 120, message: 'Full name must be 120 characters or fewer.' }
              })}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email', {
                maxLength: { value: 254, message: 'Email must be 254 characters or fewer.' },
                validate: (value) =>
                  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.'
              })}
            />

            <TextField
              label="Telegram username"
              fullWidth
              error={Boolean(errors.telegram_username)}
              helperText={errors.telegram_username?.message || 'Optional. The leading "@" is not needed.'}
              {...register('telegram_username', {
                maxLength: { value: 64, message: 'Telegram username must be 64 characters or fewer.' }
              })}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Phone ({customer.phone}) is the customer&apos;s unique identifier and can&apos;t be changed.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ==============================|| ADMIN - CUSTOMER DETAIL ||============================== //

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      setCustomer(await getCustomer(id));
    } catch (error) {
      setCustomer(null);
      setLoadError(getErrorMessage(error, 'Could not load the customer.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer, refreshKey]);

  const handleSaved = (saved) => {
    setCustomer(saved);
    setEditOpen(false);
    notify('Customer updated.', 'success');
  };

  if (loading) {
    return (
      <MainCard title="Customer">
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      </MainCard>
    );
  }

  if (loadError || !customer) {
    return (
      <MainCard title="Customer">
        <Alert
          severity="error"
          action={
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => setRefreshKey((key) => key + 1)}>
                Retry
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate('/admin/customers')}>
                Back
              </Button>
            </Stack>
          }
        >
          {loadError || 'Customer not found.'}
        </Alert>
      </MainCard>
    );
  }

  const telegram = normalizeTelegram(customer.telegram_username);
  const details = customer.orders ?? [];

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <MainCard
          title="Customer"
          secondary={
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button size="small" color="secondary" onClick={() => navigate('/admin/customers')}>
                Back
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<EditOutlined />}
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
            </Stack>
          }
        >
          <Stack sx={{ gap: 2 }}>
            <InfoRow label="Full name">
              <Typography>{customer.full_name}</Typography>
            </InfoRow>

            <InfoRow label="Phone">
              {customer.phone ? <Link href={`tel:${customer.phone}`}>{customer.phone}</Link> : <EmptyValue />}
            </InfoRow>

            <InfoRow label="Email">
              {customer.email ? <Link href={`mailto:${customer.email}`}>{customer.email}</Link> : <EmptyValue />}
            </InfoRow>

            <InfoRow label="Telegram">
              {telegram ? (
                <Link href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer">
                  @{telegram}
                </Link>
              ) : (
                <EmptyValue />
              )}
            </InfoRow>

            <InfoRow label="Orders">
              <Typography>{customer.order_count ?? 0}</Typography>
            </InfoRow>

            <InfoRow label="Joined">
              <Typography>{formatDateTime(customer.created_at)}</Typography>
            </InfoRow>
          </Stack>
        </MainCard>

        <MainCard title="Orders" content={false}>
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              '& td, & th': { whiteSpace: 'nowrap' }
            }}
          >
            <Table aria-label="customer orders table">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Deposit</TableCell>
                  <TableCell>Pickup location</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: 'text.secondary' }}>This customer has no orders yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  details.map((order) => (
                    <TableRow
                      key={order.order_number}
                      hover
                      tabIndex={0}
                      onClick={() => {
                        // TODO: the nested orders on the customer detail response have no `id`
                        // (backend OrderSummarySerializer only exposes order_number), so link by
                        // order_number for now. Switch to order.id once the serializer adds it.
                        navigate(`/admin/orders/${order.order_number}`);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/admin/orders/${order.order_number}`);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {order.order_number}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <OrderStatusChip status={order.status} />
                      </TableCell>

                      <TableCell>{formatMoney(order.total_amount)}</TableCell>

                      <TableCell>{formatMoney(order.deposit_amount)}</TableCell>

                      <TableCell>
                        {order.pickup_location ? (
                          <Stack sx={{ gap: 0 }}>
                            <Typography variant="body2">{order.pickup_location.name}</Typography>
                            {order.pickup_location.area && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {order.pickup_location.area}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>

                      <TableCell align="right">{order.item_count ?? 0}</TableCell>

                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Stack>

      {editOpen && (
        <CustomerEditDialog
          open
          customer={customer}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
          onFailed={(message) => notify(message, 'error')}
        />
      )}

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
