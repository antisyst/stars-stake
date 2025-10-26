import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { miniApp } from '@telegram-apps/sdk-react';
import styles from './UnsupportedPlatform.module.scss';
import starsBaseLogoUrl from '../../../public/stars-base.png';

export function UnsupportedPlatform() {
  useEffect(() => {
    try {
      miniApp.setBackgroundColor('secondary_bg_color');
      miniApp.setBottomBarColor('secondary_bg_color');
      miniApp.setHeaderColor('secondary_bg_color');
    } catch {}

    return () => {
      try {
        miniApp.setBackgroundColor('bg_color');
        miniApp.setBottomBarColor('bg_color');
        miniApp.setHeaderColor('bg_color');
      } catch {}
    };
  }, []);

  return (
    <div className={styles.unsupportedLayout}>
      <div className={styles.qrWrapper}>
        <QRCodeSVG
          value="https://t.me/starsbase_bot/app"
          size={160}
          level="H"
          bgColor="transparent"
          fgColor="#FFFF"
          includeMargin={false}
          title="Stars Base"
        />
        <img
          src={starsBaseLogoUrl}
          alt="Stars Base"
          className={styles.qrLogo}
        />
      </div>
      <div className={styles.content}>
        <h1>Unsupported Platform</h1>
        <p>Only available on mobile. Please open it on your phone to continue.</p>
      </div>
    </div>
  );
}