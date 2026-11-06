import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { listOrders } from 'admin/api/orders';
import OrderStatusChip from 'admin/components/OrderStatusChip';
import { ORDER_STATUS } from 'admin/constants/orderStatus';
import { formatDate, formatMoney } from 'admin/utils/format';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const getErrorMessage = (error, fallback) => {
  if (!error?.response) {
    return 'Unable to reach the server. Please try again.';
  }

  const data = error.response.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue) && firstValue.length) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
};

const EmptyCell = () => (
  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
    &mdash;
  </Typography>
);

// ==============================|| ADMIN - ORDERS ||============================== //

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Pick up the success message passed back by the create-order page.
  useEffect(() => {
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: location.state.severity ?? 'success'
      });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await listOrders({
        page: page + 1,
        pageSize,
        search: debouncedSearch,
        status: status === 'all' ? '' : status
      });

      setOrders(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (error) {
      setOrders([]);
      setCount(0);
      setLoadError(getErrorMessage(error, 'Could not load orders.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshKey]);

  const openOrder = (order) => navigate(`/admin/orders/${order.id}`);

  return (
    <>
      <MainCard
        title="Orders"
        content={false}
        secondary={
          <Button variant="contained" size="small" onClick={() => navigate('/admin/orders/new')}>
            New order
          </Button>
        }
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          sx={{
            p: 2.5,
            gap: 2,
            alignItems: { xs: 'stretch', lg: 'center' },
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <TextField
            size="small"
            placeholder="Search by order number, customer or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="order-status-filter-label">Status</InputLabel>
            <Select
              labelId="order-status-filter-label"
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All</MenuItem>
              {Object.entries(ORDER_STATUS).map(([value, config]) => (
                <MenuItem key={value} value={value}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={() => setRefreshKey((key) => key + 1)}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        <TableContainer
          sx={{
            width: '100%',
            overflowX: 'auto',
            '& td, & th': { whiteSpace: 'nowrap' }
          }}
        >
          <Table aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Pickup</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Deposit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">View</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {debouncedSearch || status !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    tabIndex={0}
                    onClick={() => openOrder(order)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openOrder(order);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
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

                    <TableCell>
                      <Stack sx={{ gap: 0 }}>
                        <Typography variant="body2">{order.customer?.full_name ?? '—'}</Typography>
                        {order.customer?.phone && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {order.customer.phone}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>{order.pickup_location || <EmptyCell />}</TableCell>

                    <TableCell align="right">{order.item_count ?? 0}</TableCell>

                    <TableCell align="right">{formatMoney(order.total_amount)}</TableCell>

                    <TableCell align="right">{formatMoney(order.deposit_amount)}</TableCell>

                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>

                    <TableCell>{formatDate(order.created_at)}</TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          openOrder(order);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        />
      </MainCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
