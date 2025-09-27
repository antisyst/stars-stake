import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number; // 0..100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const safe = useMemo(() => Math.max(0, Math.min(100, value || 0)), [value]);

  return (
    <div className={styles.track} aria-label="Loading progress">
      <motion.div
        className={styles.fill}
        initial={{ width: '0%' }}
        animate={{ width: `${safe}%` }}
        transition={{ type: 'tween', ease: 'linear', duration: 0.25 }}
      />
    </div>
  );
};