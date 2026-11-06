import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { getOrder, updateOrderStatus } from 'admin/api/orders';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import PaymentCreateDialog from 'admin/components/PaymentCreateDialog';
import PaymentReviewDialog from 'admin/components/PaymentReviewDialog';
import PaymentStatusChip from 'admin/components/PaymentStatusChip';
import ReceiptThumb from 'admin/components/ReceiptThumb';
import { ALLOWED_MANUAL_TRANSITIONS, ORDER_STATUS } from 'admin/constants/orderStatus';
import { formatDateTime, formatMoney } from 'admin/utils/format';

const METHOD_LABELS = {
  telebirr: 'Telebirr',
  bank_transfer: 'Bank transfer'
};

const TYPE_LABELS = {
  deposit: 'Deposit',
  full: 'Full payment'
};

const COLOR_MODE_LABELS = {
  as_in_picture: 'As in picture',
  custom: 'Custom colors'
};

const MANUAL_ACTION_CONFIG = {
  approved: { label: 'Complete approval', buttonColor: 'success', buttonVariant: 'contained' },
  in_production: { label: 'Start production', buttonColor: 'primary', buttonVariant: 'contained' },
  ready: { label: 'Mark as ready', buttonColor: 'primary', buttonVariant: 'contained' },
  picked_up: { label: 'Mark as picked up', buttonColor: 'primary', buttonVariant: 'contained' },
  cancelled: { label: 'Cancel', buttonColor: 'error', buttonVariant: 'outlined' }
};

const formatChoice = (labels, value) =>
  labels[value] ?? (value ? String(value).replace(/_/g, ' ') : '—');

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

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
    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 160 }}>
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Stack>
);

