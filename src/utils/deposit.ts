export const MIN_DEPOSIT = 300;
export const MAX_DEPOSIT = 100_000;

export function clampAmount(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), MAX_DEPOSIT);
}

export function parseAmountInput(v: string): number {
  const digits = v.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return clampAmount(Number(digits));
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDateDDMMYYYY(d: Date): string {
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function computeUnlockDates(now = new Date()) {
  const unlock = new Date(now.getTime());
  unlock.setDate(unlock.getDate() + 30);
  const short = formatDateDDMMYYYY(unlock);
  return { unlock, short };
}

export function calcPayable(requested: number): number {
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  return requested === 100_000 ? 100_000 : requested;
}


export function isValidDeposit(amount: number): boolean {
  return amount >= MIN_DEPOSIT && amount <= MAX_DEPOSIT && calcPayable(amount) > 0;
}