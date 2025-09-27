import { Button } from '@telegram-apps/telegram-ui';
import StarIcon from '@/assets/star-gradient.svg';
import styles from './StakeSection.module.scss';

export const StakeSection = () => {
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
        <Button size="l" mode="bezeled">Deposit</Button>
        <Button size="l" mode='bezeled'>Withdraw</Button>
      </div>

    </div>
  )
}