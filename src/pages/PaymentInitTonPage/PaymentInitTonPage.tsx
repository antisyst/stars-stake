import React, { useEffect, useMemo, useContext } from 'react';
import { Page } from '@/components/Page';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useAppData } from '@/contexts/AppDataContext';
import { useRates } from '@/contexts/RatesContext';
import { isValidDeposit, parseAmountInput, calcPayable, computeUnlockDates } from '@/utils/deposit';
import { ToastContext } from '@/contexts/ToastContext';
import { db } from '@/configs/firebaseConfig';
import {
  addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc, increment
} from 'firebase/firestore';
import { tierForTotal } from '@/utils/apy';
import styles from './PaymentInitTonPage.module.scss';

const TON_RECIPIENT = import.meta.env.VITE_TON_RECIPIENT as string | undefined;
const UNSAFE_INSTANT_CREDIT = String(import.meta.env.VITE_UNSAFE_TON_INSTANT_CREDIT || '').toLowerCase() === 'true';

export const PaymentInitTonPage: React.FC = () => {
  const location = useLocation();
  const { search, state } = location as { search: string; state?: { from?: string } };
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);

  const params = new URLSearchParams(search);
  const rawAmount = params.get('amount') ?? '0';
  const requestedAmount = useMemo(() => parseAmountInput(rawAmount), [rawAmount]);
  const payable = useMemo(() => calcPayable(requestedAmount), [requestedAmount]);

  const { uid, exchangeRate } = useAppData();
  const { tonUsd } = useRates();

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet(); // <-- hook only here, at top level

  const goBackSafely = () => {
    if (window.history.length > 1) { navigate(-1); return; }
    if (state?.from) { navigate(state.from, { replace: true }); return; }
    navigate('/deposit', { replace: true });
  };

  useEffect(() => {
    // Guard checks
    if (!uid || !isValidDeposit(requestedAmount)) {
      showError('Invalid request.');
      goBackSafely();
      return;
    }
    if (!TON_RECIPIENT) {
      showError('TON recipient is not configured. Set VITE_TON_RECIPIENT.');
      goBackSafely();
      return;
    }
    if (!tonUsd || tonUsd <= 0) {
      showError('TON price unavailable. Try again.');
      goBackSafely();
      return;
    }

    // If wallet is not connected yet, open modal and exit.
    // After the user connects, `wallet` changes, this effect re-runs and continues.
    if (!wallet) {
      tonConnectUI.openModal();
      return;
    }

    // Compute TON amount
    const usd = (exchangeRate ?? 0) * payable;
    const tonAmount = usd / tonUsd;
    const nano = Math.max(0, Math.floor(tonAmount * 1e9)).toString();

    (async () => {
      try {
        // Build a mutable send request (no readonly)
        const request = {
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address: TON_RECIPIENT!,
              amount: nano,
            }
          ]
        };

        const r = await tonConnectUI.sendTransaction(request);

        // Record payment
        const paymentsCol = collection(db, 'users', uid, 'payments');
        const payDocRef = await addDoc(paymentsCol, {
          kind: 'ton',
          amountStars: payable,
          usdCents: Math.round(usd * 100),
          tonAmount,
          tonNano: nano,
          recipient: TON_RECIPIENT,
          boc: r?.boc ?? null,
          createdAt: serverTimestamp(),
          status: UNSAFE_INSTANT_CREDIT ? 'credited' : 'pendingTon',
        });

        if (!UNSAFE_INSTANT_CREDIT) {
          showSuccess('TON transaction sent. Awaiting confirmation.');
          navigate('/home', { replace: true });
          return;
        }

        // INSECURE: client-side instant credit (testing only)
        try {
          const userRef = doc(db, 'users', uid);
          const statsRef = doc(db, 'stats', 'global');
          const userSnap = await getDoc(userRef);
          const u = userSnap.data() || {};
          const curCents = Number.isFinite(u.starsCents)
            ? Number(u.starsCents)
            : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
          const preBalanceInt = Math.floor(curCents / 100);
          const newTotal = preBalanceInt + payable;
          const { tier, apy } = tierForTotal(newTotal);
          const { unlock, short } = computeUnlockDates();

          const positionsCol = collection(db, 'users', uid, 'positions');
          const historyCol   = collection(db, 'users', uid, 'history');

          await Promise.all([
            addDoc(positionsCol, {
              amount: payable,
              apy,
              tier,
              createdAt: serverTimestamp(),
              unlockAt: Timestamp.fromDate(unlock),
              lastAccruedAt: serverTimestamp(),
              accruedDays: 0,
              fracCarryCents: 0,
            }),
            addDoc(historyCol, {
              type: 'stake',
              amount: payable,
              apy,
              createdAt: serverTimestamp(),
            }),
            updateDoc(userRef, {
              starsCents: (curCents + payable * 100),
              starsBalance: Math.floor((curCents + payable * 100) / 100),
              currentApy: apy,
              updatedAt: serverTimestamp(),
            }),
            updateDoc(statsRef, {
              totalStaked: increment(payable),
              updatedAt: serverTimestamp(),
            }),
            updateDoc(payDocRef, { status: 'credited', updatedAt: serverTimestamp() }),
          ]);

          showSuccess('TON payment successful!');
          navigate(
            `/payment/success?paid=${payable}&unlock=${encodeURIComponent(short)}&requested=${requestedAmount}&apy=${28.9}`,
            { replace: true }
          );
        } catch (e) {
          console.error(e);
          showError('Crediting failed. Check connection.');
          goBackSafely();
        }
      } catch (e) {
        console.error(e);
        showError('TON payment cancelled or failed.');
        goBackSafely();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, requestedAmount, payable, exchangeRate, tonUsd, wallet]);

  return (
    <Page back={false}>
      <div className={styles.wrap}>
        <Spinner size="m" />
        <h3>Processing TON payment…</h3>
      </div>
    </Page>
  );
};