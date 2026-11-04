export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '0 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(price);
}

