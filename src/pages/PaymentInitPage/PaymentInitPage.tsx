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
import styles from './PaymentInitPage.module.scss';

type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

export const PaymentInitPage: React.FC = () => {
  const location = useLocation();
  const { search, state } = location as { search: string; state?: { from?: string } };
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);

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

  const settle = (status: InvoiceStatus) => {
    if (settledRef.current) return;
    settledRef.current = true;

    switch (status) {
      case 'paid': {
        (async () => {
          let apyUsed = 58.6;
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
    const bridge = (eventType: string, eventData: any) => {
      const type = String(eventType || '').toLowerCase();
      if (type === 'invoice_closed' || type === 'invoiceclosed') {
        const status = String(eventData?.status || '').toLowerCase() as InvoiceStatus;
        if (status === 'paid' || status === 'cancelled' || status === 'failed' || status === 'pending') {
          settle(status);
        }
      }
    };

    const tgAny: any = (window as any).Telegram || ((window as any).Telegram = {});
    tgAny.WebView = tgAny.WebView || {};
    const prevIOSAndroid = tgAny.WebView.receiveEvent;
    tgAny.WebView.receiveEvent = (et: string, ed: unknown) => {
      try { bridge(et, ed); } finally { try { prevIOSAndroid?.(et, ed); } catch {} }
    };

    const prevDesktop = (window as any).TelegramGameProxy?.receiveEvent;
    if (!(window as any).TelegramGameProxy) (window as any).TelegramGameProxy = {};
    (window as any).TelegramGameProxy.receiveEvent = (et: string, ed: unknown) => {
      try { bridge(et, ed); } finally { try { prevDesktop?.(et, ed); } catch {} }
    };

    const prevWP = (window as any).TelegramGameProxy_receiveEvent;
    (window as any).TelegramGameProxy_receiveEvent = (et: string, ed: unknown) => {
      try { bridge(et, ed); } finally { try { prevWP?.(et, ed); } catch {} }
    };

    const onMessage = (evt: MessageEvent) => {
      const data = evt?.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object') {
            bridge(parsed.eventType, parsed.eventData);
          }
        } catch { /* ignore */ }
      } else if (data && typeof data === 'object' && 'eventType' in data) {
        bridge((data as any).eventType, (data as any).eventData);
      }
    };
    window.addEventListener('message', onMessage);

    let offInvoice: (() => void) | undefined;
    try {
      const handler = (event: { status: InvoiceStatus }) => settle(event.status);
      WebApp.onEvent('invoiceClosed', handler);
      offInvoice = () => WebApp.offEvent('invoiceClosed', handler);
    } catch {}

    return () => {
      try { tgAny.WebView.receiveEvent = prevIOSAndroid; } catch {}
      try {
        if (prevDesktop) (window as any).TelegramGameProxy.receiveEvent = prevDesktop;
        else delete (window as any).TelegramGameProxy?.receiveEvent;
      } catch {}
      try {
        if (prevWP) (window as any).TelegramGameProxy_receiveEvent = prevWP;
        else delete (window as any).TelegramGameProxy_receiveEvent;
      } catch {}
      window.removeEventListener('message', onMessage);
      try { offInvoice?.(); } catch {}
    };
  },);

  useEffect(() => {
    let visHandler: (() => void) | undefined;

    (async () => {
      if (!userId || !isValidDeposit(requestedAmount)) {
        showError('Invalid request.');
        goBackSafely();
        return;
      }

      try {
        const { data } = await axios.post(
          'https://starstake-server.vercel.app/create-token-invoice',
          {
            userId: Number(userId),
            telegramStarsPrice: payable,
            title: 'Stake Stars',
            description: `Stake deposit (30-day lock). Requested: ${requestedAmount}, Payable: ${payable}.`,
            label: `Stake ${payable} Stars`,
            meta: { kind: 'direct', slug: 'stake-deposit', name: 'Stars Stake Deposit' }
          }
        );

        const link = data?.invoiceLink as string | undefined;
        if (!link) {
          showError('Unable to start payment. Try again.');
          goBackSafely();
          return;
        }

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
      try { visHandler?.(); } catch {}
    };
  }, [requestedAmount, payable, userId]);

  return (
    <Page back={false}>
      <div className={styles.paymentInitLayout}>
        <Spinner size='m' />
        <h3>Processing…</h3>
      </div>
    </Page>
  );
};