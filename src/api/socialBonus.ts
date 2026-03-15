import { getTelegramInitDataRaw } from '@/utils/telegramInitData';

export type TwitterBonusStatusResponse = {
  ok: boolean;
  connected: boolean;
  claimed: boolean;
  followed: boolean;
  xUsername?: string;
  rewardStars: number;
  targetUsername?: string;
};

export type TwitterStartResponse = {
  ok: boolean;
  authUrl: string;
};

export type TwitterClaimResponse = {
  ok: boolean;
  claimed: boolean;
  addedStars?: number;
  balanceStars?: number;
  message?: string;
};

function getHeaders() {
  const initData = getTelegramInitDataRaw();
  return {
    'Content-Type': 'application/json',
    'telegram-web-app-init-data': initData,
  };
}

export async function getTwitterBonusStatus(): Promise<TwitterBonusStatusResponse> {
  const res = await fetch('/social/twitter/status', {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to load Twitter bonus status');
  return data;
}

export async function startTwitterConnect(): Promise<TwitterStartResponse> {
  const res = await fetch('/social/twitter/start', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to start Twitter connect');
  return data;
}

export async function claimTwitterBonus(): Promise<TwitterClaimResponse> {
  const res = await fetch('/social/twitter/claim', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to claim Twitter bonus');
  return data;
}