import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentTime } from '@tma.js/sdk';
import CheckIcon from '@/assets/icons/check.svg?react';
import { Page } from '@/components/Page';
import { useI18n } from '@/i18n';
import styles from './SystemStatusPage.module.scss';

const SYSTEMS = [
  'Core Protocol',
  'TON Network Gateway',
  'Liquidity Vaults',
  'APY Calculation Engine',
  'Transaction Indexer',
  'Withdrawal Queue Sync',
  'Hardware Security Modules',
  'Internal Database',
  'API Gateway',
  'Validator Relay Services',
  'Treasury Reserve Verification',
  'Global Node Distribution',
  'Proof-of-Stake Consensus Relay',
  'Smart Contract Oracle Layer',
  'Encryption Entropy Seed Pool',
  'Audit Ledger Immutability',
  'Automated Liquidity Safeguard',
];

const DAYS = 30;

function getLast30Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface SystemRowProps {
  name: string;
  days: Date[];
  operationalLabel: string;
  daysAgoLabel: string;
  todayLabel: string;
}

const SystemRow: React.FC<SystemRowProps> = ({
  name,
  days,
  operationalLabel,
  daysAgoLabel,
  todayLabel,
}) => (
  <div className={styles.systemRow}>
    <div className={styles.systemHeader}>
      <span className={styles.systemName}>{name}</span>
      <span className={styles.statusLabel}>{operationalLabel}</span>
    </div>
    <div className={styles.barsContainer}>
      {days.map((day, i) => (
        <div
          key={i}
          className={styles.bar}
          title={day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
      ))}
    </div>
    <div className={styles.timeLabels}>
      <span className={styles.timeLabel}>{daysAgoLabel}</span>
      <span className={styles.timeLabel}>{todayLabel}</span>
    </div>
  </div>
);

export const SystemStatusPage: React.FC = () => {
  const { t } = useI18n();
  const days = useMemo(() => getLast30Days(), []);

  const [serverDate, setServerDate] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const time = await getCurrentTime();
        if (!cancelled) setServerDate(time);
      } catch {
        if (!cancelled) setServerDate(new Date());
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dateLabel = formatDate(serverDate ?? new Date());

  const operationalLabel = t('systemStatus.operational');
  const daysAgoLabel     = t('systemStatus.daysAgo').replace('{days}', String(DAYS));
  const todayLabel       = t('systemStatus.today');

  return (
    <Page back backTo="/home">
      <div className={styles.statusPage}>
        <span className={styles.dateText}>{dateLabel}</span>
         <div className={styles.allOperationalBanner}>
           <span className={styles.checkIcon}>
            <CheckIcon className='white-icon'/>
           </span>
           <span className={styles.allOpText}>All Systems Operational</span>
          </div>
        <div className={styles.systemsList}>
          {SYSTEMS.map((system) => (
            <SystemRow
              key={system}
              name={system}
              days={days}
              operationalLabel={operationalLabel}
              daysAgoLabel={daysAgoLabel}
              todayLabel={todayLabel}
            />
          ))}
        </div>

        <div className={styles.incidentsSection}>
          <h3 className={styles.incidentsTitle}>{t('systemStatus.pastIncidents')}</h3>
          <p className={styles.noIncidents}>{t('systemStatus.noIncidents')}</p>
        </div>
      </div>
    </Page>
  );
};