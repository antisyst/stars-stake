import React, { useMemo, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TabSwitcher, TabRange } from '@/components/TabSwitcher/TabSwitcher';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useI18n } from '@/i18n';
import styles from './TonChart.module.scss';

export interface OhlcPoint {
  time: number;
  close: number;
}

interface TonChartProps {
  data: OhlcPoint[];
  range: TabRange;
  onRangeChange: (r: TabRange) => void;
  loading: boolean;
  currentPrice: number;
  changePct: number;
}

const CHART_H          = 200;
const CHART_PAD_TOP    = 4;
const CHART_PAD_BOTTOM = 0;
const PLOT_H           = CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM;

const CustomTooltip = ({ active, payload, formatFn }: any) => {
  if (!active || !payload?.length) return null;
  return <div className={styles.tooltip}>{formatFn(payload[0]?.value ?? 0, 3)}</div>;
};

const ChartFader: React.FC<{ loading: boolean; children: React.ReactNode }> = ({
  loading, children,
}) => (
  <motion.div
    className={styles.chartWrapper}
    animate={{ opacity: loading ? 0.25 : 1 }}
    transition={{ duration: 0.22, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

interface YOverlayProps {
  ticks: number[];
  yMin: number;
  yMax: number;
  formatTick: (v: number) => string;
}

const YAxisOverlay: React.FC<YOverlayProps> = ({ ticks, yMin, yMax, formatTick }) => {
  const range = yMax - yMin || 1;
  return (
    <div className={styles.yOverlay} aria-hidden>
      {ticks.map((tick) => {
        const normalized = (tick - yMin) / range;
        const y = CHART_PAD_TOP + (1 - normalized) * PLOT_H;
        return (
          <span key={tick} className={styles.yTick} style={{ top: y }}>
            {formatTick(tick)}
          </span>
        );
      })}
    </div>
  );
};

// Pass `range` as a prop so we can include it in the key.
// When `range` changes, React unmounts+remounts the whole badge,
// which forces NumberFlow to always run its enter animation on the new value.
const AnimatedPctBadge: React.FC<{ pct: number; range: TabRange }> = ({ pct, range }) => {
  const isUp   = pct >= 0;
  const dir    = isUp ? 'up' : 'down';
  const absPct = Math.abs(pct);

  return (
    <motion.span
      // Keying on both direction AND range guarantees a remount — and therefore
      // a fresh NumberFlow animation — every time the range tab changes.
      key={`${dir}-${range}`}
      layout="size"
      className={`${styles.changePctBadge} ${isUp ? styles.up : styles.down}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.2, ease: 'easeOut' },
        scale:   { duration: 0.2, ease: 'easeOut' },
        layout:  { type: 'spring', stiffness: 320, damping: 32 },
      }}
    >
      <motion.span
        key={`arrow-${dir}-${range}`}
        className={styles.arrow}
        initial={{ opacity: 0, y: isUp ? 5 : -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        {isUp ? '↑' : '↓'}
      </motion.span>
      <NumberFlow
        value={absPct}
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        suffix="%"
        transformTiming={{ duration: 600, easing: 'ease-in-out' }}
        spinTiming={{ duration: 600, easing: 'ease-in-out' }}
        opacityTiming={{ duration: 250, easing: 'ease-out' }}
        willChange
      />
    </motion.span>
  );
};

function computeYTicks(min: number, max: number): number[] {
  const step = (max - min) / 3;
  return [0, 1, 2, 3].map((i) => min + i * step);
}

function formatYTick(v: number): string {
  if (v >= 10_000) return v.toFixed(0);
  if (v >= 1_000)  return v.toFixed(1);
  if (v >= 10)     return v.toFixed(2);
  if (v >= 1)      return v.toFixed(3);
  return v.toFixed(4);
}

export const TonChart: React.FC<TonChartProps> = ({
  data, range, onRangeChange, loading, currentPrice, changePct,
}) => {
  const { formatFromUsd, convertUsdToSelected } = useCurrency();
  const { t } = useI18n();

  // Tooltip reset: we only need a ref to the recharts wrapper to call
  // dispatchEvent on blur — no state needed, so the unused-var warning is gone.
  const handleRangeChange = useCallback((r: TabRange) => {
    onRangeChange(r);
  }, [onRangeChange]);

  const chartData = useMemo(
    () => data.map((p) => ({ time: p.time, price: convertUsdToSelected(p.close) })),
    [data, convertUsdToSelected],
  );

  const isUp  = changePct >= 0;
  const color = isUp ? '#41bd58' : '#e05050';

  const changeAbs = useMemo(() => {
    if (!data.length || currentPrice <= 0) return 0;
    return convertUsdToSelected(currentPrice) - convertUsdToSelected(data[0].close);
  }, [data, currentPrice, convertUsdToSelected]);

  const { yMin, yMax, yTicks } = useMemo(() => {
    if (!chartData.length) return { yMin: 0, yMax: 1, yTicks: [0, 0.33, 0.67, 1] };
    const prices = chartData.map((d) => d.price);
    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const pad    = (rawMax - rawMin) * 0.08 || rawMin * 0.002 || 0.001;
    const yMin   = rawMin - pad;
    const yMax   = rawMax + pad;
    return { yMin, yMax, yTicks: computeYTicks(yMin, yMax) };
  }, [chartData]);

  const rangeLabelMap: Record<TabRange, string> = {
    '1D':  t('tonChart.rangeLabel.1D',  'Today'),
    '1W':  t('tonChart.rangeLabel.1W',  'This Week'),
    '1M':  t('tonChart.rangeLabel.1M',  'This Month'),
    '1Y':  t('tonChart.rangeLabel.1Y',  'This Year'),
    'All': t('tonChart.rangeLabel.All', 'All Time'),
  };

  return (
    <div className={styles.tonChart}>
      {/* ── Price header ── */}
      <div className={styles.priceHeader}>
        <h1 className={styles.price}>{formatFromUsd(currentPrice, 3)}</h1>
        <div className={styles.changeRow}>
          <span className={`${styles.changeAbs} ${isUp ? styles.up : styles.down}`}>
            {isUp ? '+' : '-'}{formatFromUsd(Math.abs(changeAbs), 3)}
          </span>
          <LayoutGroup>
            {/* Pass range so the badge remounts (and NumberFlow re-animates) on every tab switch */}
            <AnimatedPctBadge pct={changePct} range={range} />
          </LayoutGroup>
          <span className={styles.rangeLabel}>{rangeLabelMap[range]}</span>
        </div>
      </div>

      {/* ── Chart ── */}
      <ChartFader loading={loading}>
        <div className={styles.chartContainer}>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <AreaChart
                data={chartData}
                margin={{ top: CHART_PAD_TOP, right: 0, left: 0, bottom: CHART_PAD_BOTTOM }}
                style={{ outline: 'none', userSelect: 'none' }}
              >
                <defs>
                  <linearGradient id="ton-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="0"
                  horizontal
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="time" hide />
                <YAxis domain={[yMin, yMax]} ticks={yTicks} hide />

                <Tooltip
                  content={<CustomTooltip formatFn={formatFromUsd} />}
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 3' }}
                  isAnimationActive={false}
                  wrapperStyle={{ pointerEvents: 'none' }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#ton-grad)"
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  isAnimationActive={!loading && chartData.length > 0}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <YAxisOverlay
            ticks={yTicks}
            yMin={yMin}
            yMax={yMax}
            formatTick={formatYTick}
          />
        </div>
      </ChartFader>

      <TabSwitcher active={range} onChange={handleRangeChange} />
    </div>
  );
};