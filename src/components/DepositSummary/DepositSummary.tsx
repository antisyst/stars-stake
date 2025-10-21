import React, { useMemo } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { calcNetworkFee, computeUnlockDates } from '@/utils/deposit';
import styles from './DepositSummary.module.scss';

type Props = { amount: number };

export const DepositSummary: React.FC<Props> = ({ amount }) => {
  const fee = useMemo(() => calcNetworkFee(amount), [amount]);
  const { short } = useMemo(() => computeUnlockDates(), []);

  return (
    <div className={styles.summaryCard} role="region" aria-label="Deposit summary">
      <div className={styles.row}>
        <span className={styles.label}>Stake amount</span>
        <span className={styles.value}>{formatNumber(amount)} <em>Stars</em></span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Network fee</span>
        <span className={styles.value}>{formatNumber(fee)} <em>Stars</em></span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Lock period</span>
        <span className={styles.value}>30 days</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Unlock date</span>
        <span className={styles.value}>{short}</span>
      </div>
    </div>
  );
};