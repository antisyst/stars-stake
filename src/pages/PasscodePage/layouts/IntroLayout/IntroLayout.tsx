import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton';
import { useI18n } from '@/i18n';
import passcodeLottie from '@/assets/lottie/key.json';
import styles from './IntroLayout.module.scss';

interface IntroLayoutProps {
  onEnable: () => void;
}

export const IntroLayout: React.FC<IntroLayoutProps> = ({ onEnable }) => {
  const { t } = useI18n();

  return (
    <div className={styles.introPage}>
      <div className={styles.introContent}>
        <Player
          src={passcodeLottie}
          autoplay
          loop={true}
          keepLastFrame
          className={styles.animation}
        />
        <div className={styles.mainContent}>
          <h1 className={styles.title}>{t('passcode.introTitle')}</h1>
          <p className={styles.subtitle}>{t('passcode.introSubtitle')}</p>
        </div>
        <div className={styles.actions}>
          <PrimaryButton
            label={t('passcode.enablePasscode')}
            onClick={onEnable}
          />
        </div>
      </div>
    </div>
  );
};

export default IntroLayout;