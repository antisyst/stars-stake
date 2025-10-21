import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mainButton } from '@telegram-apps/sdk';
import { splitContent } from '@/utils/strings';
import { ModalProps } from '@/types';
import { resolveCssVarToHex } from '@/utils/css';
import styles from './Modal.module.scss';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  button = 'OK',
  content,
  onClose,
  children,
  mainButtonBgVar = '--app-button',
  mainButtonTextVar = '--app-button-text',
}) => {
  const offClickRef = useRef<null | (() => void)>(null);
  const lines = useMemo(() => splitContent(content), [content]);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const prevScrollTopRef = useRef(0);
  const prevOverflowRef = useRef<string>('');
  const prevTouchActionRef = useRef<string>('');

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

    if (isOpen) lock();
    else unlock();

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
                  aria-label="Close"
                >
                  Close
                </button>
              )}
            </div>
            <div className={styles.content}>
              {lines.length ? (
                <ul className={styles.list}>
                  {lines.map((txt, i) => (<li key={i}>{txt}</li>))}
                </ul>
              ) : (
                children
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};