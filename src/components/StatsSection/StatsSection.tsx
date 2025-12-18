import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './StatsSection.module.scss';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRates } from '@/contexts/RatesContext';
import { useI18n } from '@/i18n';
import TonSymbolIcon from '@/assets/icons/toncoin-symbol.svg?react';

export const StatsSection = () => {
  const { stats } = useAppData();
  const { formatFromUsd } = useCurrency();
  const { tonUsd } = useRates();
  const { t } = useI18n();

  const exchangeRate = stats?.exchangeRate ?? 0.0199;
  const tonPerStar = tonUsd && tonUsd > 0 ? exchangeRate / tonUsd : null;
  const totalStaked = stats?.totalStaked ?? 0;
  const formattedUsd = formatFromUsd(exchangeRate, 4); 
  const formattedTon = tonPerStar === null ? '—' : Number(tonPerStar).toFixed(6);

  return (
    <div className={styles.statsBody}>
      <h2 className="section-title">{t('stats.title')}</h2>
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{t('stats.totalStaked')}</div>
          <span className={styles.statValue}>
            <StarIcon className={styles.starIcon}/> {formatNumber(totalStaked)}
          </span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>{t('stats.exchangeRate')}</div>
          <span className={styles.statValue}>
            <StarIcon className={styles.starIcon} />
            1 ≈ <span className={styles.inlineValue}>{formattedUsd} ≈ <TonSymbolIcon className='text-icon'/> {formattedTon}</span>
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