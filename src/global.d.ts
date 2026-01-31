declare global {
  interface InvoiceClosedEventData {
    slug?: string;
    status: "paid" | "cancelled" | "failed" | "pending";
  }
  interface Window {
    TelegramGameProxy_receiveEvent?: ((eventType: string, eventData: InvoiceClosedEventData) => void) | null;
    TelegramGameProxy?: { receiveEvent: ((eventType: string, eventData: InvoiceClosedEventData) => void) | null };
    Telegram?: { WebView?: { receiveEvent?: ((eventType: string, eventData: InvoiceClosedEventData) => void) | null } };
  }
}

export {};
