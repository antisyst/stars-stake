import { HomePage } from '@/pages/HomePage/HomePage';
import { HistoryPage } from '@/pages/HistoryPage/HistoryPage';
import { DepositPage } from '@/pages/DepositPage/DepositPage';
import { PaymentInitPage } from '@/pages/PaymentInitPage/PaymentInitPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccess/PaymentSuccessPage';
import { PaymentInitTonPage } from '@/pages/PaymentInitTonPage/PaymentInitTonPage';
import { FaqPage } from '@/pages/FaqPage/FaqPage';
import { Route } from '@/types';

export const routes: Route[] = [
  { path: '/home', Component: HomePage, title: 'Home' },
  { path: '/history', Component: HistoryPage, title: 'History' },
  { path: '/deposit', Component: DepositPage, title: 'Deposit' },
  { path: '/payment/init', Component: PaymentInitPage, title: 'Payment Init' },
  { path: '/payment/ton', Component: PaymentInitTonPage, title: 'Payment Ton' },
  { path: '/payment/success', Component: PaymentSuccessPage, title: 'Payment Success' },
  { path: '/faq', Component: FaqPage, title: 'FAQ' }
];