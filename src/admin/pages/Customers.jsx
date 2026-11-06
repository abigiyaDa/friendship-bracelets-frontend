import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
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
import { listCustomers } from 'admin/api/customers';
import { formatDate } from 'admin/utils/format';

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

// Telegram values arrive both as "@naolda" and "AbigiyaDa".
const normalizeTelegram = (value) => String(value ?? '').trim().replace(/^@+/, '');

const EmptyCell = () => (
  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
    &mdash;
  </Typography>
);

// ==============================|| ADMIN - CUSTOMERS ||============================== //

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await listCustomers({
        page: page + 1,
        pageSize,
        search: debouncedSearch
      });

      setCustomers(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (error) {
      setCustomers([]);
      setCount(0);
      setLoadError(getErrorMessage(error, 'Could not load customers.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, refreshKey]);

  const openCustomer = (customer) => navigate(`/admin/customers/${customer.id}`);

  return (
    <>
      <MainCard title="Customers" content={false}>
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search customers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: 240, width: { xs: '100%', lg: 360 } }}
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
        </Box>

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
          <Table aria-label="customers table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telegram</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {debouncedSearch ? 'No customers match your search.' : 'No customers yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const telegram = normalizeTelegram(customer.telegram_username);

                  return (
                    <TableRow
                      key={customer.id}
                      hover
                      tabIndex={0}
                      onClick={() => openCustomer(customer)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openCustomer(customer);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {customer.full_name}
                      </TableCell>

                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {customer.phone ? <Link href={`tel:${customer.phone}`}>{customer.phone}</Link> : <EmptyCell />}
                      </TableCell>

                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {customer.email ? <Link href={`mailto:${customer.email}`}>{customer.email}</Link> : <EmptyCell />}
                      </TableCell>

                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {telegram ? (
                          <Link
                            href={`https://t.me/${telegram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{telegram}
                          </Link>
                        ) : (
                          <EmptyCell />
                        )}
                      </TableCell>

                      <TableCell align="right">{customer.order_count ?? 0}</TableCell>

                      <TableCell>{formatDate(customer.created_at)}</TableCell>
                    </TableRow>
                  );
                })
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
    </>
  );
}
