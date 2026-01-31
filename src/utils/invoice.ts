import { on } from '@telegram-apps/bridge';

export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

const STATUSES = new Set<InvoiceStatus>(['paid', 'cancelled', 'failed', 'pending']);

function normalizeStatus(input: unknown): InvoiceStatus | null {
  if (typeof input === 'string' && STATUSES.has(input as InvoiceStatus)) return input as InvoiceStatus;
  if (input && typeof input === 'object') {
    const s = (input as any).status;
    if (typeof s === 'string' && STATUSES.has(s as InvoiceStatus)) return s as InvoiceStatus;
  }
  return null;
}

function getTelegramWebApp(): any | null {
  return (window as any)?.Telegram?.WebApp ?? null;
}

export function openInvoiceByLink(
  invoiceLink: string,
  opts?: { timeoutMs?: number }
): Promise<InvoiceStatus> {
  const timeoutMs = Math.max(5_000, opts?.timeoutMs ?? 120_000);

  return new Promise<InvoiceStatus>((resolve, reject) => {
    let done = false;
    let timer: number | null = null;

    let offBridge: (() => void) | null = null;
    let waHandler: ((ev: any) => void) | null = null;

    const cleanup = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }

      try { offBridge?.(); } catch {}
      offBridge = null;

      try {
        const wa = getTelegramWebApp();
        if (wa?.offEvent && waHandler) wa.offEvent('invoiceClosed', waHandler);
      } catch {}
      waHandler = null;
    };

    const finish = (status: InvoiceStatus) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(status);
    };

    const fail = (err: unknown) => {
      if (done) return;
      done = true;
      cleanup();
      reject(err);
    };

    timer = window.setTimeout(() => {
      fail(new Error(`Invoice timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    offBridge = on('invoice_closed', (payload: any) => {
      const st = normalizeStatus(payload?.status ?? payload);
      if (st) finish(st);
    });

    try {
      const wa = getTelegramWebApp();
      if (wa?.onEvent) {
        waHandler = (ev: any) => {
          const st = normalizeStatus(ev?.status ?? ev);
          if (st) finish(st);
        };
        wa.onEvent('invoiceClosed', waHandler);
      }
    } catch {
      // ignore
    }

    try {
      const wa = getTelegramWebApp();
      if (!wa?.openInvoice) {
        fail(new Error('Telegram.WebApp.openInvoice is not available in this environment.'));
        return;
      }

      wa.openInvoice(invoiceLink, (status: any) => {
        const st = normalizeStatus(status);
        if (st) finish(st);
      });
    } catch (e) {
      fail(e);
    }
  });
}