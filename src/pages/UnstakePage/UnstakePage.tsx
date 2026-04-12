import React, { useEffect, useMemo, useRef, useState, useLayoutEffect, useContext } from 'react';
import { Page } from '@/components/Page';
import { useLocation } from 'react-router-dom';
import { mainButton } from '@telegram-apps/sdk';
import { miniApp, useLaunchParams } from '@telegram-apps/sdk-react';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { parseAmountInput } from '@/utils/deposit';
import { UnstakeTag } from '@/components/UnstakeTag/UnstakeTag';
import { UnstakeBalancePreview } from '@/components/UnstakeBalancePreview/UnstakeBalancePreview';
import { resolveCssVarToHex } from '@/utils/css';
import { ToastContext } from '@/contexts/ToastContext';
import { formatForInput } from '@/utils/formatForInput';
import { tdesktopInputShields } from '@/utils/tdesktopShields';
import { inputNoSelectGuards, composeInputProps } from '@/utils/inputGuards';
import { claimIosFocusBridge } from '@/utils/iosFocusBridge';
import { AnimatePresence } from 'framer-motion';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './UnstakePage.module.scss';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';

const MIN_UNSTAKE = 500;

export const UnstakePage: React.FC = () => {
  const location = useLocation();
  const { user, exchangeRate } = useAppData();
  const lp = useLaunchParams();
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();
  const { showError } = useContext(ToastContext);

  const isIos = lp.platform === 'ios';
  const isTDesktop = lp.platform === 'tdesktop';
  const isMobile = ['ios', 'android'].includes(lp.platform);

  const [raw, setRaw] = useState<string>('');
  const amount = useMemo(() => parseAmountInput(raw), [raw]);
  const maxBalance = user?.starsBalance ?? 0;
  const valid = amount >= MIN_UNSTAKE && amount <= maxBalance;
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(false);

  const buttonText = t('unstake.buttonWithdraw');

  const enabledBg  = resolveCssVarToHex('--app-button') || undefined;
  const enabledFg  = resolveCssVarToHex('--app-button-text') || undefined;
  const disabledBg = resolveCssVarToHex(isTDesktop ? '--app-secondary-bg' : '--app-header-bg') || undefined;
  const disabledFg = resolveCssVarToHex(isTDesktop ? '--app-subtitle' : '--app-section-separator') || undefined;

  const usdVal = (amount || 0) * (exchangeRate ?? 0);

  // ─── iOS focus: claimIosFocusBridge consumes the token primed by
  //     primeIosFocusBridge() in StakeSection before navigate('/unstake').
  //     On non-iOS we just call el.focus() directly.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (isIos) {
      // claimIosFocusBridge must run inside a rAF so the element is painted,
      // but the token was already captured during the tap in StakeSection.
      const id = requestAnimationFrame(() => claimIosFocusBridge(el));
      return () => cancelAnimationFrame(id);
    } else {
      const id = requestAnimationFrame(() => el.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hex = resolveCssVarToHex('--app-bg');
    try { miniApp.setHeaderColor((hex || '--app-bg') as any); } catch {}
    return () => { try { miniApp.setHeaderColor('secondary_bg_color'); } catch {} };
  }, []);

  const applyButtonStyle = (enabled: boolean) => {
    try {
      mainButton.setParams({
        text: buttonText,
        isVisible: true,
        isEnabled: enabled,
        isLoaderVisible: false,
        hasShineEffect: false,
        ...(enabled
          ? (enabledBg ? { backgroundColor: enabledBg } : {})
          : (disabledBg ? { backgroundColor: disabledBg } : {})),
        ...(enabled
          ? (enabledFg ? { textColor: enabledFg } : {})
          : (disabledFg ? { textColor: disabledFg } : {})),
      } as any);
    } catch {}
  };

  useEffect(() => {
    try { mainButton.mount(); mountedRef.current = true; } catch {}
    applyButtonStyle(valid);
    return () => {
      try {
        mainButton.setParams({ isVisible: false, isLoaderVisible: false } as any);
        if (mainButton.isMounted?.()) mainButton.unmount();
      } catch {}
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
        showError(t('stake.lockerNotActive'));
      });
    } catch {}
    return () => { try { off?.(); } catch {} };
  }, [valid, showError, t]);

  const displayValue = raw === '' ? '' : formatForInput(parseAmountInput(raw));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    const n = parseAmountInput(cleaned);
    setRaw(n === 0 ? '' : String(Math.min(n, maxBalance)));
  };

  const handleMax = () => {
    if (maxBalance > 0) {
      setRaw(String(maxBalance));
      // Re-focus without stealing the gesture token — plain focus is fine here
      // because this originates from a tap on the MAX button itself.
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    }
  };

  const noSelect   = useMemo(() => inputNoSelectGuards(), []);
  const shields    = useMemo(() => tdesktopInputShields(isTDesktop), [isTDesktop]);
  const inputProps = useMemo(() => composeInputProps(noSelect, shields), [noSelect, shields]);

  const sizerRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const s = sizerRef.current;
    if (!s) return;
    s.textContent = displayValue === '' ? '0' : displayValue;
    if (displayValue === '') s.classList.remove(styles.hasValueStroke);
    else s.classList.add(styles.hasValueStroke);
    setInputWidth(Math.ceil(s.getBoundingClientRect().width) + 6);
  }, [displayValue]);

  useEffect(() => { setFocused(false); }, [location.key]);

  const previewKey = isMobile ? (focused ? 'focus' : 'blur') : 'stable';

  return (
    <Page back backTo="/home">
      <div className={styles.unstakePage} key={`unstake-${location.key}`}>
        <div className={styles.unstakeLayout}>

          <UnstakeTag text={t('unstake.tagWithdraw')} />

          <div className={styles.mainUnstakeContainer}>
            <div className={styles.inputCard}>
              <StarIcon />
              <div className={styles.inputWrapper}>
                <span
                  ref={sizerRef}
                  className={`${styles.sizer} ${styles.amountText}`}
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  id="unstake-amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${styles.input} ${styles.amountText} ${
                    displayValue !== '' ? styles.hasValueStroke : ''
                  }`}
                  placeholder="0"
                  value={displayValue}
                  onChange={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  aria-label={t('unstake.amountAria')}
                  style={{ width: inputWidth ? `${inputWidth}px` : undefined }}
                  autoFocus
                  {...inputProps}
                />
              </div>
            </div>

            <div className={styles.infoTitle}>
              {displayValue === '' ? (
                <p className={styles.usdNote}>
                  1&nbsp;<StarIcon />&nbsp;≈&nbsp;{formatFromUsd(exchangeRate, 4)}
                </p>
              ) : amount > 0 && amount < MIN_UNSTAKE ? (
                <p className={styles.warning}>
                  {t('unstake.minWithdrawWarning').replace('{min}', String(formatNumber(MIN_UNSTAKE)))}
                </p>
              ) : amount > maxBalance ? (
                <p className={styles.warning}>{t('unstake.exceedsBalance')}</p>
              ) : (
                <p className={styles.usdNote}>≈ {formatFromUsd(usdVal, 2)}</p>
              )}
            </div>
          </div>

          <AnimatePresence initial={false} mode="wait">
            <UnstakeBalancePreview
              key={`balance-${previewKey}`}
              balance={maxBalance}
              exchangeRate={exchangeRate}
              onMax={handleMax}
              inputFocused={focused}
              inputId="unstake-amount"
              isMobile={isMobile}
            />
          </AnimatePresence>
        </div>
      </div>
    </Page>
  );
};