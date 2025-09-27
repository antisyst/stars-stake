import { useNavigate } from 'react-router-dom';
import { backButton } from '@telegram-apps/sdk';
import { PropsWithChildren, useEffect } from 'react';

type BackButtonOff = () => void;
type BackButtonAPI = {
  onClick?: (fn: (payload?: unknown) => void) => BackButtonOff | void;
  offClick?: (fn: (payload?: unknown) => void) => void;
  show?: () => void;
  hide?: () => void;
};

export function Page({ children, back = true }: PropsWithChildren<{ back?: boolean }>) {
  const navigate = useNavigate();
  const api = backButton as unknown as BackButtonAPI;

  useEffect(() => {
    let offClickFn: BackButtonOff | null = null;

    if (back) {
      try {
        // Show the button for this page if available
        try {
          api.show?.();
        } catch (err) {
          console.warn('backButton.show() failed:', err);
        }

        // Listener without unused parameters to satisfy linters
        const listener = () => {
          navigate(-1);
        };

        try {
          const off = api.onClick ? api.onClick(listener) : undefined;
          if (typeof off === 'function') {
            // SDK returned an off function
            offClickFn = off;
          } else if (typeof api.offClick === 'function') {
            // SDK provides offClick(fn) — use it on cleanup
            offClickFn = () => {
              try {
                api.offClick!(listener);
              } catch {
                /* ignore */
              }
            };
          }
        } catch (err) {
          console.warn('backButton.onClick() failed:', err);
        }
      } catch (err) {
        console.warn('Back button setup error:', err);
      }

      return () => {
        try {
          if (offClickFn) offClickFn();
        } catch {
          /* ignore */
        }
        try {
          api.hide?.();
        } catch {
          /* ignore */
        }
      };
    } else {
      try {
        api.hide?.();
      } catch {
        /* ignore */
      }
      return undefined;
    }
  }, [back, navigate, api]);

  return <div>{children}</div>;
}