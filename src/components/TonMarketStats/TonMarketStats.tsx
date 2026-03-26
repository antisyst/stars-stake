import React, { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';
import styles from './TonMarketStats.module.scss';

export interface TonMarketData {
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  allTimeHigh: number;
  allTimeLow: number;
  priceChange7d: number;
  priceChange30d: number;
}

interface TonMarketStatsProps {
  data: TonMarketData | null;
  loading: boolean;
  tonUsd: number;
}

function formatLargeUsd(n: number, sym: string): string {
  if (!Number.isFinite(n) || n <= 0) return `${sym}—`;
  if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${sym}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${sym}${(n / 1_000).toFixed(2)}K`;
  return `${sym}${n.toFixed(2)}`;
}

function formatTonSupply(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString();
}

const PctBadge: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct === 0) {
    return <span className={`${styles.pctBadge} ${styles.neutral}`}>—</span>;
  }
  const up = pct >= 0;
  return (
    <span className={`${styles.pctBadge} ${up ? styles.up : styles.down}`}>
      <span>{up ? '↑' : '↓'}</span>
      <span>{Math.abs(pct).toFixed(2)}%</span>
    </span>
  );
};

const SupplyBar: React.FC<{ circulating: number; total: number; label: string }> = ({
  circulating, total, label,
}) => {
  const pct = total > 0 ? Math.min(100, (circulating / total) * 100) : 0;
  return (
    <div className={styles.supplyBarWrap}>
      <div className={styles.supplyBar}>
        <div className={styles.supplyFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.supplyPct}>{pct.toFixed(1)}{label}</span>
    </div>
  );
};

const StatRow: React.FC<{
  label: string;
  valueNode: React.ReactNode;
  raw?: boolean;
}> = ({ label, valueNode, raw }) => (
  <div className={styles.statRow}>
    <span className={styles.statLabel}>{label}</span>
    <div className={styles.statRight}>
      {raw ? valueNode : <span className={styles.statValue}>{valueNode}</span>}
    </div>
  </div>
);

export const TonMarketStats: React.FC<TonMarketStatsProps> = ({ data, loading }) => {
  const { formatFromUsd, symbolFor } = useCurrency();
  const { t } = useI18n();
  const sym = symbolFor();

  const rows = useMemo(() => {
    if (!data) return [];
    return [
      { label: t('tonMarket.marketCap',   'Market Cap'),     valueNode: formatLargeUsd(data.marketCap, sym) },
      { label: t('tonMarket.volume24h',   '24h Volume'),     valueNode: formatLargeUsd(data.volume24h, sym) },
      { label: t('tonMarket.change7d',    '7d Change'),      valueNode: <PctBadge pct={data.priceChange7d} />,  raw: true },
      { label: t('tonMarket.change30d',   '30d Change'),     valueNode: <PctBadge pct={data.priceChange30d} />, raw: true },
      { label: t('tonMarket.allTimeHigh', 'All-Time High'),  valueNode: formatFromUsd(data.allTimeHigh, 3) },
      { label: t('tonMarket.allTimeLow',  'All-Time Low'),   valueNode: formatFromUsd(data.allTimeLow, 4) },
    ];
  }, [data, sym, formatFromUsd, t]);

  return (
    <div className={`${styles.tonMarketStats} glass-card`}>
      <h3 className={styles.sectionTitle}>{t('tonMarket.sectionTitle', 'Market Statistics')}</h3>

      {loading || !data ? (
        <div className={styles.skeletonList}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
        </div>
      ) : (
        <>
          <div className={styles.statsList}>
            {rows.map((r, i) => (
              <StatRow key={i} label={r.label} valueNode={r.valueNode} raw={r.raw} />
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.supplySection}>
            <div className={styles.supplyHeader}>
              <span className={styles.statLabel}>{t('tonMarket.circulatingSupply', 'Circulating Supply')}</span>
              <span className={styles.statValue}>{formatTonSupply(data.circulatingSupply)} TON</span>
            </div>
            <SupplyBar
              circulating={data.circulatingSupply}
              total={data.totalSupply}
              label={t('tonMarket.inCirculation', '% in circulation')}
            />
            <div className={styles.supplyFooter}>
              <span className={styles.statLabel}>{t('tonMarket.totalSupply', 'Total Supply')}</span>
              <span className={styles.statValue}>{formatTonSupply(data.totalSupply)} TON</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};