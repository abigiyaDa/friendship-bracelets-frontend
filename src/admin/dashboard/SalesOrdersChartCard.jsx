import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses, chartsGridClasses, lineClasses } from '@mui/x-charts';

// project imports
import MainCard from 'components/MainCard';
import { getStats } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';
import { withAlpha } from 'utils/colorUtils';
import { formatMoney } from 'admin/utils/format';

const shortDayFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

// Parse "YYYY-MM-DD" as a local date so the label doesn't shift across time zones.
const parseDay = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

// ==============================|| DASHBOARD - SALES & ORDERS CHART CARD ||============================== //

export default function SalesOrdersChartCard() {
  const theme = useTheme();
  const [view, setView] = useState('sales'); // 'sales' or 'orders'
  const { data, loading, error, retry } = useAsyncData(getStats);

  const daily = Array.isArray(data?.daily) ? data.daily : [];
  const labels = daily.map((point) => {
    const day = parseDay(point.date);
    return day ? shortDayFormatter.format(day) : point.date;
  });
  const values = daily.map((point) =>
    view === 'sales' ? Number(point.sales ?? 0) : Number(point.orders ?? 0)
  );

  const seriesLabel = view === 'sales' ? 'Sales' : 'Orders';

  return (
    <MainCard content={false} sx={{ height: '100%' }}>
      <Box sx={{ p: 2.5 }}>
        <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Grid>
            <Typography variant="h5">Sales and orders, last 30 days</Typography>
          </Grid>
          <Grid>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Button
                size="small"
                onClick={() => setView('sales')}
                color={view === 'sales' ? 'primary' : 'secondary'}
                variant={view === 'sales' ? 'outlined' : 'text'}
              >
                Sales
              </Button>
              <Button
                size="small"
                onClick={() => setView('orders')}
                color={view === 'orders' ? 'primary' : 'secondary'}
                variant={view === 'orders' ? 'outlined' : 'text'}
              >
                Orders
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 1.5, pb: 2, pt: 0 }}>
        {loading ? (
          <Skeleton variant="rounded" height={320} />
        ) : error ? (
          <BlockError message={error} onRetry={retry} />
        ) : (
          <LineChart
            hideLegend
            grid={{ horizontal: true, vertical: false }}
            xAxis={[
              {
                scaleType: 'point',
                data: labels,
                tickSize: 7,
                disableLine: true,
                tickInterval: (_value, index) => index % 5 === 0 || index === labels.length - 1
              }
            ]}
            yAxis={[{ tickSize: 7, disableLine: true, width: 56 }]}
            height={320}
            margin={{ top: 20, bottom: -5, right: 20, left: 5 }}
            series={[
              {
                type: 'line',
                data: values,
                label: seriesLabel,
                showMark: false,
                area: true,
                id: 'dashboard-daily',
                color: theme.vars.palette.primary.main,
                stroke: theme.vars.palette.primary.main,
                strokeWidth: 2,
                valueFormatter: (value) =>
                  view === 'sales' ? formatMoney(value) : `${value ?? 0} ${value === 1 ? 'order' : 'orders'}`
              }
            ]}
            sx={{
              [`& .${chartsGridClasses.line}`]: {
                strokeDasharray: '4 4',
                stroke: theme.vars.palette.divider
              },
              [`& .${lineClasses.area}`]: {
                '&[data-series-id="dashboard-daily"]': { fill: "url('#dashboardGradient')", strokeWidth: 2, opacity: 0.8 }
              },
              [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' },
              [`& .${axisClasses.root}.${axisClasses.directionY} .${axisClasses.tick}`]: { stroke: 'transparent' }
            }}
          >
            <defs>
              <linearGradient id="dashboardGradient" gradientTransform="rotate(90)">
                <stop offset="10%" stopColor={withAlpha(theme.vars.palette.primary.main, 0.4)} />
                <stop offset="90%" stopColor={withAlpha(theme.vars.palette.background.default, 0.4)} />
              </linearGradient>
            </defs>
          </LineChart>
        )}
      </Box>
    </MainCard>
  );
}
