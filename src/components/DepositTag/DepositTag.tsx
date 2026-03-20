import React from 'react';
import { motion } from 'framer-motion';
import AddIcon from '@/assets/icons/add.svg?react';
import styles from './DepositTag.module.scss';

interface DepositTagProps {
  text: string;
}

export const DepositTag: React.FC<DepositTagProps> = ({ text }) => {
  return (
    <motion.div
      className={styles.depositTag}
      initial={{ scaleX: 0.18, scaleY: 0.72, opacity: 0, borderRadius: 40 }}
      animate={{ scaleX: 1, scaleY: 1, opacity: 1, borderRadius: 12 }}
      transition={{
        duration: 0.52,
        ease: [0.23, 1.1, 0.32, 1],
        opacity: { duration: 0.18, ease: 'easeOut' },
        borderRadius: { duration: 0.48, ease: [0.23, 1.1, 0.32, 1] },
      }}
    >
      <motion.span
        className={styles.iconWrap}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.22, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <AddIcon className="green-icon" />
      </motion.span>

      <motion.span
        className={styles.label}
        initial={{ opacity: 0, x: -6, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.28, duration: 0.32, ease: 'easeOut' }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
};