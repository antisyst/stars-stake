import React, { useState } from 'react';
import styles from './TierProgress.module.scss';
import { ProgressiveTiersBar } from '../ProgressiveTiersBar/ProgressiveTiersBar';
import { TierRanges } from '../TierRanges/TierRanges';
import { Modal } from '../Modal/Modal';
import HelpIcon from '@/assets/icons/help.svg?react';

export const TierProgress: React.FC = () => {
  const [isTierOpen, setIsTierOpen] = useState(false);

  const tierContent = [
    'System uses a dynamic tier model, where your APY increases as your total staked balance grows.',
    'Each tier unlocks a higher yield rate, starting from 36.8% and reaching up to 46.8% APY at the highest level.',
    'When you stake additional Stars and move to a higher tier, your overall APY is recalculated instantly based on the new total.',
    'Your current and next tier thresholds are displayed in real-time, allowing you to track your progress toward the next APY boost.'
  ].join('\n');

  return (
    <>
      <div
        className={styles.tierProgress}
        onClick={() => setIsTierOpen(true)}
        aria-label="Boosted Rewards"
      >
        <h2 className="section-title">Boosted Rewards</h2>
        <div className={styles.tierProgressBody}>
          <h2 className={styles.tierTitle}>
            <span>APY updates automatically as your stake grows</span>
            <HelpIcon className="icon" />
          </h2>
          <ProgressiveTiersBar
            widths={[46, 17, 17, 20]}
            topLabels={['36.8%', '+2.9%', '+2.8%', '+4.3%']}
          />
          <TierRanges/>
        </div>
      </div>
      <Modal
        isOpen={isTierOpen}
        title="Boosted Rewards"
        button="Got it"
        content={tierContent}
        onClose={() => setIsTierOpen(false)}
      />
    </>
  );
};