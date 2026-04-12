import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  $debug,
  init as initSDK,
} from '@telegram-apps/sdk-react';
import { init as initTmaSdk } from '@tma.js/sdk';

export function init(debug: boolean): void {
  $debug.set(debug);

  initSDK();

  try {
    initTmaSdk();
  } catch {}

  if (!backButton.isSupported() || !miniApp.isSupported()) {
    throw new Error('ERR_NOT_SUPPORTED');
  }

  backButton.mount();
  miniApp.mount();
  themeParams.mount();
  initData.restore();
  void viewport
    .mount()
    .catch(e => {
      console.error('Something went wrong mounting the viewport', e);
    })
    .then(() => {
      viewport.bindCssVars();
    });

  miniApp.bindCssVars();
  themeParams.bindCssVars();
}