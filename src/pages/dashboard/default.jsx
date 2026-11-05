// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { useAuth } from 'admin/auth/AuthContext';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { user } = useAuth();
  const name = user?.username || user?.email || 'Admin';

  return (
    <MainCard>
      <Stack sx={{ gap: 1.5, py: { xs: 2, sm: 4 } }}>
        <Typography variant="h2">Welcome, {name}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Friendship Bracelets admin dashboard
        </Typography>
      </Stack>
    </MainCard>
  );
}
