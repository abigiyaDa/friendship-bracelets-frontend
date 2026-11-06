import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { listPayments } from 'admin/api/payments';
import PaymentReviewDialog from 'admin/components/PaymentReviewDialog';
import PaymentStatusChip from 'admin/components/PaymentStatusChip';
import ReceiptThumb from 'admin/components/ReceiptThumb';
import { formatDateTime, formatMoney } from 'admin/utils/format';

// assets
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const METHOD_LABELS = {
  telebirr: 'Telebirr',
  bank_transfer: 'Bank transfer'
};

const TYPE_LABELS = {
  deposit: 'Deposit',
  full: 'Full payment'
};

const formatChoice = (labels, value) =>
  labels[value] ?? (value ? String(value).replace(/_/g, ' ') : '—');

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

// ==============================|| ADMIN - PAYMENTS ||============================== //

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [reviewPayment, setReviewPayment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await listPayments({
        page: page + 1,
        pageSize,
        search: debouncedSearch,
        status: status === 'all' ? '' : status
      });

      setPayments(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (error) {
      setPayments([]);
      setCount(0);
      setLoadError(getErrorMessage(error, 'Could not load payments.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const handleCopyRef = async (value) => {
    if (!value) return;

    try {
      if (!navigator.clipboard) throw new Error('Clipboard is unavailable.');

      await navigator.clipboard.writeText(value);
      notify('Transaction reference copied.', 'success');
    } catch {
      notify('Could not copy the transaction reference.', 'error');
    }
  };

  const handleReviewed = (result) => {
    setReviewPayment(null);
    refresh();
    notify(result?.status === 'approved' ? 'Payment approved.' : 'Payment rejected.', 'success');
  };

  const handleConflict = (message) => {
    setReviewPayment(null);
    refresh();
    notify(message, 'error');
  };

  return (
    <>
      <MainCard title="Payments" content={false}>
        <Box
          sx={{
            p: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', lg: 'center' }
          }}
        >
          <TextField
            size="small"
            placeholder="Search by order or transaction ref"
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

          <ToggleButtonGroup
            exclusive
            size="small"
            value={status}
            onChange={(_event, value) => {
              if (!value) return;
              setStatus(value);
              setPage(0);
            }}
            aria-label="Payment status filter"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="approved">Approved</ToggleButton>
            <ToggleButton value="rejected">Rejected</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={refresh}>
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
          <Table aria-label="payments table">
            <TableHead>
              <TableRow>
                <TableCell>Receipt</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction ref</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {debouncedSearch ? 'No payments match your search.' : 'No payments found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <ReceiptThumb receipt={payment.receipt} />
                    </TableCell>

                    <TableCell component="th" scope="row">
                      {payment.order ? (
                        <Link component={RouterLink} to={`/admin/orders/${payment.order}`}>
                          {payment.order_number}
                        </Link>
                      ) : (
                        payment.order_number
                      )}
                    </TableCell>

                    <TableCell>{payment.customer_name}</TableCell>

                    <TableCell>{formatChoice(METHOD_LABELS, payment.method)}</TableCell>

                    <TableCell>{formatChoice(TYPE_LABELS, payment.payment_type)}</TableCell>

                    <TableCell>{formatMoney(payment.amount)}</TableCell>

                    <TableCell>
                      {payment.transaction_ref ? (
                        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                          <Tooltip title={payment.transaction_ref}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 160, display: 'inline-block' }}
                            >
                              {payment.transaction_ref}
                            </Typography>
                          </Tooltip>

                          <Tooltip title="Copy transaction reference">
                            <IconButton
                              size="small"
                              aria-label="Copy transaction reference"
                              onClick={() => handleCopyRef(payment.transaction_ref)}
                            >
                              <CopyOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <EmptyCell />
                      )}
                    </TableCell>

                    <TableCell>
                      <PaymentStatusChip status={payment.status} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{formatDateTime(payment.created_at)}</Typography>

                      {payment.status !== 'pending' && payment.verified_at && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          Verified {formatDateTime(payment.verified_at)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {payment.status === 'pending' ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setReviewPayment(payment)}
                        >
                          Review
                        </Button>
                      ) : (
                        <EmptyCell />
                      )}
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

      {reviewPayment && (
        <PaymentReviewDialog
          open
          payment={reviewPayment}
          orderId={reviewPayment.order}
          orderNumber={reviewPayment.order_number}
          customerName={reviewPayment.customer_name}
          onClose={() => setReviewPayment(null)}
          onSuccess={handleReviewed}
          onConflict={handleConflict}
          onError={(message) => notify(message, 'error')}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
