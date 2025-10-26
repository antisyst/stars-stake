import { useContext, useMemo, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/Modal/Modal';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { ToastContext } from '@/contexts/ToastContext';
import { formatApy } from '@/utils/apy';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import HelpIcon from '@/assets/icons/help.svg?react';
import AddIcon from '@/assets/icons/add.svg?react';
import MinusIcon from '@/assets/icons/minus.svg?react';
import styles from './StakeSection.module.scss';

export const StakeSection = () => {
  const [isApyOpen, setIsApyOpen] = useState(false);
  const { user, balanceUsd, exchangeRate, effectiveApy, positions } = useAppData();
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

  const now = useMemo(() => new Date(), [positions?.length]);

  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (typeof v?.toDate === 'function') return v.toDate();
    if (typeof v === 'number') {
      return v > 2_000_000_000 ? new Date(v) : new Date(v * 1000);
    }
    if (typeof v === 'string') {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (v instanceof Date) return v;
    return null;
    };

  const anyUnlocked = useMemo(() => {
    if (!positions || positions.length === 0) return false;
    return positions.some(p => {
      const d = toDate(p.unlockAt);
      return d ? d.getTime() <= now.getTime() : false;
    });
  }, [positions, now]);

  const allLocked = useMemo(() => {
    if (!positions || positions.length === 0) return true;
    return positions.every(p => {
      const d = toDate(p.unlockAt);
      return d ? d.getTime() > now.getTime() : true;
    });
  }, [positions, now]);

  const handleWithdraw = async () => {
    if (balanceInt <= 0) {
      showError('You have no balance to withdraw');
      return;
    }

    if (allLocked) {
      showError('Your lock period hasn’t ended yet.');
      return;
    }

    if (anyUnlocked) {
      showError('Stars Base locker is not yet active');
      return;
    }

    showError('Withdrawal is not available right now.');
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
}