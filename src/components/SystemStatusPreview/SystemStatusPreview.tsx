import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { useI18n } from '@/i18n';
import styles from './SystemStatusPreview.module.scss';

const DAYS = 30;

function getLast30Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

export const SystemStatusPreview: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const days = useMemo(() => getLast30Days(), []);

  const daysAgoLabel = t('systemStatus.daysAgo').replace('{days}', String(DAYS));
  const todayLabel   = t('systemStatus.today');

  return (
    <div className={styles.systemStatus}>
      <h2 className='section-title'>{t('systemStatus.pageTitle')}</h2>
      <div
        className={`${styles.previewCard} glass-card`}
        onClick={() => navigate('/system-status')}
        role="button"
        tabIndex={0}
        aria-label={t('systemStatus.pageTitle')}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/system-status'); }}
      >
        <div className={styles.headerRow}>
          <div className={styles.leftHeader}>
            <span className={styles.dot} />
            <span className={styles.title}>{t('systemStatus.allOperational')}</span>
          </div>
          <span className={styles.chevron}>
            <ArrowRightIcon className='arrow-icon'/>
          </span>
        </div>
        <div className={styles.systemContainer}>
          <div className={styles.systemRow}>
            <div className={styles.systemHeader}>
              <span className={styles.systemName}>Core Protocol</span>
              <span className={styles.statusLabel}>{t('systemStatus.operational')}</span>
            </div>
            <div className={styles.barsContainer}>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  title={day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
              ))}
            </div>
            <div className={styles.timeLabels}>
              <span className={styles.timeLabel}>{daysAgoLabel}</span>
              <span className={styles.timeLabel}>{todayLabel}</span>
            </div>
          </div>
          <div className={styles.systemRow}>
            <div className={styles.systemHeader}>
              <span className={styles.systemName}>TON Network Gateway</span>
              <span className={styles.statusLabel}>{t('systemStatus.operational')}</span>
            </div>
            <div className={styles.barsContainer}>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  title={day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
              ))}
            </div>
            <div className={styles.timeLabels}>
              <span className={styles.timeLabel}>{daysAgoLabel}</span>
              <span className={styles.timeLabel}>{todayLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};