import { Page } from '@/components/Page';
import styles from './ProfilePage.module.scss';
import { useAppData } from '@/contexts/AppDataContext';
import { Avatar, Button } from '@telegram-apps/telegram-ui';
import { GroupList, GroupListItem } from '@/components/GroupList/GroupList';
import LinkList, { LinkListItem } from '@/components/LinkList/LinkList';
import WalletIcon from '@/assets/icons/wallet.svg?react';
import CurrencyIcon from '@/assets/icons/currency.svg?react';
import ChatIcon from '@/assets/icons/chat.svg?react';
import HistoryIcon from '@/assets/icons/history.svg?react';
import FaqIcon from '@/assets/icons/faq.svg?react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { truncateAddress } from '@/utils/truncateAddress';
import { useMemo, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '@/contexts/ToastContext';
import { copyTextToClipboard } from '@telegram-apps/sdk';
import { useCurrency, CURRENCY_OPTIONS, CurrencyCode } from '@/contexts/CurrencyContext';
// import { openTelegramLink } from '@telegram-apps/sdk';

export const ProfilePage = () => {
  const { user } = useAppData();
  const wallet = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { selected, setSelected, symbolFor } = useCurrency();

  const currencyValueRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const displayName = `${user?.firstName ?? ''}${user?.lastName ? ' ' + user.lastName : ''}`.trim();
  const username = user?.username ?? '';

  const walletDisplay = wallet ?? (user as any)?.walletAddress ?? '';
  const isWalletConnected = Boolean(walletDisplay);
  const truncated = walletDisplay ? truncateAddress(walletDisplay) : '';

  const openConnectModal = useCallback(() => {
    try {
      tonConnectUI.openModal();
    } catch (e) {
      console.error('Failed to open connect modal', e);
    }
  }, [tonConnectUI]);

  const handleCopyWallet = useCallback(async () => {
    if (!walletDisplay) {
      showError('No wallet address available');
      return;
    }
    try {
      await copyTextToClipboard(walletDisplay);
      showSuccess('Copied to clipboard');
    } catch (e) {
      console.error('Copy failed', e);
      showError('Copy failed');
    }
  }, [walletDisplay, showError, showSuccess]);

  const onSelectChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const val = ev.target.value as CurrencyCode;
    try {
      await setSelected(val);
      showSuccess('Currency updated');
    } catch (e) {
      console.error('Currency change failed', e);
      showError('Failed to change currency');
    }
  };

  const mainItems: GroupListItem[] = useMemo(() => {
    const arr: GroupListItem[] = [];

    if (isWalletConnected) {
      arr.push({
        key: 'wallet',
        label: 'Wallet',
        value: truncated,
        icon: <WalletIcon />,
        iconBg: '#007aff',
        onClick: handleCopyWallet,
        hideChevron: true,
        ariaLabel: 'Copy wallet address',
      });
    } else {
      arr.push({
        key: 'wallet',
        label: 'Wallet',
        value: (
          <Button mode='bezeled' size='s' className={styles.connect} onClick={openConnectModal}>Connect</Button>
        ),
        icon: <WalletIcon />,
        iconBg: '#007aff',
        ariaLabel: 'Connect wallet (button)',
      });
    }

    arr.push({
      key: 'currency',
      label: 'Default Currency',
      value: (
        <div
          ref={currencyValueRef}
          style={{ position: 'relative', display: 'inline-block', minWidth: 84 }}
        >
          <span aria-hidden> {user?.defaultCurrency ?? selected}</span>

          <select
            ref={selectRef}
            aria-label="Select default currency"
            defaultValue={user?.defaultCurrency ?? selected}
            onChange={onSelectChange}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              border: 'none',
              background: 'transparent',
              zIndex: 20,
              cursor: 'pointer',
            }}
          >
            {CURRENCY_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.code}
              </option>
            ))}
          </select>
        </div>
      ),
      icon: <CurrencyIcon />,
      iconBg: '#34c759',
      onClick: () => { selectRef.current?.focus(); },
      ariaLabel: 'Default currency',
    });

    return arr;
  }, [isWalletConnected, truncated, handleCopyWallet, openConnectModal, user?.defaultCurrency, selected, symbolFor]);

  const secondaryItems: GroupListItem[] = useMemo(() => {
    return [
      {
        key: 'faq',
        label: 'FAQ',
        value: '',
        icon: <FaqIcon />,
        iconBg: '#32ade6',
        onClick: () => navigate('/faq'),
        ariaLabel: 'Open FAQ',
      },
      {
        key: 'contact_support',
        label: 'Contact Support',
        value: '',
        icon: <ChatIcon/>,
        iconBg: '#ff9f43',
        onClick: () => {
          try {
            showSuccess('Support service is launching soon.');
          } catch (e) {
            console.error('Failed to show support toast', e);
          }
        },
        ariaLabel: 'Contact Stars Base support on Telegram',
      },
    ];
  }, [navigate, showSuccess]);

  const historyGroupItems: GroupListItem[] = useMemo(() => {
    return [
      {
        key: 'history',
        label: 'History',
        value: '',
        icon: <HistoryIcon/>,
        iconBg: '#8e8e93',
        onClick: () => navigate('/history'),
        ariaLabel: 'Open History',
      },
    ];
  }, [navigate]);

  const policyLinks: LinkListItem[] = useMemo(() => {
    return [
      { key: 'user-agreement', label: 'User Agreement', to: '/user-agreement' },
      { key: 'privacy-policy', label: 'Privacy Policy', to: '/privacy-policy' },
    ];
  }, []);

  return (
    <Page back={true}>
      <div className={styles.profilePage}>
        <div className={styles.headerRow}>
          <div className={styles.avatarWrapper}>
            {user?.photoUrl ? (
              <Avatar src={user.photoUrl} size={96} alt="avatar" />
            ) : (
              <div className={styles.avatarPlaceholder}>{user?.firstName?.[0] ?? 'U'}</div>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.name}>{displayName || 'Unknown'}</div>
            <div className={styles.username}>@{username || '—'}</div>
          </div>
        </div>

        <div className={styles.sectionGroup}>
          <div className={styles.sectionItem}>
            <GroupList items={mainItems} />
          </div>

          <div className={styles.sectionItem}>
            <GroupList items={secondaryItems} />
          </div>
          <div className={styles.sectionItem}>
            <GroupList items={historyGroupItems} />
          </div>
          <div className={styles.sectionItem}>
            <LinkList items={policyLinks} />
            <p className={styles.subtitle}>
              The mini app is operated by Stars Base Digital Services Provider. The service is independent and not affiliated with Telegram. 
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
};