import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';

// Absolute backend URLs (http://127.0.0.1:8000/media/...) are reduced to their
// path so requests go through the Vite /media proxy instead of hitting Django
// cross-origin.
export const getReceiptSrc = (receipt) => {
  if (!receipt) return '';

  try {
    return new URL(receipt, window.location.origin).pathname;
  } catch {
    return receipt;
  }
};

// ==============================|| RECEIPT THUMBNAIL ||============================== //

export default function ReceiptThumb({ receipt, alt = 'Payment receipt', size = 56 }) {
  const [open, setOpen] = useState(false);
  const src = getReceiptSrc(receipt);

  if (!src) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
          color: 'text.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: 10,
          lineHeight: 1.2
        }}
      >
        No receipt
      </Box>
    );
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Preview receipt"
        sx={{
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          display: 'block',
          borderRadius: 1,
          lineHeight: 0
        }}
      >
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: size,
            height: size,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Receipt preview</DialogTitle>

        <DialogContent>
          <Box
            component="img"
            src={src}
            alt={alt}
            sx={{
              display: 'block',
              mx: 'auto',
              maxWidth: '100%',
              maxHeight: '70vh',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Link href={src} target="_blank" rel="noopener noreferrer" sx={{ mr: 'auto' }}>
            Open in new tab
          </Link>
          <Button color="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
