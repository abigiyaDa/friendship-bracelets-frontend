import { useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';

// project imports
import { getOrder } from 'shop/api';
import { useAsync } from 'shop/useAsync';
import PaymentUploadForm from 'shop/components/PaymentUploadForm';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import { GRADIENT_SOFT, INK } from 'shop/theme';
import { normalizePhone } from 'shop/phone';
import { formatDateTime, formatMoney } from 'admin/utils/format';

const STATUS_STEPS = ['pending_payment', 'payment_review', 'approved', 'in_production', 'ready', 'picked_up'];

// ==============================|| SHOP - ORDER STATUS TIMELINE ||============================== //

function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>This order was cancelled.</Alert>;
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <Stack direction="row" sx={{ mt: 1.5, mb: 0.5, alignItems: 'flex-start' }}>
      {STATUS_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const labels = {
          pending_payment: 'Ordered',
          payment_review: 'Reviewing',
          approved: 'Approved',
          in_production: 'In production',
          ready: 'Ready',
          picked_up: 'Picked up'
        };
        return (
          <Box key={step} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {index > 0 && (
              <Box sx={{ position: 'absolute', top: 9, right: '50%', width: '100%', height: 2, bgcolor: index <= currentIndex ? 'secondary.main' : 'divider' }} />
            )}
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                zIndex: 1,
                bgcolor: done ? 'secondary.main' : 'grey.300',
                border: '3px solid',
                borderColor: 'background.paper',
                boxShadow: done ? '0 0 0 2px rgba(177,92,255,0.35)' : 'none'
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.75, fontSize: '0.68rem', fontWeight: index === currentIndex ? 800 : 500, color: done ? 'text.primary' : 'text.disabled', textAlign: 'center' }}>
              {labels[step]}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

function PhonePrompt({ orderNumber, onSubmit }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const cleaned = normalizePhone(phone) ?? phone.replace(/\D/g, '');
    if (!cleaned) {
      setError('Enter the phone number used at checkout.');
      return;
    }
    setError('');
    onSubmit(cleaned);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>One quick thing</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
          To see order <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{orderNumber}</Typography>, enter the phone number you ordered with.
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            placeholder="0911 234 567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined /></InputAdornment>, inputMode: 'tel' } }}
          />
          <Button type="submit" variant="contained" size="large" disableElevation sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
            Show my order
          </Button>
        </Box>
      </Card>
    </Container>
  );
}

// ==============================|| SHOP - ORDER STATUS ||============================== //

export default function OrderStatus() {
  const { orderNumber } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

  const { data: order, loading, error, reload } = useAsync(() => (phone ? getOrder(orderNumber, phone) : Promise.resolve(null)));

  if (!phone) {
    return <PhonePrompt orderNumber={orderNumber} onSubmit={(cleaned) => setSearchParams({ phone: cleaned })} />;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Skeleton variant="text" height={64} />
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4, mt: 2 }} />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Order not found.'} — check the phone number or order number.
        </Alert>
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'center', mt: 3 }}>
          <Button component={RouterLink} to="/track" startIcon={<ArrowLeftOutlined />} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Try another number
          </Button>
          <Button onClick={reload} sx={{ textTransform: 'none', fontWeight: 700 }}>Retry</Button>
        </Stack>
      </Container>
    );
  }

  const isPendingPayment = order.status === 'pending_payment';

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Button component={RouterLink} to="/track" startIcon={<ArrowLeftOutlined />} size="small" sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
        My orders
      </Button>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>Order</Typography>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' }, color: INK }}>{order.order_number}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Placed {formatDateTime(order.created_at)}</Typography>
        </Box>
        <OrderStatusChip status={order.status} size="medium" sx={{ fontSize: '0.85rem', height: 32 }} />
      </Stack>

      <StatusTimeline status={order.status} />

      {isPendingPayment && (
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'secondary.light', background: GRADIENT_SOFT, p: 3, mt: 2 }}>
          <PaymentUploadForm orderNumber={order.order_number} depositAmount={order.deposit_amount} onSubmitted={reload} />
        </Card>
      )}

      <Grid container spacing={2.5} sx={{ mt: 2 }}>
        {/* items */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: INK, mb: 1.5 }}>Your bracelets</Typography>
            <Stack sx={{ gap: 1.75 }}>
              {order.items.map((item) => (
                <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.product_name} <Typography component="span" color="text.secondary">× {item.quantity}</Typography>
                    </Typography>
                    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                      {item.color_mode === 'custom' && item.colors.length > 0 ? (
                        <>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>My colors:</Typography>
                          {item.colors.map(({ color }, index) => (
                            <Stack key={index} direction="row" sx={{ gap: 0.4, alignItems: 'center', bgcolor: 'grey.100', borderRadius: 1.5, px: 0.75, py: 0.25 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color.hex_code || 'grey.300', border: '1px solid rgba(0,0,0,0.15)' }} />
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{color.name}</Typography>
                            </Stack>
                          ))}
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>As in picture</Typography>
                      )}
                    </Stack>
                    {item.name_text && <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, display: 'block', mt: 0.5 }}>Name: “{item.name_text}”</Typography>}
                    {item.notes && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Note: {item.notes}</Typography>}
                  </Box>
                  <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMoney(Number(item.unit_price) * item.quantity)}</Typography>
                </Stack>
              ))}
            </Stack>
            {order.customer_note && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Your note: {order.customer_note}</Typography>
              </>
            )}
          </Card>
        </Grid>

        {/* summary + payments */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack sx={{ gap: 2.5 }}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: INK, mb: 1.5 }}>Summary</Typography>
              <Stack sx={{ gap: 0.75 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" variant="body2">Total</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(order.total_amount)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" variant="body2">Deposit ({order.deposit_percent}%)</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>{formatMoney(order.deposit_amount)}</Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
                <EnvironmentOutlined style={{ color: '#B15CFF', marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.pickup_location?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{order.pickup_location?.area}{order.pickup_location?.details ? ` — ${order.pickup_location.details}` : ''}</Typography>
                </Box>
              </Stack>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: INK, mb: 1 }}>Payments</Typography>
              {(order.payments ?? []).length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No payment yet — the 50% deposit confirms your order.</Typography>
              ) : (
                <Stack sx={{ gap: 1.25 }}>
                  {order.payments.map((payment) => (
                    <Stack key={payment.id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{payment.method?.replace('_', ' ')} — {payment.payment_type}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDateTime(payment.created_at)} • ref {payment.transaction_ref}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatMoney(payment.amount)}</Typography>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 700, color: payment.status === 'approved' ? 'success.main' : payment.status === 'rejected' ? 'error.main' : 'warning.main' }}>
                          {payment.status}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
