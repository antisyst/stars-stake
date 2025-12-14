import React from 'react';
import styles from './LanguagePicker.module.scss';
import { useI18n, LangItem } from '@/i18n';
import { motion, AnimatePresence } from 'framer-motion';

const CheckIcon = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 2 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      type: 'spring',
      stiffness: 520,
      damping: 28,
      mass: 0.6
    }}
  >
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.38, ease: 'easeOut' },
          opacity: { duration: 0.12 }
        }}
      />
    </motion.svg>
  </motion.div>
);

type Props = {
  className?: string;
  onSelect?: (code: string) => void;
};

export const LanguagePicker: React.FC<Props> = ({ className, onSelect }) => {
  const { languages, lang, setLang } = useI18n();

  const handleClick = async (code: string) => {
    try {
      await setLang(code);
      onSelect?.(code);
    } catch (e) {
      console.error('LanguagePicker: setLang failed', e);
    }
  };

  return (
    <div className={`${styles.languagePicker} ${className ?? ''}`}>
      {languages.map((l: LangItem) => {
        const selected = l.code === lang;

        return (
          <div
            key={l.code}
            className={styles.row}
            onClick={() => handleClick(l.code)}
            aria-pressed={selected}
          >
            <div className={styles.rowBody}>
              <div className={styles.labels}>
                <div className={styles.labelPrimary}>{l.label}</div>
                <div className={styles.labelSecondary}>{l.nativeLabel}</div>
              </div>
              <div className={styles.check}>
                <AnimatePresence mode="wait">
                  {selected && <CheckIcon key="check" />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};