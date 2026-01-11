import React from 'react';
import styles from './GroupList.module.scss';
import ChevronIcon from '@/assets/icons/arrow-right.svg?react';

export type GroupListItem = {
  key: string;
  label: string;
  value?: string | number | React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  onClick?: () => void;
  hideChevron?: boolean;
  ariaLabel?: string;
};

type Props = {
  items: GroupListItem[];
};

export const GroupList: React.FC<Props> = ({ items }) => {
  return (
    <div className={`${styles.groupList} glass-card`}>
      {items.map((item) => {
        const actionable = typeof item.onClick === 'function';
        const showChevron = actionable && !item.hideChevron;

        return (
          <div
            key={item.key}
            data-key={item.key} 
            className={`${styles.row} ${actionable ? styles.actionable : styles.informative}`}
            onClick={() => { if (actionable) item.onClick?.(); }}
            role={actionable ? 'button' : 'group'}
            aria-label={item.ariaLabel ?? item.label}
            tabIndex={actionable ? 0 : -1}
            onKeyDown={(e) => { if (actionable && (e.key === 'Enter' || e.key === ' ')) item.onClick?.(); }}
          >
            <div className={styles.left}>
              <div className={styles.iconWrapper} style={{ background: item.iconBg || 'transparent' }}>
                {item.icon}
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.label}>{item.label}</div>

              <div className={styles.value}>
                {item.value ?? ''}
                {showChevron && <ChevronIcon className='arrow-icon' />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};