const ItemColors = ({ colors }) => {
  if (!colors?.length) return <EmptyValue />;

  const ordered = [...colors].sort((a, b) => Number(a.position) - Number(b.position));

  return (
    <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
      {ordered.map((entry, index) => {
        const color = entry.color ?? {};
        const hex = color.hex_code ?? '';
        const name = color.name ?? 'Color';

        return (
          <Tooltip key={`${entry.position}-${color.id ?? index}`} title={hex ? `${name} (${hex})` : name}>
            <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: hex || 'grey.400',
                  border: 1,
                  borderColor: 'divider'
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {entry.position}. {name}
              </Typography>
            </Stack>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

// ==============================|| ADMIN - ORDER DETAIL ||============================== //

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmAction, setConfirmAction] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [reviewPayment, setReviewPayment] = useState(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setLoadError('');
      }

      try {
        setOrder(await getOrder(id));
        return true;
      } catch (error) {
        if (!silent) {
          setOrder(null);
          setLoadError(getErrorMessage(error, 'Could not load the order.'));
        }

        return false;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder, refreshKey]);

  const openConfirm = (target) => {
    setStatusError('');
    setConfirmAction(target);
  };

  const closeConfirm = () => {
    if (statusSubmitting) return;

    setConfirmAction(null);
    setStatusError('');
  };

  const handleStatusChange = async () => {
    if (!confirmAction) return;

    setStatusSubmitting(true);
    setStatusError('');

    try {
      await updateOrderStatus(order.id, confirmAction);
      setConfirmAction(null);
      const refreshed = await loadOrder(true);

      notify(
        refreshed ? 'Order status updated.' : 'Order status updated, but the order could not be refreshed.',
        refreshed ? 'success' : 'warning'
      );
    } catch (error) {
      setStatusError(getErrorMessage(error, 'Could not change the order status.'));
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleReviewed = async (result) => {
    setReviewPayment(null);
    const refreshed = await loadOrder(true);

    if (!refreshed) {
      notify('Payment updated, but the order could not be refreshed.', 'warning');
      return;
    }

    notify(result?.status === 'approved' ? 'Payment approved.' : 'Payment rejected.', 'success');
  };

  const handleConflict = async (message) => {
    setReviewPayment(null);
    await loadOrder(true);
    notify(message, 'error');
  };

  const handleRefresh = async () => {
    const refreshed = await loadOrder(true);

    if (!refreshed) notify('Could not refresh the order.', 'error');
  };

  const handlePaymentCreated = async (payment) => {
    setAddPaymentOpen(false);
    const refreshed = await loadOrder(true);
    const amount = payment?.amount ? ` (${formatMoney(payment.amount)})` : '';

    notify(
      refreshed ? `Payment added${amount}. Review it in the payments table.` : 'Payment added, but the order could not be refreshed.',
      refreshed ? 'success' : 'warning'
    );
  };

  if (loading) {
    return (
      <MainCard title="Order">
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      </MainCard>
    );
  }

  if (loadError || !order) {
    return (
      <MainCard title="Order">
        <Alert
          severity="error"
          action={
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => setRefreshKey((key) => key + 1)}>
                Retry
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate('/admin/orders')}>
                Back
              </Button>
            </Stack>
          }
        >
          {loadError || 'Order not found.'}
        </Alert>
      </MainCard>
    );
  }

  const customer = order.customer ?? {};
  const pickup = order.pickup_location;
  const telegram = normalizeTelegram(customer.telegram_username);
  const items = order.items ?? [];
  const payments = order.payments ?? [];
  const pendingPayments = payments.filter((payment) => payment.status === 'pending');
  const approvedPayments = payments.filter((payment) => payment.status === 'approved');

  const paidSoFar = approvedPayments.reduce((sum, payment) => sum + toAmount(payment.amount), 0);

  const remaining = toAmount(order.total_amount) - paidSoFar;

  // The payment was approved but the order was left behind in review. The
  // backend allows this one repair step, so offer it alongside the usual ones.
  const canRepairReview = order.status === 'payment_review' && pendingPayments.length === 0 && approvedPayments.length > 0;
  const defaultTargets = ALLOWED_MANUAL_TRANSITIONS[order.status] ?? [];
  const manualTargets = canRepairReview ? ['approved', ...defaultTargets] : defaultTargets;
  const isCancel = confirmAction === 'cancelled';
  const targetLabel = confirmAction
    ? ORDER_STATUS[confirmAction]?.label ?? String(confirmAction).replace(/_/g, ' ')
    : '';

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <MainCard
          title={`Order ${order.order_number}`}
          content={false}
          secondary={
            <Stack
              direction="row"
              sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}
            >
              <OrderStatusChip status={order.status} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Created {formatDateTime(order.created_at)}
              </Typography>
              <Button size="small" color="secondary" onClick={handleRefresh}>
                Refresh
              </Button>
              <Button size="small" color="secondary" onClick={() => navigate('/admin/orders')}>
                Back
              </Button>
            </Stack>
          }
        />

        <MainCard title="Change status">
          <Stack sx={{ gap: 2 }}>
            {order.status === 'payment_review' && pendingPayments.length > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  Approve or reject the pending payment to move this order forward.{' '}
                  <Link component={RouterLink} to="/admin/payments">
                    Go to payments
                  </Link>
                </Typography>
              </Alert>
            )}

            {canRepairReview && (
              <Alert severity="warning">
                This order already has an approved payment but is still marked as Payment review. Use{' '}
                <strong>Complete approval</strong> below to bring the order status in line with the payment.
              </Alert>
            )}

            {order.status === 'payment_review' && pendingPayments.length === 0 && approvedPayments.length === 0 && (
              <Alert severity="info">
                There is no pending payment to review. Waiting for the customer to submit a receipt.
              </Alert>
            )}

            {manualTargets.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>No further changes.</Typography>
            ) : (
              <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                {manualTargets.map((target) => {
                  const config = MANUAL_ACTION_CONFIG[target] ?? {
                    label: ORDER_STATUS[target]?.label ?? target,
                    buttonColor: 'primary',
                    buttonVariant: 'contained'
                  };

                  return (
                    <Button
                      key={target}
                      variant={config.buttonVariant}
                      color={config.buttonColor}
                      onClick={() => openConfirm(target)}
                    >
                      {config.label}
                    </Button>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </MainCard>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <MainCard
            title="Customer"
            secondary={
              customer.id != null ? (
                <Button
                  size="small"
                  color="secondary"
                  component={RouterLink}
                  to={`/admin/customers/${customer.id}`}
                >
                  View customer
                </Button>
              ) : null
            }
          >
            <Stack sx={{ gap: 2 }}>
              <InfoRow label="Name">
                <Typography>{customer.full_name ?? '—'}</Typography>
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
            </Stack>
          </MainCard>

          <MainCard title="Pickup location">
            <Stack sx={{ gap: 2 }}>
              <InfoRow label="Name">
                <Typography>{pickup?.name ?? '—'}</Typography>
              </InfoRow>

              <InfoRow label="Area">
                {pickup?.area ? <Typography>{pickup.area}</Typography> : <EmptyValue />}
              </InfoRow>

              <InfoRow label="Details">
                {pickup?.details ? (
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{pickup.details}</Typography>
                ) : (
                  <EmptyValue />
                )}
              </InfoRow>
            </Stack>
          </MainCard>
        </Box>

        <MainCard title="Items" content={false}>
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              '& td, & th': { whiteSpace: 'nowrap' }
            }}
          >
            <Table aria-label="order items table">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Unit price</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell>Color mode</TableCell>
                  <TableCell>Name text</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Colors</TableCell>
                  <TableCell align="right">Line total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: 'text.secondary' }}>This order has no items.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {item.product_name}
                      </TableCell>

                      <TableCell align="right">{formatMoney(item.unit_price)}</TableCell>

                      <TableCell align="right">{item.quantity}</TableCell>

                      <TableCell>{formatChoice(COLOR_MODE_LABELS, item.color_mode)}</TableCell>

                      <TableCell>{item.name_text || <EmptyValue />}</TableCell>

                      <TableCell sx={{ whiteSpace: 'normal', minWidth: 160 }}>
                        {item.notes || <EmptyValue />}
                      </TableCell>

                      <TableCell>
                        {item.color_mode === 'custom' ? (
                          <ItemColors colors={item.colors} />
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(toAmount(item.unit_price) * toAmount(item.quantity))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>

        <MainCard title="Totals">
          <Stack sx={{ gap: 2 }}>
            <InfoRow label="Total">
              <Typography variant="h6">{formatMoney(order.total_amount)}</Typography>
            </InfoRow>

            <InfoRow label="Deposit percent">
              <Typography>{order.deposit_percent}%</Typography>
            </InfoRow>

            <InfoRow label="Deposit amount">
              <Typography>{formatMoney(order.deposit_amount)}</Typography>
            </InfoRow>

            <InfoRow label="Paid so far">
              <Typography>{formatMoney(paidSoFar)}</Typography>
            </InfoRow>

            <InfoRow label="Remaining balance">
              <Typography>{formatMoney(remaining)}</Typography>
            </InfoRow>

            <Divider />

            <InfoRow label="Customer note">
              {order.customer_note ? (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{order.customer_note}</Typography>
              ) : (
                <EmptyValue />
              )}
            </InfoRow>
          </Stack>
        </MainCard>

        <MainCard
          title="Payments"
          content={false}
          secondary={
            <Tooltip
              title={
                order.status === 'pending_payment'
                  ? 'Record a customer receipt'
                  : 'Payments can only be added while the order is pending payment.'
              }
            >
              <span>
                <Button
                  size="small"
                  variant="contained"
                  disabled={order.status !== 'pending_payment'}
                  onClick={() => setAddPaymentOpen(true)}
                >
                  Add payment
                </Button>
              </span>
            </Tooltip>
          }
        >
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              '& td, & th': { whiteSpace: 'nowrap' }
            }}
          >
            <Table aria-label="order payments table">
              <TableHead>
                <TableRow>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Transaction ref</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: 'text.secondary' }}>No payments yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <ReceiptThumb receipt={payment.receipt} />
                      </TableCell>

                      <TableCell>{formatChoice(TYPE_LABELS, payment.payment_type)}</TableCell>

                      <TableCell>{formatChoice(METHOD_LABELS, payment.method)}</TableCell>

                      <TableCell align="right">{formatMoney(payment.amount)}</TableCell>

                      <TableCell>
                        {payment.transaction_ref ? (
                          <Typography variant="body2" sx={{ wordBreak: 'break-all', maxWidth: 220 }}>
                            {payment.transaction_ref}
                          </Typography>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>

                      <TableCell>
                        <PaymentStatusChip status={payment.status} />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{formatDateTime(payment.created_at)}</Typography>

                        {payment.status !== 'pending' && payment.verified_at && (
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                            Verified {formatDateTime(payment.verified_at)}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {payment.status === 'pending' ? (
                          <Button size="small" variant="outlined" onClick={() => setReviewPayment(payment)}>
                            Review
                          </Button>
                        ) : (
                          <EmptyValue />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Stack>

      <Dialog open={Boolean(confirmAction)} onClose={statusSubmitting ? undefined : closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>{isCancel ? 'Cancel order' : 'Change status'}</DialogTitle>

        <DialogContent>
          <Stack sx={{ gap: 2, pt: 1 }}>
            <Typography>
              {isCancel
                ? `Cancel order ${order.order_number}?`
                : `Move order ${order.order_number} to "${targetLabel}"?`}
            </Typography>

            {isCancel && (
              <Alert severity="error">
                Cancelling is final. No further status changes are possible for this order.
              </Alert>
            )}

            {statusError && <Alert severity="error">{statusError}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={closeConfirm} disabled={statusSubmitting}>
            Back
          </Button>
          <Button
            variant="contained"
            color={isCancel ? 'error' : 'primary'}
            onClick={handleStatusChange}
            disabled={statusSubmitting}
          >
            {statusSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isCancel ? (
              'Yes, cancel order'
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {reviewPayment && (
        <PaymentReviewDialog
          open
          payment={reviewPayment}
          orderId={order.id}
          orderNumber={order.order_number}
          customerName={customer.full_name}
          onClose={() => setReviewPayment(null)}
          onSuccess={handleReviewed}
          onConflict={handleConflict}
          onError={(message) => notify(message, 'error')}
        />
      )}

      {addPaymentOpen && (
        <PaymentCreateDialog
          open
          orderNumber={order.order_number}
          depositAmount={order.deposit_amount}
          onClose={() => setAddPaymentOpen(false)}
          onSuccess={handlePaymentCreated}
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
