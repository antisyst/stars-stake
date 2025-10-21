import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ProgressiveTiersBarProps } from '@/types';
import styles from './ProgressiveTiersBar.module.scss';


export const ProgressiveTiersBar: React.FC<ProgressiveTiersBarProps> = ({
  widths,
  topLabels,
  colors,
  ariaLabel = 'Tiers (Progressive Boosts)',
  durationPerSeg = 0.9,
  stagger = 0.06,
}) => {
  const reduce = useReducedMotion();

  const [w1, w2, w3, w4] = widths.map((w) => `${w}%`);
  const [c1, c2, c3, c4] =
    colors ?? ['#007aff', '#22c55e', '#ff9f1a', '#a855f7'];

  const ease = [0.22, 1, 0.36, 1] as const;
  const targets = [w1, w2, w3, w4];
  const cols = [c1, c2, c3, c4];

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} role="img" aria-label={ariaLabel}>
        {targets.map((tw, i) => {
          const delay = i * stagger;
          const labelDelay = delay + durationPerSeg * 0.45;

          if (reduce) {
            return (
              <div
                key={i}
                className={styles.segment}
                style={{ width: tw, background: cols[i] }}
              >
                <span className={styles.segmentLabel}>{topLabels[i]}</span>
              </div>
            );
          }

          return (
            <motion.div
              key={i}
              className={styles.segment}
              style={{ background: cols[i] }}
              initial={{ width: 0 }}
              animate={{ width: tw }}
              transition={{ duration: durationPerSeg, delay, ease }}
            >
              <motion.span
                className={styles.segmentLabel}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, delay: labelDelay, ease }}
              >
                {topLabels[i]}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};