import BarChartUpIcon from '@/assets/icons/bar-chart-up.svg?react';
import ShieldIcon from '@/assets/icons/shield.svg?react';
import TrendingUpIcon from '@/assets/icons/trending-up.svg?react';

export type Benefit = {
  title: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  content: string;
};

export const ecosystemBenefits: Benefit[] = [
  {
    title: 'Marketplace Liquidity Support',
    Icon: BarChartUpIcon,
    content: [
      'The Stars Base system contributes to maintaining stable liquidity across the Telegram Stars Marketplace.',
      'By temporarily locking Stars in staking pools, the circulating supply decreases, helping stabilize market activity.',
      'This ensures consistent buying power, smoother transactions, and a healthier trading environment for all participants.',
      'A balanced liquidity model keeps the Stars ecosystem sustainable and resistant to sudden market fluctuations.',
      'Liquidity stability also strengthens confidence among both users and developers integrating Stars payments.'
    ].join('\n'),
  },
  {
    title: 'Anti-Inflation System',
    Icon: ShieldIcon,
    content: [
      'Staking directly supports the anti-inflation mechanics of the Stars ecosystem by reducing the volume of Stars in circulation.',
      'As more users stake their Stars, supply contraction naturally helps preserve the long-term value of the asset.',
      'This process creates a self-balancing economy where growth remains stable and organic.',
      'The system ensures that both early and long-term participants benefit from consistent and fair yield conditions.',
      'By minimizing uncontrolled inflation, the ecosystem safeguards reward sustainability for all users.',
    ].join('\n'),
  },
  {
    title: 'Infrastructure Funding',
    Icon: TrendingUpIcon,
    content: [
      'A portion of staking activity supports the ongoing development of Telegram’s Stars payment and staking infrastructure.',
      'This includes maintaining secure transactions, efficient processing systems, and reliable scalability for millions of users.',
      'By participating in staking, users indirectly contribute to improving the performance and resilience of the ecosystem.',
      'Infrastructure funding ensures that the Stars network remains fast, secure, and future-ready.',
      'These resources enable continuous upgrades, technical maintenance, and future feature expansions.',
    ].join('\n'),
  },
];