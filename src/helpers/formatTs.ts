export function formatTs(ts: any): string {
  try {
    const d: Date = ts?.toDate ? ts.toDate() : new Date();
    const dPart = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    const tPart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dPart} at ${tPart}`;
  } catch {
    return '';
  }
}