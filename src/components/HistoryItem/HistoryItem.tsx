import React from 'react';
import styles from './HistoryItem.module.scss';
import type { Activity } from '@/types';
import { formatNumber } from '@/utils/formatNumber';
import { toDate } from '@/utils/toDate';
import { formatDMY } from '@/utils/formatDMY';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg?react';

type Props = { data: Activity };

export const HistoryItem: React.FC<Props> = ({ data }) => {
  const isStake = data.type === 'stake';
  const dateStr = formatDMY(toDate(data.createdAt));

  return (
    <div
      className={styles.item}
      role="listitem"
      aria-label={isStake ? 'Stake' : 'Unstake'}
    >
       <div className={styles.iconWrapper} aria-hidden>
        <ArrowDownIcon className='white-icon'/>
      </div>
      <div className={styles.itemBody}>
        <div className={styles.rowTop}>
          <span className={styles.type}>{isStake ? 'Deposit' : 'Withdraw'}</span>
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
            {Number(data.apy).toFixed(1)}% APY
          </span>
        </div>
      </div>
    </div>
  );
};