// material-ui
import Box from '@mui/material/Box';

// assets
import HeartFilled from '@ant-design/icons/HeartFilled';

// ==============================|| LOGO ICON - FRIENDSHIP BRACELETS ||============================== //

export default function LogoIcon() {
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #FF5E8A 0%, #B15CFF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(177, 92, 255, 0.4)'
      }}
    >
      <HeartFilled style={{ color: '#fff', fontSize: 24 }} />
    </Box>
  );
}
