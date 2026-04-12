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

export function useRouteBarColors() {
  const location = useLocation();

  useEffect(() => {
    const route = routes.find((r) => r.path === location.pathname) as any;

    const bgColor     = resolveColor(route?.bgColor);
    const bottomColor = resolveColor(route?.bottomBarColor);

    try { (miniApp as any).setBackgroundColor(bgColor); }  catch {}
    try { (miniApp as any).setBottomBarColor(bottomColor); } catch {}

    return () => {
      try { (miniApp as any).setBackgroundColor(DEFAULT_COLOR); }  catch {}
      try { (miniApp as any).setBottomBarColor(DEFAULT_COLOR); }   catch {}
    };
  }, [location.pathname]);
}