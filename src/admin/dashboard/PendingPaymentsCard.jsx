import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// project imports
import MainCard from 'components/MainCard';
import { getPendingPayments } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';
import ReceiptThumb from 'admin/components/ReceiptThumb';
import { formatMoney } from 'admin/utils/format';

// ==============================|| DASHBOARD - PAYMENTS AWAITING REVIEW ||============================== //

export default function PendingPaymentsCard() {
  const { data, loading, error, retry } = useAsyncData(() => getPendingPayments(5));
  const payments = Array.isArray(data) ? data : [];

  return (
    <MainCard
      title="Payments awaiting review"
      content={false}
      sx={{ height: '100%' }}
      secondary={
        <Link component={RouterLink} to="/admin/payments" variant="body2">
          View all
        </Link>
      }
    >
      {loading ? (
        <Box sx={{ p: 2.5, pt: 1 }}>
          <Stack sx={{ gap: 1.5 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={64} />
            ))}
          </Stack>
        </Box>
      ) : error ? (
        <Box sx={{ p: 2.5 }}>
          <BlockError message={error} onRetry={retry} />
        </Box>
      ) : payments.length === 0 ? (
        <Stack
          sx={{ alignItems: 'center', justifyContent: 'center', gap: 1.25, py: 6, px: 2.5 }}
        >
          <CheckCircleOutlined style={{ fontSize: 40 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Nothing waiting for review
          </Typography>
        </Stack>
      ) : (
        <List disablePadding>
          {payments.map((payment, index) => (
            <Box key={payment.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  px: 2.5,
                  py: 1.75,
                  gap: 2,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}
              >
                <ReceiptThumb receipt={payment.receipt} size={56} />

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {payment.customer_name || 'Unknown customer'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    Order {payment.order_number || '—'}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>
                  {formatMoney(payment.amount)}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  component={RouterLink}
                  to="/admin/payments"
                >
                  Review
                </Button>
              </ListItem>
            </Box>
          ))}
        </List>
      )}
    </MainCard>
  );
}
