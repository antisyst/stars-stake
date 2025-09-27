import styles from './UnsupportedPlatform.module.scss';
import GifthIcon from '@/assets/gifth.svg';

export function UnsupportedPlatform() {
  return (
    <div className={styles.unsupportedLayout}>
      <img src={GifthIcon} alt="Gifth" />
      <h1>Unsupported Platform</h1>
      <p>Only available on mobile. Please open it on your phone to continue.</p>
    </div>
  );
}