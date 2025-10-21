import StarIcon from '@/assets/icons/star.svg?react';
import styles from './LoaderScreen.module.scss';

export const LoaderScreen = () => {
  return (
    <div className={styles.loaderScreen}>
        <div className={`${styles.iconWrapper} gradient-move`}>
          <StarIcon/>
        </div>
    </div>
  )
}