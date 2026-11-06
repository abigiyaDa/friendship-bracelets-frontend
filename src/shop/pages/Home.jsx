import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// assets
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import InstagramOutlined from '@ant-design/icons/InstagramOutlined';
import ScissorOutlined from '@ant-design/icons/ScissorOutlined';
import ShoppingOutlined from '@ant-design/icons/ShoppingOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';

// project imports
import { listCategories, listProducts } from 'shop/api';
import { useAsync } from 'shop/useAsync';
import ProductCard from 'shop/components/ProductCard';
import { GRADIENT, GRADIENT_SOFT, gradientButtonSx, gradientText, INK, PAPER } from 'shop/theme';

const STEPS = [
  {
    icon: <ShoppingOutlined style={{ fontSize: 26 }} />,
    title: 'Pick your bracelet',
    text: 'Browse the shop, choose “As in picture” or your own custom colors, and add a name if the design allows it.'
  },
  {
    icon: <WalletOutlined style={{ fontSize: 26 }} />,
    title: 'Pay 50% deposit',
    text: 'Place your order with your phone number, pay half now via Telebirr or bank transfer, and keep your order number.'
  },
  {
    icon: <CarOutlined style={{ fontSize: 26 }} />,
    title: 'We braid, you pick up',
    text: 'Every bracelet is knotted by hand. We’ll let you know when it’s ready, and you pick it up at your chosen spot.'
  }
];

// ==============================|| SHOP - HOME ||============================== //

