import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
} from 'firebase/firestore';
import type { GlobalStats, UserData, Position } from '@/types';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { weightedApy } from '@/utils/apy';
import { AppDataContextType } from '@/types';

const AppDataContext = createContext<AppDataContextType>({
  loading: true,
  uid: null,
  user: null,
  stats: null,
  positions: [],
  effectiveApy: 48.7,
  exchangeRate: 0.0199,
  balanceUsd: 0,
});

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  useTelegramSdk();
  const initDataState = useSignal(initData.state);

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

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
        if (!userSnap.exists()) {
          const u = initDataState?.user;
          await setDoc(
            userRef,
            {
              id: u?.id ?? Number(uid),
              firstName: u?.firstName || '',
              lastName: u?.lastName || '',
              username: u?.username || '',
              languageCode: u?.languageCode || '',
              photoUrl: u?.photoUrl || '',
              starsBalance: 0,
              currentApy: 48.7,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          const data = userSnap.data() as Partial<UserData>;
          const patch: Partial<UserData> & { updatedAt?: any } = {};
          if (typeof data.starsBalance !== 'number') patch.starsBalance = 0;
          if (typeof data.currentApy !== 'number') patch.currentApy = 48.7;
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
        console.error('Ensure defaults failed:', e);
      } finally {
        if (!cancelled) {
          // no-op
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
        if (snap.exists()) setUser(snap.data() as UserData);
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

  const exchangeRate = stats?.exchangeRate ?? 0.0199;
  const balance = user?.starsBalance ?? 0;

  const effectiveApy = useMemo(() => weightedApy(positions), [positions]);
  const balanceUsd = balance * exchangeRate;

  const value = useMemo(
    () => ({
      loading,
      uid,
      user,
      stats,
      positions,
      effectiveApy,
      exchangeRate,
      balanceUsd,
    }),
    [loading, uid, user, stats, positions, effectiveApy, exchangeRate, balanceUsd]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};