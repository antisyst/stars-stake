import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './StatsSection.module.scss';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';

export const StatsSection = () => {
  const { stats } = useAppData();
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();

  const totalStaked = stats?.totalStaked ?? 0;
  const exchangeRate = stats?.exchangeRate ?? 0.0199;

  return (
    <div className={styles.statsBody}>
      <h2 className="section-title">{t('stats.title')}</h2>
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{t('stats.totalStaked')}</div>
          <span className={styles.statValue}>
            <StarIcon /> {formatNumber(totalStaked)}
          </span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{t('stats.exchangeRate')}</div>
          <span className={styles.statValue}>
            <StarIcon />
            1 ≈ <span className={styles.inlineValue}>{formatFromUsd(exchangeRate, 4)}</span>
          </span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{t('stats.protocol')}</div>
          <span className={styles.statValue}>
            {t('stats.protocolValue')}
          </span>
        </div>
      </div>
    </div>
  );
};