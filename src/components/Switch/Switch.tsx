import React from 'react';
import { motion } from 'framer-motion';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) => (
  <motion.button
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    className={[styles.switch, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
    animate={{ backgroundColor: checked ? '#34c759' : 'var(--app-secondary-bg)' }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    onClick={() => onChange(!checked)}
    type="button"
  >
    <motion.span
      className={styles.thumb}
      animate={{ x: checked ? 22 : 0 }} 
      transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.8 }}
    />
  </motion.button>
);