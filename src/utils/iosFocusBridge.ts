/**
 * iOS WebKit only allows .focus() synchronously inside a user-gesture handler.
 * This bridge creates a hidden input, focuses it inside the tap handler,
 * then signals the next page to steal focus from it — which iOS permits
 * because the keyboard is already up.
 */

const BRIDGE_INPUT_ID = '__ios_focus_bridge__';

/** Call this SYNCHRONOUSLY inside a click/touchend handler before navigate. */
export function primeIosFocusBridge(): void {
  // Remove any stale bridge
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
    'font-size:16px', // prevents iOS zoom
    'z-index:-1',
  ].join(';');

  document.body.appendChild(el);
  el.focus(); // ← synchronous, inside gesture = iOS allows this
}

/**
 * Call this on the destination page mount.
 * Transfers focus from the bridge input to your real input.
 * iOS allows this because focus is already active (keyboard is up).
 */
export function claimIosFocusBridge(
  realInput: HTMLInputElement | null
): void {
  if (!realInput) return;

  const bridge = document.getElementById(BRIDGE_INPUT_ID) as HTMLInputElement | null;
  if (bridge) {
    realInput.focus({ preventScroll: true });
    bridge.remove();
  } else {
    // Fallback: no bridge found, try direct focus anyway
    realInput.focus({ preventScroll: true });
  }
}