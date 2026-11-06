import { useSearchParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// assets
import SmileOutlined from '@ant-design/icons/SmileOutlined';

// project imports
import { listCategories, listProducts } from 'shop/api';
import { useAsync } from 'shop/useAsync';
import ProductCard from 'shop/components/ProductCard';
import { GRADIENT_SOFT, INK } from 'shop/theme';

// ==============================|| SHOP - CATALOG ||============================== //

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  const products = useAsync(() => listProducts(activeCategory || undefined), [activeCategory]);
  const categories = useAsync(listCategories);

  const setCategory = (slug) => {
    setSearchParams(slug ? { category: slug } : {}, { replace: true });
  };

  const items = products.data ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
          The collection
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>
          {activeCategory
            ? (categories.data ?? []).find((c) => c.slug === activeCategory)?.name ?? 'Shop'
            : 'Shop all bracelets'}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Every piece is handmade — colors may vary slightly, just like friendship.
        </Typography>
      </Box>

      {/* category filter */}
      <Stack direction="row" sx={{ gap: 1, mb: 4, overflowX: 'auto', pb: 0.5, flexWrap: { xs: 'nowrap', md: 'wrap' } }}>
        <Chip
          label="All"
          onClick={() => setCategory('')}
          variant={activeCategory === '' ? 'filled' : 'outlined'}
          color={activeCategory === '' ? 'secondary' : 'default'}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        />
        {(categories.data ?? []).map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => setCategory(category.slug)}
            variant={activeCategory === category.slug ? 'filled' : 'outlined'}
            color={activeCategory === category.slug ? 'secondary' : 'default'}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'capitalize' }}
          />
        ))}
      </Stack>

      {products.loading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 8 }, (_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : products.error ? (
        <Alert severity="error" action={<Button color="inherit" onClick={products.reload}>Retry</Button>} sx={{ borderRadius: 2 }}>
          {products.error}
        </Alert>
      ) : items.length === 0 ? (
        <Stack sx={{ alignItems: 'center', py: 10, gap: 1.5, borderRadius: 4, background: GRADIENT_SOFT }}>
          <SmileOutlined style={{ fontSize: 40, color: '#B15CFF' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: INK }}>
            Nothing here yet
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>No bracelets in this category right now — check back soon!</Typography>
          <Button onClick={() => setCategory('')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Show everything
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
