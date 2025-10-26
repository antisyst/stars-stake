import { QRCodeSVG } from 'qrcode.react';
import styles from './UnsupportedPlatform.module.scss';
import starsBaseLogoUrl from '../../../public/stars-base.png';

export function UnsupportedPlatform() {
  return (
    <div className={styles.unsupportedLayout}>
      <QRCodeSVG
        value="https://t.me/starsbase_bot/app"
        size={160}
        level="H"
        bgColor="transparent"
        fgColor="#ffff"
        includeMargin={false}
        title="Stars Base"
        imageSettings={{
          src: starsBaseLogoUrl,
          height: 30,    
          width: 30,
          excavate: true,   
        }}
      />
      <h1>Unsupported Platform</h1>
      <p>Only available on mobile. Please open it on your phone to continue.</p>
    </div>
  );
}