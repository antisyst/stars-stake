import BarChartUpIcon from '@/assets/icons/bar-chart-up.svg?react';
import ShieldIcon from '@/assets/icons/shield.svg?react';
import TrendingUpIcon from '@/assets/icons/trending-up.svg?react';

export type Benefit = {
  key: string; 
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export const ecosystemBenefits: Benefit[] = [
  { key: 'ecosystem.items.marketplace', Icon: BarChartUpIcon },
  { key: 'ecosystem.items.antiInflation', Icon: ShieldIcon },
  { key: 'ecosystem.items.infrastructure', Icon: TrendingUpIcon },
];