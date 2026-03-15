import React, { useContext, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { openLink } from '@telegram-apps/sdk';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { useAppData } from '@/contexts/AppDataContext';
import { ToastContext } from '@/contexts/ToastContext';
import { useI18n } from '@/i18n';
import styles from './SocialBonusSection.module.scss';
import XIcon from '@/assets/icons/x-twitter.png';

const BONUS_STARS = 75;
const X_TARGET_USERNAME = 'starsbase_bot';
const X_TARGET_URL = `https://x.com/${X_TARGET_USERNAME}`;
const VISIT_FLAG_KEY = 'x_bonus_follow_visit_started';

export const SocialBonusSection: React.FC = () => {
  const { uid, user } = useAppData();
  const { showError, showSuccess } = useContext(ToastContext);
  const { t } = useI18n();

  const [claiming, setClaiming] = useState(false);

  const handleConnectAndClaim = async () => {
    if (!uid) {
      showError(t('socialBonus.userDataUnavailable'));
      return;
    }

    if (user?.hasClaimedTwitterBonus) {
      showError(t('socialBonus.bonusAlreadyClaimed'));
      return;
    }

    try {
      sessionStorage.setItem(VISIT_FLAG_KEY, '1');
    } catch {}

    try {
      openLink(X_TARGET_URL, {
        tryBrowser: 'chrome',
        tryInstantView: true,
      });
    } catch (e) {
      console.error('Failed to open X link:', e);
      showError(t('socialBonus.failedToAddBonus'));
      return;
    }

    setClaiming(true);

    try {
      const userRef = doc(db, 'users', uid);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);

        if (!snap.exists()) {
          throw new Error('USER_DOCUMENT_NOT_FOUND');
        }

        const data = snap.data() as any;

        if (data.hasClaimedTwitterBonus) {
          throw new Error('ALREADY_CLAIMED');
        }

        const currentCents = Number.isFinite(data.starsCents)
          ? data.starsCents
          : Math.max(0, Math.floor((data.starsBalance || 0) * 100));

        const bonusCents = BONUS_STARS * 100;
        const nextCents = currentCents + bonusCents;

        tx.update(userRef, {
          starsCents: nextCents,
          starsBalance: Math.floor(nextCents / 100),
          hasClaimedTwitterBonus: true,
          twitterBonusStars: BONUS_STARS,
          twitterBonusClaimedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      try {
        sessionStorage.removeItem(VISIT_FLAG_KEY);
      } catch {}

      showSuccess(t('socialBonus.rewardAddedSuccessfully'));
    } catch (e: any) {
      if (e?.message === 'ALREADY_CLAIMED') {
        showError(t('socialBonus.bonusAlreadyClaimed'));
      } else if (e?.message === 'USER_DOCUMENT_NOT_FOUND') {
        showError(t('socialBonus.userDocumentNotFound'));
      } else {
        console.error('Twitter bonus claim failed:', e);
        showError(t('socialBonus.failedToAddBonus'));
      }
    } finally {
      setClaiming(false);
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
        disabled={Boolean(user?.hasClaimedTwitterBonus)}
        onClick={handleConnectAndClaim}
      >
        {user?.hasClaimedTwitterBonus
          ? t('socialBonus.claimed')
          : t('socialBonus.connectAndClaim')}
      </Button>
    </div>
  );
};