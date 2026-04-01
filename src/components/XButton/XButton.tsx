import styles from './XButton.module.scss';
import XIcon from '@/assets/icons/x.svg?react';
import { openLink } from '@telegram-apps/sdk';

export const XButton = () => {
  const handleClick = () => {
    openLink(`https://x.com/starsbase_bot`, { 
      tryBrowser: 'chrome', 
      tryInstantView: true 
    });
  };

  return (
    <button 
      className={styles.xButton} 
      onClick={handleClick}
    >
      <XIcon className='text-icon' />
    </button>
  );
};