import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@telegram-apps/telegram-ui';
import { db } from '@/configs/firebaseConfig';
import { useI18n } from '@/i18n';
import { ToastContext } from '@/contexts/ToastContext';
import { popup } from '@telegram-apps/sdk';
import {
  biometry,
  mountBiometry,
  isBiometryMounted,
  requestBiometryAccess,
  updateBiometryToken,
  openBiometrySettings,
} from '@telegram-apps/sdk';
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton';
import FaceIDIcon from '@/assets/icons/face-id.svg?react';
import { dismissIosKeyboard } from '@/utils/iosFocusBridge';
import styles from './FaceIdSuggestionLayout.module.scss';

interface FaceIdSuggestionLayoutProps {
  onSkip: () => void;
  onDone: () => void;
}

async function ensureBiometryMounted(): Promise<boolean> {
  try {
    const canMount =
      typeof (mountBiometry as any).isAvailable === 'function' &&
      (mountBiometry as any).isAvailable();
    if (!canMount) return false;
    if (!isBiometryMounted()) {
      await (mountBiometry as any)();
    }
    return isBiometryMounted();
  } catch (e) {
    console.error('[FaceID] mount error:', e);
    return false;
  }
}

function readBiometryLiveState(): { available: boolean; accessGranted: boolean } {
  const b = biometry as any;
  return {
    available: Boolean(
      typeof b.isAvailable === 'function' ? b.isAvailable() : false
    ),
    accessGranted: Boolean(
      typeof b.accessGranted === 'function'
        ? b.accessGranted()
        : typeof b.isAccessGranted === 'function'
        ? b.isAccessGranted()
        : false
    ),
  };
}

export const FaceIdSuggestionLayout: React.FC<FaceIdSuggestionLayoutProps> = ({
  onSkip,
  onDone,
}) => {
  const { uid } = useAppData();
  const { t } = useI18n();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const inProgressRef = useRef(false);

  // Ensure keyboard is fully dismissed when this layout appears
  useEffect(() => {
    dismissIosKeyboard();
    // Belt-and-suspenders: dismiss again after a frame in case blur was async
    const raf = requestAnimationFrame(() => dismissIosKeyboard());
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    ensureBiometryMounted().catch(console.error);
  }, []);

  const handleEnableFaceId = useCallback(async () => {
    if (!uid) return;
    if (inProgressRef.current) return;

    inProgressRef.current = true;
    setLoading(true);

    try {
      const mounted = await ensureBiometryMounted();
      if (!mounted) {
        showError(t('passcode.faceIdNotAvailable') ?? 'Face ID is not available on this device');
        return;
      }

      const { available, accessGranted } = readBiometryLiveState();
      if (!available) {
        showError(t('passcode.faceIdNotAvailable') ?? 'Face ID is not available on this device');
        return;
      }

      if (!accessGranted) {
        let granted = false;
        try {
          const canRequest =
            typeof (requestBiometryAccess as any).isAvailable === 'function' &&
            (requestBiometryAccess as any).isAvailable();

          if (canRequest) {
            granted = Boolean(
              await requestBiometryAccess({
                reason:
                  t('passcode.faceIdEnableReason') ?? 'Enable Face ID to unlock the app',
              })
            );
          }
        } catch (e) {
          console.error('[FaceID] requestAccess error:', e);
        }

        if (!granted) {
          if (popup.isSupported()) {
            const btn = await popup.open({
              title: t('passcode.faceIdDeniedTitle') ?? 'Face ID Access Denied',
              message:
                t('passcode.faceIdDeniedMessage') ??
                'Please enable Face ID in Telegram settings.',
              buttons: [
                {
                  id: 'settings',
                  type: 'default',
                  text: t('passcode.openSettings') ?? 'Open Settings',
                },
                { type: 'cancel' },
              ],
            });
            if (btn === 'settings') {
              try { openBiometrySettings(); } catch {}
            }
          } else {
            showError(t('passcode.faceIdDenied') ?? 'Face ID permission denied');
          }
          return;
        }
      }

      let saved = false;
      try {
        const canUpdate =
          typeof (updateBiometryToken as any).isAvailable === 'function' &&
          (updateBiometryToken as any).isAvailable();

        if (canUpdate) {
          const result = await updateBiometryToken({
            token: 'passcode_verified',
            reason:
              t('passcode.faceIdEnableReason') ?? 'Enable Face ID to unlock the app',
          });
          saved =
            typeof result === 'boolean'
              ? result
              : result === 'updated' || result === 'removed';
        }
      } catch (e) {
        console.error('[FaceID] updateToken error:', e);
      }

      if (!saved) {
        showError(t('passcode.faceIdFailed') ?? 'Face ID setup failed or was cancelled');
        return;
      }

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        faceIdEnabled: true,
        updatedAt: serverTimestamp(),
      });

      showSuccess(t('passcode.faceIdEnabled') ?? 'Face ID enabled');
      onDone();
    } catch (e) {
      console.error('[FaceID] enable error:', e);
      showError(t('passcode.faceIdFailed') ?? 'Something went wrong');
    } finally {
      inProgressRef.current = false;
      setLoading(false);
    }
  }, [uid, showSuccess, showError, t, onDone]);

  return (
    <div className={styles.suggestionPage}>
      <div className={styles.suggestionContent}>
        <div className={styles.imageWrapper}>
          <FaceIDIcon />
        </div>
        <div className={styles.mainContent}>
          <h1 className={styles.title}>{t('passcode.enableFaceId')}</h1>
          <p className={styles.subtitle}>{t('passcode.faceIdSuggestionSubtitle')}</p>
        </div>
        <div className={styles.actions}>
          <PrimaryButton
            label={t('passcode.enableFaceId')}
            onClick={handleEnableFaceId}
            loading={loading}
          />
          <Button
            type="button"
            className={styles.maybeLater}
            onClick={onSkip}
            mode='bezeled'
            disabled={loading}
          >
            {t('passcode.maybeLater')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaceIdSuggestionLayout;