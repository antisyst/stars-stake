import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Page } from '@/components/Page';
import { useNavigate } from 'react-router-dom';
import { miniApp, useLaunchParams } from '@telegram-apps/sdk-react';
import {
  mountBiometry,
  isBiometryMounted,
  authenticateBiometry,
} from '@telegram-apps/sdk';
import { useAppData } from '@/contexts/AppDataContext';
import { useI18n } from '@/i18n';
import { ToastContext } from '@/contexts/ToastContext';
import { claimIosFocusBridge } from '@/utils/iosFocusBridge';
import { resolveCssVarToHex } from '@/utils/css';
import passcodeLottie from '@/assets/lottie/diamond.json';
import FaceIDIcon from '@/assets/icons/face-id.svg?react';
import styles from './PasscodeVerifyPage.module.scss';

const PASSCODE_LENGTH = 4;
const MAX_ATTEMPTS = 5;

function hashPasscode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(Math.abs(hash));
}

interface PasscodeVerifyPageProps {
  redirectTo?: string;
}

export const PasscodeVerifyPage: React.FC<PasscodeVerifyPageProps> = ({
  redirectTo = '/passcode-settings',
}) => {
  const navigate = useNavigate();
  const lp = useLaunchParams();
  const { user } = useAppData();
  const { t } = useI18n();
  const { showError } = useContext(ToastContext);

  const isIos = lp.platform === 'ios';
  const faceIdEnabled = isIos && Boolean((user as any)?.faceIdEnabled);
  const passcodeHash = (user as any)?.passcodeHash as string | undefined;

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const faceIdInProgressRef = useRef(false);
  const focusTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      miniApp.setBackgroundColor('bg_color' as any);
      miniApp.setBottomBarColor('bg_color' as any);
    } catch {}
  }, []);

  useEffect(() => {
    const hex = resolveCssVarToHex('--app-bg');
    try { miniApp.setHeaderColor((hex || 'bg_color') as any); } catch {}
    return () => {
      try { miniApp.setHeaderColor('secondary_bg_color' as any); } catch {}
    };
  }, []);


  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    if (isIos) {
      requestAnimationFrame(() => claimIosFocusBridge(el));
    } else {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.focus({ preventScroll: true });
          const t1 = setTimeout(() => el.focus({ preventScroll: true }), 100);
          focusTimersRef.current.push(t1);
        })
      );
    }

    return () => {
      focusTimersRef.current.forEach(clearTimeout);
      focusTimersRef.current = [];
    };
  }, [isIos]);

  useEffect(() => {
    if (!isIos || !faceIdEnabled) return;

    const ensureMount = async () => {
      try {
        const canMount =
          typeof (mountBiometry as any).isAvailable === 'function' &&
          (mountBiometry as any).isAvailable();
        if (canMount && !isBiometryMounted()) {
          await (mountBiometry as any)();
        }
      } catch (e) {
        console.error('[FaceID] mount error on verify page:', e);
      }
    };

    ensureMount();
  }, [isIos, faceIdEnabled]);

  useEffect(() => {
    if (!isIos || !faceIdEnabled) return;
    const timer = setTimeout(() => triggerFaceId(), 600);
    return () => clearTimeout(timer);
  }, [isIos, faceIdEnabled]);

  const triggerFaceId = useCallback(async () => {
    if (!isIos) return;
    if (faceIdInProgressRef.current) return;
    faceIdInProgressRef.current = true;
    setFaceIdLoading(true);

    try {
      const canMount =
        typeof (mountBiometry as any).isAvailable === 'function' &&
        (mountBiometry as any).isAvailable();

      if (canMount && !isBiometryMounted()) {
        await (mountBiometry as any)();
      }

      if (!isBiometryMounted()) {
        showError(t('passcode.faceIdNotAvailable') ?? 'Face ID not available');
        return;
      }

      const canAuth =
        typeof (authenticateBiometry as any).isAvailable === 'function'
          ? (authenticateBiometry as any).isAvailable()
          : true;

      if (!canAuth) {
        showError(t('passcode.faceIdNotAvailable') ?? 'Face ID not available');
        return;
      }

      const result = await (authenticateBiometry as any)({
        reason: t('passcode.faceIdReason') ?? 'Unlock the app',
      });

      if (result?.status === 'authorized' && result?.token === 'passcode_verified') {
        navigate(redirectTo, { replace: true });
      } else {
        showError(t('passcode.faceIdFailed') ?? 'Face ID failed or was cancelled');
      }
    } catch (e) {
      console.error('[FaceID] authenticate error:', e);
      showError(t('passcode.faceIdFailed') ?? 'Something went wrong');
    } finally {
      faceIdInProgressRef.current = false;
      setFaceIdLoading(false);
    }
  }, [isIos, navigate, redirectTo, showError, t]);

  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const resetDigits = () => {
    setDigits(['', '', '', '']);
    setActiveIndex(0);
    requestAnimationFrame(focusInput);
  };

  const verify = (code: string) => {
    if (!passcodeHash) return;

    if (hashPasscode(code) === passcodeHash) {
      navigate(redirectTo, { replace: true });
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    triggerShake();

    if (next >= MAX_ATTEMPTS) {
      setLocked(true);
      showError(t('passcode.tooManyAttempts'));
    } else {
      showError(t('passcode.wrongPasscode'));
    }

    resetDigits();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;

    const next = [...digits];
    next[activeIndex] = char;
    setDigits(next);

    const nextIndex = activeIndex + 1;
    if (nextIndex < PASSCODE_LENGTH) {
      setActiveIndex(nextIndex);
    } else {
      verify(next.join(''));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[activeIndex]) {
        next[activeIndex] = '';
        setDigits(next);
      } else if (activeIndex > 0) {
        const prev = activeIndex - 1;
        next[prev] = '';
        setDigits(next);
        setActiveIndex(prev);
      }
    }
  };

  const inputValue = useMemo(() => '', [activeIndex]);

  return (
    <Page back backTo="/profile">
      <div className={styles.passcodePage} onClick={focusInput}>
        <div className={styles.passcodeContent}>
          <Player
            src={passcodeLottie}
            autoplay
            loop={true}
            keepLastFrame
            className={styles.animation}
          />

          <div className={styles.mainContent}>
            <h1 className={styles.title}>{t('passcode.enterTitle')}</h1>
            <p className={styles.subtitle}>{t('passcode.enterSubtitle')}</p>
          </div>

          <div className={`${styles.dotsRow} ${shake ? styles.shake : ''}`}>
            {digits.map((d, i) => (
              <div
                key={i}
                className={[
                  styles.dot,
                  d ? styles.filled : '',
                  i === activeIndex ? styles.active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>

          {isIos && faceIdEnabled && (
            <button
              className={styles.faceIdIconButton}
              onClick={(e) => {
                e.stopPropagation();
                triggerFaceId();
              }}
              type="button"
              disabled={faceIdLoading}
              aria-label="Use Face ID"
            >
              <FaceIDIcon />
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={inputValue}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={locked}
            aria-label="Passcode digit"
            className={styles.hiddenInput}
            onBlur={() => {
              if (!locked) requestAnimationFrame(focusInput);
            }}
          />
        </div>
      </div>
    </Page>
  );
};

export default PasscodeVerifyPage;