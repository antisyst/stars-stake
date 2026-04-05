import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Page } from '@/components/Page';
import { useNavigate } from 'react-router-dom';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useAppData } from '@/contexts/AppDataContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { useI18n } from '@/i18n';
import { ToastContext } from '@/contexts/ToastContext';
import { Switch } from '@/components/Switch/Switch';
import { popup } from '@telegram-apps/sdk';
import { primeIosFocusBridge } from '@/utils/iosFocusBridge';
import { lockStableVh } from '@/utils/stableVh';
import { useBiometry } from '@/hooks/useBiometry';
import styles from './PasscodeSettingsPage.module.scss';

export const PasscodeSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const lp = useLaunchParams();
  const { uid, user } = useAppData();
  const { t } = useI18n();
  const { showSuccess, showError } = useContext(ToastContext);

  const isIos = lp.platform === 'ios';
  const hasPasscode = Boolean((user as any)?.passcodeHash);
  const faceIdEnabled = Boolean((user as any)?.faceIdEnabled);

  const { state: bmState, requestAccess, updateToken, openSettings, refresh } = useBiometry();
  const [faceIdToggle, setFaceIdToggle] = useState(faceIdEnabled);
  const [togglingFaceId, setTogglingFaceId] = useState(false);
  const inProgressRef = useRef(false);

  useEffect(() => {
    setFaceIdToggle(faceIdEnabled);
  }, [faceIdEnabled]);

  const handleGoToSetup = useCallback(() => {
    lockStableVh();
    if (isIos) primeIosFocusBridge();
    navigate('/passcode-setup');
  }, [isIos, navigate]);

  const handleTurnOff = useCallback(async () => {
    if (!uid) return;

    try {
      let confirmed = false;

      if (popup.isSupported()) {
        const buttonId = await popup.open({
          title: t('passcode.turnOffTitle'),
          message: t('passcode.turnOffMessage'),
          buttons: [
            { id: 'confirm', type: 'destructive', text: t('passcode.turnOffConfirm') },
            { type: 'cancel' },
          ],
        });
        confirmed = buttonId === 'confirm';
      } else {
        confirmed = window.confirm(t('passcode.turnOffMessage'));
      }

      if (!confirmed) return;

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        passcodeHash: null,
        passcodeEnabled: false,
        faceIdEnabled: false,
        updatedAt: serverTimestamp(),
      });

      await updateToken('', t('passcode.faceIdDisableReason') ?? 'Passcode disabled');

      showSuccess(t('passcode.turnedOff'));
      navigate('/profile', { replace: true });
    } catch (e) {
      console.error('Turn off passcode error:', e);
      showError(t('passcode.turnOffFailed'));
    }
  }, [uid, navigate, showSuccess, showError, t, updateToken]);

  const handleFaceIdToggle = useCallback(
    async (val: boolean) => {
      if (!uid) return;
      if (inProgressRef.current) return;

      inProgressRef.current = true;
      setTogglingFaceId(true);

      try {
        refresh();

        if (!bmState.supported || bmState.loading) {
          showError(t('passcode.faceIdNotAvailable') ?? 'Face ID is not available on this device');
          return;
        }

        if (!bmState.available) {
          showError(t('passcode.faceIdNotAvailable') ?? 'Face ID is not available on this device');
          return;
        }

        if (val) {
          if (!bmState.accessGranted) {
            const granted = await requestAccess(
              t('passcode.faceIdEnableReason') ?? 'Enable Face ID to unlock the app'
            );
            console.log('[FaceID] access granted:', granted);

            if (!granted) {
              if (popup.isSupported()) {
                const btn = await popup.open({
                  title: t('passcode.faceIdDeniedTitle') ?? 'Face ID Access Denied',
                  message:
                    t('passcode.faceIdDeniedMessage') ??
                    'Please enable Face ID in Telegram settings.',
                  buttons: [
                    { id: 'settings', type: 'default', text: t('passcode.openSettings') ?? 'Open Settings' },
                    { type: 'cancel' },
                  ],
                });

                if (btn === 'settings') openSettings();
              } else {
                showError(t('passcode.faceIdDenied') ?? 'Face ID permission denied');
              }
              return;
            }
          }

          const saved = await updateToken(
            'passcode_verified',
            t('passcode.faceIdEnableReason') ?? 'Enable Face ID to unlock the app'
          );
          console.log('[FaceID] token saved:', saved);

          if (!saved) {
            showError(t('passcode.faceIdFailed') ?? 'Face ID setup failed or was cancelled');
            return;
          }
        } else {
          await updateToken('', t('passcode.faceIdDisableReason') ?? 'Disable Face ID');
        }

        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          faceIdEnabled: val,
          updatedAt: serverTimestamp(),
        });

        setFaceIdToggle(val);
        showSuccess(
          val
            ? (t('passcode.faceIdEnabled') ?? 'Face ID enabled')
            : (t('passcode.faceIdDisabled') ?? 'Face ID disabled')
        );
      } catch (e) {
        console.error('[FaceID] error:', e);
        showError(t('passcode.faceIdFailed') ?? 'Something went wrong');
      } finally {
        inProgressRef.current = false;
        setTogglingFaceId(false);
      }
    },
    [uid, bmState, requestAccess, updateToken, openSettings, refresh, showSuccess, showError, t]
  );

  const biometryReady = bmState.supported && bmState.mounted && !bmState.loading && bmState.available;

  return (
    <Page back backTo="/profile">
      <div className={styles.settingsPage}>
        <div className={`${styles.section} glass-card`}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleGoToSetup}
            aria-label={hasPasscode ? 'Change passcode' : 'Set passcode'}
          >
            <span className={styles.actionLabel}>
              {hasPasscode ? t('passcode.changePasscode') : t('passcode.setPasscode')}
            </span>
          </button>
          {hasPasscode && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.destructiveButton}`}
              onClick={handleTurnOff}
              aria-label="Turn passcode off"
            >
              <span className={styles.dangerLabel}>{t('passcode.turnOff')}</span>
            </button>
          )}
        </div>
        {isIos && (
          <div className={styles.faceIdSection}>
            <div className={styles.switchTitle}>{t('passcode.faceId')}</div>
            <Switch
              checked={faceIdToggle}
              onChange={handleFaceIdToggle}
              disabled={togglingFaceId || !hasPasscode || !biometryReady}
              aria-label="Toggle Face ID"
            />
          </div>
        )}
      </div>
    </Page>
  );
};

export default PasscodeSettingsPage;