export function splitContent(input?: string): string[] {
  if (!input) return [];
  return input
    .split(/\r?\n|\|/g)
    .map(s => s.trim())
    .filter(Boolean);
}