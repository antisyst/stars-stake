import React, { useRef } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';
import { motion, Variants } from 'framer-motion';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './UnstakeBalancePreview.module.scss';

interface UnstakeBalancePreviewProps {
  balance: number;
  exchangeRate: number;
  onMax: () => void;
  inputFocused?: boolean;
  inputId?: string;
  isMobile?: boolean;
}

const containerVariants: Variants = {
  initial: { y: 28, opacity: 0, filter: 'blur(6px)' },
  animate: { y: 0,  opacity: 1, filter: 'blur(0px)', transition: { type: 'tween', duration: 0.22 } },
  exit:    { y: 28, opacity: 0, filter: 'blur(6px)', transition: { type: 'tween', duration: 0.18 } },
};

export const UnstakeBalancePreview: React.FC<UnstakeBalancePreviewProps> = ({
  balance,
  exchangeRate,
  onMax,
  inputFocused = false,
  inputId = 'unstake-amount',
  isMobile = false,
}) => {
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();
  const wasFocusedRef = useRef(false);

  const usdVal = balance * (exchangeRate ?? 0);

  const refocusInput = () => {
    if (isMobile && wasFocusedRef.current) {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      el?.focus({ preventScroll: true });
    }
  };

  const handleMaxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    wasFocusedRef.current = inputFocused;
    onMax();
    setTimeout(refocusInput, 0);
  };

  return (
    <motion.div
      className={styles.balanceLine}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      aria-live="polite"
    >
      <div className={styles.row}>
        <div className={styles.balanceInfo}>
          <span className={styles.label}>{t('unstake.availableBalance')}</span>
          <div className={styles.balanceRow}>
            <StarIcon className={styles.starIcon} />
            <span className={styles.amount}>{formatNumber(balance)}</span>
            <span className={styles.usd}>≈ {formatFromUsd(usdVal, 2)}</span>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.maxButton} gradient-move`}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onClick={handleMaxClick}
          disabled={balance <= 0}
          aria-label={t('unstake.maxAria')}
        >
          {t('unstake.max')}
        </button>
      </div>
    </motion.div>
  );
};