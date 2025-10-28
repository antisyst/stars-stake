import React from 'react';
import styles from './TierRanges.module.scss';

export const TierRanges: React.FC = () => {
  const tiers = [
    { color: 'var(--app-button)', range: '0 – 19,999',  apy: '28.9' },
    { color: '#22c55e', range: '20,000 – 49,999', apy: '39.7' },
    { color: '#ff9f1a', range: '50,000 – 99,999', apy: '42.5' },
    { color: '#a855f7', range: '100,000 +',       apy: '39.8' },
  ];

  return (
    <div className={styles.tierRanges}>
      {tiers.map((t, i) => (
        <div key={i} className={styles.tierItem}>
          <div className={styles.tierRow}>
            <span className={styles.dot} style={{ backgroundColor: t.color }} />
            <span className={styles.rangeText}>{t.range}</span>
          </div>
          <span className={styles.apyText} style={{ color: t.color }}>
            {t.apy}%
          </span>
        </div>
      ))}
    </div>
  );
};