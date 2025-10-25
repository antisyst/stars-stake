import { useContext, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import HelpIcon from '@/assets/icons/help.svg?react';
import AddIcon from '@/assets/icons/add.svg?react';
import MinusIcon from '@/assets/icons/minus.svg?react';
import styles from './StakeSection.module.scss';
import { Modal } from '@/components/Modal/Modal';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { ToastContext } from '@/contexts/ToastContext';
import { formatApy } from '@/utils/apy';

export const StakeSection = () => {
  const [isApyOpen, setIsApyOpen] = useState(false);
  const { user, balanceUsd, exchangeRate, effectiveApy } = useAppData();
  const { showError } = useContext(ToastContext);
  const navigate = useNavigate();

  const balanceInt = user?.starsBalance ?? 0;
  const apyStr = formatApy(effectiveApy);

  const apyContent = [
    'APY stands for Annual Percentage Yield, representing the total yearly return including compound rewards.',
    'Rates are tiered and assigned per stake (lot); your displayed APY is a weighted average across all open lots.',
    `Your current effective APY: ${apyStr}%`,
    `Current price: $${exchangeRate.toFixed(4)} per Star.`,
  ].join('\n');

  const goDeposit = () => navigate('/deposit');

  const handleWithdraw = async () => {
    if (balanceInt <= 0) {
      showError('You have no balance to withdraw');
      return;
    }
    if (balanceInt < 300) {
      showError('You need at least 300 Stars to make a withdrawal.');
      return;
    }
  };

  return (
    <>
      <div className={styles.stakeSection}>
        <div className={styles.columnItem}>
          <p className={styles.mutedText}>Balance</p>
          <div className={styles.apyTitle} onClick={() => setIsApyOpen(true)} aria-label="APY details">
            <span className={styles.apyTitle}>APY</span>
            <HelpIcon className="icon" />
          </div>
        </div>

        <div className={styles.rowItem}>
          <div className={styles.starsBalance}>
            <div className={styles.starAmount}>
              <StarIcon />
              <span className={styles.balanceAmount}>{formatNumber(balanceInt)}</span>
            </div>
          </div>
          <h2 className={styles.currentApy}>
            {apyStr}%
          </h2>
        </div>

        <div className={styles.rowItem}>
          <span className="muted-text">≈${formatNumber(Number(balanceUsd.toFixed(2)))}</span>
          <span className="muted-text">Minimum Lock: 30 Days</span>
        </div>

        {balanceInt <= 0 ? (
          <div className={styles.buttonsContainer}>
            <Button size="m" mode="filled" onClick={goDeposit}>
              <AddIcon className="add-icon" />
              Stake &amp; Earn
            </Button>
          </div>
        ) : (
          <div className={styles.buttonsContainerRow}>
            <Button size="m" mode="bezeled" onClick={goDeposit}>
              <AddIcon className="accent-icon" />
              Deposit
            </Button>
            <Button size="m" mode="bezeled" onClick={handleWithdraw}>
              <MinusIcon className="accent-icon" />
              Withdraw
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isApyOpen}
        title="What is APY?"
        button="Got it"
        content={apyContent}
        onClose={() => setIsApyOpen(false)}
      />
    </>
  );
};