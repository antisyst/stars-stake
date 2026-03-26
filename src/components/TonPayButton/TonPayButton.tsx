import { useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '@/contexts/ToastContext';
import { useAppData } from '@/contexts/AppDataContext';
import { TON_PAYMENT_DISCOUNT } from '@/utils/tonPaymentsApi';
import { useI18n } from '@/i18n';
import { isValidDeposit } from '@/utils/deposit';

export type TonPayStep = null; // DepositPage only needs idle/paying boolean now

/**
 * useTonPay
 *
 * Validates, computes the discounted TON amount, then navigates to
 * /payment/init?amount=X&method=ton  — identical to how the Stars flow works.
 * PaymentInitPage owns the full TON lifecycle (connect → send → verify →
 * Firestore write → /payment/success).
 *
 * Returns:
 *   discountedTon  — what the user pays; shown in the DepositTag pill
 *   paying         — true for the brief moment between tap and navigation
 *   handlePress    — call when the user taps the TON pill
 */
export function useTonPay({
  starsAmount,
  tonAmount,
  disabled,
}: {
  starsAmount: number;
  tonAmount: number;
  disabled?: boolean;
}) {
  const { showError } = useContext(ToastContext);
  const { user } = useAppData();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [paying, setPaying] = useState(false);
  const guardRef = useRef(false);

  // Discounted TON — what the user actually pays (no UI label for the discount)
  const discountedTon = tonAmount * TON_PAYMENT_DISCOUNT;

  const handlePress = useCallback(() => {
    if (paying || disabled || guardRef.current) return;

    if (!isValidDeposit(starsAmount)) {
      showError(t('tonPay.priceNotReady'));
      return;
    }

    if (!Number.isFinite(discountedTon) || discountedTon <= 0) {
      showError(t('tonPay.priceNotReady'));
      return;
    }

    const userId = user?.id ? String(user.id) : null;
    if (!userId) {
      showError(t('tonPay.userNotDetected'));
      return;
    }

    guardRef.current = true;
    setPaying(true);

    // Navigate with method=ton — PaymentInitPage detects this and runs TON flow
    navigate(
      `/payment/init?amount=${starsAmount}&method=ton`,
      { replace: true, state: { from: '/deposit' } }
    );

    // Reset guard after navigation tick (this component unmounts anyway)
    setTimeout(() => {
      guardRef.current = false;
      setPaying(false);
    }, 600);
  }, [paying, disabled, starsAmount, discountedTon, user?.id, navigate, showError, t]);

  return { discountedTon, paying, handlePress };
}

// ─────────────────────────────────────────────────────────────────────────────
// friendlyTonError
// Used by PaymentInitPage to map raw SDK errors to clean user-facing strings.
// NEVER leaks "[TON_CONNECT_SDK_ERROR]_UserRejectsError" or similar internals.
// ─────────────────────────────────────────────────────────────────────────────

export function friendlyTonError(e: any, t: (k: string) => string): string {
  const msg: string =
    typeof e?.message === 'string' ? e.message.toLowerCase() : '';

  // User tapped "Decline" / "Reject" in the wallet app
  if (
    msg.includes('reject') ||
    msg.includes('decline') ||
    msg.includes('userrejects') ||
    msg.includes('user rejects') ||
    e?.code === 300
  ) {
    return t('tonPay.rejected');
  }

  // Wallet modal dismissed / connection cancelled
  if (msg.includes('cancel') || msg.includes('closed') || msg.includes('dismiss')) {
    return t('tonPay.cancelled');
  }

  // Timeout waiting for connection or on-chain confirmation
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return t('tonPay.verifyFailed');
  }

  // On-chain tx never found within polling window
  if (
    msg.includes('confirmation') ||
    msg.includes('on-chain') ||
    msg.includes('not found') ||
    msg.includes('toncenter')
  ) {
    return t('tonPay.verifyFailed');
  }

  // Network / HTTP layer errors
  if (
    msg.includes('http') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch')
  ) {
    return t('tonPay.networkError');
  }

  // Generic fallback — intentionally vague, never leaks internals
  return t('tonPay.failed');
}