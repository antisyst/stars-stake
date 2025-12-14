import React, { useMemo, useRef, useState } from 'react';
import { tierForTotal, formatApy, projectedAfterOneYear } from '@/utils/apy';
import { formatNumber } from '@/utils/formatNumber';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import ChevronIcon from '@/assets/icons/chevron-up.svg?react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useRates } from '@/contexts/RatesContext';
import styles from './ApyPreview.module.scss';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';

type Props = {
  currentBalance: number;
  inputAmount: number;
  exchangeRate: number;
  inputId?: string;
  inputFocused?: boolean;
};

const containerVariants: Variants = {
  initial: { y: 28, opacity: 0, filter: 'blur(6px)' },
  animate: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: 'tween', duration: 0.22 } },
  exit:    { y: 28, opacity: 0, filter: 'blur(6px)', transition: { type: 'tween', duration: 0.18 } },
};

const compactFade: Variants = {
  show: { opacity: 1, height: 'auto', transition: { duration: 0.16 } },
  hide: { opacity: 0, height: 0, transition: { duration: 0.14 } },
};

const overlayVariants: Variants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(12px)',
    transition: { duration: 0.12, ease: 'linear' }
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.12, ease: 'linear' }
  },
};

const detailsVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    y: -6,
    filter: 'blur(6px)',
    borderRadius: 16,
    scale: 0.98,
    transition: { duration: 0.16 }
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    y: 0,
    filter: 'blur(0px)',
    borderRadius: 12,
    scale: 1,
    transition: { type: 'tween', duration: 0.22 }
  },
};

export const ApyPreview: React.FC<Props> = ({
  currentBalance,
  inputAmount,
  exchangeRate,
  inputId = 'amount',
  inputFocused = false,
}) => {
  const { tonUsd } = useRates();
  const lp = useLaunchParams();
  const isMobile = ['ios', 'android'].includes(lp.platform);
  const baseRotation = lp.platform === 'ios' ? 90 : 0;
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();

  const [expanded, setExpanded] = useState(false);
  const wasFocusedRef = useRef(false);

  const view = useMemo(() => {
    const amt = Math.max(0, inputAmount || 0);
    if (!amt) return null;

    const newTotal = (currentBalance || 0) + amt;
    const { apy } = tierForTotal(newTotal);

    const afterYear = projectedAfterOneYear(amt, apy);
    const yearlyGain  = Math.max(0, Math.floor(afterYear - amt));
    const monthlyGain = Math.max(0, Math.floor(yearlyGain / 12));
    const dailyGain   = Math.max(0, Math.floor(yearlyGain / 365));

    const toUSD = (x: number) => x * (exchangeRate || 0);
    const toTON = (x: number) => {
      const usd = toUSD(x);
      return tonUsd > 0 ? (usd / tonUsd) : 0;
    };

    return {
      apy,
      yearlyGain, monthlyGain, dailyGain,
      usd: { y: toUSD(yearlyGain), m: toUSD(monthlyGain), d: toUSD(dailyGain) },
      ton: { y: toTON(yearlyGain), m: toTON(monthlyGain), d: toTON(dailyGain) },
    };
  }, [currentBalance, inputAmount, exchangeRate, tonUsd]);

  if (!view) return null;

  const refocusInput = () => {
    if (isMobile && wasFocusedRef.current) {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      el?.focus({ preventScroll: true });
    }
  };

  const handleToggle = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    wasFocusedRef.current = inputFocused;
    setExpanded((p) => !p);
    if (expanded) {
      setTimeout(refocusInput, 0);
    } else {
      if (isMobile && inputFocused) {
        setTimeout(refocusInput, 0);
      }
    }
  };

  const focusPhaseKey = inputFocused ? 'phase-focus' : 'phase-blur';

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.button
            type="button"
            className={styles.overlay}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={overlayVariants}
            aria-label={t('apy.collapseDetails')}
            onClick={() => handleToggle()}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={styles.apyLine}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        aria-live="polite"
        data-expanded={expanded ? '1' : '0'}
      >
        <motion.div
          key={focusPhaseKey}
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'tween', duration: 0.22 } }}
        >
          <div className={styles.row}>
            <div className={styles.apyInfo}>
              <span className={styles.label}>{t('apy.estimatedYield')}</span>

              <motion.span
                className={styles.value}
                variants={compactFade}
                animate={expanded ? 'hide' : 'show'}
              >
                <span className={styles.title}>{formatApy(view.apy)}%</span>
              </motion.span>
            </div>

            <div className={styles.rowRightSide}>
              <motion.span
                className={styles.gainProfitValue}
                variants={compactFade}
                animate={expanded ? 'hide' : 'show'}
              >
                <span className={styles.yearlyGain}>
                  +{formatNumber(view.yearlyGain)} <StarIcon /> {t('apy.perYear')}
                </span>
              </motion.span>

              <button
                type="button"
                className={`${styles.toggle} gradient-move`}
                onMouseDown={(e) => { e.preventDefault(); }}
                onTouchStart={(e) => { e.preventDefault(); }}
                onClick={handleToggle}
                aria-expanded={expanded}
                aria-label={expanded ? t('apy.collapseDetails') : t('apy.expandDetails')}
              >
                <motion.span
                  className={styles.chevronWrap}
                  animate={{ rotate: (expanded ? 180 : 0) + baseRotation }}
                  transition={{ type: 'tween', duration: 0.18 }}
                >
                  <ChevronIcon />
                </motion.span>
              </button>
            </div>
          </div>
          <AnimatePresence initial={false} mode="wait">
            {expanded && (
              <motion.div
                key="details"
                className={styles.details}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={detailsVariants}
              >
                <div className={styles.list} role="list">
                  <div className={styles.item} role="listitem">
                    <span className={styles.itemLabel}>{t('apy.estimatedYield')}</span>
                    <span className={`${styles.itemValue} ${styles.apyTitle}`}>{formatApy(view.apy)}%</span>
                  </div>
                  <div className={styles.item} role="listitem">
                    <span className={styles.itemLabel}>{t('apy.yearly')}</span>
                    <span className={styles.itemValue}>
                      +{formatNumber(view.yearlyGain)} <StarIcon />
                      <span className={styles.sep}>·</span>{formatFromUsd(view.usd.y, 2)}
                      <span className={styles.sep}>·</span>{view.ton.y ? view.ton.y.toFixed(3) : '—'} TON
                    </span>
                  </div>
                  <div className={styles.item} role="listitem">
                    <span className={styles.itemLabel}>{t('apy.monthly')}</span>
                    <span className={styles.itemValue}>
                      +{formatNumber(view.monthlyGain)} <StarIcon />
                      <span className={styles.sep}>·</span>{formatFromUsd(view.usd.m, 2)}
                      <span className={styles.sep}>·</span>{view.ton.m ? view.ton.m.toFixed(3) : '—'} TON
                    </span>
                  </div>
                  <div className={styles.item} role="listitem">
                    <span className={styles.itemLabel}>{t('apy.daily')}</span>
                    <span className={styles.itemValue}>
                      +{formatNumber(view.dailyGain)} <StarIcon />
                      <span className={styles.sep}>·</span>{formatFromUsd(view.usd.d, 2)}
                      <span className={styles.sep}>·</span>{view.ton.d ? view.ton.d.toFixed(3) : '—'} TON
                    </span>
                  </div>
                  <div className={styles.item} role="listitem" aria-label={t('apy.minimumLock')}>
                    <span className={styles.itemLabel}>{t('apy.minimumLock')}</span>
                    <span className={styles.itemValue}>
                      {t('apy.minimumLockValue').replace('{days}', '30')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};