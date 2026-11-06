import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ShoppingOutlined from '@ant-design/icons/ShoppingOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';

// project imports
import { useCart } from 'shop/CartContext';
import { gradientButtonSx, GRADIENT_SOFT, INK } from 'shop/theme';
import { formatMoney } from 'admin/utils/format';

// ==============================|| SHOP - CART ||============================== //

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, setQuantity, removeItem } = useCart();

  const deposit = total * 0.5;

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Stack sx={{ alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 88, height: 88, borderRadius: '28px', background: GRADIENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingOutlined style={{ fontSize: 40, color: '#B15CFF' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>
            Your cart is feeling lonely
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 380 }}>
            Add a bracelet (or three) — they make great gifts, even for the maker of this very sentence.
          </Typography>
          <Button component={RouterLink} to="/shop" size="large" disableElevation endIcon={<ArrowRightOutlined />} sx={{ ...gradientButtonSx, px: 4, py: 1.25 }}>
            Browse bracelets
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
        Almost there
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK, mb: 4 }}>
        Your cart
      </Typography>

      <Grid container spacing={4}>
        {/* items */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack sx={{ gap: 1.5 }}>
            {items.map((item) => (
              <Card key={item.key} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={item.image || undefined}
                    alt={item.name}
                    sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 3, bgcolor: 'grey.100' }}
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: INK }} noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {item.colorMode === 'custom' ? `My colors: ${item.colorNames.join(', ')}` : 'As in picture'}
                      {item.nameText ? ` • “${item.nameText}”` : ''}
                    </Typography>
                    {item.notes && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                        Note: {item.notes}
                      </Typography>
                    )}
                    <Typography sx={{ fontWeight: 800, mt: 0.5, color: INK }}>{formatMoney(item.price)}</Typography>
                  </Box>
                  <Stack sx={{ alignItems: 'flex-end', gap: 1 }}>
                    <IconButton size="small" aria-label="Remove item" onClick={() => removeItem(item.key)} sx={{ color: 'text.secondary' }}>
                      <DeleteOutlined />
                    </IconButton>
                    <Stack direction="row" sx={{ border: 1, borderColor: 'divider', borderRadius: 2, alignItems: 'center' }}>
                      <IconButton size="small" aria-label="Decrease quantity" onClick={() => setQuantity(item.key, item.quantity - 1)}>
                        <MinusOutlined style={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography sx={{ width: 32, textAlign: 'center', fontWeight: 800 }}>{item.quantity}</Typography>
                      <IconButton size="small" aria-label="Increase quantity" onClick={() => setQuantity(item.key, item.quantity + 1)}>
                        <PlusOutlined style={{ fontSize: 12 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 3, position: 'sticky', top: 96 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: INK, mb: 2 }}>
              Order summary
            </Typography>
            <Stack sx={{ gap: 1.25 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatMoney(total)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Deposit due today (50%)</Typography>
                <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>{formatMoney(deposit)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Kept for pickup</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatMoney(total - deposit)}</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              The bracelet is made for you — that’s why we confirm with a 50% deposit. The rest when you pick it up.
            </Typography>
            <Button size="large" fullWidth disableElevation onClick={() => navigate('/checkout')} endIcon={<ArrowRightOutlined />} sx={{ ...gradientButtonSx, py: 1.4, mt: 2, fontSize: '1.02rem' }}>
              Continue to checkout
            </Button>
            <Button component={RouterLink} to="/shop" fullWidth sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}>
              Add more bracelets
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
