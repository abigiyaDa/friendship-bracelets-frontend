import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

// assets
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import InboxOutlined from '@ant-design/icons/InboxOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';

// project imports
import { lookupOrders } from 'shop/api';
import { INK } from 'shop/theme';
import { normalizePhone } from 'shop/phone';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import { formatDateTime, formatMoney } from 'admin/utils/format';

// ==============================|| SHOP - TRACK ORDERS ||============================== //

export default function Track() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (event) => {
    event?.preventDefault();
    setError('');

    // The API matches exact stored numbers too, so fall back to raw digits when
    // the input isn't a standard 09…/+251… number.
    const cleaned = normalizePhone(phone) ?? phone.replace(/\D/g, '');
    if (!cleaned) {
      setError('Enter the phone number you ordered with.');
      return;
    }

    setLoading(true);
    try {
      const results = await lookupOrders(cleaned);
      setOrders(results);
      setSearchedPhone(cleaned);
    } catch (err) {
      const status = err?.response?.status;
      setOrders(null);
      setError(status === 429 ? 'Too many attempts — please wait a moment and try again.' : 'Could not look up orders right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
        Where’s my bracelet?
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>
        Track your order
      </Typography>
      <Typography sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
        Enter the phone number you used at checkout — we’ll show every order tied to it.
      </Typography>

      <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="0911 234 567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          slotProps={{
            htmlInput: { inputMode: 'tel', 'aria-label': 'Phone number' },
            input: { startAdornment: <InputAdornment position="start"><PhoneOutlined /></InputAdornment> }
          }}
        />
        <Button type="submit" variant="contained" size="large" disableElevation disabled={loading} startIcon={<SearchOutlined />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, px: 4 }}>
          {loading ? 'Searching…' : 'Find'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading && (
        <Stack sx={{ gap: 1.5, mt: 3 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 3 }} />)}
        </Stack>
      )}

      {!loading && orders && orders.length === 0 && (
        <Stack sx={{ alignItems: 'center', gap: 1.5, py: 8, textAlign: 'center' }}>
          <InboxOutlined style={{ fontSize: 42, color: '#B15CFF' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: INK }}>No orders for that number yet</Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 380 }}>Double-check the phone number, or place your first order — your wrist will thank you.</Typography>
        </Stack>
      )}

      {!loading && orders && orders.length > 0 && (
        <Stack sx={{ gap: 1.5, mt: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} for {searchedPhone}
          </Typography>
          {orders.map((order) => (
            <Card
              key={order.order_number}
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/track/${order.order_number}?phone=${encodeURIComponent(searchedPhone)}`)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/track/${order.order_number}?phone=${encodeURIComponent(searchedPhone)}`); }}
              sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 2, cursor: 'pointer', transition: 'transform .15s ease, box-shadow .15s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(43,23,35,0.12)' } }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
                <Box>
                  <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: INK }}>{order.order_number}</Typography>
                    <OrderStatusChip status={order.status} />
                  </Stack>
                  <Stack direction="row" sx={{ gap: 1.5, mt: 0.75, color: 'text.secondary', flexWrap: 'wrap' }}>
                    <Typography variant="caption">{formatDateTime(order.created_at)}</Typography>
                    <Typography variant="caption">{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</Typography>
                    {order.pickup_location && (
                      <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ fontSize: 12 }} />
                        <Typography variant="caption">{order.pickup_location.name}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total</Typography>
                    <Typography sx={{ fontWeight: 800, color: INK }}>{formatMoney(order.total_amount)}</Typography>
                  </Box>
                  <ArrowRightOutlined style={{ color: '#B15CFF' }} />
                </Stack>
              </Stack>
            </Card>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Changed your number or have a question? Message us on{' '}
            <Box component="a" href="https://t.me/friendshipbracelets1" target="_blank" rel="noopener noreferrer" sx={{ color: 'secondary.main', fontWeight: 700 }}>Telegram</Box>.
          </Typography>
        </Stack>
      )}
    </Container>
  );
}
