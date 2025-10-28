import styles from './Header.module.scss';
import StarIcon from '@/assets/icons/star.svg?react';

export const Header = () => {
  return (
    <div className={styles.mainHeader}>
        <div className={`${styles.iconWrapper} gradient-move`}>
         <StarIcon  />
        </div>
        <div className={styles.headerText}>
            <h2 className={styles.title}>Stars Base</h2>
            <p className={styles.subtitle}>Earn up to 45.9% APY through staking</p>
        </div>
    </div>
  )
}