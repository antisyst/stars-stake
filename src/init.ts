// init.ts
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
  setDebug,
  emitEvent,
  mockTelegramEnv,
} from '@telegram-apps/sdk';

export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
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

  // Standard bootstrap
  mountBackButton.ifAvailable();
  restoreInitData();

  // This is enough to get Telegram theme params into CSS variables.
  // No need for miniApp.mountSync.
  try {
    bindThemeParamsCssVars();
  } catch {
    // Some clients can throw before the first theme is available; it's safe to ignore.
  }

  // Mount viewport early so viewport CSS vars are available too.
  if (mountViewport.isAvailable()) {
    await mountViewport();
    bindViewportCssVars();
  }
}