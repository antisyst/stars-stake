import React, { useContext, useEffect, useRef, useState } from 'react';
import CheckIcon from '@/assets/icons/check.svg?react'; 
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { openLink } from '@telegram-apps/sdk';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { useAppData } from '@/contexts/AppDataContext';
import { ToastContext } from '@/contexts/ToastContext';
import { useI18n } from '@/i18n';
import styles from './SocialBonusSection.module.scss';
import XIcon from '@/assets/icons/x-twitter.png';

const BONUS_STARS = 50;
const X_TARGET_USERNAME = 'starsbase_bot';
const X_TARGET_URL = `https://x.com/${X_TARGET_USERNAME}`;
const VISIT_FLAG_KEY = 'x_bonus_follow_visit_started';

export const SocialBonusSection: React.FC = () => {
  const { uid, user } = useAppData();
  const { showError, showSuccess } = useContext(ToastContext);
  const { t } = useI18n();

  const [status, setStatus] = useState<'idle' | 'opening' | 'done'>('idle');
  const claimingRef = useRef(false);

  useEffect(() => {
    if (!uid || !user) return;
    if (user.hasClaimedTwitterBonus) return; 

    let didVisit = false;
    try {
      didVisit = sessionStorage.getItem(VISIT_FLAG_KEY) === '1';
    } catch {}

    if (didVisit && status === 'idle') {
      setStatus('opening');
      claimBonus(uid);
    }
  }, [uid, user]);

  const claimBonus = async (uidArg: string) => {
    if (claimingRef.current) return;
    claimingRef.current = true;

    try {
      const userRef = doc(db, 'users', uidArg);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);

        if (!snap.exists()) throw new Error('USER_DOCUMENT_NOT_FOUND');

        const data = snap.data() as any;
        if (data.hasClaimedTwitterBonus) throw new Error('ALREADY_CLAIMED');

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

      try { sessionStorage.removeItem(VISIT_FLAG_KEY); } catch {}

      setStatus('done');
      showSuccess(t('socialBonus.rewardAddedSuccessfully'));
    } catch (e: any) {
      claimingRef.current = false;
      if (e?.message === 'ALREADY_CLAIMED') {
        try { sessionStorage.removeItem(VISIT_FLAG_KEY); } catch {}
        setStatus('done');
        showError(t('socialBonus.bonusAlreadyClaimed'));
      } else if (e?.message === 'USER_DOCUMENT_NOT_FOUND') {
        setStatus('idle');
        showError(t('socialBonus.userDocumentNotFound'));
      } else {
        console.error('Twitter bonus claim failed:', e);
        setStatus('idle');
        showError(t('socialBonus.failedToAddBonus'));
      }
    }
  };

  const handleClick = async () => {
    if (!uid) {
      showError(t('socialBonus.userDataUnavailable'));
      return;
    }
    if (user?.hasClaimedTwitterBonus || status === 'done' || status === 'opening') return;

    try { sessionStorage.setItem(VISIT_FLAG_KEY, '1'); } catch {}

    setStatus('opening');

    try {
      openLink(X_TARGET_URL, { tryBrowser: 'chrome', tryInstantView: true });
    } catch (e) {
      console.error('Failed to open X link:', e);
      setStatus('idle');
      try { sessionStorage.removeItem(VISIT_FLAG_KEY); } catch {}
      showError(t('socialBonus.failedToAddBonus'));
      return;
    }

    await claimBonus(uid);
  };

  if (user?.hasClaimedTwitterBonus) return null;

  const renderTrailing = () => {
    if (status === 'opening') {
      return <Spinner size="s" />;
    }
    if (status === 'done') {
      return (
        <div className={styles.checkWrapper}>
          <CheckIcon className={styles.checkIcon} />
        </div>
      );
    }
    return (
      <div className={styles.arrowWrapper}>
        <ArrowRightIcon className="white-icon" />
      </div>
    );
  };

  return (
    <div
      className={styles.socialBonusSection}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className={styles.socialTitle}>
        <div className={styles.iconWrapper}>
          <img src={XIcon} alt="X (Twitter)" />
        </div>
        <div className={styles.socialLabel}>{t('socialBonus.subtitle')}</div>
      </div>
      {renderTrailing()}
    </div>
  );
};