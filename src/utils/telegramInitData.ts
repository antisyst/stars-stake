export function getTelegramInitDataRaw(): string {
  try {
    const raw = (window as any)?.Telegram?.WebApp?.initData;
    return typeof raw === 'string' ? raw : '';
  } catch {
    return '';
  }
}