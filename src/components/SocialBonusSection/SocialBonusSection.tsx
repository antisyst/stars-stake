import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { openLink } from '@telegram-apps/sdk';
import { useAppData } from '@/contexts/AppDataContext';
import { ToastContext } from '@/contexts/ToastContext';
import { useI18n } from '@/i18n';
import styles from './SocialBonusSection.module.scss';
import XIcon from '@/assets/icons/x-twitter.png';
import {
  X_TARGET_URL,
  createPendingChallenge,
  savePendingChallenge,
  markChallengeHidden,
  markChallengeReturned,
  canFinalizeChallenge,
  completeChallenge,
  clearPendingChallenge,
  claimTwitterBonus,
} from '@/utils/socialBonus';

export const SocialBonusSection: React.FC = () => {
  const { uid, user } = useAppData();
  const { showError, showSuccess } = useContext(ToastContext);
  const { t } = useI18n();

  const [claiming, setClaiming] = useState(false);
  const isMountedRef = useRef(true);
  const claimInFlightRef = useRef(false);

  const finalizeClaim = async () => {
    if (!uid || claimInFlightRef.current || claiming) return;

    claimInFlightRef.current = true;
    setClaiming(true);

    try {
      await claimTwitterBonus(uid);
      completeChallenge();
      clearPendingChallenge();
      showSuccess(t('socialBonus.rewardAddedSuccessfully'));
    } catch (e: any) {
      if (e?.message === 'ALREADY_CLAIMED') {
        clearPendingChallenge();
        showError(t('socialBonus.bonusAlreadyClaimed'));
      } else if (e?.message === 'USER_DOCUMENT_NOT_FOUND') {
        clearPendingChallenge();
        showError(t('socialBonus.userDocumentNotFound'));
      } else {
        console.error('Twitter bonus claim failed:', e);
        showError(t('socialBonus.failedToAddBonus'));
      }
    } finally {
      claimInFlightRef.current = false;
      if (isMountedRef.current) {
        setClaiming(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markChallengeHidden();
        return;
      }

      if (document.visibilityState === 'visible') {
        markChallengeReturned();
        if (canFinalizeChallenge()) {
          void finalizeClaim();
        }
      }
    };

    const handleWindowFocus = () => {
      markChallengeReturned();
      if (canFinalizeChallenge()) {
        void finalizeClaim();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    if (document.visibilityState === 'visible') {
      markChallengeReturned();
      if (canFinalizeChallenge()) {
        void finalizeClaim();
      }
    }

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [uid]);

  const handleConnectAndClaim = async () => {
    if (!uid) {
      showError(t('socialBonus.userDataUnavailable'));
      return;
    }

    if (user?.hasClaimedTwitterBonus) {
      showError(t('socialBonus.bonusAlreadyClaimed'));
      return;
    }

    if (claimInFlightRef.current || claiming) return;

    try {
      const challenge = createPendingChallenge();
      savePendingChallenge(challenge);
    } catch (e) {
      console.error('Failed to save pending X challenge:', e);
      showError(t('socialBonus.failedToAddBonus'));
      return;
    }

    try {
      openLink(X_TARGET_URL, {
        tryBrowser: 'chrome',
        tryInstantView: true,
      });
    } catch (e) {
      console.error('Failed to open X link:', e);
      clearPendingChallenge();
      showError(t('socialBonus.failedToAddBonus'));
    }
  };

  return (
    <div className={styles.socialBonusSection}>
      <img src={XIcon} alt="" className={styles.backgroundIcon} />
      <div className={styles.header}>
        <div className={styles.textContent}>
          <h3 className={styles.title}>{t('socialBonus.title')}</h3>
          <p className={styles.subtitle}>{t('socialBonus.subtitle')}</p>
        </div>
      </div>

      <Button
        size="m"
        mode="gray"
        stretched
        loading={claiming}
        disabled={Boolean(user?.hasClaimedTwitterBonus) || claiming}
        onClick={handleConnectAndClaim}
      >
        {user?.hasClaimedTwitterBonus
          ? t('socialBonus.claimed')
          : t('socialBonus.connectAndClaim')}
      </Button>
    </div>
  );
};