import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

// assets
import UserOutlined from '@ant-design/icons/UserOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';

// project imports
import { createOrder, listPickupLocations } from 'shop/api';
import { useAsync } from 'shop/useAsync';
import { useCart } from 'shop/CartContext';
import PaymentUploadForm from 'shop/components/PaymentUploadForm';
import { gradientButtonSx, GRADIENT_SOFT, INK } from 'shop/theme';
import { normalizePhone, PHONE_HINT } from 'shop/phone';
import { formatMoney } from 'admin/utils/format';

// ==============================|| SHOP - CHECKOUT ||============================== //

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const pickupLocations = useAsync(listPickupLocations);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    telegram_username: '',
    pickup_location: '',
    customer_note: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const locationsByArea = useMemo(() => {
    const groups = new Map();
    for (const location of pickupLocations.data ?? []) {
      const area = location.area || 'Other';
      if (!groups.has(area)) groups.set(area, []);
      groups.get(area).push(location);
    }
    return [...groups.entries()];
  }, [pickupLocations.data]);

  const deposit = total * 0.5;

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.full_name.trim()) return setError('Please tell us your name.');
    const normalizedPhone = normalizePhone(form.phone);
    if (!normalizedPhone) return setError(`Enter a valid Ethiopian phone number — ${PHONE_HINT}.`);
    if (!form.pickup_location) return setError('Choose where you want to pick up your order.');

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          full_name: form.full_name.trim(),
          phone: normalizedPhone,
          email: form.email.trim() || null,
          telegram_username: form.telegram_username.trim().replace(/^@/, '') || null
        },
        pickup_location: Number(form.pickup_location),
        customer_note: form.customer_note.trim() || null,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          color_mode: item.colorMode,
          colors: item.colorMode === 'custom' ? item.colorIds : [],
          name_text: item.nameText || null,
          notes: item.notes || null
        }))
      };

      const data = await createOrder(payload);
      clearCart();
      setPlacedOrder({ ...data, phone: normalizedPhone });
      window.scrollTo(0, 0);
    } catch (err) {
      const data = err?.response?.data;
      let message = 'Could not place the order. Please try again.';
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (data && typeof data === 'object') {
        const first = Object.values(data)[0];
        message = Array.isArray(first) ? String(first[0]) : typeof first === 'string' ? first : message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- confirmation view ---------- */
  if (placedOrder) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 }, textAlign: 'center' }}>
        <CheckCircleFilled style={{ fontSize: 72, color: '#22C55E' }} />
        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK, mt: 2 }}>
          Order placed!
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>
          We’ll start braiding as soon as your deposit is in. Keep your order number safe!
        </Typography>

        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 3, mt: 3, textAlign: 'left' }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>Order number</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.2rem', color: INK, bgcolor: GRADIENT_SOFT, px: 1.5, py: 0.5, borderRadius: 2 }}>
              {placedOrder.order_number}
            </Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack sx={{ gap: 0.75 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatMoney(placedOrder.total_amount)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Deposit due ({placedOrder.deposit_percent}%)</Typography>
              <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>{formatMoney(placedOrder.deposit_amount)}</Typography>
            </Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <PaymentUploadForm orderNumber={placedOrder.order_number} depositAmount={placedOrder.deposit_amount} />
        </Card>

        <Button component={RouterLink} to={`/track/${placedOrder.order_number}?phone=${encodeURIComponent(placedOrder.phone)}`} sx={{ mt: 3, textTransform: 'none', fontWeight: 700 }}>
          Track my order →
        </Button>
      </Container>
    );
  }

  /* ---------- empty cart guard ---------- */
  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: INK }}>Nothing to check out yet</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>Add a bracelet or two first.</Typography>
        <Button component={RouterLink} to="/shop" variant="contained" disableElevation sx={{ ...gradientButtonSx, mt: 3, px: 4 }}>
          Browse bracelets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button component={RouterLink} to="/cart" startIcon={<ArrowLeftOutlined />} size="small" sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
        Back to cart
      </Button>
      <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK, mb: 4 }}>
        Checkout
      </Typography>

      <Box component="form" onSubmit={submit}>
        <Grid container spacing={4}>
          {/* ---------- form ---------- */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: INK, mb: 1 }}>Your details</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                We only use these to confirm your order and arrange pickup.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Stack sx={{ gap: 2 }}>
                <TextField
                  required
                  label="Full name"
                  value={form.full_name}
                  onChange={set('full_name')}
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><UserOutlined /></InputAdornment> } }}
                />
                <TextField
                  required
                  label="Phone number"
                  placeholder="0911 234 567"
                  value={form.phone}
                  onChange={set('phone')}
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined /></InputAdornment>, inputMode: 'tel' } }}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email (optional)"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      fullWidth
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlined /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Telegram username (optional)"
                      placeholder="@username"
                      value={form.telegram_username}
                      onChange={set('telegram_username')}
                      fullWidth
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><SendOutlined /></InputAdornment> } }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  select
                  required
                  label="Pickup location"
                  value={form.pickup_location}
                  onChange={set('pickup_location')}
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><EnvironmentOutlined /></InputAdornment> } }}
                  helperText={pickupLocations.error ? pickupLocations.error : 'Where should we meet you?'}
                  error={Boolean(pickupLocations.error)}
                >
                  {locationsByArea.map(([area, locations]) => [
                    <MenuItem key={`area-${area}`} disabled value="" sx={{ fontWeight: 800, opacity: 0.7 }}>
                      {area}
                    </MenuItem>,
                    ...locations.map((location) => (
                      <MenuItem key={location.id} value={String(location.id)} sx={{ pl: 4 }}>
                        {location.name}
                        {location.details ? ` — ${location.details}` : ''}
                      </MenuItem>
                    ))
                  ])}
                </TextField>

                <TextField
                  label="Note for us (optional)"
                  placeholder="Anything we should know — gift wrap, delivery dreams, bracelet lore…"
                  value={form.customer_note}
                  onChange={set('customer_note')}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Stack>
            </Card>
          </Grid>

          {/* ---------- summary ---------- */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3 }, position: 'sticky', top: 96 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: INK, mb: 2 }}>
                Your bracelets
              </Typography>
              <Stack sx={{ gap: 1.5, maxHeight: 320, overflow: 'auto' }}>
                {items.map((item) => (
                  <Stack key={item.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box component="img" src={item.image || undefined} alt={item.name} sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 2, bgcolor: 'grey.100' }} />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{item.name} × {item.quantity}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.colorMode === 'custom' ? item.colorNames.join(', ') : 'As in picture'}
                        {item.nameText ? ` • “${item.nameText}”` : ''}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatMoney(Number(item.price) * item.quantity)}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />
              <Stack sx={{ gap: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(total)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Deposit now (50%)</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>{formatMoney(deposit)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">At pickup</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(total - deposit)}</Typography>
                </Stack>
              </Stack>

              <Button type="submit" size="large" fullWidth disableElevation disabled={submitting} sx={{ ...gradientButtonSx, py: 1.4, mt: 2.5, fontSize: '1rem' }}>
                {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : `Place order — ${formatMoney(deposit)} deposit`}
              </Button>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.25, color: 'text.secondary' }}>
                Your bracelet enters the queue once the deposit is verified.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
