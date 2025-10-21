export function formatNumber(value: number | string): string {
  if (value == null) return '';

  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return String(value);

  return num.toLocaleString('de-DE');
}