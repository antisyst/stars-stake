export function toDate(d: any): Date {
  if (!d) return new Date(0);
  if (d instanceof Date) return d;
  if (typeof d?.toDate === 'function') return d.toDate();
  const t = typeof d === 'string' ? Date.parse(d) : NaN;
  return Number.isFinite(t) ? new Date(t) : new Date(0);
}