import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Page } from '@/components/Page';
import { useLocation, useNavigate } from 'react-router-dom';
import { mainButton } from '@telegram-apps/sdk';
import { miniApp, useLaunchParams } from '@telegram-apps/sdk-react';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { MIN_DEPOSIT, parseAmountInput, isValidDeposit } from '@/utils/deposit';
import { resolveCssVarToHex } from '@/utils/css';
import { ApyPreview } from '@/components/ApyPreview/ApyPreview';
import { AnimatePresence } from 'framer-motion';
import { useRates } from '@/contexts/RatesContext';
import { formatForInput } from '@/utils/formatForInput';
import { tdesktopInputShields } from '@/utils/tdesktopShields';
import { inputNoSelectGuards, composeInputProps } from '@/utils/inputGuards';
import AddIcon from '@/assets/icons/add.svg?react';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './DepositPage.module.scss';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';
import { STAKE_PROMO_EVENT, isStakePromoActive, getStakePromoResult } from '@/utils/stakePromo';

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, exchangeRate } = useAppData();
  const { tonUsd } = useRates();
  const lp = useLaunchParams();
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();

  const isMobile = ['ios', 'android'].includes(lp.platform);
  const isTDesktop = lp.platform === 'tdesktop';

  const [raw, setRaw] = useState<string>('');
  const amount = useMemo(() => parseAmountInput(raw), [raw]);
  const valid = isValidDeposit(amount);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const hasStakedBefore = (user?.starsBalance ?? 0) > 0;
  const buttonText = hasStakedBefore ? t('deposit.buttonDeposit') : t('deposit.buttonConfirmStake');
  const tagText = hasStakedBefore ? t('deposit.tagDeposit') : t('deposit.tagStake');

  const enabledBg = resolveCssVarToHex('--app-button') || undefined;
  const enabledFg = resolveCssVarToHex('--app-button-text') || undefined;

  const disabledBgVar = isTDesktop ? '--app-secondary-bg' : '--app-header-bg';
  const disabledFgVar = isTDesktop ? '--app-subtitle' : '--app-section-separator';
  const disabledBg = resolveCssVarToHex(disabledBgVar) || undefined;
  const disabledFg = resolveCssVarToHex(disabledFgVar) || undefined;

  const mountedRef = useRef(false);

  // UI-only promo preview (final promo application still happens in PaymentInit with server time)
  const promoNow = useMemo(() => new Date(), []);
  const promoActive = useMemo(() => isStakePromoActive(promoNow, STAKE_PROMO_EVENT), [promoNow]);
  const promoPreview = useMemo(() => getStakePromoResult(amount || 0, promoNow, STAKE_PROMO_EVENT), [amount, promoNow]);

  // ✅ Only show "You will stake" when amount is valid (so below MIN_DEPOSIT it won't appear)
  const showStakePreview = promoActive && valid && amount >= MIN_DEPOSIT && promoPreview.creditedAmount > 0;

  useEffect(() => {
    const hex = resolveCssVarToHex('--app-section-bg');
    try { miniApp.setHeaderColor((hex || 'secondary_bg_color') as any); } catch {}
    return () => { try { miniApp.setHeaderColor('secondary_bg_color'); } catch {} };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.click();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const applyButtonStyle = (enabled: boolean) => {
    try {
      mainButton.setParams({
        text: buttonText,
        isVisible: true,
        isEnabled: enabled,
        isLoaderVisible: false,
        hasShineEffect: enabled,
        ...(enabled
          ? (enabledBg ? { backgroundColor: enabledBg } : {})
          : (disabledBg ? { backgroundColor: disabledBg } : {})),
        ...(enabled
          ? (enabledFg ? { textColor: enabledFg } : {})
          : (disabledFg ? { textColor: disabledFg } : {})),
      } as any);
    } catch {}
  };

  const resetToDefaultTheme = () => {
    const defBg = resolveCssVarToHex('--app-button') || undefined;
    const defFg = resolveCssVarToHex('--app-button-text') || undefined;
    try {
      mainButton.setParams({
        isVisible: false,
        isLoaderVisible: false,
        ...(defBg ? { backgroundColor: defBg } : {}),
        ...(defFg ? { textColor: defFg } : {}),
      } as any);
    } catch {}
  };

  useEffect(() => {
    try { mainButton.mount(); mountedRef.current = true; } catch {}
    applyButtonStyle(valid);
    return () => {
      resetToDefaultTheme();
      try { if (mainButton.isMounted?.()) mainButton.unmount(); } catch {}
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyButtonStyle(valid);
  }, [valid, buttonText, enabledBg, enabledFg, disabledBg, disabledFg]);

  useEffect(() => {
    let off: (() => void) | undefined;
    try {
      off = mainButton.onClick(() => {
        if (!mountedRef.current || !valid) return;
        try { mainButton.setParams({ isLoaderVisible: true, isEnabled: false }); } catch {}
        navigate(`/payment/init?amount=${amount}`, { replace: true, state: { from: location.pathname } });
      });
    } catch {}
    return () => { try { off?.(); } catch {} };
  }, [valid, amount, navigate, location.pathname]);

  const displayValue = raw === '' ? '' : formatForInput(parseAmountInput(raw));

  // USD/TON note is based on credited amount when promo is active, otherwise base amount.
  const amountForQuote = showStakePreview ? promoPreview.creditedAmount : amount;
  const usdVal = (amountForQuote || 0) * (exchangeRate ?? 0);
  const tonVal = (tonUsd > 0 && usdVal > 0) ? (usdVal / tonUsd) : 0;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    const n = parseAmountInput(cleaned);
    setRaw(n === 0 ? '' : String(n));
  };

  const noSelect = useMemo(() => inputNoSelectGuards(), []);
  const shields = useMemo(() => tdesktopInputShields(isTDesktop), [isTDesktop]);
  const inputProps = useMemo(() => composeInputProps(noSelect, shields), [noSelect, shields]);

  const sizerRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const s = sizerRef.current;
    if (!s) return;
    s.textContent = displayValue === '' ? '0' : displayValue;
    if (displayValue === '') s.classList.remove(styles.hasValueStroke);
    else s.classList.add(styles.hasValueStroke);
    const w = Math.ceil(s.getBoundingClientRect().width) + 6;
    setInputWidth(w);
  }, [displayValue]);

  const currentBalance = user?.starsBalance ?? 0;

  useEffect(() => {
    setFocused(false);
  }, [location.key]);

  const apyKey = isMobile ? (focused ? 'focus' : 'blur') : 'stable';

  return (
    <Page back backTo="/home">
      <div className={styles.depositPage} key={`deposit-${location.key}`}>
        <div className={styles.depositLayout}>
          <div className={styles.depositTag}>
            <AddIcon className="green-icon" />
            <span>{tagText}</span>
          </div>

          <div className={styles.mainDepositContainer}>
            <div className={styles.inputCard}>
              <StarIcon />
              <div className={styles.inputWrapper}>
                <span ref={sizerRef} className={`${styles.sizer} ${styles.amountText}`} aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${styles.input} ${styles.amountText} ${displayValue !== '' ? styles.hasValueStroke : ''}`}
                  placeholder="0"
                  value={displayValue}
                  onChange={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  aria-label={t('deposit.stakeAmountAria')}
                  style={{ width: inputWidth ? `${inputWidth}px` : undefined }}
                  autoFocus
                  {...inputProps}
                />
              </div>
            </div>
            {showStakePreview ? (
              <div className={styles.infoTitle} style={{ marginTop: 8 }}>
                <p className={styles.usdNote}>
                  <StarIcon />&nbsp;
                  <span className={styles.stakePromoPreview}>{formatNumber(promoPreview.creditedAmount)}</span>
                  {promoPreview.bonusAmount > 0 ? (
                    <span className={styles.boostLabel}>
                        {promoPreview.boostLabel}
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}

            <div className={styles.infoTitle}>
              {displayValue === '' ? (
                <p className={styles.usdNote}>
                  1&nbsp;<StarIcon />&nbsp;≈&nbsp;{formatFromUsd(exchangeRate, 4)}
                </p>
              ) : amount > 0 && amount < MIN_DEPOSIT ? (
                <p className={styles.warning}>
                  {t('deposit.minDepositWarning').replace('{min}', String(formatNumber(MIN_DEPOSIT)))}
                </p>
              ) : valid ? (
                <p className={styles.usdNote}>
                  ≈ {formatFromUsd(usdVal, 2)}&nbsp;≈ {tonVal ? tonVal.toFixed(3) : '—'} TON
                  {showStakePreview && promoPreview.bonusAmount > 0 ? (
                    <span className={styles.boostLabel}>
                      {promoPreview.boostLabel}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className={styles.usdNote}>
                  ≈ {formatFromUsd(usdVal, 2)}
                </p>
              )}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {isValidDeposit(amount) ? (
                <ApyPreview
                  key={`apy-${apyKey}-${amount}`}
                  currentBalance={currentBalance}
                  inputAmount={showStakePreview ? promoPreview.creditedAmount : amount}
                  exchangeRate={exchangeRate}
                  inputId="amount"
                  inputFocused={focused}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Page>
  );
}