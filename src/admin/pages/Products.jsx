import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { listCategories } from 'admin/api/categories';
import { deactivateProduct, listProducts, restoreProduct } from 'admin/api/products';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const thumbnailSx = {
  width: 44,
  height: 44,
  borderRadius: 1,
  objectFit: 'cover',
  display: 'block'
};

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

const getThumbnail = (product) => {
  const images = product.images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];
  return primary?.image ?? '';
};

// ==============================|| ADMIN - PRODUCTS ||============================== //

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // Pick up the success message passed back by the form page.
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

  useEffect(() => {
    let active = true;

    listCategories()
      .then((list) => {
        if (active) setCategories(list);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await listProducts({
        page: page + 1,
        pageSize,
        search: debouncedSearch,
        status,
        category
      });

      setProducts(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (error) {
      setProducts([]);
      setCount(0);
      setLoadError(getErrorMessage(error, 'Could not load products.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const handleDeactivate = async () => {
    if (!deleteTarget) return;

    setActionLoading(deleteTarget.id);

    try {
      await deactivateProduct(deleteTarget.id);
      setDeleteTarget(null);
      notify('Product deactivated.', 'success');

      if (products.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (error) {
      notify(getErrorMessage(error, 'Could not deactivate the product.'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (product) => {
    setActionLoading(product.id);

    try {
      await restoreProduct(product.id);
      notify('Product restored.', 'success');

      if (products.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (error) {
      notify(getErrorMessage(error, 'Could not restore the product.'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <MainCard
        title="Products"
        content={false}
        secondary={
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusOutlined />}
            onClick={() => navigate('/admin/products/new')}
          >
            Add product
          </Button>
        }
      >
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
            placeholder="Search products"
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

          <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="product-status-label">Status</InputLabel>
              <Select
                labelId="product-status-label"
                label="Status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="product-category-label">Category</InputLabel>
              <Select
                labelId="product-category-label"
                label="Category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All categories</MenuItem>
                {categories.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {loadError && (
          <Alert
            severity="error"
            sx={{ m: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={fetchProducts}>
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
          <Table aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Colors</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: 'text.secondary' }}>
                      No products found. Add your first product.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const thumbnail = getThumbnail(product);
                  const busy = actionLoading === product.id;

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        opacity: product.is_active ? 1 : 0.6,
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        {thumbnail ? (
                          <Box component="img" src={thumbnail} alt={product.name} sx={thumbnailSx} />
                        ) : (
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 1,
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.disabled',
                              fontSize: 11
                            }}
                          >
                            None
                          </Box>
                        )}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {product.name}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {product.category_name}
                        </Typography>
                      </TableCell>

                      <TableCell>{product.price}</TableCell>

                      <TableCell>
                        {product.colors?.length ? (
                          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                            {product.colors.map((color) => (
                              <Tooltip key={color.id} title={color.name}>
                                <Box
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    bgcolor: color.hex_code || 'grey.300',
                                    border: 1,
                                    borderColor: 'divider'
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            &mdash;
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={product.is_active ? 'Active' : 'Inactive'}
                          color={product.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label={`Edit ${product.name}`}
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>

                          {product.is_active ? (
                            <Tooltip title="Deactivate">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  aria-label={`Deactivate ${product.name}`}
                                  disabled={busy}
                                  onClick={() => setDeleteTarget(product)}
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Restore">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  aria-label={`Restore ${product.name}`}
                                  disabled={busy}
                                  onClick={() => handleRestore(product)}
                                >
                                  <UndoOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
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

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={actionLoading ? undefined : () => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Deactivate product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `"${deleteTarget.name}" will be deactivated and hidden from the store. You can restore it later.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={() => setDeleteTarget(null)} disabled={Boolean(actionLoading)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeactivate}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

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
