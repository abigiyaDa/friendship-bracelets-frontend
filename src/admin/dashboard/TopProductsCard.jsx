// material-ui
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import InboxOutlined from '@ant-design/icons/InboxOutlined';

// project imports
import MainCard from 'components/MainCard';
import { getStats } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';

// ==============================|| DASHBOARD - TOP PRODUCTS ||============================== //

export default function TopProductsCard() {
  const { data, loading, error, retry } = useAsyncData(getStats);
  const topProducts = Array.isArray(data?.top_products) ? data.top_products : [];
  const maxQuantity = topProducts.reduce((max, item) => Math.max(max, Number(item.quantity) || 0), 0);

  return (
    <MainCard title="Top products" content={false} sx={{ height: '100%' }}>
      {loading ? (
        <Box sx={{ p: 2.5, pt: 1 }}>
          <Stack sx={{ gap: 2 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={44} />
            ))}
          </Stack>
        </Box>
      ) : error ? (
        <Box sx={{ p: 2.5 }}>
          <BlockError message={error} onRetry={retry} />
        </Box>
      ) : topProducts.length === 0 ? (
        <Stack
          sx={{ alignItems: 'center', justifyContent: 'center', gap: 1.25, py: 6, px: 2.5 }}
        >
          <InboxOutlined style={{ fontSize: 40 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No products sold yet
          </Typography>
        </Stack>
      ) : (
        <List disablePadding sx={{ p: 2.5, pt: 1 }}>
          {topProducts.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const progress = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;

            return (
              <ListItem key={`${item.product_name}-${index}`} disableGutters sx={{ px: 0, py: 1, gap: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ width: 24, color: 'text.secondary', textAlign: 'center' }}
                >
                  {index + 1}
                </Typography>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}
                  >
                    <Typography variant="body2" noWrap title={item.product_name}>
                      {item.product_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {quantity} {quantity === 1 ? 'item' : 'items'}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    aria-label={`${item.product_name}: ${quantity} sold`}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </MainCard>
  );
}
