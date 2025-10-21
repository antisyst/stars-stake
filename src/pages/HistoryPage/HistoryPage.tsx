import React, { useEffect, useState } from 'react';
import { Page } from '@/components/Page';
import styles from './HistoryPage.module.scss';
import { useHistoryData } from '@/contexts/HistoryContext';
import { HistoryItem } from '@/components/HistoryItem/HistoryItem';
import { BATCH, THRESHOLD_PX } from '@/constants';
import EmptySection from '@/components/EmptySection/EmptySection';
import duckTgs from '@/assets/lottie/duck.tgs?url';

export const HistoryPage: React.FC = () => {
  const { ready, items } = useHistoryData();
  const [renderCount, setRenderCount] = useState(BATCH);

  useEffect(() => {
    setRenderCount(BATCH);
    window.scrollTo(0, 0);
  }, [items.length]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const distanceToBottom = docH - (scrollY + viewportH);
      if (distanceToBottom <= THRESHOLD_PX) {
        setRenderCount(prev => (prev >= items.length ? prev : Math.min(prev + BATCH, items.length)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length]);

  const visible = items.slice(0, Math.min(renderCount, items.length));

  return (
    <Page back={true}>
      <div className={styles.historyPage}>
        <div className="section-title">Transaction History</div>
        {ready && items.length === 0 ? (
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
              <HistoryItem key={item.id} data={item} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};