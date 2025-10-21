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
import AddIcon from '@/assets/icons/add.svg?react';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './DepositPage.module.scss';

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, exchangeRate } = useAppData();
  const { tonUsd } = useRates();
  const lp = useLaunchParams();
  const isMobile = ['ios', 'android'].includes(lp.platform);

  const [raw, setRaw] = useState<string>('');
  const amount = useMemo(() => parseAmountInput(raw), [raw]);
  const valid = isValidDeposit(amount);
  const [focused, setFocused] = useState(false)

  const hasStakedBefore = (user?.starsBalance ?? 0) > 0;
  const buttonText = hasStakedBefore ? 'Deposit' : 'Confirm Stake';
  const tagText = hasStakedBefore ? 'Deposit' : 'Stake';

  const enabledBg = resolveCssVarToHex('--app-button') || undefined;
  const enabledFg = resolveCssVarToHex('--app-button-text') || undefined;
  const disabledBg = resolveCssVarToHex('--app-header-bg') || undefined;
  const disabledFg = resolveCssVarToHex('--app-section-separator') || undefined;

  const mountedRef = useRef(false);

  useEffect(() => {
    const hex = resolveCssVarToHex('--app-section-bg');
    try { miniApp.setHeaderColor((hex || 'secondary_bg_color') as any); } catch {}
    return () => { try { miniApp.setHeaderColor('secondary_bg_color'); } catch {} };
  }, []);

  const applyButtonStyle = (enabled: boolean) => {
    try {
      mainButton.setParams({
        text: buttonText,
        isVisible: true,
        isEnabled: enabled,
        isLoaderVisible: false,
        hasShineEffect: enabled,
        ...(enabled ? (enabledBg ? { backgroundColor: enabledBg } : {}) : (disabledBg ? { backgroundColor: disabledBg } : {})),
        ...(enabled ? (enabledFg ? { textColor: enabledFg } : {}) : (disabledFg ? { textColor: disabledFg } : {})),
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
  }, []);

  useEffect(() => { applyButtonStyle(valid); }, [valid, buttonText]);

  useEffect(() => {
    let off: (() => void) | undefined;
    try {
      off = mainButton.onClick(() => {
        if (!mountedRef.current || !valid) return;
        try { mainButton.setParams({ isLoaderVisible: true, isEnabled: false }); } catch {}
        navigate(`/payment/init?amount=${amount}`, { state: { from: location.pathname } });
      });
    } catch {}
    return () => { try { off?.(); } catch {} };
  }, [valid, amount, navigate, location.pathname]);

  const displayValue = raw === '' ? '' : formatForInput(parseAmountInput(raw));
  const usdVal = (amount || 0) * (exchangeRate ?? 0);
  const tonVal = (tonUsd > 0 && usdVal > 0) ? (usdVal / tonUsd) : 0;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    const n = parseAmountInput(cleaned);
    setRaw(n === 0 ? '' : String(n));
  };

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
    <Page back>
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
                  id="amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${styles.input} ${styles.amountText} ${displayValue !== '' ? styles.hasValueStroke : ''}`}
                  placeholder="0"
                  value={displayValue}
                  onChange={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  aria-label="Stake amount in Stars"
                  style={{ width: inputWidth ? `${inputWidth}px` : undefined }}
                />
              </div>
            </div>
            <div className={styles.infoTitle}>
              {displayValue === '' ? (
                <p className={styles.usdNote}>
                  1&nbsp;<StarIcon />&nbsp;≈&nbsp;{formatNumber(Number((exchangeRate ?? 0.0199).toFixed(4)))}
                </p>
              ) : amount > 0 && amount < MIN_DEPOSIT ? (
                <p className={styles.warning}>Minimum deposit is {formatNumber(MIN_DEPOSIT)} Stars.</p>
              ) : valid ? (
                <p className={styles.usdNote}>
                  ≈ ${formatNumber(Number(usdVal.toFixed(2)))}&nbsp;≈ {tonVal ? (tonVal.toFixed(3)) : '—'} TON
                </p>
              ) : (
                <p className={styles.usdNote}>≈ ${formatNumber(Number(usdVal.toFixed(2)))}</p>
              )}
            </div>
            <AnimatePresence initial={false} mode="wait">
              {isValidDeposit(amount) ? (
                <ApyPreview
                  key={`apy-${apyKey}-${amount}`}
                  currentBalance={currentBalance}
                  inputAmount={amount}
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
};