import { useEffect } from 'react';
import { miniApp, useLaunchParams, useSignal } from '@telegram-apps/sdk-react';
import { applyTheme } from '@/theme/applyTheme';
import type { Platform, Scheme } from '@/theme/palettes';

export function useTheme() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const platform: Platform =
    lp.platform === 'ios' ? 'ios' :
    lp.platform === 'android' ? 'android' : 'web';

  const scheme: Scheme = isDark ? 'dark' : 'light';

  useEffect(() => {
    const palette = applyTheme(platform, scheme);

    try { (miniApp as any).setHeaderColor?.(palette.headerBg); } catch {}
    try { (miniApp as any).setBackgroundColor?.(palette.secondaryBg); } catch {}
    try { (miniApp as any).setBottomBarColor?.(palette.bottomBarBg); } catch {}

    document.documentElement.setAttribute('data-platform', platform);
    document.documentElement.setAttribute('data-scheme', scheme);
  }, [platform, scheme]);
}