// material-ui
import Chip from '@mui/material/Chip';

const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' }
};

// ==============================|| PAYMENT STATUS CHIP ||============================== //

export default function PaymentStatusChip({ status, size = 'small', ...rest }) {
  const config = PAYMENT_STATUS[status];
  const label = config?.label ?? (status ? String(status).replace(/_/g, ' ') : 'Unknown');

  return <Chip label={label} color={config?.color ?? 'default'} size={size} {...rest} />;
}
