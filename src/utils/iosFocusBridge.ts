const BRIDGE_INPUT_ID = '__ios_focus_bridge__';

export function primeIosFocusBridge(): void {
  document.getElementById(BRIDGE_INPUT_ID)?.remove();

  const el = document.createElement('input');
  el.id = BRIDGE_INPUT_ID;
  el.type = 'text';
  el.inputMode = 'numeric';
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('tabindex', '-1');
  el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:1px',
    'height:1px',
    'opacity:0',
    'pointer-events:none',
    'border:none',
    'outline:none',
    'background:transparent',
    'font-size:16px',
    'z-index:-1',
  ].join(';');

  document.body.appendChild(el);
  el.focus();
}

export function claimIosFocusBridge(
  realInput: HTMLInputElement | null
): void {
  if (!realInput) return;

  const bridge = document.getElementById(BRIDGE_INPUT_ID) as HTMLInputElement | null;
  if (bridge) {
    realInput.focus({ preventScroll: true });
    bridge.remove();
  } else {
    realInput.focus({ preventScroll: true });
  }
}

export function dismissIosKeyboard(): void {
  document.getElementById(BRIDGE_INPUT_ID)?.remove();
  const active = document.activeElement as HTMLElement | null;
  if (active && typeof active.blur === 'function') {
    active.blur();
  }
}