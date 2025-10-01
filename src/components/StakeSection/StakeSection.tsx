import { Button } from '@telegram-apps/telegram-ui';
import StarIcon from '@/assets/star-gradient.svg';
import styles from './StakeSection.module.scss';

export const StakeSection = () => {
  return (
    <div className={styles.stakeSection}>
      <div className={styles.columnItem}>
        <p className={styles.mutedText}>Balance</p>
        <p className={styles.apyTitle}>48% APY</p>
      </div>
      <div className={styles.starsBalance}>
         <div className={styles.starAmount}>
          <img src={StarIcon} alt="Star" />
          <span className={styles.balanceAmount}>12.450</span>
         </div>
         <span className={styles.value}>≈$1,112.42</span>
      </div>
      <div className={styles.buttonsContainer}>
        <Button size="l" mode="filled">
          Stake Stars
        </Button>
      </div>
    </div>
  )
}