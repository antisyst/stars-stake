import { useEffect, useState, useCallback } from 'react';
import {
  mountBiometry,
  isBiometryMounted,
  requestBiometryAccess,
  updateBiometryToken,
  authenticateBiometry,
  openBiometrySettings,
  biometry,
} from '@telegram-apps/sdk';

export type BiometryState = {
  supported: boolean;
  mounted: boolean;
  available: boolean;
  accessGranted: boolean;
  tokenSaved: boolean;
  loading: boolean;
};

function readBiometrySignals(): { available: boolean; accessGranted: boolean; tokenSaved: boolean } {
  const b = biometry as any;
  return {
    available:     Boolean(typeof b.isAvailable     === 'function' ? b.isAvailable()     : false),
    accessGranted: Boolean(typeof b.accessGranted   === 'function' ? b.accessGranted()   :
                           typeof b.isAccessGranted === 'function' ? b.isAccessGranted() : false),
    tokenSaved:    Boolean(typeof b.isTokenSaved    === 'function' ? b.isTokenSaved()    :
                           typeof b.tokenSaved      === 'function' ? b.tokenSaved()      : false),
  };
}

export function useBiometry() {
  const [state, setState] = useState<BiometryState>({
    supported: false,
    mounted: false,
    available: false,
    accessGranted: false,
    tokenSaved: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const canMount = typeof mountBiometry === 'function' &&
                         typeof (mountBiometry as any).isAvailable === 'function' &&
                         (mountBiometry as any).isAvailable();

        if (!canMount) {
          if (!cancelled) setState(s => ({ ...s, supported: false, loading: false }));
          return;
        }

        if (!isBiometryMounted()) {
          await (mountBiometry as any)();
        }

        if (!cancelled) {
          setState({
            supported: true,
            mounted: true,
            loading: false,
            ...readBiometrySignals(),
          });
        }
      } catch (e) {
        console.error('[useBiometry] mount error:', e);
        if (!cancelled) setState(s => ({ ...s, loading: false }));
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(() => {
    if (!isBiometryMounted()) return;
    setState(s => ({ ...s, ...readBiometrySignals() }));
  }, []);

  const requestAccess = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      if (typeof (requestBiometryAccess as any).isAvailable === 'function' &&
          !(requestBiometryAccess as any).isAvailable()) return false;
      const granted = await requestBiometryAccess({ reason });
      refresh();
      return Boolean(granted);
    } catch (e) {
      console.error('[useBiometry] requestAccess error:', e);
      return false;
    }
  }, [refresh]);

  const updateToken = useCallback(async (token: string, reason?: string): Promise<boolean> => {
    try {
      if (typeof (updateBiometryToken as any).isAvailable === 'function' &&
          !(updateBiometryToken as any).isAvailable()) return false;
      const result = await updateBiometryToken(
        token ? { token, reason } : { reason }
      );
      refresh();
      if (typeof result === 'boolean') return result;
      return result === 'updated' || result === 'removed';
    } catch (e) {
      console.error('[useBiometry] updateToken error:', e);
      return false;
    }
  }, [refresh]);

  const authenticate = useCallback(async (reason?: string): Promise<{ status: string; token?: string }> => {
    try {
      if (typeof (authenticateBiometry as any).isAvailable === 'function' &&
          !(authenticateBiometry as any).isAvailable()) return { status: 'failed' };
      return await authenticateBiometry({ reason }) as { status: string; token?: string };
    } catch (e) {
      console.error('[useBiometry] authenticate error:', e);
      return { status: 'failed' };
    }
  }, []);

  const openSettings = useCallback(() => {
    try {
      if (typeof (openBiometrySettings as any).isAvailable === 'function' &&
          !(openBiometrySettings as any).isAvailable()) return;
      openBiometrySettings();
    } catch {}
  }, []);

  return { state, requestAccess, updateToken, authenticate, openSettings, refresh };
}