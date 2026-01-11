import { useState } from 'react';
import styles from './WithdrawOptions.module.scss';
import TonIcon from '@/assets/icons/toncoin.svg?react';
import HelpIcon from '@/assets/icons/help.svg?react';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import { Modal } from '../Modal/Modal';
import { useI18n } from '@/i18n';

export const WithdrawOptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();

  const modalContent = [
    t('withdraw.line1'),
    t('withdraw.line2'),
    t('withdraw.line3'),
    t('withdraw.line4'),
  ].join('\n');

  return (
    <>
     <div className={styles.withdrawOptions} onClick={() => setIsModalOpen(true)}>
        <h2 className="section-title">{t('withdraw.title')}</h2>
        <div className={`${styles.withdrawSection} glass-card`}>
            <div className={styles.item}>
                <TonIcon/>
                <div className={styles.title}>{t('withdraw.tonLabel')}</div>
            </div>
            <div className={styles.item}>
                <StarIcon/>
                <div className={styles.title}>{t('withdraw.starsLabel')}</div>
            </div>
            <div className={styles.helpWrapper}>
                <HelpIcon className='icon'/>
            </div>
        </div>
        <span className='subtitle'>{t('withdraw.subtitle')}</span>
     </div>
     <Modal
        isOpen={isModalOpen}
        title={t('withdraw.title')}
        button={t('common.gotIt')}
        content={modalContent}
        onClose={() => setIsModalOpen(false)}
     />
    </>
  )
}