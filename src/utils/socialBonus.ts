import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';

export const BONUS_STARS = 75;
export const X_TARGET_USERNAME = 'starsbase_bot';
export const X_TARGET_URL = `https://x.com/${X_TARGET_USERNAME}`;

const PENDING_KEY = 'x_bonus_pending_challenge';
const MIN_EXTERNAL_STAY_MS = 8000;

type PendingChallenge = {
  nonce: string;
  startedAt: number;
  hiddenAt: number | null;
  returnedAt: number | null;
  completed: boolean;
};

function createNonce() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function createPendingChallenge(): PendingChallenge {
  return {
    nonce: createNonce(),
    startedAt: Date.now(),
    hiddenAt: null,
    returnedAt: null,
    completed: false,
  };
}

export function savePendingChallenge(challenge: PendingChallenge) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(challenge));
}

export function readPendingChallenge(): PendingChallenge | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingChallenge;

    if (
      !parsed ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.startedAt !== 'number' ||
      typeof parsed.completed !== 'boolean'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingChallenge() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
}

export function markChallengeHidden() {
  const challenge = readPendingChallenge();
  if (!challenge || challenge.completed) return;

  if (challenge.hiddenAt == null) {
    challenge.hiddenAt = Date.now();
    savePendingChallenge(challenge);
  }
}

export function markChallengeReturned() {
  const challenge = readPendingChallenge();
  if (!challenge || challenge.completed) return;

  if (challenge.hiddenAt != null && challenge.returnedAt == null) {
    challenge.returnedAt = Date.now();
    savePendingChallenge(challenge);
  }
}

export function canFinalizeChallenge() {
  const challenge = readPendingChallenge();
  if (!challenge || challenge.completed) return false;
  if (challenge.hiddenAt == null || challenge.returnedAt == null) return false;

  const hiddenDuration = challenge.returnedAt - challenge.hiddenAt;
  const totalDuration = challenge.returnedAt - challenge.startedAt;

  return hiddenDuration >= MIN_EXTERNAL_STAY_MS && totalDuration >= MIN_EXTERNAL_STAY_MS;
}

export function completeChallenge() {
  const challenge = readPendingChallenge();
  if (!challenge) return;

  challenge.completed = true;
  savePendingChallenge(challenge);
}

export async function claimTwitterBonus(uid: string) {
  const userRef = doc(db, 'users', uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists()) {
      throw new Error('USER_DOCUMENT_NOT_FOUND');
    }

    const data = snap.data() as any;

    if (data.hasClaimedTwitterBonus) {
      throw new Error('ALREADY_CLAIMED');
    }

    const currentCents = Number.isFinite(data.starsCents)
      ? data.starsCents
      : Math.max(0, Math.floor((data.starsBalance || 0) * 100));

    const bonusCents = BONUS_STARS * 100;
    const nextCents = currentCents + bonusCents;

    tx.update(userRef, {
      starsCents: nextCents,
      starsBalance: Math.floor(nextCents / 100),
      hasClaimedTwitterBonus: true,
      twitterBonusStars: BONUS_STARS,
      twitterBonusClaimedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}