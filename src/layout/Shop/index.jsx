import { useEffect, useState } from 'react';
import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// assets
import HeartFilled from '@ant-design/icons/HeartFilled';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import TikTokOutlined from '@ant-design/icons/TikTokOutlined';
import InstagramOutlined from '@ant-design/icons/InstagramOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';

// project imports
import { CartProvider, useCart } from 'shop/CartContext';
import { GRADIENT, GRADIENT_DEEP, INK, PAPER, THREAD_STRIP } from 'shop/theme';

export const SOCIAL_LINKS = [
  { label: 'Telegram — @friendshipbracelets1', href: 'https://t.me/friendshipbracelets1', icon: <SendOutlined /> },
  { label: 'TikTok — @friendshipbracelet094', href: 'https://www.tiktok.com/@friendshipbracelet094', icon: <TikTokOutlined /> },
  { label: 'Instagram — @friendshipbracelet094', href: 'https://www.instagram.com/friendshipbracelet094/', icon: <InstagramOutlined /> }
];

const NAV_LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'How it works', to: '/#how-it-works', plain: true },
  { label: 'Track order', to: '/track' }
];

function Logo() {
  return (
    <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', textDecoration: 'none' }} component={RouterLink} to="/">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '12px',
          background: GRADIENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(255, 94, 138, 0.4)'
        }}
      >
        <HeartFilled style={{ color: '#fff', fontSize: 20 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: INK, lineHeight: 1.1 }}>
          Friendship
          <br />
          Bracelets
        </Typography>
      </Box>
    </Stack>
  );
}

function CartButton() {
  const { count } = useCart();

  return (
    <IconButton
      component={RouterLink}
      to="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      sx={{
        background: GRADIENT,
        color: '#fff',
        borderRadius: '12px',
        width: 42,
        height: 42,
        boxShadow: '0 6px 16px rgba(177, 92, 255, 0.35)',
        '&:hover': { background: GRADIENT, filter: 'brightness(1.07)' }
      }}
    >
      <Badge
        key={count}
        badgeContent={count}
        color="warning"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            animation: 'cart-pop 0.45s cubic-bezier(0.2, 1.6, 0.4, 1)',
            '@keyframes cart-pop': {
              '0%': { transform: 'scale(0.3)' },
              '60%': { transform: 'scale(1.6)' },
              '100%': { transform: 'scale(1)' }
            }
          }
        }}
      >
        <ShoppingCartOutlined />
      </Badge>
    </IconButton>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 253, 251, 0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: INK
      }}
    >
      <Box sx={{ height: 4, background: THREAD_STRIP }} />
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 68, gap: 2 }}>
          <Logo />

          <Stack direction="row" sx={{ gap: 0.5, mx: 'auto', display: { xs: 'none', md: 'flex' } }}>
            {NAV_LINKS.map((link) => (
              <Box
                key={link.to}
                component={link.plain ? RouterLink : NavLink}
                to={link.to}
                sx={{
                  px: 1.75,
                  py: 0.75,
                  borderRadius: 2,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: INK,
                  '&:hover': { bgcolor: 'rgba(177, 92, 255, 0.09)' },
                  '&.active': { color: 'secondary.main', bgcolor: 'rgba(177, 92, 255, 0.12)' }
                }}
              >
                {link.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', ml: { xs: 'auto', md: 0 } }}>
            <Stack direction="row" sx={{ gap: 0.25, display: { xs: 'none', lg: 'flex' } }}>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <IconButton key={href} size="small" component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} sx={{ color: INK }}>
                  {icon}
                </IconButton>
              ))}
            </Stack>
            <CartButton />
            <IconButton aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: INK }}>
              {open ? <CloseOutlined /> : <MenuOutlined />}
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Collapse in={open} sx={{ display: { md: 'none' }, borderTop: open ? '1px solid' : 'none', borderColor: 'divider', bgcolor: PAPER }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack sx={{ gap: 0.5 }}>
            {NAV_LINKS.map((link) => (
              <Box
                key={link.to}
                component={link.plain ? RouterLink : NavLink}
                to={link.to}
                onClick={() => setOpen(false)}
                sx={{ px: 1.5, py: 1.25, borderRadius: 2, textDecoration: 'none', fontWeight: 600, color: INK, '&:hover': { bgcolor: 'rgba(177,92,255,0.09)' } }}
              >
                {link.label}
              </Box>
            ))}
            <Divider sx={{ my: 0.75 }} />
            <Stack direction="row" sx={{ gap: 1, px: 1.5, pb: 1 }}>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <IconButton key={href} component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} sx={{ color: INK }}>
                  {icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Collapse>
    </AppBar>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ background: GRADIENT_DEEP, color: 'rgba(255,255,255,0.82)', mt: 'auto' }}>
      <Box sx={{ height: 4, background: THREAD_STRIP }} />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: GRADIENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HeartFilled style={{ color: '#fff', fontSize: 17 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Friendship Bracelets</Typography>
            </Stack>
            <Typography variant="body2" sx={{ maxWidth: 320 }}>
              Handmade friendship bracelets, braided one knot at a time. Pick your colors, add a name, and carry a piece of the friendship with
              you.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.25, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Explore
            </Typography>
            <Stack sx={{ gap: 0.75 }}>
              <Box component={RouterLink} to="/shop" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Shop</Box>
              <Box component={RouterLink} to="/cart" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Cart</Box>
              <Box component={RouterLink} to="/track" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Track order</Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.25, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Follow along
            </Typography>
            <Stack direction="row" sx={{ gap: 0.75 }}>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <IconButton key={href} component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' } }}>
                  {icon}
                </IconButton>
              ))}
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5 }}>
              @friendshipbracelet094
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.25, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              How ordering works
            </Typography>
            <Typography variant="body2">1. Choose your bracelet &amp; colors</Typography>
            <Typography variant="body2">2. Pay 50% deposit to confirm</Typography>
            <Typography variant="body2">3. We braid it &amp; you pick it up</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.14)' }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            &copy; {new Date().getFullYear()} Friendship Bracelets. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Made with thread, patience &amp; love
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default function ShopLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <CartProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: PAPER }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </CartProvider>
  );
}
