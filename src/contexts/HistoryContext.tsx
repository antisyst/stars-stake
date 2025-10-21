import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { db } from '@/configs/firebaseConfig';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import type { Activity } from '@/types';

type HistoryContextType = {
  ready: boolean;
  items: Activity[];
};

const HistoryContext = createContext<HistoryContextType>({
  ready: false,
  items: [],
});

export const useHistoryData = () => useContext(HistoryContext);

export const HistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const initDataState = useSignal(initData.state);
  const uid = initDataState?.user?.id ? String(initDataState.user.id) : null;

  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    if (!uid) return;
    const col = collection(db, 'users', uid, 'history');
    const qAll = query(col, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      qAll,
      (snap) => {
        const list: Activity[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setItems(list);
        setReady(true);
      },
      (err) => {
        console.error('History snapshot error:', err);
        setReady(true);
      }
    );
    return () => unsub();
  }, [uid]);

  const value = useMemo(() => ({ ready, items }), [ready, items]);

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};