import { Address, beginCell } from '@ton/core';

const TONCENTER_API_BASE = 'https://toncenter.com/api/v2';
const TONCENTER_API_KEY =
  '99db533a1c399d858f5b1bb0c3d66f8acdfb307e45563f6b9593fdf8efa3f96d';

export const TON_MERCHANT_ADDRESS =
  'UQAFM3blAmL0fgwLqM8HesCJbgKfxMwN9dgysoJpNYGm2fyz';

export const TON_PAYMENT_DISCOUNT = 0.93;

export function friendlyTonError(
  e: unknown,
  t: (key: string) => string
): string {
  if (!e) return t('tonPay.failed');

  const msg =
    e instanceof Error
      ? e.message
      : typeof e === 'string'
      ? e
      : String((e as any)?.message ?? '');

  const lower = msg.toLowerCase();

  if (
    lower.includes('reject') ||
    lower.includes('declined') ||
    lower.includes('user cancel') ||
    lower.includes('userrejects') ||
    lower.includes('user rejects')
  ) {
    return t('tonPay.errorRejected');
  }

  // User closed the TonConnect modal without connecting
  if (
    lower.includes('cancelled') ||
    lower.includes('canceled') ||
    lower.includes('connection cancelled') ||
    lower.includes('wallet connection cancelled')
  ) {
    return t('tonPay.errorCancelled');
  }

  // Wallet connection timed out
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return t('tonPay.errorTimeout');
  }

  // On-chain verification timed out
  if (lower.includes('confirmation was not found')) {
    return t('tonPay.errorNotConfirmed');
  }

  // Generic fallback
  return t('tonPay.failed');
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TonConnectUI = {
  wallet?: { account?: { address?: string } } | null;
  openModal?: () => void;
  onStatusChange?: (cb: (wallet: any) => void) => () => void;
  onModalStateChange?: (cb: (state: any) => void) => () => void;
  sendTransaction: (tx: any) => Promise<any>;
};

export type TonStakeStep = 'connect' | 'send' | 'verify';

export type TonVerifyResult = {
  txHash: string;
  txLt?: string;
  utime?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function normalizeTonAddress(addr: string): string {
  return Address.parse(addr).toString({
    urlSafe: true,
    bounceable: false,
    testOnly: false,
  });
}

export function buildTonCommentPayloadBase64(text: string): string {
  const cell = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
  return Buffer.from(cell.toBoc()).toString('base64');
}

export function tonToNano(ton: number): bigint {
  if (!Number.isFinite(ton) || ton <= 0) throw new Error('Invalid TON amount.');
  const fixed = ton.toFixed(9);
  const [i, f = ''] = fixed.split('.');
  const frac = (f + '000000000').slice(0, 9);
  const sign = i.startsWith('-') ? -1n : 1n;
  const intPart = BigInt(i.replace('-', ''));
  const fracPart = BigInt(frac);
  return sign * (intPart * 1_000_000_000n + fracPart);
}

function isModalClosedState(state: any): boolean {
  if (!state) return false;
  if (typeof state === 'string') return state.toLowerCase() === 'closed';
  const st = (state as any).status;
  if (typeof st === 'string' && st.toLowerCase() === 'closed') return true;
  const open = (state as any).open;
  if (typeof open === 'boolean') return open === false;
  return false;
}

// ─── Wallet connection ────────────────────────────────────────────────────────
async function ensureConnected(
  tonConnectUI: TonConnectUI,
  timeoutMs = 60_000
): Promise<string> {
  const existing = tonConnectUI.wallet?.account?.address;
  if (existing) return existing;

  if (typeof tonConnectUI.openModal === 'function') tonConnectUI.openModal();

  return new Promise<string>((resolve, reject) => {
    let done = false;
    let unsubStatus: (() => void) | null = null;
    let unsubModal:  (() => void) | null = null;

    const cleanup = () => {
      try { unsubStatus?.(); } catch {}
      try { unsubModal?.();  } catch {}
      unsubStatus = null;
      unsubModal  = null;
    };

    const finish = (addr: string) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      cleanup();
      resolve(addr);
    };

    const cancel = (msg: string) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error(msg));
    };

    const timer = window.setTimeout(
      () => cancel('Wallet connection timed out.'),
      timeoutMs
    );

    if (typeof tonConnectUI.onStatusChange === 'function') {
      unsubStatus = tonConnectUI.onStatusChange((w: any) => {
        const addr = w?.account?.address || w?.wallet?.account?.address;
        if (addr) finish(String(addr));
      });
    }

    if (typeof tonConnectUI.onModalStateChange === 'function') {
      unsubModal = tonConnectUI.onModalStateChange((state: any) => {
        const addrNow = tonConnectUI.wallet?.account?.address;
        if (isModalClosedState(state) && !addrNow) {
          // User closed the modal without connecting
          cancel('Wallet connection cancelled.');
        }
      });
    }
  });
}

