import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { db } from '@/configs/firebaseConfig';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import type { GlobalStats, UserData, Position } from '@/types';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { weightedApy } from '@/utils/apy';
import { AppDataContextType } from '@/types';
import { applyDailyAccrualTx } from '@/utils/accrual';

const AppDataContext = createContext<AppDataContextType>({
  loading: true,
  uid: null,
  user: null,
  stats: null,
  positions: [],
  effectiveApy: 12.8,
  exchangeRate: 0.0199,
  balanceUsd: 0,
});

export const useAppData = () => useContext(AppDataContext);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runAccrualWithRetry(uid: string, attempts = 4) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      await applyDailyAccrualTx(uid);
      return;
    } catch (e: any) {
      lastErr = e;
      const isConflict =
        e?.code === 'failed-precondition' ||
        typeof e?.message === 'string' && e.message.includes('failed-precondition');
      if (!isConflict) throw e;
      await sleep(150 * Math.pow(2, i));
    }
  }
  console.error('Accrual permanently failed after retries:', lastErr);
}

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  useTelegramSdk();
  const initDataState = useSignal(initData.state);

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  const accrualOnceRef = useRef(false);

  useEffect(() => {
    const tgUser = initDataState?.user;
    if (tgUser?.id) setUid(String(tgUser.id));
  }, [initDataState?.user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!uid) return;
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const tgUser = initDataState?.user;

        if (!userSnap.exists()) {
          await setDoc(
            userRef,
            {
              id: tgUser?.id ?? Number(uid),
              firstName: tgUser?.firstName || '',
              lastName: tgUser?.lastName || '',
              username: tgUser?.username || '',
              languageCode: tgUser?.languageCode || '',
              photoUrl: tgUser?.photoUrl || '',
              starsCents: 0,
              starsBalance: 0,
              currentApy: 12.8,
              walletConnected: false,
              walletAddress: '',
              defaultCurrency: 'USD',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          const data = userSnap.data() as Partial<UserData> & { starsCents?: number; defaultCurrency?: string };
          const patch: any = {};
          if (!Number.isFinite(data.starsCents)) {
            const sb = typeof (data as any).starsBalance === 'number' ? (data as any).starsBalance : 0;
            patch.starsCents = Math.max(0, Math.floor(sb * 100));
          }
          if (typeof (data as any).starsBalance !== 'number') patch.starsBalance = 0;
          if (typeof data.currentApy !== 'number') patch.currentApy = 12.8;
          if (!data.defaultCurrency) patch.defaultCurrency = 'USD';

          if (tgUser) {
            const updates: any = {};
            if (typeof tgUser.firstName === 'string' && tgUser.firstName !== data.firstName) updates.firstName = tgUser.firstName;
            if (typeof tgUser.lastName === 'string' && tgUser.lastName !== data.lastName) updates.lastName = tgUser.lastName;
            if (typeof tgUser.username === 'string' && tgUser.username !== data.username) updates.username = tgUser.username;
            if (typeof tgUser.photoUrl === 'string' && tgUser.photoUrl !== data.photoUrl) updates.photoUrl = tgUser.photoUrl;

            if ((!data.languageCode || data.languageCode === '') && typeof tgUser.languageCode === 'string' && tgUser.languageCode) {
              updates.languageCode = tgUser.languageCode;
            }

            if (Object.keys(updates).length) {
              updates.updatedAt = serverTimestamp();
              try {
                await updateDoc(userRef, updates);
              } catch (e) {
                await setDoc(userRef, updates, { merge: true });
              }
            }
          }

          if (Object.keys(patch).length) {
            patch.updatedAt = serverTimestamp();
            await setDoc(userRef, patch, { merge: true });
          }
        }

        const statsRef = doc(db, 'stats', 'global');
        const statsSnap = await getDoc(statsRef);
        if (!statsSnap.exists()) {
          await setDoc(
            statsRef,
            {
              totalStaked: 0,
              exchangeRate: 0.0199,
              systemHealth: 'Stable',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (e) {
        console.error('Ensure defaults / sync failed:', e);
      } finally {
        if (!cancelled) {
          // nothing
        }
      }
    })();
    return () => { cancelled = true; };
  }, [uid, initDataState?.user]);

  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    const statsRef = doc(db, 'stats', 'global');
    const posRef = collection(db, 'users', uid, 'positions');
    const posQ = query(posRef, orderBy('createdAt', 'asc'));

    let gotUser = false;
    let gotStats = false;
    let gotPos = false;

    const maybeDone = () => {
      if (gotUser && gotStats && gotPos) setLoading(false);
    };

    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const u = snap.data() as any;
          const cents = Number.isFinite(u.starsCents)
            ? u.starsCents
            : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
          const mirrInt = Math.floor(cents / 100);
          setUser({ ...(u as UserData), starsCents: cents, starsBalance: mirrInt });
        }
        gotUser = true; maybeDone();
      },
      (err) => { console.error('User onSnapshot error:', err); gotUser = true; maybeDone(); }
    );

    const unsubStats = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) setStats(snap.data() as GlobalStats);
        gotStats = true; maybeDone();
      },
      (err) => { console.error('Stats onSnapshot error:', err); gotStats = true; maybeDone(); }
    );

    const unsubPos = onSnapshot(
      posQ,
      (qs) => {
        const arr: Position[] = [];
        qs.forEach(d => arr.push({ id: d.id, ...(d.data() as any) }));
        setPositions(arr);
        gotPos = true; maybeDone();
      },
      (err) => { console.error('Positions onSnapshot error:', err); gotPos = true; maybeDone(); }
    );

    return () => {
      unsubUser(); unsubStats(); unsubPos();
    };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    if (loading) return;
    if (accrualOnceRef.current) return;
    accrualOnceRef.current = true;

    runAccrualWithRetry(uid).catch((e) => {
      console.error('applyDailyAccrualTx failed after retries:', e);
    });
  }, [uid, loading]);

  const exchangeRate = stats?.exchangeRate ?? 0.0199;
  const cents = Number.isFinite((user as any)?.starsCents)
    ? (user as any).starsCents
    : Math.max(0, Math.floor((user?.starsBalance || 0) * 100));
  const balanceIntDisplay = Math.floor(cents / 100);
  const balanceUsd = (cents / 100) * exchangeRate;

  const effectiveApy = useMemo(() => weightedApy(positions), [positions]);

  const value = useMemo(
    () => ({
      loading,
      uid,
      user: user ? { ...user, starsBalance: balanceIntDisplay, starsCents: cents } as any : null,
      stats,
      positions,
      effectiveApy,
      exchangeRate,
      balanceUsd,
    }),
    [loading, uid, user, stats, positions, effectiveApy, exchangeRate, balanceUsd, balanceIntDisplay, cents]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};