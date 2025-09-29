import {
  mountBackButton,
  restoreInitData,
  init as initSDKReact,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
} from '@telegram-apps/sdk-react';

import {
  miniApp,
  setDebug,
  emitEvent,
  mockTelegramEnv,
} from '@telegram-apps/sdk';

let started = false;

export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  if (started) return;
  started = true;

  setDebug(options.debug);
  initSDKReact();

  if (options.eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  if (options.mockForMacOS) {
    let firstThemeSent = false;
    type SDKEvent = [method: string, ...args: unknown[]];
    mockTelegramEnv({
      onEvent(event: SDKEvent, next: () => void) {
        const [method] = event;

        if (method === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParamsState() || {};
          } else {
            firstThemeSent = true;
            const lp = retrieveLaunchParams();
            tp = (lp?.themeParams as ThemeParams) || {};
          }
          emitEvent('theme_changed', { theme_params: tp });
          return;
        }

        if (method === 'web_app_request_safe_area') {
          emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
          return;
        }

        next();
      },
    });
  }

  mountBackButton.ifAvailable();
  restoreInitData();

  try {
    // @ts-ignore optional
    if (miniApp.mountSync?.isAvailable?.()) {
      // @ts-ignore
      miniApp.mountSync();
    }
  } catch {}

  try { bindThemeParamsCssVars(); } catch {}

  if (mountViewport.isAvailable()) {
    try { await mountViewport(); } catch {}
    try { bindViewportCssVars(); } catch {}
  }
}