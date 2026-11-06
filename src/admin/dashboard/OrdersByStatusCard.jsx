// material-ui
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { axisClasses, barClasses, BarChart } from '@mui/x-charts';

// project imports
import MainCard from 'components/MainCard';
import { getStats } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';
import { ORDER_STATUS, ORDER_STATUS_FLOW } from 'admin/constants/orderStatus';

// Pipeline order first, then any off-pipeline statuses (e.g. cancelled).
const STATUS_ORDER = [
  ...ORDER_STATUS_FLOW,
  ...Object.keys(ORDER_STATUS).filter((status) => !ORDER_STATUS_FLOW.includes(status))
];

// ==============================|| DASHBOARD - ORDERS BY STATUS CARD ||============================== //

export default function OrdersByStatusCard() {
  const theme = useTheme();
  const { data, loading, error, retry } = useAsyncData(getStats);

  const counts = data?.orders_by_status ?? {};
  const labels = STATUS_ORDER.map((status) => ORDER_STATUS[status]?.label ?? status);
  const values = STATUS_ORDER.map((status) => Number(counts[status] ?? 0));
  const colors = STATUS_ORDER.map((status) => {
    const key = ORDER_STATUS[status]?.color;
    return (key && theme.vars.palette[key]?.main) || theme.vars.palette.grey[500];
  });

  return (
    <MainCard title="Orders by status" content={false} sx={{ height: '100%' }}>
      <Box sx={{ p: 2.5, pt: 1.5 }}>
        {loading ? (
          <Skeleton variant="rounded" height={320} />
        ) : error ? (
          <BlockError message={error} onRetry={retry} />
        ) : (
          <BarChart
            hideLegend
            layout="horizontal"
            height={320}
            grid={{ vertical: true, horizontal: false }}
            xAxis={[{ tickSize: 7, disableLine: true, tickMinStep: 1 }]}
            yAxis={[
              {
                scaleType: 'band',
                data: labels,
                width: 118,
                tickSize: 0,
                disableLine: true,
                disableTicks: true
              }
            ]}
            series={[
              {
                type: 'bar',
                data: values,
                label: 'Orders',
                barLabel: 'value',
                colorGetter: ({ dataIndex }) => colors[dataIndex] ?? theme.vars.palette.primary.main
              }
            ]}
            slotProps={{ bar: { rx: 4, ry: 4 } }}
            margin={{ left: 0, right: 24, top: 4, bottom: 0 }}
            sx={{
              [`& .${barClasses.element}:hover`]: { opacity: 0.7 },
              [`& .${axisClasses.root}.${axisClasses.directionY} .${axisClasses.label}`]: {
                textAnchor: 'start'
              }
            }}
          />
        )}
        {!loading && !error && values.every((count) => count === 0) && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
            No orders yet.
          </Typography>
        )}
      </Box>
    </MainCard>
  );
}
