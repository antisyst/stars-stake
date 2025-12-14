import React, { useState } from 'react';
import styles from './TierProgress.module.scss';
import { ProgressiveTiersBar } from '../ProgressiveTiersBar/ProgressiveTiersBar';
import { TierRanges } from '../TierRanges/TierRanges';
import { Modal } from '../Modal/Modal';
import HelpIcon from '@/assets/icons/help.svg?react';
import { useI18n } from '@/i18n';

export const TierProgress: React.FC = () => {
  const [isTierOpen, setIsTierOpen] = useState(false);
  const { t } = useI18n();

  const tierContent = [
    t('tier.line1'),
    t('tier.line2'),
    t('tier.line3'),
    t('tier.line4'),
  ].join('\n');

  return (
    <>
      <div
        className={styles.tierProgress}
        onClick={() => setIsTierOpen(true)}
        aria-label="Boosted Rewards"
      >
        <h2 className="section-title">{t('tier.title')}</h2>
        <div className={styles.tierProgressBody}>
          <h2 className={styles.tierTitle}>
            <span>{t('tier.apyUpdates')}</span>
            <HelpIcon className="icon" />
          </h2>
          <ProgressiveTiersBar
            widths={[46, 17, 17, 20]}
            topLabels={['12.8%', '+5.1%', '+5.8%', '+6.0%']}
          />
          <TierRanges/>
        </div>
      </div>
      <Modal
        isOpen={isTierOpen}
        title={t('tier.title')}
        button={t('common.gotIt')}
        content={tierContent}
        onClose={() => setIsTierOpen(false)}
      />
    </>
  );
};