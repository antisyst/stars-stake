import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SuccessCheck.module.scss';
import CheckSuccessIcon from '@/assets/icons/check-success.svg?react';

type Props = {
  size?: number;
  show?: boolean;
  ariaLabel?: string;
};

const SuccessCheck: React.FC<Props> = ({
  size = 120,
  show = true,
  ariaLabel = 'Success'
}) => {
  const popDur = 0.22;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="success-check"
          className={styles.root}
          role="img"
          aria-label={ariaLabel}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
          transition={{ type: 'tween', duration: popDur, ease: 'easeOut' }}
          style={{ width: size, height: size }}
        >
          <motion.div
            className={styles.halo}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0.0, 0.24, 0], scale: [1, 1.16, 1.25] }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.06 }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.icon}
            initial={{ opacity: 0, scale: 0.84 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut', delay: 0.08 }}
          >
            <CheckSuccessIcon />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessCheck;