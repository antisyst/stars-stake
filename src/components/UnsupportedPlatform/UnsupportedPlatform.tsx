import { QRCodeSVG } from 'qrcode.react';
import styles from './UnsupportedPlatform.module.scss';

export function UnsupportedPlatform() {
  return (
    <div className={styles.unsupportedLayout}>
      <QRCodeSVG
        value="https://t.me/starsbase_bot/app"
        size={160}
        level="H"
        bgColor="transparent"
        fgColor="#000"
        includeMargin={false}
        title="Stars Base"
      />
      <h1>Unsupported Platform</h1>
      <p>Only available on mobile. Please open it on your phone to continue.</p>
    </div>
  );
}