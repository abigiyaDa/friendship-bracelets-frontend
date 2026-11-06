// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { useAuth } from 'admin/auth/AuthContext';
import StatCardsRow from 'admin/dashboard/StatCardsRow';
import SalesOrdersChartCard from 'admin/dashboard/SalesOrdersChartCard';
import OrdersByStatusCard from 'admin/dashboard/OrdersByStatusCard';
import PendingPaymentsCard from 'admin/dashboard/PendingPaymentsCard';
import TopProductsCard from 'admin/dashboard/TopProductsCard';
import RecentOrdersCard from 'admin/dashboard/RecentOrdersCard';

const todayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { user } = useAuth();
  const name = user?.username || user?.email || 'Admin';

  return (
    <Stack sx={{ gap: 3 }}>
      <MainCard>
        <Stack sx={{ gap: 0.5, py: 1 }}>
          <Typography variant="h2">Welcome, {name}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {todayFormatter.format(new Date())}
          </Typography>
        </Stack>
      </MainCard>

      <StatCardsRow />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SalesOrdersChartCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <OrdersByStatusCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PendingPaymentsCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TopProductsCard />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <RecentOrdersCard />
        </Grid>
      </Grid>
    </Stack>
  );
}
