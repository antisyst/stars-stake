import { Faq } from "@/types";

export const faqs: Faq[] = [
  {
    question: 'Where do rewards for Stars Base come from?',
    answer: [
      'Rewards are generated through the Stars Base ecosystem’s yield distribution model.',
      'Each staking pool contributes to liquidity stability and network infrastructure, which in turn creates sustainable reward cycles.',
      'Part of the yield comes from ecosystem growth, marketplace activity, and staking incentives distributed over time.',
      'No speculative sources are involved, all rewards are backed by real ecosystem value.',
      'This structure ensures fairness, long-term sustainability, and transparency for all participants.'
    ].join('\n'),
  },
  {
    question: 'What is staking and is it secure?',
    answer: [
      'Staking is the process of locking your Stars to support the ecosystem and earn passive rewards in return.',
      'When you stake, your assets remain safely tied to your account and are never transferred to third parties.',
      'The system is built on Telegram’s secure payment infrastructure and operates with full encryption and transparency.',
      'All transactions are verified and auditable, ensuring safety and immutability.',
      'It’s a low-risk mechanism designed for long-term value growth and ecosystem contribution.'
    ].join('\n'),
  },
  {
    question: 'How are rewards calculated?',
    answer: [
      'Rewards are based on your total staked balance and the tier level you currently hold.',
      'Each tier offers a higher Annual Percentage Yield (APY), starting at 36.8% and going up to 45.9% for higher commitments.',
      'APY dynamically adjusts as you increase your stake; larger stakes unlock higher yield rates.',
      'The system automatically recalculates your effective APY in real time.',
      'All reward calculations are transparent and verifiable within the app’s dashboard.'
    ].join('\n'),
  },
  {
    question: 'Can I withdraw my Stars anytime?',
    answer: [
      'Yes, withdrawals are available anytime after your minimum lock period has ended.',
      'You can choose to withdraw directly in Telegram Stars or in Toncoin (TON) based on your preference.',
      'Withdrawals in TON may include a small network fee depending on the amount.',
      'All transactions are processed automatically and securely within minutes.',
      'The system ensures a smooth experience with full traceability.'
    ].join('\n'),
  },
  {
    question: 'What happens if I stake more Stars later?',
    answer: [
      'When you add more Stars to your existing stake, your total balance updates instantly.',
      'The system automatically evaluates your new tier level and applies the corresponding APY boost.',
      'Your previous rewards remain unaffected, while your future yield increases accordingly.',
      'This makes your staking experience dynamic — the more you stake, the more you earn.',
      'There’s no penalty or delay when increasing your stake amount.'
    ].join('\n'),
  },
  {
    question: 'How does Stars Base benefit the Telegram ecosystem?',
    answer: [
      'Stars Base helps maintain liquidity and stability within the Telegram Stars Marketplace.',
      'It also supports anti-inflation measures by reducing the number of circulating Stars.',
      'A portion of all staking activity contributes to payment and staking infrastructure development.',
      'This enables faster payments, higher scalability, and a sustainable economic loop.',
      'By staking, users not only earn but also help strengthen the long-term foundation of the entire Stars ecosystem.'
    ].join('\n'),
  },
  {
    question: 'How does APY affect daily and monthly rewards?',
    answer: [
      'APY (Annual Percentage Yield) represents your yearly return, but rewards are calculated and added daily.',
      'For example, a 36.8% APY corresponds to roughly ~3.06% per month (compounded). If you stake 1,000 Stars, you’ll see about 1,039 after one month (before rounding on display).',
      'Your balance increases every day; compounding works automatically — each day’s yield builds upon the last.',
      'We credit rewards daily with two-decimal precision, while the Stake screen shows the integer balance.',
      'In short, the longer you stake, the more your returns compound over time.'
    ].join('\n'),
  },
  {
    question: 'Is there any risk of losing my Stars?',
    answer: [
      'Stars Base operates under a non-custodial structure, meaning you retain ownership of your assets.',
      'Your funds remain securely locked and verifiable at all times.',
      'The system’s architecture prioritizes transparency and security.',
      'The primary variable is yield fluctuation, not the safety of your funds.'
    ].join('\n'),
  },
  {
    question: 'Is my APY fixed or does it change over time?',
    answer: [
      'APY in Stars Base is dynamic and depends on your total staked amount and system liquidity.',
      'While the base APY starts at 36.8%, it can increase as you move through higher staking tiers.',
      'In rare cases, network or liquidity adjustments may slightly influence the yield rate.',
      'All rate changes are transparent and reflected instantly in your dashboard.',
      'The system aims to keep returns stable and competitive under varying conditions.'
    ].join('\n'),
  },
  {
    question: 'What is the minimum and maximum amount I can stake?',
    answer: [
      'The minimum amount to participate in staking is 300 Stars.',
      'The maximum per single deposit is 100,000 Stars.',
      'Higher amounts automatically unlock higher tiers and better APY rates.',
      'This flexible system rewards both new and long-term users fairly.'
    ].join('\n'),
  },
  {
    question: 'What makes Stars Base different from regular staking platforms?',
    answer: [
      'Stars Base is an ecosystem-native staking model built around Telegram Stars.',
      'It combines high APY rewards with real utility, supporting marketplace liquidity and infrastructure.',
      'Unlike speculative staking apps, value flows remain within the ecosystem.',
      'This ensures transparency, long-term sustainability, and real-world impact for every user.'
    ].join('\n'),
  },
  {
    question: 'What happens to my Stars during the lock period?',
    answer: [
      'Your Stars remain securely staked within the system for the duration of the 30-day minimum lock period.',
      'During this time, they continue generating rewards without any risk of loss or external transfer.',
      'You can monitor your yield growth in real time through the dashboard.',
      'Once the lock period ends, you may withdraw or restake at any time with full control.'
    ].join('\n'),
  },
  {
    question: 'Can I cancel my staking early?',
    answer: [
      'Early unstaking is not available during the initial 30-day lock period to maintain ecosystem stability.',
      'This rule protects all participants by ensuring liquidity consistency and fair yield distribution.',
      'After this period, you can freely withdraw or restake anytime.',
      'The system is designed to balance flexibility with sustainability.'
    ].join('\n'),
  },
  {
    question: 'Are rewards distributed automatically?',
    answer: [
      'Yes, rewards are distributed automatically and updated daily within your account balance.',
      'There’s no need for manual claiming or external transfers.',
      'Your cumulative rewards can be tracked in real time from your staking dashboard.',
      'This automation ensures maximum convenience and transparency for all users.'
    ].join('\n'),
  },
  {
    question: 'How often is APY updated?',
    answer: [
      'APY rates are recalculated based on your active tier and the system’s liquidity health.',
      'When you stake or add new Stars, the update is applied instantly.',
      'This ensures your rewards always reflect your most recent stake level.',
      'It also prevents outdated or delayed yield data from appearing on your account.'
    ].join('\n'),
  },
  {
    question: 'Why does Stars Base use a lock period?',
    answer: [
      'The 30-day minimum lock period helps maintain market liquidity and prevents rapid inflows and outflows that can destabilize the system.',
      'It ensures reward rates remain fair and consistent for all participants.',
      'Lock periods are standard in most staking systems to protect ecosystem integrity.',
      'After the lock ends, you’re free to withdraw or restake without limits.'
    ].join('\n'),
  },
  {
    question: 'What factors can influence the APY rate?',
    answer: [
      'The APY rate depends on overall ecosystem liquidity, total staked volume, and internal market demand.',
      'When more users stake, the pool expands, allowing yield adjustments to maintain balance.',
      'Additionally, system health and market stability are monitored continuously to optimize returns.',
      'All adjustments are algorithmic and transparent to maintain fairness.'
    ].join('\n'),
  },
  {
    question: 'How does compounding work in Stars Base?',
    answer: [
      'Compounding means your daily rewards are added to your balance automatically.',
      'Each new day, your yield is calculated on the updated precise balance (tracked with two decimals), while the Stake page shows the integer amount.',
      'This creates a compounding growth effect over time, boosting long-term returns.'
    ].join('\n'),
  },
  {
    question: 'Can system updates affect my staking balance?',
    answer: [
      'No, updates or maintenance operations do not affect your staked amount or accumulated rewards.',
      'All staking data is stored securely and synchronized.',
      'In rare cases, temporary display delays may occur, but your funds remain safe.',
      'You’ll receive a notification if any scheduled maintenance is planned.'
    ].join('\n'),
  },
];