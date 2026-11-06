// material-ui
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

// project imports
import { getStats } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';
import StatCard from 'admin/dashboard/StatCard';
import { formatMoney } from 'admin/utils/format';

// ==============================|| DASHBOARD - STAT CARDS ROW ||============================== //

export default function StatCardsRow() {
  const { data, loading, error, retry } = useAsyncData(getStats);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }, (_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={112} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <BlockError message={error} onRetry={retry} />;
  }

  const totals = data?.totals ?? {};
  const awaitingReview = Number(totals.pending_payment_reviews ?? 0);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard title="Total orders" count={totals.orders ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard title="Customers" count={totals.customers ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard title="Total sales" count={formatMoney(totals.sales)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Payments awaiting review"
          count={awaitingReview}
          highlight={awaitingReview > 0}
          to="/admin/payments"
        />
      </Grid>
    </Grid>
  );
}
