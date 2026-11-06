import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useForm } from 'react-hook-form';

// project imports
import { createPayment } from 'services/customerApi';
import { formatMoney } from 'admin/utils/format';

// assets
import UploadOutlined from '@ant-design/icons/UploadOutlined';

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

const getFirstMessage = (value) => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = getFirstMessage(entry);
      if (message) return message;
    }
    return '';
  }

  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      const message = getFirstMessage(entry);
      if (message) return message;
    }
  }

  return '';
};

const getErrorMessage = (error, fallback) => {
  if (!error?.response) return 'Unable to reach the server. Please try again.';

  const data = error.response.data;

  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data === 'string' && data) return data;

  return getFirstMessage(data) || fallback;
};

const applyServerErrors = (data, setError) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;

  ['method', 'transaction_ref', 'receipt', 'amount'].forEach((field) => {
    const message = getFirstMessage(data[field]);
    if (message) setError(field, { type: 'server', message });
  });
};

const validateReceipt = (files) => {
  const file = files?.[0] ?? files;

  if (!file) return 'Upload the payment receipt.';
  if (!ALLOWED_TYPES.includes(file.type)) return 'Use a PNG or JPG image.';
  if (file.size > MAX_RECEIPT_SIZE) return 'File is too large (max 5 MB).';

  return true;
};

// ==============================|| PAYMENT CREATE DIALOG ||============================== //

export default function PaymentCreateDialog({ open, orderNumber, depositAmount, onClose, onSuccess }) {
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm({
    defaultValues: {
      method: 'telebirr',
      transaction_ref: ''
    }
  });

  const receipt = watch('receipt');
  const receiptFile = receipt?.[0] ?? receipt;

  const close = () => {
    if (submitting) return;

    reset();
    setServerError('');
    onClose();
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError('');

    const data = new FormData();
    data.append('method', values.method);
    data.append('transaction_ref', values.transaction_ref.trim());
    data.append('receipt', values.receipt?.[0] ?? values.receipt);

    try {
      const payment = await createPayment(orderNumber, data);
      reset();
      onSuccess(payment);
    } catch (error) {
      const response = error?.response?.data;

      if (error?.response?.status === 409) {
        setServerError(getErrorMessage(error, 'This order cannot accept a payment right now.'));
      } else {
        applyServerErrors(response, setError);
        setServerError(getErrorMessage(error, 'Could not add the payment.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>Add payment</DialogTitle>

      <DialogContent>
        <Stack component="form" id="payment-create-form" onSubmit={handleSubmit(onSubmit)} sx={{ gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Order {orderNumber} · deposit {formatMoney(depositAmount)}
          </Typography>

          <Alert severity="info">
            This records a customer receipt. The server always uses the order&apos;s deposit amount, and the order
            moves to Payment review for approval.
          </Alert>

          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            select
            label="Method"
            fullWidth
            error={Boolean(errors.method)}
            helperText={errors.method?.message}
            {...register('method', { required: 'Choose a payment method.' })}
          >
            <MenuItem value="telebirr">Telebirr</MenuItem>
            <MenuItem value="bank_transfer">Bank transfer</MenuItem>
          </TextField>

          <TextField
            label="Transaction reference"
            fullWidth
            error={Boolean(errors.transaction_ref)}
            helperText={errors.transaction_ref?.message}
            {...register('transaction_ref', {
              required: 'Enter the transaction reference.',
              maxLength: { value: 100, message: 'Use at most 100 characters.' }
            })}
          />

          <Stack sx={{ gap: 1 }}>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<UploadOutlined />}
                disabled={submitting}
              >
                {receiptFile ? 'Change receipt' : 'Choose receipt'}
                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg"
                  {...register('receipt', { validate: validateReceipt })}
                />
              </Button>

              {receiptFile && (
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {receiptFile.name}
                </Typography>
              )}
            </Stack>

            {errors.receipt && <FormHelperText error>{errors.receipt.message}</FormHelperText>}

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PNG or JPG, max 5 MB.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="secondary" onClick={close} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" form="payment-create-form" variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Add payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
