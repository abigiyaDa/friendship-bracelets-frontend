import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CrownFilled from '@ant-design/icons/CrownFilled';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import PictureOutlined from '@ant-design/icons/PictureOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';

// project imports
import { getProduct } from 'shop/api';
import { useAsync } from 'shop/useAsync';
import { useCart } from 'shop/CartContext';
import { gradientButtonSx, GRADIENT_SOFT, INK } from 'shop/theme';
import { formatMoney } from 'admin/utils/format';

// ==============================|| SHOP - PRODUCT DETAIL ||============================== //

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { data: product, loading, error, reload } = useAsync(() => getProduct(slug));

  const images = useMemo(() => {
    if (!product) return [];
    const all = product.images ?? [];
    if (all.length) {
      const primary = all.filter((img) => img.is_primary);
      const rest = all.filter((img) => !img.is_primary);
      return [...primary, ...rest].map((img) => img.image);
    }
    return product.primary_image ? [product.primary_image] : [];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [colorMode, setColorMode] = useState('as_in_picture');
  const [selectedColors, setSelectedColors] = useState([]);
  const [nameText, setNameText] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState('');
  const [snackbar, setSnackbar] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setColorMode('as_in_picture');
    setSelectedColors([]);
    setNameText('');
    setNotes('');
    setQuantity(1);
    setFormError('');
  }, [slug]);

  const colors = product?.colors ?? [];
  const allowsCustom = Boolean(product?.allows_custom_colors);
  const allowsName = Boolean(product?.allows_name_text);
  const maxName = product?.max_name_length ?? 50;

  const toggleColor = (id) => {
    setSelectedColors((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const validate = () => {
    if (colorMode === 'custom') {
      if (!allowsCustom) return 'This bracelet only comes as shown in the picture.';
      if (selectedColors.length === 0) return 'Pick at least one color for your custom bracelet.';
    }
    if (allowsName && nameText.length > maxName) return `Name must be at most ${maxName} characters.`;
    return '';
  };

  const buildItem = () => ({
    key: '',
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    image: images[0] ?? product.primary_image ?? null,
    quantity,
    colorMode: allowsCustom ? colorMode : 'as_in_picture',
    colorIds: allowsCustom && colorMode === 'custom' ? selectedColors : [],
    colorNames: allowsCustom && colorMode === 'custom' ? colors.filter((c) => selectedColors.includes(c.id)).map((c) => c.name) : colors.map((c) => c.name),
    nameText: allowsName ? nameText.trim() || null : null,
    notes: notes.trim()
  });

  const handleAdd = () => {
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    addItem(buildItem());
    setSnackbar(true);
  };

  const handleBuyNow = () => {
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    addItem(buildItem());
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={460} sx={{ borderRadius: 5 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" width="60%" height={56} />
            <Skeleton variant="text" width="35%" height={48} />
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4, mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" action={<Button color="inherit" onClick={reload}>Retry</Button>}>
          {error || 'This bracelet could not be found.'}
        </Alert>
        <Button component={RouterLink} to="/shop" startIcon={<ArrowLeftOutlined />} sx={{ mt: 3, textTransform: 'none', fontWeight: 700 }}>
          Back to shop
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Button component={RouterLink} to="/shop" startIcon={<ArrowLeftOutlined />} size="small" sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', mb: 2 }}>
        Back to shop
      </Button>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        {/* ---------- gallery ---------- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', aspectRatio: '1 / 1', bgcolor: 'grey.100' }}>
            {images[activeImage] ? (
              <Box component="img" src={images[activeImage]} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.disabled' }}>
                <PictureOutlined style={{ fontSize: 44 }} />
                <Typography variant="body2">No photo yet</Typography>
              </Box>
            )}
          </Box>
          {images.length > 1 && (
            <Stack direction="row" sx={{ gap: 1.25, mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
              {images.map((src, index) => (
                <Box
                  key={index}
                  component="button"
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Photo ${index + 1}`}
                  sx={{
                    p: 0,
                    border: 2,
                    borderColor: index === activeImage ? 'secondary.main' : 'transparent',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    width: 76,
                    height: 76,
                    flexShrink: 0
                  }}
                >
                  <Box component="img" src={src} alt={`${product.name} ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* ---------- purchase panel ---------- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack sx={{ gap: 2 }}>
            <Box>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
                  {product.category?.name}
                </Typography>
                {product.is_special && (
                  <Chip size="small" icon={<CrownFilled style={{ color: '#7A4A00' }} />} label="Special" sx={{ bgcolor: '#FFD84D', color: '#7A4A00', fontWeight: 800 }} />
                )}
              </Stack>
              <Typography component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' }, fontWeight: 800, letterSpacing: '-0.02em', color: INK, lineHeight: 1.15 }}>
                {product.name}
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: INK, mt: 1 }}>{formatMoney(product.price)}</Typography>
              {product.lead_time_days != null && (
                <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
                  <ClockCircleOutlined />
                  <Typography variant="body2">Ready in about {product.lead_time_days} {product.lead_time_days === 1 ? 'day' : 'days'} — it’s made for you</Typography>
                </Stack>
              )}
            </Box>

            {product.description && <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{product.description}</Typography>}

            <Divider />

            {/* color mode */}
            {allowsCustom ? (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1, color: INK }}>Colors</Typography>
                <Stack direction="row" sx={{ gap: 1, mb: 1.5 }}>
                  {['as_in_picture', 'custom'].map((mode) => (
                    <Button
                      key={mode}
                      size="small"
                      onClick={() => setColorMode(mode)}
                      variant={colorMode === mode ? 'contained' : 'outlined'}
                      disableElevation
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                    >
                      {mode === 'as_in_picture' ? 'As in picture' : 'My own colors'}
                    </Button>
                  ))}
                </Stack>
                {colorMode === 'custom' && (
                  <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                    {colors.map((color) => {
                      const active = selectedColors.includes(color.id);
                      return (
                        <Box
                          key={color.id}
                          component="button"
                          type="button"
                          onClick={() => toggleColor(color.id)}
                          aria-pressed={active}
                          title={color.name}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            p: 1,
                            borderRadius: 3,
                            border: 2,
                            borderColor: active ? 'secondary.main' : 'divider',
                            bgcolor: active ? 'rgba(177,92,255,0.08)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: color.hex_code || 'grey.300', border: '1px solid rgba(0,0,0,0.15)' }} />
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{color.name}</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1, color: INK }}>Colors</Typography>
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  {colors.map((color) => (
                    <Stack key={color.id} direction="row" sx={{ gap: 0.75, alignItems: 'center', px: 1.25, py: 0.75, borderRadius: 2, bgcolor: GRADIENT_SOFT }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color.hex_code || 'grey.300', border: '1px solid rgba(0,0,0,0.15)' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{color.name}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {/* name text */}
            {allowsName && (
              <TextField
                label="Name on the bracelet (optional)"
                value={nameText}
                onChange={(event) => setNameText(event.target.value.slice(0, maxName))}
                helperText={`${nameText.length}/${maxName}`}
                fullWidth
                size="small"
              />
            )}

            <TextField
              label="Notes for the maker (optional)"
              placeholder="e.g. make it extra long, add a 2nd strand…"
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 500))}
              fullWidth
              multiline
              minRows={1}
              size="small"
            />

            {formError && <Alert severity="warning" sx={{ borderRadius: 2 }}>{formError}</Alert>}

            {/* quantity + CTA */}
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Stack direction="row" sx={{ border: 1, borderColor: 'divider', borderRadius: 2, alignItems: 'center' }}>
                <IconButton size="small" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} sx={{ m: 0.25 }}>
                  <MinusOutlined />
                </IconButton>
                <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 800 }}>{quantity}</Typography>
                <IconButton size="small" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(32767, q + 1))} sx={{ m: 0.25 }}>
                  <PlusOutlined />
                </IconButton>
              </Stack>

              <Button onClick={handleAdd} size="large" variant="contained" disableElevation startIcon={<ShoppingCartOutlined />} sx={{ ...gradientButtonSx, flexGrow: 1, py: 1.3, fontSize: '1rem' }}>
                Add to cart — {formatMoney(Number(product.price) * quantity)}
              </Button>
            </Stack>

            <Button onClick={handleBuyNow} size="medium" variant="text" startIcon={<ThunderboltOutlined />} sx={{ textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start' }}>
              Buy now
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar open={snackbar} autoHideDuration={3000} onClose={() => setSnackbar(false)} message="Added to your cart" action={<Button size="small" color="inherit" onClick={() => navigate('/cart')}>View cart</Button>} />
    </Container>
  );
}
