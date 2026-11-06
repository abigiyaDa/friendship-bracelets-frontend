import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import { getRecentOrders } from 'admin/api/dashboard';
import { useAsyncData } from 'admin/dashboard/useAsyncData';
import { BlockError } from 'admin/dashboard/BlockState';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import { formatDateTime, formatMoney } from 'admin/utils/format';

// ==============================|| DASHBOARD - RECENT ORDERS ||============================== //

export default function RecentOrdersCard() {
  const navigate = useNavigate();
  const { data, loading, error, retry } = useAsyncData(() => getRecentOrders(5));
  const orders = Array.isArray(data) ? data : [];

  return (
    <MainCard
      title="Recent orders"
      content={false}
      secondary={
        <Link component={RouterLink} to="/admin/orders" variant="body2">
          View all
        </Link>
      }
    >
      {loading ? (
        <Box sx={{ p: 2.5 }}>
          <Skeleton variant="rounded" height={240} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2.5 }}>
          <BlockError message={error} onRetry={retry} />
        </Box>
      ) : orders.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
          No orders yet.
        </Typography>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table aria-label="recent orders">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Link
                      component={RouterLink}
                      to={`/admin/orders/${order.id}`}
                      onClick={(event) => event.stopPropagation()}
                      sx={{ fontWeight: 600 }}
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer?.full_name ?? '—'}</TableCell>
                  <TableCell align="right">{formatMoney(order.total_amount)}</TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDateTime(order.created_at)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}
