import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './CampaignSection.module.scss';
import { useI18n } from '@/i18n';

export const CampaignSection = () => {
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const { t } = useI18n();

  const campaignContent = [
    t('campaign.line1'),
    t('campaign.line2'),
  ].join('\n');

  return (
    <>
     <div className={styles.campaignSection} onClick={() => setIsCampaignOpen(true)}>
        <h2 className='section-title'>{t('campaign.title')}</h2>
        <div className={`${styles.campaignBody} glass-card`}>
            <div className={styles.campaignItem}>
                <span className={styles.campaignValue}>
                    <StarIcon />
                    500
                </span>
                <span className={styles.campaignLabel}>{t('campaign.minStakeLabel')}</span>
            </div>
            <div className={styles.campaignItem}>
                <span className={styles.campaignValue}>
                    <StarIcon />
                    ∞
                </span>
                <span className={styles.campaignLabel}>{t('campaign.maxStakeLabel')}</span>
            </div>
        </div>
     </div>
     <Modal
        isOpen={isCampaignOpen}
        title={t('campaign.title')}
        button={t('common.gotIt')}
        content={campaignContent}
        onClose={() => setIsCampaignOpen(false)}
     />
    </>
  )
}