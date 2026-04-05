import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useAppData } from '@/contexts/AppDataContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { ToastContext } from '@/contexts/ToastContext';
import { useI18n } from '@/i18n';
import { claimIosFocusBridge, primeIosFocusBridge, dismissIosKeyboard } from '@/utils/iosFocusBridge';
import { hashPasscode } from '@/utils/hashPasscode';
import passcodeLottie from '@/assets/lottie/passcode.json';
import styles from './SetPasscodeLayout.module.scss';

const PASSCODE_LENGTH = 4;

interface SetPasscodeLayoutProps {
  onSuccess: () => void;
}

export const SetPasscodeLayout: React.FC<SetPasscodeLayoutProps> = ({ onSuccess }) => {
  const lp = useLaunchParams();
  const { uid, user } = useAppData();
  const { showSuccess, showError } = useContext(ToastContext);
  const { t } = useI18n();

  const isIos = lp.platform === 'ios';
  const hasPasscode = Boolean((user as any)?.passcodeHash);

  const [phase, setPhase] = useState<'set' | 'confirm'>('set');
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [firstPasscode, setFirstPasscode] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const title =
    phase === 'set'
      ? hasPasscode
        ? t('passcode.changeTitle')
        : t('passcode.setTitle')
      : t('passcode.confirmTitle');

  const subtitle = t('passcode.subtitle');

  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };

  const focusOnMount = (el: HTMLInputElement) => {
    if (isIos) {
      primeIosFocusBridge();
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
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    focusOnMount(el);

    return () => {
      focusTimersRef.current.forEach(clearTimeout);
      focusTimersRef.current = [];
      try { el.blur(); } catch {}
      if (isIos) dismissIosKeyboard();
    };
  }, [isIos]);

  useEffect(() => {
    if (phase === 'set') return;
    const el = inputRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.focus({ preventScroll: true }));
  }, [phase]);

  const resetDigits = () => {
    setDigits(['', '', '', '']);
    setActiveIndex(0);
    requestAnimationFrame(focusInput);
  };

  const handleSubmit = (code: string) => {
    if (phase === 'set') {
      setFirstPasscode(code);
      setPhase('confirm');
      setDigits(['', '', '', '']);
      setActiveIndex(0);
      return;
    }
    if (code !== firstPasscode) {
      showError(t('passcode.mismatch'));
      setPhase('set');
      setFirstPasscode('');
      resetDigits();
      return;
    }
    if (!uid) return;

    inputRef.current?.blur();
    setSaving(true);

    (async () => {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          passcodeHash: hashPasscode(code),
          passcodeEnabled: true,
          updatedAt: serverTimestamp(),
        });
        showSuccess(t('passcode.setSuccess'));
        onSuccess();
      } catch (e) {
        console.error('Failed to save passcode', e);
        showError(t('passcode.saveFailed'));
        setSaving(false);
        requestAnimationFrame(focusInput);
      }
    })();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = [...digits];
    next[activeIndex] = char;
    setDigits(next);
    const nextIndex = activeIndex + 1;
    if (nextIndex < PASSCODE_LENGTH) {
      setActiveIndex(nextIndex);
    } else {
      handleSubmit(next.join(''));
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

  const inputValue = useMemo(() => '', [activeIndex, phase]);

  return (
    <div className={styles.passcodePage} onClick={focusInput}>
      <div className={styles.passcodeContent}>
        <Player
          src={passcodeLottie}
          autoplay
          loop={false}
          keepLastFrame
          className={styles.animation}
        />
        <div className={styles.mainContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.dotsRow}>
          {saving ? (
            <>
              <div className={`${styles.dot} ${styles.loading} ${styles.d0}`} />
              <div className={`${styles.dot} ${styles.loading} ${styles.d1}`} />
              <div className={`${styles.dot} ${styles.loading} ${styles.d2}`} />
              <div className={`${styles.dot} ${styles.loading} ${styles.d3}`} />
            </>
          ) : (
            digits.map((d, i) => (
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
            ))
          )}
        </div>

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
          disabled={saving}
          aria-label="Passcode digit"
          className={styles.hiddenInput}
          onBlur={() => {
            if (!saving) requestAnimationFrame(focusInput);
          }}
        />
      </div>
    </div>
  );
};

export default SetPasscodeLayout;