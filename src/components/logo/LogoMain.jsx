// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// assets
import HeartFilled from '@ant-design/icons/HeartFilled';

// ==============================|| LOGO - FRIENDSHIP BRACELETS ||============================== //

export default function LogoMain() {
  return (
    <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FF5E8A 0%, #B15CFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(177, 92, 255, 0.4)',
          flexShrink: 0
        }}
      >
        <HeartFilled style={{ color: '#fff', fontSize: 20 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'text.primary', lineHeight: 1.15 }}>
        Friendship
        <br />
        Bracelets
      </Typography>
    </Stack>
  );
}
