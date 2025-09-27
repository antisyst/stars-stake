import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import TelegramStarIcon from '@/assets/star.svg';
import { ToastContext } from '@/contexts/ToastContext';
import styles from './PaymentButton.module.scss';
import { formatNumber } from '@/utils/formatNumber';

interface InvoiceClosedEventData {
  status: 'paid' | 'cancelled' | 'failed' | 'pending';
}

export interface PaymentMeta {
  kind: 'direct' | 'tickets';
  slug: string;
  name: string;
  tickets?: number; 
}

export interface PaymentButtonProps {
  cost: number;
  label: string;
  title?: string;
  description?: string;
  onSuccess: () => void;
  variant?: 1 | 2;
  beforeOpen?: () => Promise<boolean | void>;
  meta?: PaymentMeta;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  cost,
  label,
  title,
  description,
  onSuccess,
  variant = 1,
  beforeOpen,
  meta,
}) => {
  const initDataState = useSignal(initData.state);
  const userId = initDataState?.user?.id.toString() ?? null;

  const { showSuccess, showError } = useContext(ToastContext);
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchInvoice = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      const { data } = await axios.post(
        'https://gifth-server.vercel.app/create-token-invoice',
        {
          userId: Number(userId),
          telegramStarsPrice: cost,
          title: title ?? label,
          description: description ?? label,
          label,
          meta, // <-- pass purchase meta to the server
        }
      );
      const link = data.invoiceLink as string;
      if (variant === 1) {
        setInvoiceLink(link);
      }
      return link;
    } catch (err) {
      console.error('Error fetching invoice:', err);
      showError('Unable to start payment. Please try again.');
      return null;
    }
  }, [userId, cost, label, title, description, showError, variant, meta]);

  useEffect(() => {
    if (variant === 1) {
      fetchInvoice();
    }
  }, [fetchInvoice, variant]);

  useEffect(() => {
    const handleInvoiceEvent = async (status: InvoiceClosedEventData['status']) => {
      setProcessing(false);
      fetchInvoice();

      switch (status) {
        case 'paid':
          if (!userId) return;
          try {
            await updateDoc(doc(db, 'users', userId), {
              accessGranted: true,
              totalSpentStars: increment(cost),
            });
            showSuccess('Payment successful!');
            onSuccess();
          } catch (e) {
            console.error('Error granting access:', e);
            showError('Payment succeeded but access failed');
          }
          break;
        case 'cancelled':
          showError('Payment cancelled');
          break;
        case 'failed':
          showError('Payment failed');
          break;
        case 'pending':
          showError('Payment pending');
          break;
      }
    };

    const handleMessage = (e: MessageEvent) => {
      try {
        const { eventType, eventData } = JSON.parse(e.data);
        if (eventType === 'invoice_closed') {
          handleInvoiceEvent(eventData.status);
        }
      } catch {
        // ignore
      }
    };

  window.addEventListener('message', handleMessage)
    window.TelegramGameProxy_receiveEvent = (_, data) =>
      handleInvoiceEvent(data.status)
    if (window.TelegramGameProxy)
      window.TelegramGameProxy.receiveEvent = (_, data) =>
        handleInvoiceEvent(data.status)
    if (window.Telegram && window.Telegram.WebView)
      window.Telegram.WebView.receiveEvent = (_, data) =>
        handleInvoiceEvent(data.status)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.TelegramGameProxy_receiveEvent = null
      if (window.TelegramGameProxy) window.TelegramGameProxy.receiveEvent = null
      if (window.Telegram && window.Telegram.WebView)
        window.Telegram.WebView.receiveEvent = null
    }
  }, [userId, cost, onSuccess, fetchInvoice, showSuccess, showError])

  const handleClick = useCallback(async () => {
    if (processing) return;
    setProcessing(true);

    let link = invoiceLink;
    if (variant === 2 || !link) {
      link = await fetchInvoice();
      if (!link) {
        setProcessing(false);
        return;
      }
    }

    if (beforeOpen) {
      const ok = await beforeOpen();
      if (ok === false) {
        showError('This item is no longer available.');
        setProcessing(false);
        return;
      }
    }

    try {
      WebApp.openInvoice(link);
    } catch (err) {
      console.error('Error opening invoice:', err);
      showError('Unable to open payment. Please try again.');
      setProcessing(false);
    }
  }, [processing, invoiceLink, fetchInvoice, showError, variant, beforeOpen]);

  return (
    <button
      onClick={handleClick}
      disabled={processing}
      className={styles.buyButton}
    >
      {processing ? (
        <p>Loading...</p>
      ) : (
        <>
          <img
            src={TelegramStarIcon}
            alt="★"
            style={{ width: 16, marginRight: 4 }}
          />
          {formatNumber(cost)}
        </>
      )}
    </button>
  );
};