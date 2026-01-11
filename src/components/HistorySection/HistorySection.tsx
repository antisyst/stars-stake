import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@/assets/icons/history.svg?react';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import styles from './HistorySection.module.scss';
import { useI18n } from '@/i18n';

export const HistorySection = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const navigateHistory = () => navigate('/history', { replace: false });

  return (
    <div 
      className={`${styles.historySection} glass-card`}
      role='button'
      onClick={navigateHistory}
    >
        <div className={styles.historyTitle}>
            <div className={styles.iconWrapper}>
              <HistoryIcon className='history-icon' />
            </div>
            <div className={styles.historyLabel}>{t('profile.history')}</div>
        </div>
        <div className={styles.arrowWrapper}>
            <ArrowRightIcon className='arrow-icon' />
        </div>
    </div>
  )
}