import React, { useEffect, useMemo, useState } from 'react';
import { Page } from '@/components/Page';
import styles from './HistoryPage.module.scss';
import { useHistoryData } from '@/contexts/HistoryContext';
import { HistoryItem } from '@/components/HistoryItem/HistoryItem';
import { BATCH, THRESHOLD_PX } from '@/constants';
import EmptySection from '@/components/EmptySection/EmptySection';
import duckTgs from '@/assets/lottie/duck.tgs?url';
import { Modal } from '@/components/Modal/Modal';
import type { ActivityWithExtras, Position } from '@/types';
import { useAppData } from '@/contexts/AppDataContext';
import { toDate } from '@/utils/toDate';

export const HistoryPage: React.FC = () => {
  const { ready, items } = useHistoryData();
  const { positions } = useAppData();
  const [renderCount, setRenderCount] = useState(BATCH);

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<ActivityWithExtras | null>(null);

  const filtered = useMemo(
    () => items.filter((it) => it.type === 'stake' || it.type === 'unstake'),
    [items]
  );

  useEffect(() => {
    setRenderCount(BATCH);
    window.scrollTo(0, 0);
  }, [filtered.length]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const distanceToBottom = docH - (scrollY + viewportH);
      if (distanceToBottom <= THRESHOLD_PX) {
        setRenderCount(prev =>
          prev >= filtered.length ? prev : Math.min(prev + BATCH, filtered.length)
        );
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filtered.length]);

  const visible = useMemo(
    () => filtered.slice(0, Math.min(renderCount, filtered.length)),
    [filtered, renderCount]
  );

  const matchPosition = (act: ActivityWithExtras, list: Position[]) => {
    if (act.type !== 'stake') return null;
    const actTime = toDate(act.createdAt).getTime();

    const TWO_MIN = 2 * 60 * 1000;
    const rounded = Math.round(act.amount);
    let best: Position | null = null;
    let bestDt = Number.POSITIVE_INFINITY;

    for (const p of list) {
      const pt = toDate(p.createdAt).getTime();
      const dt = Math.abs(pt - actTime);
      if (dt <= TWO_MIN && Math.round(p.amount) === rounded) {
        if (dt < bestDt) {
          best = p;
          bestDt = dt;
        }
      }
    }
    return best;
  };

  const openDetails = (data: ActivityWithExtras) => {
    let unlockAt: any = null;

    if (data.type === 'stake') {
      const pos = matchPosition(data, positions || []);
      if (pos?.unlockAt) unlockAt = pos.unlockAt;
    }

    setSelected({ ...data, lockDays: 30, ...(unlockAt ? { unlockAt } : {}) });
    setIsOpen(true);
  };

  const closeDetails = () => {
    setIsOpen(false);
    setSelected(null);
  };

  return (
    <Page back={true}>
      <div className={styles.historyPage}>
        <div className="section-title">Transaction History</div>
        {ready && filtered.length === 0 ? (
          <div className={styles.empty}>
            <EmptySection
              icon={duckTgs}
              title="No History Yet"
              subtitle="Once you start making transactions, they will appear here."
            />
          </div>
        ) : (
          <div className={styles.list} role="list">
            {ready && visible.map(item => (
              <HistoryItem key={item.id} data={item} onOpen={openDetails} />
            ))}
          </div>
        )}
      </div>
      <Modal
        isOpen={isOpen}
        title="Transaction Details"
        button="Close"
        variant="history"
        historyItem={selected}
        onClose={closeDetails}
      />
    </Page>
  );
};