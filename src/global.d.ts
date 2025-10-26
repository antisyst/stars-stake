declare global {
  interface InvoiceClosedEventData {
    status: 'paid' | 'cancelled' | 'failed' | 'pending';
    slug?: string;
  }
  interface Window {
    TelegramGameProxy_receiveEvent?: ((eventType: string, eventData: unknown) => void) | null;
    TelegramGameProxy?: { receiveEvent?: ((eventType: string, eventData: unknown) => void) | null };
    Telegram?: { WebView?: { receiveEvent?: ((eventType: string, eventData: unknown) => void) | null } };
  }
}

export {};