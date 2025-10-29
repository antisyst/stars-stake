import React, { useEffect, useMemo, useRef, useContext } from 'react';
import { Page } from '@/components/Page';
import { useLocation, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { mainButton } from '@telegram-apps/sdk';
import { Spinner } from '@telegram-apps/telegram-ui';
import {
  calcPayable,
  computeUnlockDates,
  isValidDeposit,
  parseAmountInput
} from '@/utils/deposit';
import { ToastContext } from '@/contexts/ToastContext';
import { db } from '@/configs/firebaseConfig';
import {
  doc,
  increment,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { tierForTotal } from '@/utils/apy';
import { useAppData } from '@/contexts/AppDataContext';
import { useRates } from '@/contexts/RatesContext';
import { formatEnUS } from '@/utils/formatEnUS';
import styles from './PaymentInitPage.module.scss';


export const PaymentInitPage: React.FC = () => {
  const location = useLocation();
  const { search, state } = location as { search: string; state?: { from?: string } };
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);
  const { exchangeRate } = useAppData();
  const { tonUsd } = useRates();

  useEffect(() => {
    try { mainButton.setParams({ isVisible: false, isLoaderVisible: false, isEnabled: false }); } catch {}
    try { if (mainButton.isMounted?.()) mainButton.unmount(); } catch {}
  }, []);

  const params = new URLSearchParams(search);
  const rawAmount = params.get('amount') ?? '0';
  const requestedAmount = useMemo(() => parseAmountInput(rawAmount), [rawAmount]);
  const payable = useMemo(() => calcPayable(requestedAmount), [requestedAmount]);

  const initDataState = useSignal(initData.state);
  const userId = initDataState?.user?.id ? String(initDataState.user.id) : null;

  const openedRef = useRef(false);
  const settledRef = useRef(false);
  const becameHiddenRef = useRef(false);

  const goBackSafely = () => {
    if (window.history.length > 1) { navigate(-1); return; }
    if (state?.from) { navigate(state.from, { replace: true }); return; }
    navigate('/deposit', { replace: true });
  };

  const settle = (status: 'paid' | 'cancelled' | 'failed' | 'pending') => {
    if (settledRef.current) return;
    settledRef.current = true;

    switch (status) {
      case 'paid': {
        (async () => {
          let apyUsed = 12.8;
          try {
            if (userId) {
              const userRef = doc(db, 'users', userId);
              const statsRef = doc(db, 'stats', 'global');

              const userSnap = await getDoc(userRef);
              const u = userSnap.data() || {};
              const curCents = Number.isFinite(u.starsCents)
                ? Number(u.starsCents)
                : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
              const preBalanceInt = Math.floor(curCents / 100);

              const newTotal = preBalanceInt + payable;
              const { tier, apy } = tierForTotal(newTotal);
              apyUsed = apy;

              const { unlock } = computeUnlockDates();
              const positionsCol = collection(db, 'users', userId, 'positions');
              const historyCol   = collection(db, 'users', userId, 'history');

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
              ]);
            }
          } catch (e) {
            console.error('Firestore update error:', e);
          }

          const { short } = computeUnlockDates();
          showSuccess('Payment successful!');
          navigate(
            `/payment/success?paid=${payable}&unlock=${encodeURIComponent(short)}&requested=${requestedAmount}&apy=${apyUsed}`,
            { replace: true }
          );
        })();
        break;
      }
      default:
        showError('Payment cancelled');
        goBackSafely();
        break;
    }
  };

  useEffect(() => {
    let offInvoice: (() => void) | undefined;
    let visHandler: (() => void) | undefined;

    (async () => {
      if (!userId || !isValidDeposit(requestedAmount)) {
        showError('Invalid request.');
        goBackSafely();
        return;
      }

      const formatted = formatEnUS(payable); 
      const title = `Stake ${formatted} Stars`;
      const label = `Stake ${formatted} Stars`;

      const lockDays = 30;
      const usd = (exchangeRate ?? 0) * payable;
      const usdCents = Math.max(0, Math.round(usd * 100));
      const ton = (tonUsd > 0) ? (usd / tonUsd) : 0;
      const tonMilli = ton > 0 ? Math.round(ton * 1000) : 0;
      const apyHint = 0;

      try {
        const { data } = await axios.post(
          'https://starstake-server.vercel.app/create-token-invoice',
          {
            userId: Number(userId),
            telegramStarsPrice: payable,
            title,
            description: `Stake deposit (30-day lock). Requested: ${requestedAmount}, Payable: ${payable}.`,
            label,
            meta: {
              kind: 'stake',
              slug: 'stake-deposit',
              name: 'Stars Base Deposit',
              extras: { p: payable, a: apyHint, u: usdCents, t: tonMilli, d: lockDays }
            }
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const link = data?.invoiceLink as string | undefined;
        if (!link) {
          showError('Unable to start payment. Try again.');
          goBackSafely();
          return;
        }

        const handler = (event: { status: 'paid' | 'cancelled' | 'failed' | 'pending' }) => {
          settle(event.status);
        };
        WebApp.onEvent('invoiceClosed', handler);
        offInvoice = () => WebApp.offEvent('invoiceClosed', handler);

        const onVis = () => {
          if (document.visibilityState === 'hidden') {
            becameHiddenRef.current = true;
          } else if (document.visibilityState === 'visible') {
            setTimeout(() => {
              if (!settledRef.current && becameHiddenRef.current) settle('cancelled');
            }, 350);
          }
        };
        document.addEventListener('visibilitychange', onVis);
        visHandler = () => document.removeEventListener('visibilitychange', onVis);

        if (!openedRef.current) {
          openedRef.current = true;
          WebApp.openInvoice(link);
        }
      } catch (e) {
        console.error(e);
        showError('Unable to open payment. Try again.');
        goBackSafely();
      }
    })();

    return () => {
      try { offInvoice?.(); } catch {}
      try { visHandler?.(); } catch {}
    };
  }, [requestedAmount, payable, userId, exchangeRate, tonUsd]);

  return (
    <Page back={false}>
      <div className={styles.paymentInitLayout}>
        <Spinner size='m' />
        <h3>Processing…</h3>
      </div>
    </Page>
  );
};