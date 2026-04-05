import React from 'react';
import styles from './PrimaryButton.module.scss';

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`${styles.primaryButton} ${loading ? styles.isLoading : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      <span className={styles.glassHighlight} aria-hidden />
      <span className={styles.label}>{label}</span>
      {loading && (
        <span className={styles.spinner} aria-hidden>
          <span className={styles.spinnerInner} />
        </span>
      )}
    </button>
  );
};

export default PrimaryButton;