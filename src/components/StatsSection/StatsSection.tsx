import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './StatsSection.module.scss';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { useCurrency } from '@/contexts/CurrencyContext';

export const StatsSection = () => {
  const { stats } = useAppData();
  const { formatFromUsd } = useCurrency();

  const totalStaked = stats?.totalStaked ?? 0;
  const exchangeRate = stats?.exchangeRate ?? 0.0199;
  // const systemHealth = stats?.systemHealth ?? 'Stable';

  return (
    <div className={styles.statsBody}>
      <h2 className='section-title'>System Overview</h2>
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Total Staked</div>
          <span className={styles.statValue}>
            <StarIcon /> {formatNumber(totalStaked)}
          </span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Exchange Rate</div>
          <span className={styles.statValue}>
            <StarIcon />
            1 ≈ <span className={styles.inlineValue}>{formatFromUsd(exchangeRate, 4)}</span>
          </span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Protocol</div>
          <span className={styles.statValue}>
              Stars Base Protocol
          </span>
        </div>
        {/* <div className={styles.statItem}>
          <div className={styles.statLabel}>System Health</div>
          <span className={styles.statValue}>
            <div className={styles.positiveStatus}/>
            {systemHealth}
          </span>
        </div> */}
      </div>
    </div>
  );
};