import { HomePage }             from '@/pages/HomePage/HomePage';
import { HistoryPage }          from '@/pages/HistoryPage/HistoryPage';
import { DepositPage }          from '@/pages/DepositPage/DepositPage';
import { UnstakePage }          from '@/pages/UnstakePage/UnstakePage';
import { PaymentInitPage }      from '@/pages/PaymentInitPage/PaymentInitPage';
import { PaymentSuccessPage }   from '@/pages/PaymentSuccess/PaymentSuccessPage';
import { ProfilePage }          from '@/pages/ProfilePage/ProfilePage';
import { FaqPage }              from '@/pages/FaqPage/FaqPage';
import { UserAgreement }        from '@/pages/UserAgreement/UserAgreement';
import { LanguagePage }         from '@/pages/LanguagePage/LanguagePage';
import { PrivacyPolicy }        from '@/pages/PrivacyPolicy/PrivacyPolicy';
import { TonMarketPage }        from '@/pages/TonMarketPage/TonMarketPage';
import { PasscodeSettingsPage } from '@/pages/PasscodeSettingsPage/PasscodeSettingsPage';
import { PasscodePage }         from '@/pages/PasscodePage/PasscodePage';
import { PasscodeVerifyPage }   from '@/pages/PasscodeVerifyPage/PasscodeVerifyPage';
import { SystemStatusPage }     from '@/pages/SystemStatusPage/SystemStatusPage';
import { Route } from '@/types';

export const routes: Route[] = [
  {
    path: '/home',
    Component: HomePage,
    title: 'Home',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/history',
    Component: HistoryPage,
    title: 'History',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/deposit',
    Component: DepositPage,
    title: 'Deposit',
    headerColor:    '--app-bg',
    bgColor:        '--app-bg',
    bottomBarColor: '--app-bg',
  },
  {
    path: '/unstake',
    Component: UnstakePage,
    title: 'Withdraw',
    headerColor:    '--app-bg',
    bgColor:        '--app-bg',
    bottomBarColor: '--app-bg',
  },
  {
    path: '/payment/init',
    Component: PaymentInitPage,
    title: 'Payment Init',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/payment/success',
    Component: PaymentSuccessPage,
    title: 'Payment Success',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/faq',
    Component: FaqPage,
    title: 'FAQ',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/profile',
    Component: ProfilePage,
    title: 'Profile',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/privacy-policy',
    Component: PrivacyPolicy,
    title: 'Privacy Policy',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/user-agreement',
    Component: UserAgreement,
    title: 'User Agreement',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/language',
    Component: LanguagePage,
    title: 'Language',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/ton-market',
    Component: TonMarketPage,
    title: 'TON Market',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/system-status',
    Component: SystemStatusPage,
    title: 'System Status',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/passcode-verify',
    Component: PasscodeVerifyPage,
    title: 'Enter Passcode',
    headerColor:    '--app-bg',
    bgColor:        '--app-bg',
    bottomBarColor: '--app-bg',
  },
  {
    path: '/passcode-settings',
    Component: PasscodeSettingsPage,
    title: 'Passcode & Face ID',
    headerColor:    'secondary_bg_color',
    bgColor:        'secondary_bg_color',
    bottomBarColor: 'secondary_bg_color',
  },
  {
    path: '/passcode-setup',
    Component: PasscodePage,
    title: 'Set Passcode',
    headerColor:    '--app-bg',
    bgColor:        '--app-bg',
    bottomBarColor: '--app-bg',
  },
];