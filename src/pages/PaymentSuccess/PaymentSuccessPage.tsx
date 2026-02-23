import React, { useMemo } from 'react';
import { Page } from '@/components/Page';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, type Variants, type Transition } from 'framer-motion';
import { useAppData } from '@/contexts/AppDataContext';
import { useRates } from '@/contexts/RatesContext';
import { formatNumber } from '@/utils/formatNumber';
import SuccessCheck from '@/components/SuccessCheck/SuccessCheck';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './PaymentSuccessPage.module.scss';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';

export const PaymentSuccessPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const paid = Number(params.get('paid') ?? 0);
  const requested = Number(params.get('requested') ?? 0);
  const apy = Number(params.get('apy') ?? 0);
  const unlock = params.get('unlock') ?? '';
  const lockDays = 30;

  const { exchangeRate } = useAppData();
  const { tonUsd } = useRates();
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();

  const usdVal = useMemo(() => (exchangeRate ? paid * exchangeRate : 0), [paid, exchangeRate]);
  const tonVal = useMemo(() => (tonUsd > 0 ? usdVal / tonUsd : 0), [usdVal, tonUsd]);

  const formattedFiat = useMemo(() => formatFromUsd(usdVal, 2), [formatFromUsd, usdVal]);

  const easeOutExpo: NonNullable<Transition['ease']> =
    [0.16, 1, 0.3, 1];

  const shellVariants: Variants = {
    initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(8px)' },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.22, ease: easeOutExpo }
    }
  };

  return (
    <Page back>
      <div className={styles.wrap}>
        <motion.div
          className={styles.island}
          variants={shellVariants}
          initial="initial"
          animate="animate"
          aria-live="polite"
        >
          <div className={styles.iconWrap} aria-hidden="true">
            <SuccessCheck size={130} />
          </div>

          <h2 className={styles.title}>{t('paymentSuccess.title')}</h2>
          <p className={styles.subtitle}>{t('paymentSuccess.subtitle').replace('{days}', String(lockDays))}</p>

          <div className={styles.detailsCard} role="list">
            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.apy')}</span>
              <span className={`${styles.itemValue} ${styles.apyTitle}`}>
                {Number.isFinite(apy) ? apy.toFixed(1) : '—'}%
              </span>
            </div>

            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.stakedStars')}</span>
              <span className={styles.itemValue}>
                <StarIcon />
                <strong>{formatNumber(paid)}</strong>
              </span>
            </div>

            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.approxFiatLabel').replace('{fiat}', formattedFiat.split(/\s/)[0])}</span>
              <span className={styles.itemValue}>{formattedFiat}</span>
            </div>

            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.approxTonLabel')}</span>
              <span className={styles.itemValue}>{tonVal ? tonVal.toFixed(3) : '—'} TON</span>
            </div>

            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.lockPeriod')}</span>
              <span className={styles.itemValue}>{lockDays} days</span>
            </div>

            <div className={styles.item} role="listitem">
              <span className={styles.itemLabel}>{t('paymentSuccess.unlockDate')}</span>
              <span className={styles.itemValue}>{unlock || '—'}</span>
            </div>
          </div>

          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/home', { replace: true })}
            aria-label={t('paymentSuccess.back')}
          >
            {t('paymentSuccess.back')}
          </button>

          {requested > paid ? (
            <p className={styles.note}>
              {t('paymentSuccess.note').replace('{requested}', String(requested)).replace('{paid}', String(paid))}
            </p>
          ) : null}
        </motion.div>
      </div>
    </Page>
  );
}