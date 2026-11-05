import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { deleteProductImage, updateProductImage, uploadProductImage } from 'admin/api/products';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import StarOutlined from '@ant-design/icons/StarOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

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

// ==============================|| PRODUCT IMAGE MANAGER ||============================== //

export default function ProductImageManager({ product, onRefresh }) {
  const [actionId, setActionId] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const images = useMemo(
    () =>
      [...(product?.images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order || a.id - b.id
      ),
    [product]
  );

  const uploading = uploadQueue.length > 0;
  const busy = Boolean(actionId) || uploading || deleting;

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleSetPrimary = async (image) => {
    setActionId(`primary-${image.id}`);

    try {
      // The backend unsets the previous primary automatically.
      await updateProductImage(product.id, image.id, { is_primary: true });
      await onRefresh();
      notify('Primary image updated.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not update the primary image.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleMove = async (image, offset) => {
    const index = images.findIndex((item) => item.id === image.id);
    const neighbor = images[index + offset];

    if (!neighbor) return;

    setActionId(`move-${image.id}`);

    try {
      // Swap the two sort_order values to reorder the pair.
      await updateProductImage(product.id, image.id, { sort_order: neighbor.sort_order });
      await updateProductImage(product.id, neighbor.id, { sort_order: image.sort_order });
      await onRefresh();
      notify('Image order updated.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not reorder the images.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) return;

    setUploadQueue(files.map((file) => file.name));
    let failed = false;

    for (const file of files) {
      try {
        await uploadProductImage(product.id, file);
      } catch (error) {
        failed = true;
        notify(getErrorMessage(error, 'Could not upload the image.'), 'error');
        break;
      } finally {
        setUploadQueue((prev) => prev.slice(1));
      }
    }

    try {
      await onRefresh();
    } catch (error) {
      notify(getErrorMessage(error, 'Images were saved but the list could not be refreshed.'), 'error');
      return;
    }

    if (!failed) notify(files.length > 1 ? 'Images uploaded.' : 'Image uploaded.', 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteProductImage(product.id, deleteTarget.id);
      setDeleteTarget(null);
      await onRefresh();
      notify('Image deleted.', 'success');
    } catch (error) {
      notify(getErrorMessage(error, 'Could not delete the image.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <MainCard
        title="Images"
        secondary={
          <Button
            component="label"
            variant="contained"
            size="small"
            startIcon={<UploadOutlined />}
            disabled={busy}
          >
            Upload images
            <input type="file" hidden multiple accept="image/*" onChange={handleUpload} />
          </Button>
        }
      >
        {uploading && (
          <Stack sx={{ gap: 1, mb: 2 }}>
            {uploadQueue.map((name, index) => (
              <Stack key={`${name}-${index}`} direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <CircularProgress size={16} />
                <Typography variant="body2" noWrap sx={{ maxWidth: 320 }}>
                  {name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {images.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No images yet. Upload the first image for this product.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))'
              },
              gap: 2
            }}
          >
            {images.map((image, index) => {
              const isPrimary = Boolean(image.is_primary);
              const primaryBusy = actionId === `primary-${image.id}`;

              return (
                <Card key={image.id} variant="outlined" sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={image.image}
                    alt={`${product.name} image ${index + 1}`}
                    sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  />

                  {isPrimary && (
                    <Chip
                      label="Primary"
                      size="small"
                      color="primary"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}

                  <Stack sx={{ p: 1.5, gap: 1 }}>
                    <Button
                      variant={isPrimary ? 'outlined' : 'contained'}
                      size="small"
                      startIcon={primaryBusy ? undefined : <StarOutlined />}
                      disabled={isPrimary || busy}
                      onClick={() => handleSetPrimary(image)}
                    >
                      {primaryBusy ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : isPrimary ? (
                        'Primary image'
                      ) : (
                        'Set as primary'
                      )}
                    </Button>

                    <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'space-between' }}>
                      <Tooltip title="Move left">
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Move image left"
                            disabled={index === 0 || busy}
                            onClick={() => handleMove(image, -1)}
                          >
                            <ArrowLeftOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Move right">
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Move image right"
                            disabled={index === images.length - 1 || busy}
                            onClick={() => handleMove(image, 1)}
                          >
                            <ArrowRightOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete image"
                            disabled={busy}
                            onClick={() => setDeleteTarget(image)}
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Box>
        )}
      </MainCard>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={deleting ? undefined : () => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete image?</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <Box
              component="img"
              src={deleteTarget.image}
              alt="Selected product image"
              sx={{
                width: 120,
                height: 120,
                borderRadius: 1,
                objectFit: 'cover',
                display: 'block',
                mb: 2
              }}
            />
          )}
          <DialogContentText>
            This image will be permanently deleted. If it is the primary image, the first remaining image is promoted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
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
