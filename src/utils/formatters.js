export const formatCurrency = (value, currency = 'INR') => {
  const amount = value || 0;
  // Round to the nearest paisa first so float artifacts (e.g. 340.7999999999999)
  // don't spuriously count as "has decimals". Only show the .00 when the amount
  // actually carries cents — ₹340 stays clean, ₹340.80 now displays correctly
  // instead of being silently rounded to ₹341 by a hardcoded maximumFractionDigits: 0.
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
