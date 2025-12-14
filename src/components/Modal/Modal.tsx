import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mainButton } from '@telegram-apps/sdk';
import { splitContent } from '@/utils/strings';
import { ModalProps } from '@/types';
import { resolveCssVarToHex } from '@/utils/css';
import { useRates } from '@/contexts/RatesContext';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { toDate } from '@/utils/toDate';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import Table, { type TableRow } from '@/components/Table/Table';
import styles from './Modal.module.scss';
import { useI18n } from '@/i18n';

const ADD_DAYS = (d: Date, days: number) => {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + days);
  return x;
};

const formatMDYDots = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${mm}.${dd}.${yyyy}`;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  button = 'OK',
  content,
  onClose,
  children,
  mainButtonBgVar = '--app-button',
  mainButtonTextVar = '--app-button-text',
  variant = 'info',
  historyItem = null,
}) => {
  const offClickRef = useRef<null | (() => void)>(null);
  const lines = useMemo(() => splitContent(content), [content]);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const prevScrollTopRef = useRef(0);
  const prevOverflowRef = useRef<string>('');
  const prevTouchActionRef = useRef<string>('');

  const { t } = useI18n();

  const showCloseBtn = (title ?? '').trim().length <= 30;

  useEffect(() => {
    const lock = () => {
      const el = document.querySelector<HTMLElement>('.page-layout');
      scrollContainerRef.current = el || null;
      if (el) {
        prevScrollTopRef.current = el.scrollTop;
        prevOverflowRef.current = el.style.overflow || '';
        prevTouchActionRef.current = el.style.touchAction || '';
        el.style.overflow = 'hidden';
        el.style.touchAction = 'none';
      }
    };
    const unlock = () => {
      const el = scrollContainerRef.current;
      if (el) {
        el.style.overflow = prevOverflowRef.current;
        el.style.touchAction = prevTouchActionRef.current;
        el.scrollTop = prevScrollTopRef.current;
      }
    };
    if (isOpen) lock(); else unlock();
    return () => {
      const el = scrollContainerRef.current;
      if (el) {
        el.style.overflow = prevOverflowRef.current;
        el.style.touchAction = prevTouchActionRef.current;
      }
    };
  }, [isOpen]);

  const resolveMbColors = () => {
    const bg = resolveCssVarToHex(mainButtonBgVar) || undefined;
    const fg = resolveCssVarToHex(mainButtonTextVar) || undefined;
    return { bg, fg };
  };

  useEffect(() => {
    if (!isOpen) {
      try { mainButton.setParams({ isVisible: false, isLoaderVisible: false }); } catch {}
      try { mainButton.unmount(); } catch {}
      if (offClickRef.current) { offClickRef.current(); offClickRef.current = null; }
      return;
    }
    const { bg, fg } = resolveMbColors();
    try { mainButton.mount(); } catch {}
    try {
      mainButton.setParams({
        text: button,
        isVisible: true,
        isEnabled: true,
        isLoaderVisible: false,
        ...(bg ? { backgroundColor: bg } : {}),
        ...(fg ? { textColor: fg } : {}),
      } as any);
    } catch {}
    try {
      const off = mainButton.onClick(() => {
        try { mainButton.setParams({ isVisible: false, isLoaderVisible: false }); } catch {}
        try { mainButton.unmount(); } catch {}
        onClose();
      });
      offClickRef.current = off;
    } catch {}
    return () => {
      if (offClickRef.current) { offClickRef.current(); offClickRef.current = null; }
      try { mainButton.setParams({ isVisible: false, isLoaderVisible: false }); } catch {}
      try { mainButton.unmount(); } catch {}
    };
  }, [isOpen, button, onClose, mainButtonBgVar, mainButtonTextVar]);

  const stopScrollPropagation = (e: React.UIEvent | React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  const { exchangeRate } = useAppData();
  const { tonUsd } = useRates();

  const usdVal = useMemo(() => {
    if (variant !== 'history' || !historyItem) return 0;
    return exchangeRate ? historyItem.amount * exchangeRate : 0;
  }, [variant, historyItem, exchangeRate]);

  const tonVal = useMemo(() => {
    if (variant !== 'history' || !historyItem) return 0;
    return tonUsd > 0 ? usdVal / tonUsd : 0;
  }, [variant, historyItem, usdVal, tonUsd]);

  const historyRows: TableRow[] | null = useMemo(() => {
    if (variant !== 'history' || !historyItem) return null;

    const created = toDate(historyItem.createdAt);
    const unlockDate = historyItem.unlockAt ? toDate(historyItem.unlockAt) : ADD_DAYS(created, 30);
    const unlockStr = formatMDYDots(unlockDate);

    return [
      {
        label: t('modal.apy'),
        value: (
          <span className='apy-title'>
            {Number(historyItem.apy).toFixed(1)}%
          </span>
        )
      },
      {
        label: historyItem.type === 'stake' ? t('modal.stakedStars') : t('modal.amount'),
        value: (
          <>
            <StarIcon />
            {formatNumber(historyItem.amount)}
          </>
        ),
      },
      { label: t('modal.approxUsd'), value: `$${formatNumber(Number(usdVal.toFixed(2)))}` },
      { label: t('modal.approxTon'), value: tonVal ? `${tonVal.toFixed(3)} TON` : '—' },
      { label: t('modal.lockPeriod'), value: t('modal.lockPeriodValue').replace('{days}', '30') },
      { label: t('modal.unlockDate'), value: unlockStr }
    ];
  }, [variant, historyItem, usdVal, tonVal, t]);

  const renderBody = () => {
    if (variant === 'history' && historyItem && historyRows) {
      return <Table rows={historyRows} />;
    }
    if ((lines?.length ?? 0) > 0) {
      return (
        <ul className={styles.list}>
          {lines.map((txt, i) => (<li key={i}>{txt}</li>))}
        </ul>
      );
    }
    return children;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          onWheel={stopScrollPropagation}
          onTouchMove={stopScrollPropagation}
          initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          animate={{ backgroundColor: 'rgba(0, 0, 0, 0.41)' }}
          exit={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.58, 1] }}
          >
            <div className={styles.header}>
              <h3 className={styles.title}>{title}</h3>
              {showCloseBtn && (
                <button
                  className={styles.closeBtn}
                  onClick={onClose}
                  type="button"
                  aria-label={t('modal.close')}
                >
                  {t('modal.close')}
                </button>
              )}
            </div>
            <div className={styles.content}>
              {renderBody()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};