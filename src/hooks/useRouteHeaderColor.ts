import { useEffect } from 'react';
import { miniApp } from '@telegram-apps/sdk-react';
import { useLocation } from 'react-router-dom';
import { routes } from '@/navigation/routes';
import { resolveCssVarToHex } from '@/utils/css';

const DEFAULT_COLOR = 'secondary_bg_color';

function resolveColor(color: string | undefined | null): string {
  if (!color) return DEFAULT_COLOR;
  if (color.startsWith('--')) {
    return resolveCssVarToHex(color) || DEFAULT_COLOR;
  }
  return color;
}

export function useRouteHeaderColor() {
  const location = useLocation();

  useEffect(() => {
    const route = routes.find((r) => r.path === location.pathname);
    const color = resolveColor((route as any)?.headerColor);
    try {
      miniApp.setHeaderColor(color as any);
    } catch {}

    return () => {
      try {
        miniApp.setHeaderColor(DEFAULT_COLOR as any);
      } catch {}
    };
  }, [location.pathname]);
}