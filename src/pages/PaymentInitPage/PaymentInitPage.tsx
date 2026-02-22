import React, { useEffect, useMemo, useRef, useContext } from 'react';
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
  parseAmountInput
} from '@/utils/deposit';
import { ToastContext } from '@/contexts/ToastContext';
import { db } from '@/configs/firebaseConfig';
import {
  doc,
  increment,
  getDoc,
  collection,
  serverTimestamp,
  Timestamp,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { tierForTotal } from '@/utils/apy';
import { useAppData } from '@/contexts/AppDataContext';
import { useRates } from '@/contexts/RatesContext';
import { formatEnUS } from '@/utils/formatEnUS';
import styles from './PaymentInitPage.module.scss';
import { useI18n } from '@/i18n';
import { openInvoiceByLink, type InvoiceStatus } from '@/utils/invoice';
import { getStakePromoResult } from '@/utils/stakePromo';

async function getServerNow(uid: string): Promise<Date> {
  const ref = doc(db, 'users', uid, 'meta', 'clock');
  await setDoc(ref, { now: serverTimestamp() }, { merge: true });
  const snap = await getDoc(ref);
  const ts = snap.get('now') as Timestamp | undefined;
  return ts ? ts.toDate() : new Date();
}

export const PaymentInitPage: React.FC = () => {
  const location = useLocation();
  const { search, state } = location as { search: string; state?: { from?: string } };
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);
  const { exchangeRate } = useAppData();
  const { tonUsd } = useRates();
  const { t } = useI18n();

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

  const redirectBack = (fallback: string = '/deposit') => {
    const from = (state?.from && typeof state.from === 'string' && state.from.startsWith('/'))
      ? state.from
      : null;

    const target = (from && from !== location.pathname) ? from : fallback;

    setTimeout(() => {
      navigate(target, { replace: true });
    }, 0);
  };

  const settle = (status: InvoiceStatus) => {
    if (settledRef.current) return;
    settledRef.current = true;

    switch (status) {
      case 'paid': {
        (async () => {
          let apyUsed = 12.8;
          let bonusUsed = 0;
          let creditedUsed = payable;
          let boostLabel: string | null = null;

          try {
            if (userId) {
              const serverNow = await getServerNow(userId);
              const promo = getStakePromoResult(payable, serverNow);

              bonusUsed = promo.bonusAmount;
              creditedUsed = promo.creditedAmount;
              boostLabel = promo.boostLabel;

              const userRef = doc(db, 'users', userId);
              const statsRef = doc(db, 'stats', 'global');

              const positionsCol = collection(db, 'users', userId, 'positions');
              const historyCol = collection(db, 'users', userId, 'history');

              const positionRef = doc(positionsCol);
              const historyRef = doc(historyCol);

              const { unlock } = computeUnlockDates(serverNow);

              await runTransaction(db, async (tx) => {
                const userSnap = await tx.get(userRef);
                if (!userSnap.exists()) {
                  throw new Error('User document not found');
                }

                const statsSnap = await tx.get(statsRef);

                const u = userSnap.data() || {};
                const curCents = Number.isFinite(u.starsCents)
                  ? Number(u.starsCents)
                  : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
                const preBalanceInt = Math.floor(curCents / 100);

                // ✅ Tier hesabı credited amount-a görə (1.5X event üçün)
                const newTotal = preBalanceInt + creditedUsed;
                const { tier, apy } = tierForTotal(newTotal);
                apyUsed = apy;

                tx.set(positionRef, {
                  amount: creditedUsed,               // ✅ staked amount with bonus
                  baseAmount: payable,                // ✅ original paid
                  bonusAmount: bonusUsed,             // ✅ bonus part
                  promoEventId: promo.eventId,        // ✅ null if no promo
                  promoMultiplier: promo.active ? 1.5 : 1,
                  apy,
                  tier,
                  createdAt: serverTimestamp(),
                  unlockAt: Timestamp.fromDate(unlock),
                  lastAccruedAt: serverTimestamp(),
                  accruedDays: 0,
                  fracCarryCents: 0,
                });

                tx.set(historyRef, {
                  type: 'stake',
                  amount: creditedUsed,               // ✅ credited shown in history
                  baseAmount: payable,
                  bonusAmount: bonusUsed,
                  promoEventId: promo.eventId,
                  promoMultiplier: promo.active ? 1.5 : 1,
                  apy,
                  createdAt: serverTimestamp(),
                });

                tx.update(userRef, {
                  starsCents: (curCents + creditedUsed * 100),
                  starsBalance: Math.floor((curCents + creditedUsed * 100) / 100),
                  currentApy: apy,
                  updatedAt: serverTimestamp(),
                });

                if (!statsSnap.exists()) {
                  tx.set(statsRef, {
                    totalStaked: creditedUsed,
                    exchangeRate: 0.0199,
                    systemHealth: 'Stable',
                    promoBonusDistributed: bonusUsed,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                } else {
                  tx.update(statsRef, {
                    totalStaked: increment(creditedUsed),
                    promoBonusDistributed: increment(bonusUsed),
                    updatedAt: serverTimestamp(),
                  });
                }
              });
            }
          } catch (e) {
            console.error('Firestore update error:', e);
            showError(t('payment.unableOpen'));
            redirectBack('/deposit');
            return;
          }

          const { short } = computeUnlockDates();
          showSuccess(t('payment.paymentSuccessful'));

          navigate(
            `/payment/success?paid=${payable}&credited=${creditedUsed}&bonus=${bonusUsed}&unlock=${encodeURIComponent(short)}&requested=${requestedAmount}&apy=${apyUsed}${boostLabel ? `&boost=${encodeURIComponent(boostLabel)}` : ''}`,
            { replace: true }
          );
        })();
        break;
      }

      case 'cancelled':
      case 'failed':
      case 'pending':
      default: {
        showError(t('payment.paymentCancelled'));
        redirectBack('/deposit');
        break;
      }
    }
  };

  useEffect(() => {
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
        const usd = (exchangeRate ?? 0) * payable;
        const usdCents = Math.max(0, Math.round(usd * 100));
        const ton = (tonUsd > 0) ? (usd / tonUsd) : 0;
        const tonMilli = ton > 0 ? Math.round(ton * 1000) : 0;
        const apyHint = 0;

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
          showError(t('payment.unableStart'));
          redirectBack('/deposit');
          return;
        }

        if (cancelled) return;
        if (openedRef.current) return;
        openedRef.current = true;

        const status = await openInvoiceByLink(link);

        if (cancelled) return;
        settle(status);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          showError(t('payment.unableOpen'));
          redirectBack('/deposit');
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedAmount, payable, userId, exchangeRate, tonUsd]);

  return (
    <Page back={false}>
      <div className={styles.paymentInitLayout}>
        <Spinner size='m' />
        <h3>{t('payment.processing')}</h3>
      </div>
    </Page>
  );
};