import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddIcon from '@/assets/icons/add.svg?react';
import TonIcon from '@/assets/icons/toncoin-symbol.svg?react';
import { useI18n } from '@/i18n';
import styles from './DepositTag.module.scss';

interface DepositTagProps {
  text: string;
  tonMode?: boolean;
  tonAmount?: number;
  paying?: boolean;
  payStep?: 'connect' | 'send' | 'verify' | null;
  onTonPress?: () => void;
}

export const DepositTag: React.FC<DepositTagProps> = ({
  text,
  tonMode = false,
  tonAmount = 0,
  paying = false,
  payStep = null,
  onTonPress,
}) => {
  const { t } = useI18n();

  const tagSizerRef = useRef<HTMLSpanElement>(null);
  const tonSizerRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const [tagW, setTagW] = useState(0);
  const [tonW, setTonW] = useState(0);

  useLayoutEffect(() => {
    const el = tagSizerRef.current;
    if (!el) return;
    setTagW(Math.ceil(el.getBoundingClientRect().width));
  }, [text]);

  useLayoutEffect(() => {
    const el = tonSizerRef.current;
    if (!el) return;
    setTonW(Math.ceil(el.getBoundingClientRect().width));
  }, [tonAmount, paying, payStep]);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const target = tonMode ? tonW : tagW;
    if (target > 0) {
      pill.style.setProperty('--pill-w', `${target}px`);
    }
  }, [tonMode, tagW, tonW]);

  const tonLabel = useMemo(
    () => getTonLabel(paying, payStep, tonAmount),
    [paying, payStep, tonAmount],
  );

  const stakeWithTemplate = t('deposit.stakeWith', 'Stake with {amount}');
  const [stakeWithBefore, stakeWithAfter] = useMemo(() => {
    const parts = stakeWithTemplate.split('{amount}');
    return [parts[0] ?? '', parts[1] ?? ''];
  }, [stakeWithTemplate]);

  const amtLabel = tonAmount > 0 ? tonAmount.toFixed(3) : '';

  return (
    <div className={styles.shell}>
      <span ref={tagSizerRef} className={styles.sizer} aria-hidden="true">
        <span className={styles.sizerIconSlot} />
        <span className={styles.label}>{text}</span>
      </span>

      <span
        ref={tonSizerRef}
        className={`${styles.sizer} ${styles.sizerTon}`}
        aria-hidden="true"
      >
        {paying ? (
          <>
            <span className={styles.payingDotSizer} />
            <span className={styles.tonLabel}>{tonLabel}</span>
          </>
        ) : (
          <>
            {stakeWithBefore ? (
              <span className={styles.stakeWith}>{stakeWithBefore}</span>
            ) : null}
            <span className={styles.tonIconSizer} />
            <span className={styles.tonAmt}>{amtLabel}</span>
            {stakeWithAfter ? (
              <span className={styles.stakeWith}>{stakeWithAfter}</span>
            ) : null}
          </>
        )}
      </span>

      <motion.div
        ref={pillRef}
        className={`${styles.pill} ${tonMode ? styles.tonMode : ''} ${paying ? styles.paying : ''}`}
        onClick={tonMode && !paying ? onTonPress : undefined}
        role={tonMode && !paying ? 'button' : undefined}
        tabIndex={tonMode && !paying ? 0 : undefined}
        aria-label={tonMode ? 'Pay with TON' : undefined}
        aria-busy={paying}
        initial={false}
        animate={{
          scale: paying ? 0.985 : 1,
          y: paying ? -0.5 : 0,
          opacity: paying ? 0.92 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 520,
          damping: 34,
          mass: 0.75,
        }}
        whileTap={
          tonMode && !paying
            ? { scale: 0.965, y: 0.5 }
            : undefined
        }
      >
        <AnimatePresence initial={false} mode="wait">
          {!tonMode ? (
            <motion.span
              key="tag-content"
              className={styles.tagContent}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9, y: 4 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.94, y: -4 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 26,
                mass: 0.6,
              }}
            >
              <motion.span
                className={styles.iconWrap}
                initial={{ scale: 0.92, rotate: -6, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 520,
                  damping: 22,
                }}
              >
                <AddIcon className="green-icon" />
              </motion.span>
              <span className={styles.label}>{text}</span>
            </motion.span>
          ) : (
            <motion.span
              key={paying ? `ton-paying-${payStep}` : 'ton-idle'}
              className={styles.tonContent}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9, y: 4 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.94, y: -4 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 26,
                mass: 0.6,
              }}
            >
              {paying ? (
                <>
                  <motion.span
                    className={styles.payingDot}
                    aria-hidden="true"
                    initial={{ scale: 0.7, opacity: 0.35 }}
                    animate={{
                      scale: [0.82, 1.18, 0.82],
                      opacity: [0.35, 1, 0.35],
                    }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className={styles.tonLabel}>{tonLabel}</span>
                </>
              ) : (
                <>
                  {stakeWithBefore ? (
                    <span className={styles.stakeWith}>{stakeWithBefore}</span>
                  ) : null}
                  <motion.span
                    initial={{ scale: 0.94, rotate: -8, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 520,
                      damping: 22,
                    }}
                  >
                    <TonIcon className={`secondary-icon ${styles.tonIcon}`} />
                  </motion.span>
                  <span className={styles.tonAmt}>{amtLabel}</span>
                  {stakeWithAfter ? (
                    <span className={styles.stakeWith}>{stakeWithAfter}</span>
                  ) : null}
                </>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

function getTonLabel(
  paying: boolean,
  payStep: 'connect' | 'send' | 'verify' | null,
  tonAmount: number,
): string {
  if (!paying) return tonAmount > 0 ? `${tonAmount.toFixed(3)} TON` : 'TON';

  switch (payStep) {
    case 'connect':
      return 'Connecting…';
    case 'send':
      return 'Confirm in wallet…';
    case 'verify':
      return 'Verifying…';
    default:
      return 'Processing…';
  }
}