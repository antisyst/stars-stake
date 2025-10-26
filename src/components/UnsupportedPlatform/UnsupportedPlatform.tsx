import { QRCodeSVG } from 'qrcode.react';
import styles from './UnsupportedPlatform.module.scss';
import starsBaseLogoUrl from '@/assets/brand/stars-base-logo.svg?url';

export function UnsupportedPlatform() {
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
      <h1>Unsupported Platform</h1>
      <p>Only available on mobile. Please open it on your phone to continue.</p>
    </div>
  );
}