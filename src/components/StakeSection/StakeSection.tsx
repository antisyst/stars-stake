import React from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { hapticFeedback } from '@telegram-apps/sdk';
import StarIcon from '@/assets/star-gradient.svg';
import styles from './StakeSection.module.scss';

export const StakeSection: React.FC = () => {
  // Instant haptic on press
  const hapticPress = () => {
    try {
      hapticFeedback.impactOccurred('medium');
    } catch {
      // no-op if not supported
    }
  };

  const onDeposit = () => {
    // your deposit logic...
  };

  const onWithdraw = () => {
    // your withdraw logic...
  };

  return (
    <div className={styles.stakeSection}>
      <div className={styles.columnItem}>
        <p className={styles.mutedText}>Balance</p>
        <p className={styles.mutedText}>APY</p>
      </div>

      <div className={styles.columnItem}>
        <div className={styles.starsBalance}>
          <img src={StarIcon} alt="Star" />
          <span className={styles.balanceAmount}>0</span>
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        <Button
          size="l"
          mode="bezeled"
          onPointerDown={hapticPress}
          onClick={onDeposit}
        >
          Deposit
        </Button>

        <Button
          size="l"
          mode="bezeled"
          onPointerDown={hapticPress}
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};