export default function Home() {
  const location = useLocation();
  const products = useAsync(() => listProducts());
  const categories = useAsync(listCategories);

  useEffect(() => {
    if (location.hash === '#how-it-works') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const allProducts = products.data ?? [];
  const specials = allProducts.filter((p) => p.is_special);
  const featured = (specials.length ? specials : allProducts).slice(0, 4);
  const collage = allProducts.filter((p) => p.primary_image).slice(0, 3);

  return (
    <Box>
      {/* ---------- HERO ---------- */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: GRADIENT,
            opacity: 0.16,
            filter: 'blur(120px)',
            top: -180,
            right: -160
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#FFD84D,#FF5E8A)',
            opacity: 0.14,
            filter: 'blur(110px)',
            bottom: -160,
            left: -140
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', pt: { xs: 5, md: 9 }, pb: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack sx={{ gap: 3, alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
                <Chip
                  icon={<ScissorOutlined style={{ color: '#B15CFF' }} />}
                  label="Handmade in Addis Ababa"
                  sx={{ bgcolor: 'rgba(177,92,255,0.12)', color: '#7C3AED', fontWeight: 700, borderRadius: 2 }}
                />

                <Typography component="h1" sx={{ fontSize: { xs: '2.6rem', sm: '3.4rem', md: '3.9rem' }, lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.03em', color: INK }}>
                  Bracelets braided with{' '}
                  <Box component="span" sx={{ ...gradientText }}>
                    real friendship
                  </Box>
                </Typography>

                <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.18rem' }, color: 'text.secondary', maxWidth: 480 }}>
                  Every bracelet is knotted by hand, made to order. Choose your colors, add a name, pay a small deposit — and carry the
                  friendship on your wrist.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                  <Button component={RouterLink} to="/shop" size="large" disableElevation endIcon={<ArrowRightOutlined />} sx={{ ...gradientButtonSx, px: 4, py: 1.4, fontSize: '1.02rem' }}>
                    Shop the collection
                  </Button>
                  <Button component={RouterLink} to="/track" size="large" variant="outlined" sx={{ px: 4, py: 1.4, fontSize: '1.02rem', borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: 'rgba(43,23,35,0.25)', color: INK }}>
                    Track my order
                  </Button>
                </Stack>

                <Stack direction="row" sx={{ gap: 2.5, color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <span>✦ Made to order</span>
                  <span>✦ Custom colors</span>
                  <span>✦ Local pickup</span>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative', height: { xs: 320, sm: 400, md: 480 } }}>
                {collage[0] && (
                  <Box
                    component="img"
                    src={collage[0].primary_image}
                    alt={collage[0].name}
                    sx={{
                      position: 'absolute',
                      width: { xs: '58%', md: '62%' },
                      aspectRatio: '4/5',
                      objectFit: 'cover',
                      borderRadius: 5,
                      top: 0,
                      left: '4%',
                      transform: 'rotate(-4deg)',
                      border: '6px solid #fff',
                      boxShadow: '0 24px 60px rgba(43,23,35,0.35)'
                    }}
                  />
                )}
                {collage[1] && (
                  <Box
                    component="img"
                    src={collage[1].primary_image}
                    alt={collage[1].name}
                    sx={{
                      position: 'absolute',
                      width: { xs: '42%', md: '46%' },
                      aspectRatio: '1/1',
                      objectFit: 'cover',
                      borderRadius: 5,
                      bottom: '6%',
                      right: '2%',
                      transform: 'rotate(5deg)',
                      border: '6px solid #fff',
                      boxShadow: '0 24px 60px rgba(43,23,35,0.35)'
                    }}
                  />
                )}
                {collage[2] && (
                  <Box
                    component="img"
                    src={collage[2].primary_image}
                    alt={collage[2].name}
                    sx={{
                      position: 'absolute',
                      width: { xs: '30%', md: '32%' },
                      aspectRatio: '1/1',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      top: '8%',
                      right: '8%',
                      border: '6px solid #fff',
                      boxShadow: '0 18px 44px rgba(43,23,35,0.3)'
                    }}
                  />
                )}
                <Chip
                  icon={<GiftOutlined style={{ color: '#fff' }} />}
                  label="Perfect for besties"
                  sx={{
                    position: 'absolute',
                    bottom: { xs: 0, md: '12%' },
                    left: { xs: '2%', md: '0%' },
                    background: GRADIENT,
                    color: '#fff',
                    fontWeight: 800,
                    px: 1.5,
                    py: 2.2,
                    fontSize: '0.9rem',
                    boxShadow: '0 14px 34px rgba(177,92,255,0.45)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ---------- CATEGORIES ---------- */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5, gap: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
              Browse
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>
              Shop by category
            </Typography>
          </Box>
          <Button component={RouterLink} to="/shop" endIcon={<ArrowRightOutlined />} sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
            View all
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {categories.loading
            ? Array.from({ length: 4 }, (_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Skeleton variant="rounded" height={150} sx={{ borderRadius: 4 }} />
                </Grid>
              ))
            : (categories.data ?? []).map((category) => (
                <Grid key={category.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 36px rgba(43,23,35,0.14)' } }}>
                    <CardActionArea component={RouterLink} to={`/shop?category=${category.slug}`} sx={{ height: '100%' }}>
                      <Box sx={{ height: 92, background: category.image ? undefined : GRADIENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {category.image ? (
                          <Box component="img" src={category.image} alt={category.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Typography sx={{ fontSize: 34, fontWeight: 800, ...gradientText }}>{category.name?.charAt(0)?.toUpperCase()}</Typography>
                        )}
                      </Box>
                      <Typography sx={{ p: 1.25, textAlign: 'center', fontWeight: 700, color: INK, fontSize: '0.92rem', textTransform: 'capitalize' }} noWrap>
                        {category.name}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Container>

      {/* ---------- FEATURED / SPECIALS ---------- */}
      <Box sx={{ bgcolor: '#FBF3EE', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5, gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
                {specials.length ? 'Specials' : 'Fresh off the loom'}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>
                {specials.length ? 'Loved by friends' : 'Latest bracelets'}
              </Typography>
            </Box>
            <Button component={RouterLink} to="/shop" endIcon={<ArrowRightOutlined />} sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
              See everything
            </Button>
          </Stack>

          <Grid container spacing={2.5}>
            {products.loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
                  </Grid>
                ))
              : featured.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      {/* ---------- HOW IT WORKS ---------- */}
      <Container id="how-it-works" maxWidth="lg" sx={{ py: { xs: 7, md: 10 }, scrollMarginTop: 90 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '0.12em' }}>
            Simple as a braid
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>
            How it works
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {STEPS.map((step, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1.75, p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: PAPER, height: '100%', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 14, right: 18, fontWeight: 800, fontSize: '2.4rem', color: 'rgba(177,92,255,0.16)' }}>0{index + 1}</Box>
                <Box sx={{ width: 64, height: 64, borderRadius: '20px', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 24px rgba(177,92,255,0.4)' }}>
                  {step.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: INK }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{step.text}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ---------- SOCIAL CTA ---------- */}
      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
        <Box sx={{ borderRadius: 6, background: GRADIENT, p: { xs: 4, md: 6 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <Box aria-hidden sx={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', top: -120, left: -100, filter: 'blur(10px)' }} />
          <Box aria-hidden sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', bottom: -110, right: -80, filter: 'blur(10px)' }} />
          <Stack sx={{ position: 'relative', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Watch them come to life
            </Typography>
            <Typography sx={{ maxWidth: 480, opacity: 0.92 }}>
              Fresh drops, custom orders and behind-the-scenes braiding — follow us on Instagram &amp; TikTok.
            </Typography>
            <Button
              component="a"
              href="https://www.instagram.com/friendshipbracelet094/"
              target="_blank"
              rel="noopener noreferrer"
              size="large"
              startIcon={<InstagramOutlined />}
              sx={{ bgcolor: '#fff', color: '#B15CFF', fontWeight: 800, borderRadius: 2, px: 4, py: 1.3, textTransform: 'none', '&:hover': { bgcolor: '#FFF1F6' } }}
            >
              @friendshipbracelet094
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
