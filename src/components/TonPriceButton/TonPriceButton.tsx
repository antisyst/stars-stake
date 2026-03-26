import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRates } from '@/contexts/RatesContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import TonIcon from '@/assets/icons/toncoin-simple.svg?react';
import styles from './TonPriceButton.module.scss';

export const TonPriceButton: React.FC = () => {
  const { tonUsd, loading } = useRates();
  const { convertUsdToSelected, symbolFor, selected } = useCurrency();
  const navigate = useNavigate();

  const priceInSelected = useMemo(() => {
    if (!tonUsd || tonUsd <= 0) return null;
    return convertUsdToSelected(tonUsd);
  }, [tonUsd, convertUsdToSelected]);

  const formattedPrice = useMemo(() => {
    if (priceInSelected === null) return '—';
    const sym = symbolFor(selected);
    if (priceInSelected >= 1000) return `${sym}${priceInSelected.toFixed(0)}`;
    if (priceInSelected >= 10) return `${sym}${priceInSelected.toFixed(2)}`;
    return `${sym}${priceInSelected.toFixed(3)}`;
  }, [priceInSelected, selected, symbolFor]);

  return (
    <button
      className={styles.tonPriceButton}
      onClick={() => navigate('/ton-market')}
      aria-label="View TON price details"
    >
      <TonIcon className="text-icon" />
      <span className={`${styles.price} ${loading ? styles.loading : ''}`}>
        {formattedPrice}
      </span>
    </button>
  );
};