import { miniApp } from '@telegram-apps/sdk-react';

export function readCssVar(name: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v.trim();
}

export function setHeaderFromCssVar(varName: string) {
  const color = readCssVar(varName);
  if (!color) return;

  try {
    miniApp.setHeaderColor('bg_color');
  } catch {
    /* ignore */
  }

  try {
    if (typeof (miniApp as any).setBackgroundColor === 'function') {
      (miniApp as any).setBackgroundColor(color);
    }
  } catch {
    /* ignore */
  }
}