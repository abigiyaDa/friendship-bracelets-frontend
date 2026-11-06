// material-ui
import Chip from '@mui/material/Chip';

// project imports
import { ORDER_STATUS } from 'admin/constants/orderStatus';

// ==============================|| ORDER STATUS CHIP ||============================== //

export default function OrderStatusChip({ status, size = 'small', ...rest }) {
  const config = ORDER_STATUS[status];
  const label = config?.label ?? (status ? String(status).replace(/_/g, ' ') : 'Unknown');

  return <Chip label={label} color={config?.color ?? 'default'} size={size} {...rest} />;
}
