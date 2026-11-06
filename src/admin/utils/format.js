export const CURRENCY = 'ETB';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

const toDate = (iso) => {
  if (!iso) return null;

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Accepts a number or a numeric string (e.g. a DRF DecimalField value).
export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';

  const amount = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));

  if (!Number.isFinite(amount)) return '—';

  return `${moneyFormatter.format(amount)} ${CURRENCY}`;
}

export function formatDate(iso) {
  const date = toDate(iso);
  return date ? dateFormatter.format(date) : '—';
}

export function formatDateTime(iso) {
  const date = toDate(iso);
  return date ? dateTimeFormatter.format(date) : '—';
}
