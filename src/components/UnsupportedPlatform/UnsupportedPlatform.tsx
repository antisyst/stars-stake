import styles from './UnsupportedPlatform.module.scss';

export function UnsupportedPlatform() {
  return (
    <div className={styles.unsupportedLayout}>
      <h1>Unsupported Platform</h1>
      <p>Only available on mobile. Please open it on your phone to continue.</p>
    </div>
  );
}