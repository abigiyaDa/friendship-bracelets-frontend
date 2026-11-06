import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// assets
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';

// project imports
import { submitPayment } from 'shop/api';
import { formatMoney } from 'admin/utils/format';

const MAX_SIZE = 5 * 1024 * 1024;
const OK_TYPES = ['image/jpeg', 'image/png'];

// ==============================|| SHOP - PAYMENT UPLOAD FORM ||============================== //

export default function PaymentUploadForm({ orderNumber, depositAmount, onSubmitted }) {
  const [method, setMethod] = useState('telebirr');
  const [transactionRef, setTransactionRef] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const fileRef = useRef(null);

  const pickFile = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setError('');

    if (!selected) {
      setFile(null);
      setPreview('');
      return;
    }
    if (!OK_TYPES.includes(selected.type)) {
      setError('Receipt must be a JPG or PNG image.');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('Image is too large (max 5 MB).');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!transactionRef.trim()) {
      setError('Enter the transaction reference from your payment.');
      return;
    }
    if (!file) {
      setError('Attach a screenshot of your payment receipt.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitPayment(orderNumber, {
        method,
        transactionRef: transactionRef.trim(),
        receipt: file
      });
      setDone(data);
      onSubmitted?.(data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const firstFieldError = err?.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null;
      const fieldMessage = Array.isArray(firstFieldError) ? firstFieldError[0] : typeof firstFieldError === 'string' ? firstFieldError : null;
      setError(detail || fieldMessage || 'Could not submit your payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Alert severity="success" icon={<SafetyCertificateOutlined />} sx={{ borderRadius: 2 }}>
        Payment submitted! We&apos;re verifying it now — you can follow along on the track page.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" sx={{ mb: 0.25 }}>Pay your deposit</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Transfer exactly {formatMoney(depositAmount)} via Telebirr or bank transfer, then upload the receipt.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel id="payment-method-label">Payment method</InputLabel>
          <Select labelId="payment-method-label" label="Payment method" value={method} onChange={(event) => setMethod(event.target.value)}>
            <MenuItem value="telebirr">Telebirr</MenuItem>
            <MenuItem value="bank_transfer">Bank transfer</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Transaction reference"
          placeholder="e.g. FT240…"
          value={transactionRef}
          onChange={(event) => setTransactionRef(event.target.value)}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />

        <Box>
          <Button variant="outlined" component="label" startIcon={<UploadOutlined />} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {file ? 'Change receipt' : 'Upload receipt (JPG/PNG)'}
            <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png" onChange={pickFile} />
          </Button>
          {file && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
              {file.name}
            </Typography>
          )}
          {preview && (
            <Box component="img" src={preview} alt="Receipt preview" sx={{ mt: 1.5, width: 120, height: 120, objectFit: 'cover', borderRadius: 2, border: 1, borderColor: 'divider' }} />
          )}
          <FormHelperText>Max 5 MB. We only use it to verify your deposit.</FormHelperText>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={submitting} disableElevation sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Submit payment'}
        </Button>
      </Stack>
    </Box>
  );
}

PaymentUploadForm.propTypes = {
  orderNumber: PropTypes.string.isRequired,
  depositAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSubmitted: PropTypes.func
};
