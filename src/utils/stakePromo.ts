export type StakePromoConfig = {
  id: string;
  enabled: boolean;
  startsAtIso: string;
  endsAtIso: string;
  bonusMultiplier: number; 
};

export const STAKE_PROMO_EVENT: StakePromoConfig = {
  id: 'stake-boost-1_5x-2026-02-22',
  enabled: true, 
  startsAtIso: '2026-02-22T00:00:00.000Z',
  endsAtIso: '2026-02-23T00:00:00.000Z',
  bonusMultiplier: 0.5,
};

export type StakePromoResult = {
  active: boolean;
  eventId: string | null;
  baseAmount: number;
  bonusAmount: number;
  creditedAmount: number;
  boostLabel: string | null;
};

function clampInt(n: number) {
  return Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
}

export function isStakePromoActive(now: Date, cfg: StakePromoConfig = STAKE_PROMO_EVENT): boolean {
  if (!cfg.enabled) return false;
  const t = now.getTime();
  const starts = new Date(cfg.startsAtIso).getTime();
  const ends = new Date(cfg.endsAtIso).getTime();

  if (!Number.isFinite(starts) || !Number.isFinite(ends)) return false;
  return t >= starts && t < ends;
}

export function getStakePromoResult(
  baseAmount: number,
  now: Date,
  cfg: StakePromoConfig = STAKE_PROMO_EVENT
): StakePromoResult {
  const base = clampInt(baseAmount);
  const active = isStakePromoActive(now, cfg);

  if (!active || base <= 0) {
    return {
      active: false,
      eventId: null,
      baseAmount: base,
      bonusAmount: 0,
      creditedAmount: base,
      boostLabel: null,
    };
  }

  const bonus = Math.floor(base * cfg.bonusMultiplier);
  const credited = base + bonus;
  const boostFactor = 1 + cfg.bonusMultiplier;

  return {
    active: true,
    eventId: cfg.id,
    baseAmount: base,
    bonusAmount: bonus,
    creditedAmount: credited,
    boostLabel: `${boostFactor.toFixed(1)}X`,
  };
}