// ─── TON Center polling ───────────────────────────────────────────────────────
async function toncenterGetTransactions(
  address: string,
  limit = 25
): Promise<any[]> {
  const url = new URL(`${TONCENTER_API_BASE}/getTransactions`);
  url.searchParams.set('address', address);
  url.searchParams.set('limit', String(limit));

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'X-API-Key': TONCENTER_API_KEY },
  });

  const text = await resp.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!resp.ok || !data?.ok) {
    const err = data?.error ? String(data.error) : text || `HTTP ${resp.status}`;
    throw new Error(`TON Center error: ${err}`);
  }

  return Array.isArray(data?.result) ? data.result : [];
}

function extractCommentFromInMsg(inMsg: any): string {
  const direct = inMsg?.message;
  if (typeof direct === 'string' && direct.trim()) return direct;

  const msgData = inMsg?.msg_data;
  const text    = msgData?.text;
  if (typeof text === 'string' && text.trim()) return text;

  const body = msgData?.body;
  if (typeof body === 'string' && body.trim()) return body;

  return '';
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function sendTonAndVerify(args: {
  tonConnectUI: TonConnectUI;
  merchantAddress?: string;
  amountTonDiscounted: number;
  orderId: string;
  commentPrefix?: string;
  timeoutMs?: number;
  pollEveryMs?: number;
  onStep?: (s: TonStakeStep) => void;
  onConnected?: (walletAddress: string) => void | Promise<void>;
}): Promise<{ walletAddress: string; expectedNano: bigint; verify: TonVerifyResult }> {
  const {
    tonConnectUI,
    amountTonDiscounted,
    orderId,
    timeoutMs  = 150_000,
    pollEveryMs = 3_500,
    onStep,
    onConnected,
  } = args;

  const merchantAddress = args.merchantAddress ?? TON_MERCHANT_ADDRESS;

  onStep?.('connect');
  const walletAddress = await ensureConnected(tonConnectUI, 60_000);
  await onConnected?.(walletAddress);

  const expectedNano = tonToNano(amountTonDiscounted);
  const comment      = `${args.commentPrefix ?? 'starstake'}|ton|${orderId}`;
  const payload      = buildTonCommentPayloadBase64(comment);

  const tx = {
    validUntil: nowSec() + 5 * 60,
    messages: [
      {
        address: merchantAddress,
        amount:  expectedNano.toString(),
        payload,
      },
    ],
  };

  onStep?.('send');
  await tonConnectUI.sendTransaction(tx);

  onStep?.('verify');

  const t0        = Date.now();
  const fromNorm  = normalizeTonAddress(walletAddress);
  const toNorm    = normalizeTonAddress(merchantAddress);
  const startUtime = nowSec() - 10;

  while (Date.now() - t0 < timeoutMs) {
    const txs = await toncenterGetTransactions(merchantAddress, 25);

    for (const txItem of txs) {
      const utime = Number(txItem?.utime ?? 0);
      if (Number.isFinite(utime) && utime < startUtime) continue;

      const inMsg = txItem?.in_msg;
      if (!inMsg) continue;

      const src = typeof inMsg?.source      === 'string' ? inMsg.source      : '';
      const dst = typeof inMsg?.destination === 'string' ? inMsg.destination : '';
      if (!src || !dst) continue;

      let srcNorm = '';
      let dstNorm = '';
      try {
        srcNorm = normalizeTonAddress(src);
        dstNorm = normalizeTonAddress(dst);
      } catch { continue; }

      if (srcNorm !== fromNorm) continue;
      if (dstNorm !== toNorm)   continue;

      const vRaw = inMsg?.value;
      let valueNano: bigint;
      try {
        valueNano = BigInt(typeof vRaw === 'string' ? vRaw : String(vRaw ?? '0'));
      } catch { continue; }

      if (valueNano !== expectedNano) continue;

      const c = extractCommentFromInMsg(inMsg);
      if (!c || !c.includes(orderId)) continue;

      const txHash = txItem?.transaction_id?.hash;
      const txLt   = txItem?.transaction_id?.lt;

      if (typeof txHash === 'string' && txHash.length > 10) {
        return {
          walletAddress,
          expectedNano,
          verify: {
            txHash,
            txLt:   typeof txLt === 'string' ? txLt : undefined,
            utime:  Number.isFinite(utime) ? utime : undefined,
          },
        };
      }
    }

    await new Promise((r) => setTimeout(r, pollEveryMs));
  }

  throw new Error(
    'TON payment was sent, but confirmation was not found on-chain (timeout).'
  );
}