import { Page } from '@/components/Page';
import styles from './ProfilePage.module.scss';
import { useAppData } from '@/contexts/AppDataContext';
import { Avatar, Button } from '@telegram-apps/telegram-ui';
import { GroupList, GroupListItem } from '@/components/GroupList/GroupList';
import LinkList, { LinkListItem } from '@/components/LinkList/LinkList';
import WalletIcon from '@/assets/icons/wallet.svg?react';
import CurrencyIcon from '@/assets/icons/currency.svg?react';
import ChatIcon from '@/assets/icons/chat.svg?react';
import GlobeIcon from '@/assets/icons/globe.svg?react';
import HistoryIcon from '@/assets/icons/history.svg?react';
import FaqIcon from '@/assets/icons/faq.svg?react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { truncateAddress } from '@/utils/truncateAddress';
import { useMemo, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '@/contexts/ToastContext';
import { copyTextToClipboard, openTelegramLink } from '@telegram-apps/sdk';
import { useCurrency, CURRENCY_OPTIONS, CurrencyCode } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';

export const ProfilePage = () => {
  const { user } = useAppData();
  const wallet = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { selected, setSelected } = useCurrency();

  const { t, lang, languages } = useI18n();

  const currencyValueRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const languageValueRef = useRef<HTMLDivElement | null>(null);

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
      showError(t('common.failedOpenLink'));
    }
  }, [tonConnectUI, showError, t]);

  const handleCopyWallet = useCallback(async () => {
    if (!walletDisplay) {
      showError(t('common.noWallet'));
      return;
    }
    try {
      await copyTextToClipboard(walletDisplay);
      showSuccess(t('common.copiedToClipboard'));
    } catch (e) {
      console.error('Copy failed', e);
      showError(t('common.copyFailed'));
    }
  }, [walletDisplay, showError, showSuccess, t]);

  const onCurrencyChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const val = ev.target.value as CurrencyCode;
    try {
      await setSelected(val);
      showSuccess(t('profile.currencyUpdated'));
    } catch (e) {
      console.error('Currency change failed', e);
      showError(t('profile.currencyUpdateFailed') ?? 'Failed to change currency');
    }
  };

  const currentLangItem = languages.find((l) => l.code === lang) ?? languages[0];

  const mainItems: GroupListItem[] = useMemo(() => {
    const arr: GroupListItem[] = [];

    if (isWalletConnected) {
      arr.push({
        key: 'wallet',
        label: t('profile.wallet'),
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
        label: t('profile.wallet'),
        value: (
          <Button mode="bezeled" size="s" className={styles.connect} onClick={openConnectModal}>
            {t('profile.connect')}
          </Button>
        ),
        icon: <WalletIcon />,
        iconBg: '#007aff',
        ariaLabel: 'Connect wallet (button)',
      });
    }

    arr.push({
      key: 'language',
      label: t('profile.language'),
      value: (
        <div
          ref={languageValueRef}
          style={{ position: 'relative', display: 'inline-block', minWidth: 120 }}
          aria-hidden
        >
          <div style={{ lineHeight: 1 }}>{currentLangItem.nativeLabel}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }} />
        </div>
      ),
      icon: <GlobeIcon />,
      iconBg: '#af52de',
      onClick: () => {
        try {
          navigate('/language');
        } catch (e) {
          console.error('Language navigation failed', e);
        }
      },
      ariaLabel: 'Default language',
    });

    arr.push({
      key: 'currency',
      label: t('profile.defaultCurrency'),
      value: (
        <div ref={currencyValueRef} style={{ position: 'relative', display: 'inline-block', minWidth: 84 }}>
          <span aria-hidden>{user?.defaultCurrency ?? selected}</span>
          <select
            ref={selectRef}
            aria-label={t('profile.selectCurrencyAria') ?? 'Select default currency'}
            defaultValue={user?.defaultCurrency ?? selected}
            onChange={onCurrencyChange}
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
      onClick: () => {
        selectRef.current?.focus();
      },
      ariaLabel: 'Default currency',
    });

    return arr;
  }, [
    isWalletConnected,
    truncated,
    handleCopyWallet,
    openConnectModal,
    user?.defaultCurrency,
    selected,
    currentLangItem,
    languages,
    t,
    navigate,
  ]);

  const secondaryItems: GroupListItem[] = useMemo(() => {
    return [
      {
        key: 'faq',
        label: t('profile.faq'),
        value: '',
        icon: <FaqIcon />,
        iconBg: '#32ade6',
        onClick: () => navigate('/faq'),
        ariaLabel: 'Open FAQ',
      },
      {
        key: 'contact_support',
        label: t('profile.contactSupport'),
        value: '',
        icon: <ChatIcon />,
        iconBg: '#ff9f43',
        onClick: () => {
          try {
            openTelegramLink('https://t.me/starsbase_support');
          } catch (e) {
            console.error('Failed to open telegram link', e);
            showError(t('common.failedOpenLink'));
          }
        },
        ariaLabel: 'Contact Stars Base support on Telegram',
      },
    ];
  }, [navigate, showError, t]);

  const historyGroupItems: GroupListItem[] = useMemo(() => {
    return [
      {
        key: 'history',
        label: t('profile.history'),
        value: '',
        icon: <HistoryIcon className='white-icon'/>,
        iconBg: '#8e8e93',
        onClick: () => navigate('/history'),
        ariaLabel: 'Open History',
      },
    ];
  }, [navigate, t]);

  const policyLinks: LinkListItem[] = useMemo(() => {
    return [
      { key: 'user-agreement', label: t('profile.userAgreement'), to: '/user-agreement' },
      { key: 'privacy-policy', label: t('profile.privacyPolicy'), to: '/privacy-policy' },
    ];
  }, [t]);

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
            <div className={styles.name}>{displayName || t('profile.unknown')}</div>
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
            <p className={styles.subtitle}>{t('profile.supportNotice')}</p>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ProfilePage;