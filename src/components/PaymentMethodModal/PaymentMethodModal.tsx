import React from 'react';
import styles from './PaymentMethodModal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  onChooseStars: () => void;
  onChooseTon: () => void;
  starsAmountLabel: string; // e.g. "5,000 Stars ≈ $99.50 ≈ 12.345 TON"
};

export const PaymentMethodModal: React.FC<Props> = ({
  open, onClose, onChooseStars, onChooseTon, starsAmountLabel
}) => {
  if (!open) return null;
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3>Choose payment</h3>
          <button className={styles.x} onClick={onClose} aria-label="Close">✕</button>
        </header>
        <p className={styles.caption}>{starsAmountLabel}</p>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={onChooseStars}>
            Pay with Stars (Telegram)
          </button>
          <button className={styles.secondary} onClick={onChooseTon}>
            Pay with TON (TonConnect)
          </button>
        </div>
      </div>
    </div>
  );
};
