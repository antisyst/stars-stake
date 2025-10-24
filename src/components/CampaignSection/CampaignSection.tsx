import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import styles from './CampaignSection.module.scss';

export const CampaignSection = () => {
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);

   const campaignContent = [
    'The campaign allows staking from a minimum of 200 Stars, with no upper limit on the maximum stake.',
    'All deposits contribute directly to the active staking pool and start generating rewards immediately upon confirmation.'
  ].join('\n');

  return (
    <>
     <div className={styles.campaignSection} onClick={() => setIsCampaignOpen(true)}>
        <h2 className='section-title'>Campaign Details</h2>
        <div className={styles.campaignBody}>
            <div className={styles.campaignItem}>
                <span className={styles.campaignValue}>
                    <StarIcon />
                    200
                </span>
                <span className={styles.campaignLabel}>Min. Stake</span>
            </div>
            <div className={styles.campaignItem}>
                <span className={styles.campaignValue}>
                    <StarIcon />
                    ∞
                </span>
                <span className={styles.campaignLabel}>Max. Stake</span>
            </div>
        </div>
     </div>
     <Modal
        isOpen={isCampaignOpen}
        title="Campaign Details"
        button="Got it"
        content={campaignContent}
        onClose={() => setIsCampaignOpen(false)}
     />
    </>
  )
}
