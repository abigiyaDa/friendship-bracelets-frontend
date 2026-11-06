// Mirrors Order.Status in the backend (apps/orders/models.py).
export const ORDER_STATUS = {
  pending_payment: { label: 'Pending payment', color: 'warning' },
  payment_review: { label: 'Payment review', color: 'info' },
  approved: { label: 'Approved', color: 'primary' },
  in_production: { label: 'In production', color: 'secondary' },
  ready: { label: 'Ready', color: 'success' },
  picked_up: { label: 'Picked up', color: 'default' },
  cancelled: { label: 'Cancelled', color: 'error' }
};

// Normal pipeline order. "cancelled" is a terminal, off-pipeline status.
export const ORDER_STATUS_FLOW = [
  'pending_payment',
  'payment_review',
  'approved',
  'in_production',
  'ready',
  'picked_up'
];
