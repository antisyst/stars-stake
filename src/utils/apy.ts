export type TierId = 1 | 2 | 3 | 4;

export const TIER_TABLE = [
  { id: 1 as TierId, min: 0,       max: 19_999,   apy: 36.8 },
  { id: 2 as TierId, min: 20_000,  max: 49_999,   apy: 39.7 },
  { id: 3 as TierId, min: 50_000,  max: 99_999,   apy: 42.5 },
  { id: 4 as TierId, min: 100_000, max: Infinity, apy: 46.8 },
];

export function tierForTotal(total: number) {
  for (const t of TIER_TABLE) {
    if (total >= t.min && total <= t.max) return { tier: t.id, apy: t.apy };
  }
  return { tier: 1 as TierId, apy: 36.8 };
}

export function formatApy(apy: number): string {
  return Number.isFinite(apy) ? apy.toFixed(1) : '0.0';
}

export function weightedApy(positions: { amount: number; apy: number }[]): number {
  const total = positions.reduce((s, p) => s + (p.amount || 0), 0);
  if (total <= 0) return 36.8;
  const sum = positions.reduce((s, p) => s + (p.amount * p.apy), 0);
  return sum / total;
}

export function apyDailyRate(apyPct: number): number {
  return Math.pow(1 + apyPct / 100, 1 / 365) - 1;
}

export function dailyReward(amount: number, apy: number): number {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(apy) || apy <= 0) return 0;
  return amount * apyDailyRate(apy);
}

export function projectedAfterOneYear(amount: number, apy: number): number {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(apy) || apy <= 0) return amount;
  return amount * (1 + apy / 100);
}

export const clampPosAmount = (n: number) => Math.max(0, Math.floor(n || 0));