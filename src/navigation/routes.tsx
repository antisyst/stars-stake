import { HomePage } from '@/pages/HomePage/HomePage';
import { HistoryPage } from '@/pages/HistoryPage/HistoryPage';
import { DepositPage } from '@/pages/DepositPage/DepositPage';
import { PaymentInitPage } from '@/pages/PaymentInitPage/PaymentInitPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccess/PaymentSuccessPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { FaqPage } from '@/pages/FaqPage/FaqPage';
import { UserAgreement } from '@/pages/UserAgreement/UserAgreement';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy/PrivacyPolicy';
import { Route } from '@/types';

export const routes: Route[] = [
  { path: '/home', Component: HomePage, title: 'Home' },
  { path: '/history', Component: HistoryPage, title: 'History' },
  { path: '/deposit', Component: DepositPage, title: 'Deposit' },
  { path: '/payment/init', Component: PaymentInitPage, title: 'Payment Init' },
  { path: '/payment/success', Component: PaymentSuccessPage, title: 'Payment Success' },
  { path: '/faq', Component: FaqPage, title: 'FAQ' },
  { path: '/profile', Component: ProfilePage, title: 'Profile' },
  { path: '/privacy-policy', Component: PrivacyPolicy, title: 'User Agreement' },
  { path: '/user-agreement', Component: UserAgreement, title: 'User Agreement' }
];