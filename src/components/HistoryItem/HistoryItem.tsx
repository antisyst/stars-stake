import React from 'react';
import styles from './HistoryItem.module.scss';
import type { Activity } from '@/types';
import { formatNumber } from '@/utils/formatNumber';
import { toDate } from '@/utils/toDate';
import { formatDMY } from '@/utils/formatDMY';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg?react';
import { useI18n } from '@/i18n';

type Props = {
  data: Activity;
  onOpen?: (data: Activity) => void;
};

export const HistoryItem: React.FC<Props> = ({ data, onOpen }) => {
  const isStake = data.type === 'stake';
  const dateStr = formatDMY(toDate(data.createdAt));
  const { t } = useI18n();

  const handleClick = () => {
    if (onOpen) onOpen(data);
  };

  return (
    <div
      className={styles.item}
      role="listitem"
      aria-label={isStake ? t('history.deposit') : t('history.withdraw')}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      style={{ cursor: onOpen ? 'pointer' : 'default' }}
    >
      <div className={styles.iconWrapper} aria-hidden>
        <ArrowDownIcon className="white-icon" />
      </div>
      <div className={styles.itemBody}>
        <div className={styles.rowTop}>
          <span className={styles.type}>{isStake ? t('history.deposit') : t('history.withdraw')}</span>
          <span
            className={`${styles.amount} ${
              isStake ? styles.amountPositive : styles.amountNegative
            }`}
          >
            {isStake ? '+' : '-'}
            {formatNumber(data.amount)} <StarIcon />
          </span>
        </div>
        <div className={styles.rowBottom}>
          <span className={styles.meta}>{dateStr}</span>
          <span
            className={`${styles.apy} ${
              isStake ? styles.amountPositive : styles.amountNegative
            }`}
          >
            {Number(data.apy).toFixed(1)}% {t('history.apySuffix')}
          </span>
        </div>
      </div>
    </div>
  );
};