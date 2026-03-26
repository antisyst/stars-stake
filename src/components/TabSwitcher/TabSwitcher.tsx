import React from 'react';
import { motion } from 'framer-motion';
import styles from './TabSwitcher.module.scss';

export type TabRange = '1D' | '1W' | '1M' | '1Y' | 'All';

interface TabSwitcherProps {
  active: TabRange;
  onChange: (range: TabRange) => void;
}

const TABS: TabRange[] = ['1D', '1W', '1M', '1Y', 'All'];

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ active, onChange }) => {
  return (
    <div className={styles.tabSwitcher} role="tablist" aria-label="Time range">
      {TABS.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          className={`${styles.tab} ${active === tab ? styles.active : ''}`}
          onClick={() => onChange(tab)}
        >
          {active === tab && (
            <motion.div
              className={styles.pill}
              layoutId="tab-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            />
          )}
          <span className={styles.label}>{tab}</span>
        </button>
      ))}
    </div>
  );
};