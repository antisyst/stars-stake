import React, { useEffect, useMemo, useRef, useContext, useState } from 'react';
import { Page } from '@/components/Page';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { mainButton } from '@telegram-apps/sdk';
import { Spinner } from '@telegram-apps/telegram-ui';
import {
  calcPayable,
  computeUnlockDates,
  isValidDeposit,
  parseAmountInput,
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
  Timestamp,
} from 'firebase/firestore';
import { tierForTotal } from '@/utils/apy';
import { useAppData } from '@/contexts/AppDataContext';
import { useRates } from '@/contexts/RatesContext';
import { formatEnUS } from '@/utils/formatEnUS';
import styles from './PaymentInitPage.module.scss';
import { useI18n } from '@/i18n';
import { openInvoiceByLink, type InvoiceStatus } from '@/utils/invoice';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
  sendTonAndVerify,
  TON_MERCHANT_ADDRESS,
  TON_PAYMENT_DISCOUNT,
  type TonStakeStep,
} from '@/utils/tonPaymentsApi';
import { friendlyTonError } from '@/components/TonPayButton/TonPayButton';

export const PaymentInitPage: React.FC = () => {
  const location = useLocation();
  const { search, state } = location as { search: string; state?: { from?: string } };
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);
  const { exchangeRate } = useAppData();
  const { tonUsd } = useRates();
  const { t } = useI18n();

  // Always hide the Telegram main button on this page
  useEffect(() => {
    try { mainButton.setParams({ isVisible: false, isLoaderVisible: false, isEnabled: false }); } catch {}
    try { if (mainButton.isMounted?.()) mainButton.unmount(); } catch {}
  }, []);

  // Parse URL
  const params          = new URLSearchParams(search);
  const rawAmount       = params.get('amount') ?? '0';
  const method          = params.get('method') ?? 'stars';
  const isTon           = method === 'ton';

  const requestedAmount = useMemo(() => parseAmountInput(rawAmount), [rawAmount]);
  const payable         = useMemo(() => calcPayable(requestedAmount), [requestedAmount]);

  const initDataState = useSignal(initData.state);
  const userId = initDataState?.user?.id ? String(initDataState.user.id) : null;

  // H3 label — updated as the TON step progresses
  const [tonStep, setTonStep] = useState<TonStakeStep | null>(null);

  const [tonConnectUI] = useTonConnectUI();

  const openedRef    = useRef(false);
  const settledRef   = useRef(false);
  const cancelledRef = useRef(false);

  const redirectBack = (fallback = '/deposit') => {
    const from =
      state?.from && typeof state.from === 'string' && state.from.startsWith('/')
        ? state.from
        : null;
    const target = from && from !== location.pathname ? from : fallback;
    setTimeout(() => navigate(target, { replace: true }), 0);
  };

  // ─── STARS FLOW — 100% untouched ─────────────────────────────────────────

  const settle = (status: InvoiceStatus) => {
    if (settledRef.current) return;
    settledRef.current = true;

    switch (status) {
      case 'paid': {
        (async () => {
          let apyUsed = 12.8;
          try {
            if (userId) {
              const userRef  = doc(db, 'users', userId);
              const statsRef = doc(db, 'stats', 'global');

              const userSnap = await getDoc(userRef);
              const u = userSnap.data() || {};
              const curCents = Number.isFinite(u.starsCents)
                ? Number(u.starsCents)
                : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
              const preBalanceInt = Math.floor(curCents / 100);

              const newTotal      = preBalanceInt + payable;
              const { tier, apy } = tierForTotal(newTotal);
              apyUsed = apy;

              const { unlock } = computeUnlockDates();
              const positionsCol = collection(db, 'users', userId, 'positions');
              const historyCol   = collection(db, 'users', userId, 'history');

              await Promise.all([
                addDoc(positionsCol, {
                  amount: payable, apy, tier,
                  createdAt: serverTimestamp(),
                  unlockAt: Timestamp.fromDate(unlock),
                  lastAccruedAt: serverTimestamp(),
                  accruedDays: 0,
                  fracCarryCents: 0,
                }),
                addDoc(historyCol, { type: 'stake', amount: payable, apy, createdAt: serverTimestamp() }),
                updateDoc(userRef, {
                  starsCents: curCents + payable * 100,
                  starsBalance: Math.floor((curCents + payable * 100) / 100),
                  currentApy: apy,
                  updatedAt: serverTimestamp(),
                }),
                updateDoc(statsRef, { totalStaked: increment(payable), updatedAt: serverTimestamp() }),
              ]);
            }
          } catch (e) {
            console.error('Firestore update error:', e);
          }

          const { short } = computeUnlockDates();
          showSuccess(t('payment.paymentSuccessful'));
          navigate(
            `/payment/success?paid=${payable}&unlock=${encodeURIComponent(short)}&requested=${requestedAmount}&apy=${apyUsed}`,
            { replace: true }
          );
        })();
        break;
      }
      default: {
        showError(t('payment.paymentCancelled'));
        redirectBack('/deposit');
        break;
      }
    }
  };

  useEffect(() => {
    if (isTon) return; // TON branch below

    let cancelled = false;

    (async () => {
      try {
        if (!userId || !isValidDeposit(requestedAmount)) {
          showError(t('payment.invalidRequest'));
          redirectBack('/deposit');
          return;
        }

        const formatted = formatEnUS(payable);
        const title = t('payment.stakeTitle').replace('{amount}', String(formatted));
        const label = t('payment.stakeLabel').replace('{amount}', String(formatted));

        const lockDays = 30;
        const usd      = (exchangeRate ?? 0) * payable;
        const usdCents = Math.max(0, Math.round(usd * 100));
        const ton      = tonUsd > 0 ? usd / tonUsd : 0;
        const tonMilli = ton > 0 ? Math.round(ton * 1000) : 0;

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
              extras: { p: payable, a: 0, u: usdCents, t: tonMilli, d: lockDays },
            },
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const link = data?.invoiceLink as string | undefined;
        if (!link) { showError(t('payment.unableStart')); redirectBack('/deposit'); return; }

        if (cancelled) return;
        if (openedRef.current) return;
        openedRef.current = true;

        const status = await openInvoiceByLink(link);
        if (cancelled) return;
        settle(status);
      } catch (e) {
        console.error(e);
        if (!cancelled) { showError(t('payment.unableOpen')); redirectBack('/deposit'); }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedAmount, payable, userId, exchangeRate, tonUsd]);

  // ─── TON FLOW ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isTon) return;

    cancelledRef.current = false;

    (async () => {
      try {
        if (!userId || !isValidDeposit(requestedAmount)) {
          showError(t('payment.invalidRequest'));
          redirectBack('/deposit');
          return;
        }

        const usd          = (exchangeRate ?? 0) * payable;
        const tonFull      = tonUsd > 0 ? usd / tonUsd : 0;
        const discountedTon = tonFull * TON_PAYMENT_DISCOUNT;

        if (!Number.isFinite(discountedTon) || discountedTon <= 0) {
          showError(t('tonPay.priceNotReady'));
          redirectBack('/deposit');
          return;
        }

        const orderId = `${userId}_stake_${payable}_${Date.now()}_${Math.random()
          .toString(16).slice(2)}`;

        const { walletAddress, expectedNano, verify } = await sendTonAndVerify({
          tonConnectUI: tonConnectUI as any,
          amountTonDiscounted: discountedTon,
          orderId,
          commentPrefix: `starstake|stake|${payable}`,
          timeoutMs: 150_000,
          pollEveryMs: 3_500,
          onStep: (s) => { if (!cancelledRef.current) setTonStep(s); },
        });

        if (cancelledRef.current) return;

        // Firestore write — only after on-chain verification succeeds
        const userRef    = doc(db, 'users', userId);
        const statsRef   = doc(db, 'stats', 'global');
        const userSnap   = await getDoc(userRef);
        const u          = userSnap.data() || {};

        const curCents = Number.isFinite(u.starsCents)
          ? Number(u.starsCents)
          : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
        const preBalanceInt = Math.floor(curCents / 100);
        const newTotal      = preBalanceInt + payable;
        const { tier, apy } = tierForTotal(newTotal);
        const { unlock, short } = computeUnlockDates();

        const positionsCol = collection(db, 'users', userId, 'positions');
        const historyCol   = collection(db, 'users', userId, 'history');

        await Promise.all([
          addDoc(positionsCol, {
            amount: payable, apy, tier,
            createdAt: serverTimestamp(),
            unlockAt: Timestamp.fromDate(unlock),
            lastAccruedAt: serverTimestamp(),
            accruedDays: 0,
            fracCarryCents: 0,
            paymentMethod: 'ton',
            paidTon: discountedTon,
            paidNanoTon: expectedNano.toString(),
            tonWallet: walletAddress,
            tonMerchant: TON_MERCHANT_ADDRESS,
            tonTxHash: verify.txHash,
            tonTxLt: verify.txLt ?? null,
            tonOrderId: orderId,
          }),
          addDoc(historyCol, {
            type: 'stake',
            amount: payable, apy,
            paymentMethod: 'ton',
            paidTon: discountedTon,
            tonTxHash: verify.txHash,
            createdAt: serverTimestamp(),
          }),
          updateDoc(userRef, {
            starsCents: curCents + payable * 100,
            starsBalance: Math.floor((curCents + payable * 100) / 100),
            currentApy: apy,
            updatedAt: serverTimestamp(),
          }),
          updateDoc(statsRef, { totalStaked: increment(payable), updatedAt: serverTimestamp() }),
        ]);

        if (cancelledRef.current) return;

        showSuccess(t('payment.paymentSuccessful'));
        navigate(
          `/payment/success?paid=${payable}&unlock=${encodeURIComponent(short)}&requested=${requestedAmount}&apy=${apy}`,
          { replace: true }
        );
      } catch (e: any) {
        console.error('[TON PaymentInitPage]', e);
        if (!cancelledRef.current) {
          showError(friendlyTonError(e, t));
          redirectBack('/deposit');
        }
      }
    })();

    return () => { cancelledRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTon, requestedAmount, payable, userId, exchangeRate, tonUsd]);

  // ── H3 text — updates live as TON step progresses ────────────────────────
  const h3Text = isTon ? tonStepLabel(tonStep, t) : t('payment.processing');

  return (
    <Page back={false}>
      <div className={styles.paymentInitLayout}>
        <Spinner size="m" />
        <h3>{h3Text}</h3>
      </div>
    </Page>
  );
};

function tonStepLabel(step: TonStakeStep | null, t: (k: string) => string): string {
  switch (step) {
    case 'connect': return t('tonPay.connecting');
    case 'send':    return t('tonPay.confirm');
    case 'verify':  return t('tonPay.verifying');
    default:        return t('payment.processing');
  }
}