export const CATEGORY_COLORS = {
  Food: '#c8f25a',
  Travel: '#5af2c8',
  Shopping: '#f25a8a',
  Health: '#f2a45a',
  Entertainment: '#a45af2',
  Bills: '#5a8af2',
  Other: '#f2e45a',
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);

/** Amount is stored on-chain in paise (i128). Convert to/from rupees for the UI. */
export function toPaise(rupees) {
  return Math.round(rupees * 100);
}

export function fromPaise(paise) {
  return paise / 100;
}

export function formatINR(paise) {
  return '₹' + fromPaise(paise).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export function formatDate(msTimestamp) {
  if (!msTimestamp) return '';
  const d = new Date(msTimestamp);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
