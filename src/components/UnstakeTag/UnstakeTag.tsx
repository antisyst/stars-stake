import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MinusIcon from '@/assets/icons/minus.svg?react';
import styles from './UnstakeTag.module.scss';

interface UnstakeTagProps {
  text: string;
}

export const UnstakeTag: React.FC<UnstakeTagProps> = ({ text }) => {
  const tagSizerRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [tagW, setTagW] = useState(0);

  useLayoutEffect(() => {
    const el = tagSizerRef.current;
    if (!el) return;
    setTagW(Math.ceil(el.getBoundingClientRect().width));
  }, [text]);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    if (tagW > 0) pill.style.setProperty('--pill-w', `${tagW}px`);
  }, [tagW]);

  return (
    <div className={styles.shell}>
      <span ref={tagSizerRef} className={styles.sizer} aria-hidden="true">
        <span className={styles.sizerIconSlot} />
        <span className={styles.label}>{text}</span>
      </span>

      <motion.div
        ref={pillRef}
        className={styles.pill}
        initial={false}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.75 }}
      >
        <motion.span
          className={styles.tagContent}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9, y: 4 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.6 }}
        >
          <motion.span
            className={styles.iconWrap}
            initial={{ scale: 0.92, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
          >
            <MinusIcon className="accent-icon" />
          </motion.span>
          <span className={styles.label}>{text}</span>
        </motion.span>
      </motion.div>
    </div>
  );
};