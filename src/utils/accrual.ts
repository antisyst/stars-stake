import {
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
  runTransaction,
  Timestamp,
  collection,
  getDocs,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import type { Position } from '@/types';

export function startOfUTCDate(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export function daysBetweenUTC(from: Date, to: Date) {
  const A = startOfUTCDate(from).getTime();
  const B = startOfUTCDate(to).getTime();
  const MS = 24 * 60 * 60 * 1000;
  const diff = Math.floor((B - A) / MS);
  return diff > 0 ? diff : 0;
}

async function getServerTime(uid: string): Promise<Date> {
  const ref = doc(db, 'users', uid, 'meta', 'clock');
  await setDoc(ref, { now: serverTimestamp() }, { merge: true });
  const snap = await getDoc(ref);
  const ts = snap.get('now') as Timestamp | undefined;
  return ts ? ts.toDate() : new Date();
}

function apyDailyRate(apy: number) {
  return (apy / 100) / 365;
}

type AccrualResult = {
  addCents: number;   
  totalDailyFloat: number; 
};

export async function applyDailyAccrualTx(uid: string): Promise<AccrualResult> {
  const posCol = collection(db, 'users', uid, 'positions');
  const posSnap = await getDocs(query(posCol));
  const posDocs: QueryDocumentSnapshot<DocumentData>[] = posSnap.docs;

  const now = await getServerTime(uid);
  const todayUTC = startOfUTCDate(now);

  let addCentsTotal = 0;
  let totalDailyFloat = 0;

  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) return;

    const u = userSnap.data() as any;
    const curCentsBase = Number.isFinite(u.starsCents)
      ? Number(u.starsCents)
      : Math.max(0, Math.floor((u.starsBalance || 0) * 100));
    let newCents = curCentsBase;

    for (const d of posDocs) {
      const posRef = doc(db, 'users', uid, 'positions', d.id);
      const snap = await tx.get(posRef);
      if (!snap.exists()) continue;

      const data = snap.data() as Position & {
        lastAccruedAt?: Timestamp;
        accruedDays?: number;  
        fracCarryCents?: number; 
      };

      const amount = Math.max(0, Math.floor(data.amount || 0));
      const apy = Number(data.apy) || 0;
      const createdAtTs = data.createdAt as Timestamp | undefined;

      if (!createdAtTs || amount <= 0 || apy <= 0) {
        if (amount > 0 && apy > 0) totalDailyFloat += amount * apyDailyRate(apy);
        continue;
      }

      const createdAt = createdAtTs.toDate();
      const lastAccTs = (data.lastAccruedAt as Timestamp) || createdAtTs;
      const lastAcc = lastAccTs.toDate();

      const nDays = daysBetweenUTC(lastAcc, todayUTC);
      const dailyRate = apyDailyRate(apy);
      const perDayCentsFloat = amount * dailyRate * 100; 

      totalDailyFloat += amount * dailyRate;

      if (nDays <= 0) continue;

      const carryCents = Number.isFinite(data.fracCarryCents) ? (data.fracCarryCents as number) : 0;
      const prevAccDays = Number.isFinite(data.accruedDays) ? (data.accruedDays as number) : 0;

      const totalFloatCents = nDays * perDayCentsFloat + carryCents;
      const addCents = Math.floor(totalFloatCents);
      const nextCarryCents = totalFloatCents - addCents;

      if (addCents > 0) {
        newCents += addCents;
        addCentsTotal += addCents;
      }

      const nextAccDays = prevAccDays + nDays;
      const nextLastAcc = startOfUTCDate(new Date(createdAt.getTime() + nextAccDays * 24 * 60 * 60 * 1000));

      tx.update(posRef, {
        lastAccruedAt: Timestamp.fromDate(nextLastAcc),
        accruedDays: nextAccDays,
        fracCarryCents: nextCarryCents,
      });
    }

    if (addCentsTotal > 0) {
      tx.update(userRef, {
        starsCents: newCents,
        starsBalance: Math.floor(newCents / 100),
        updatedAt: serverTimestamp(),
      });

      const hRef = doc(collection(db, 'users', uid, 'history'));
      tx.set(hRef, {
        type: 'reward',
        amount: Math.floor(addCentsTotal / 100), 
        apySnapshot: null,
        createdAt: serverTimestamp(),
      });
    }
  });

  return { addCents: addCentsTotal, totalDailyFloat };
}