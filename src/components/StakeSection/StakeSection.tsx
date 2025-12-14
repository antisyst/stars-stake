import { useContext, useMemo, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/Modal/Modal';
import { useAppData } from '@/contexts/AppDataContext';
import { formatNumber } from '@/utils/formatNumber';
import { ToastContext } from '@/contexts/ToastContext';
import { formatApy } from '@/utils/apy';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import HelpIcon from '@/assets/icons/help.svg?react';
import AddIcon from '@/assets/icons/add.svg?react';
import MinusIcon from '@/assets/icons/minus.svg?react';
import { useCurrency } from '@/contexts/CurrencyContext';
import styles from './StakeSection.module.scss';
import { useI18n } from '@/i18n';

export const StakeSection = () => {
  const [isApyOpen, setIsApyOpen] = useState(false);
  const { user, balanceUsd, exchangeRate, effectiveApy, positions } = useAppData();
  const { showError } = useContext(ToastContext);
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonAddress();
  const { formatFromUsd } = useCurrency();
  const { t } = useI18n();

  const balanceInt = user?.starsBalance ?? 0;
  const apyStr = formatApy(effectiveApy);

  const apyContent = [
    t('stake.apyLine1'),
    t('stake.apyLine2'),
    t('stake.apyLine3').replace('{apy}', String(apyStr)),
    t('stake.apyLine4').replace('{price}', formatFromUsd(exchangeRate, 4)),
  ].join('\n');

  const ensureConnected = (): boolean => {
    if (!wallet) {
      try {
        tonConnectUI.openModal();
      } catch (e) {
        console.error('Failed to open connect modal', e);
      }
      return false;
    }
    return true;
  };

  const handleStakeEarnOrDeposit = () => {
    if (ensureConnected()) {
      navigate('/deposit');
    }
  };

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
    return positions.some((p) => {
      const d = toDate(p.unlockAt);
      return d ? d.getTime() <= now.getTime() : false;
    });
  }, [positions, now]);

  const allLocked = useMemo(() => {
    if (!positions || positions.length === 0) return true;
    return positions.every((p) => {
      const d = toDate(p.unlockAt);
      return d ? d.getTime() > now.getTime() : true;
    });
  }, [positions, now]);

  const handleWithdraw = () => {
    if (ensureConnected()) {
      if (balanceInt <= 0) {
        showError(t('stake.noBalance'));
        return;
      }
      if (allLocked) {
        showError(t('stake.lockNotEnded'));
        return;
      }
      if (anyUnlocked) {
        showError(t('stake.lockerNotActive'));
        return;
      }
      showError(t('stake.withdrawUnavailable'));
    }
  };

  return (
    <>
      <div className={styles.stakeSection}>
        <div className={styles.columnItem}>
          <p className={styles.mutedText}>{t('stake.balance')}</p>
          <div className={styles.apyTitle} onClick={() => setIsApyOpen(true)} aria-label={t('stake.apyTitle')}>
            <span className={styles.apyTitle}>{t('stake.apy')}</span>
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
          <h2 className={styles.currentApy}>{apyStr}%</h2>
        </div>
        <div className={styles.rowItem}>
          <span className="muted-text">≈{formatFromUsd(balanceUsd, 2)}</span>
          <span className="muted-text">{t('stake.minimumLock')}</span>
        </div>
        {balanceInt <= 0 ? (
          <div className={styles.buttonsContainer}>
            <Button size="m" mode="filled" onClick={handleStakeEarnOrDeposit}>
              <AddIcon className="add-icon" />
              {t('stake.stakeEarn')}
            </Button>
          </div>
        ) : (
          <div className={styles.buttonsContainerRow}>
            <Button size="m" mode="bezeled" onClick={handleStakeEarnOrDeposit}>
              <AddIcon className="accent-icon" />
              {t('stake.deposit')}
            </Button>
            <Button size="m" mode="bezeled" onClick={handleWithdraw}>
              <MinusIcon className="accent-icon" />
              {t('stake.withdraw')}
            </Button>
          </div>
        )}
      </div>
      <Modal
        isOpen={isApyOpen}
        title={t('stake.apyTitle')}
        button={t('common.gotIt')}
        content={apyContent}
        onClose={() => setIsApyOpen(false)}
      />
    </>
  );
};