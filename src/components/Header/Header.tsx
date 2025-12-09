import styles from './Header.module.scss';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { popup, copyTextToClipboard } from '@telegram-apps/sdk';
import { Avatar, Button } from '@telegram-apps/telegram-ui';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { truncateAddress } from '@/utils/truncateAddress';
import { ToastContext } from '@/contexts/ToastContext';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import TonIcon from '@/assets/icons/toncoin-simple.svg?react';
import CopyIcon from '@/assets/icons/copy.svg?react';
import DisconnectIcon from '@/assets/icons/disconnect.svg?react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const initDataState = useSignal(initData.state);
  const user = initDataState?.user;
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonAddress();
  const { showSuccess } = useContext(ToastContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const avatarRedirectedForRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleFirstSuccessfulConnect = async () => {
      if (!wallet || !user?.id) return;

      const uid = String(user.id);
      const userRef = doc(db, 'users', uid);

      try {
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(
            userRef,
            {
              id: user.id,
              username: user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Anonymous',
              walletConnected: true,
              walletAddress: wallet,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );

          if (!cancelled) showSuccess('Wallet connected');
          return;
        }

        const data = snap.data() as any;
        const alreadyConnected = Boolean(data?.walletConnected);
        const existingAddress = typeof data?.walletAddress === 'string' ? data.walletAddress : '';

        if (!alreadyConnected) {
          if (!cancelled) showSuccess('Wallet connected');
        }

        const needUpdate =
          !alreadyConnected ||
          existingAddress.toLowerCase() !== String(wallet).toLowerCase();

        if (needUpdate) {
          try {
            await updateDoc(userRef, {
              walletConnected: true,
              walletAddress: wallet,
              updatedAt: serverTimestamp(),
            });
          } catch (updateErr) {
            try {
              await setDoc(userRef, { walletConnected: true, walletAddress: wallet, updatedAt: serverTimestamp() }, { merge: true });
            } catch (mergeErr) {
              console.error('Failed to write wallet info (merge fallback):', mergeErr);
            }
          }
        }
      } catch (err) {
        console.error('Error checking/setting walletConnected/walletAddress flag:', err);
      }
    };

    handleFirstSuccessfulConnect();

    return () => { cancelled = true; };
  }, [wallet, user?.id, user?.firstName, user?.lastName, user?.username, showSuccess]);

  useEffect(() => {
    const photoUrl = user?.photoUrl ? String(user.photoUrl).trim() : '';
    if (!photoUrl) return;

    if (avatarRedirectedForRef.current === photoUrl) return;

    if (location.pathname === '/home') {
      avatarRedirectedForRef.current = photoUrl;
      return;
    }

    let img = new Image();
    let cleanedUp = false;

    img.onload = () => {
      if (cleanedUp) return;
      avatarRedirectedForRef.current = photoUrl;
      try {
        navigate('/home', { replace: true });
      } catch (e) {
        console.error('Navigation to /home failed after avatar load:', e);
      }
    };
    img.onerror = (err) => {
      avatarRedirectedForRef.current = photoUrl;
      console.warn('Avatar image failed to load', err);
    };

    img.src = photoUrl;

    return () => {
      cleanedUp = true;
      img.onload = null;
      img.onerror = null;
      img = null as any;
    };
  }, [user?.photoUrl, location.pathname, navigate]);

  const handleWalletClick = () => {
    if (!wallet) {
      tonConnectUI.openModal();
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleCopy = async () => {
    const toCopy = wallet ?? (initDataState?.user as any)?.walletAddress ?? '';
    if (toCopy) {
      try {
        await copyTextToClipboard(toCopy);
        showSuccess('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    popup.open({
      title: 'Disconnect Wallet',
      message: 'Are you sure you want to disconnect wallet?',
      buttons: [
        { id: 'disconnect', type: 'destructive', text: 'Disconnect' },
        { type: 'cancel' },
      ],
    }).then((buttonId) => {
      if (buttonId === 'disconnect') {
        tonConnectUI.disconnect();
      }
    }).catch((e) => {
      console.error('Popup error:', e);
    });
  };

  const dropdownItems = [
    {
      label: 'Copy address',
      icon: <CopyIcon className="text-icon" />,
      onClick: handleCopy,
    },
    {
      label: 'Disconnect',
      icon: <DisconnectIcon className="destructive-icon" />,
      onClick: handleDisconnect,
    },
  ];

  const onProfileClick = () => {
    if (user?.id) navigate('/profile');
  };

  return (
    <div className={styles.mainHeader}>
      <div 
       className={styles.profileWrapper}
       onClick={onProfileClick} 
       role="button" 
       tabIndex={0} 
       aria-label="Open profile"
      >
        {user?.photoUrl ? (
          <Avatar
            src={user.photoUrl}
            size={40}
            alt="Profile"
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.profilePlaceholder}>
            {user?.firstName?.[0] || 'U'}
          </div>
        )}
      </div>
      <div className={styles.walletButtonWrapper}>
        <Button
          ref={buttonRef}
          mode={wallet ? 'bezeled' : 'filled'}
          className={`${styles.walletButton} ${wallet ? styles.bezeled : styles.filled}`}
          onClick={handleWalletClick}
        >
          {wallet ? (
            truncateAddress(wallet)
          ) : (
            <>
              <TonIcon className="icon" />
              Connect
            </>
          )}
        </Button>
        <Dropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          items={dropdownItems}
          position="right"
          triggerRef={buttonRef}
        />
      </div>
    </div>
  );
};