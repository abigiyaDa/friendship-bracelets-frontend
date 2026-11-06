// Normalize Ethiopian phone numbers to the national 0XXXXXXXXX form.
// Accepts 0911234567, +251911234567, 251911234567 and 911234567 — all become 0911234567.
// Returns null when the number can't be understood.
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;

  let national = digits;
  if (digits.startsWith('251')) national = digits.slice(3);
  else if (digits.startsWith('0')) national = digits.slice(1);

  if (!/^\d{9}$/.test(national)) return null;
  return `0${national}`;
}

export const PHONE_HINT = 'e.g. 0911 234 567 or +251 911 234 567';
