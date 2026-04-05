export function formatCardAddress(address: string | null | undefined): string {
  if (!address || address.length < 16) return address || 'Not connected';
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}