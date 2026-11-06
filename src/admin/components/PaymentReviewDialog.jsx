import { useCallback, useEffect, useState } from 'react';

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
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { approvePayment, getPaymentOrder, rejectPayment } from 'admin/api/payments';
import { getReceiptSrc } from 'admin/components/ReceiptThumb';
import { formatDateTime, formatMoney } from 'admin/utils/format';

const METHOD_LABELS = {
  telebirr: 'Telebirr',
  bank_transfer: 'Bank transfer'
};

const TYPE_LABELS = {
  deposit: 'Deposit',
  full: 'Full payment'
};

const formatChoice = (labels, value) =>
  labels[value] ?? (value ? String(value).replace(/_/g, ' ') : '—');

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

const InfoRow = ({ label, children }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    sx={{ gap: { xs: 0.25, sm: 1.5 }, alignItems: { xs: 'flex-start', sm: 'baseline' } }}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 130 }}>
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Stack>
);

// ==============================|| PAYMENT REVIEW DIALOG ||============================== //

export default function PaymentReviewDialog({
  open,
  payment,
  orderId,
  orderNumber,
  customerName,
  onClose,
  onSuccess,
  onConflict,
  onError
}) {
  const resolvedOrderId = orderId ?? payment?.order ?? null;

  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadOrder = useCallback(async () => {
    if (resolvedOrderId == null) {
      setOrder(null);
      setOrderError('');
      return;
    }

    setOrderLoading(true);
    setOrderError('');

    try {
      setOrder(await getPaymentOrder(resolvedOrderId));
    } catch (error) {
      setOrder(null);
      setOrderError(getErrorMessage(error, 'Could not load the order totals.'));
    } finally {
      setOrderLoading(false);
    }
  }, [resolvedOrderId]);

  useEffect(() => {
    if (open) loadOrder();
  }, [open, loadOrder]);

  useEffect(() => {
    setConfirmAction(null);
    setActionError('');
    setSubmitting(false);
  }, [payment?.id]);

  if (!payment) return null;

  const receiptSrc = getReceiptSrc(payment.receipt);
  const paidAmount = Number(payment.amount);
  const expectedDeposit = order ? Number(order.deposit_amount) : null;
  const amountMismatch =
    Number.isFinite(paidAmount) &&
    Number.isFinite(expectedDeposit) &&
    Math.abs(paidAmount - expectedDeposit) > 0.005;

  const review = async (action) => {
    setSubmitting(true);
    setActionError('');

    try {
      const result =
        action === 'approve' ? await approvePayment(payment.id) : await rejectPayment(payment.id);

      onSuccess?.(result);
    } catch (error) {
      const message = getErrorMessage(error, `Could not ${action} the payment.`);

      if (error?.response?.status === 409) {
        onConflict?.(message);
      } else {
        setActionError(message);
        onError?.(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startConfirm = (action) => {
    setActionError('');
    setConfirmAction(action);
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Review payment</DialogTitle>

      <DialogContent dividers>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 3 }}>
          <Box sx={{ flex: { md: '0 0 44%' }, minWidth: 0 }}>
            {receiptSrc ? (
              <Box
                component="img"
                src={receiptSrc}
                alt="Payment receipt"
                sx={{
                  width: '100%',
                  maxHeight: 420,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  display: 'block'
                }}
              />
            ) : (
              <Box
                sx={{
                  minHeight: 220,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>No receipt uploaded</Typography>
              </Box>
            )}
          </Box>

          <Stack sx={{ gap: 1.5, flexGrow: 1, minWidth: 0 }}>
            <InfoRow label="Customer">
              <Typography>{customerName ?? payment.customer_name ?? '—'}</Typography>
            </InfoRow>

            <InfoRow label="Order number">
              <Typography>{orderNumber ?? payment.order_number ?? '—'}</Typography>
            </InfoRow>

            <InfoRow label="Method">
              <Typography>{formatChoice(METHOD_LABELS, payment.method)}</Typography>
            </InfoRow>

            <InfoRow label="Type">
              <Typography>{formatChoice(TYPE_LABELS, payment.payment_type)}</Typography>
            </InfoRow>

            <InfoRow label="Transaction ref">
              <Typography sx={{ wordBreak: 'break-all' }}>{payment.transaction_ref || '—'}</Typography>
            </InfoRow>

            <InfoRow label="Submitted">
              <Typography>{formatDateTime(payment.created_at)}</Typography>
            </InfoRow>

            <Divider />

            <InfoRow label="Paid amount">
              <Typography variant="h6">{formatMoney(payment.amount)}</Typography>
            </InfoRow>

            {orderLoading && (
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <CircularProgress size={16} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Loading order totals…
                </Typography>
              </Stack>
            )}

            {order && !orderLoading && (
              <>
                <InfoRow label="Order total">
                  <Typography>{formatMoney(order.total_amount)}</Typography>
                </InfoRow>

                <InfoRow label="Expected deposit">
                  <Typography>{formatMoney(order.deposit_amount)}</Typography>
                </InfoRow>
              </>
            )}

            {amountMismatch && (
              <Alert severity="warning">
                The paid amount ({formatMoney(payment.amount)}) differs from the expected deposit (
                {formatMoney(order.deposit_amount)}). You can still approve or reject.
              </Alert>
            )}

            {orderError && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={loadOrder} disabled={orderLoading}>
                    Retry
                  </Button>
                }
              >
                {orderError}
              </Alert>
            )}

            {actionError && <Alert severity="error">{actionError}</Alert>}

            {confirmAction && (
              <Alert severity={confirmAction === 'reject' ? 'warning' : 'info'}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {confirmAction === 'reject'
                    ? 'Reject this receipt? The order goes back to "Pending payment" and the customer must pay again.'
                    : 'Approve this payment? The order will move to Approved.'}
                </Typography>

                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color={confirmAction === 'reject' ? 'error' : 'success'}
                    onClick={() => review(confirmAction)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : confirmAction === 'reject' ? (
                      'Confirm reject'
                    ) : (
                      'Confirm approve'
                    )}
                  </Button>

                  <Button size="small" color="secondary" onClick={() => setConfirmAction(null)} disabled={submitting}>
                    Back
                  </Button>
                </Stack>
              </Alert>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>

        {!confirmAction && (
          <>
            <Button
              color="error"
              variant="outlined"
              onClick={() => startConfirm('reject')}
              disabled={submitting || orderLoading}
            >
              Reject
            </Button>

            <Button
              color="success"
              variant="contained"
              onClick={() => startConfirm('approve')}
              disabled={submitting || orderLoading}
            >
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
