import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Page } from '@/components/Page';
import { TonChart, OhlcPoint } from '@/components/TonChart/TonChart';
import { TonMarketStats } from '@/components/TonMarketStats/TonMarketStats';
import { TabRange } from '@/components/TabSwitcher/TabSwitcher';
import { useRates } from '@/contexts/RatesContext';
import TonLogoIcon from '@/assets/icons/toncoin.svg?react';
import styles from './TonMarketPage.module.scss';

const TONAPI_BASE = 'https://tonapi.io/v2';

export interface MarketData {
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  allTimeHigh: number;
  allTimeLow: number;
  priceChange7d: number;
  priceChange30d: number;
}

export interface RateDiffs {
  diff_24h: number;
  diff_7d: number;
  diff_30d: number;
}

function getRangeStart(range: TabRange): number {
  const now = Math.floor(Date.now() / 1000);
  switch (range) {
    case '1D':  return now - 86_400;
    case '1W':  return now - 7 * 86_400;
    case '1M':  return now - 30 * 86_400;
    case '1Y':  return now - 365 * 86_400;
    case 'All': return now - 4 * 365 * 86_400;
  }
}

function parsePctString(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace('%', '').replace(/\s/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function extractDiff(obj: any, key: string): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const raw = obj[key];
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const inner = raw['USD'] ?? raw['usd'] ?? raw['Usd'] ?? Object.values(raw)[0];
    return parsePctString(inner);
  }
  return parsePctString(raw);
}

function parseDiffs(node: any): RateDiffs {
  const d24 = extractDiff(node, 'diff_24h')  ?? extractDiff(node, 'diff24h')
           ?? extractDiff(node?.diff, '24h') ?? extractDiff(node?.changes, '24h');
  const d7  = extractDiff(node, 'diff_7d')   ?? extractDiff(node, 'diff7d')
           ?? extractDiff(node?.diff, '7d')  ?? extractDiff(node?.changes, '7d');
  const d30 = extractDiff(node, 'diff_30d')  ?? extractDiff(node, 'diff30d')
           ?? extractDiff(node?.diff, '30d') ?? extractDiff(node?.changes, '30d');
  return { diff_24h: d24 ?? 0, diff_7d: d7 ?? 0, diff_30d: d30 ?? 0 };
}

function pctFromChart(pts: OhlcPoint[], currentPrice: number): number | null {
  if (!pts.length || currentPrice <= 0) return null;
  const first = pts[0].close;
  if (first <= 0) return null;
  return ((currentPrice - first) / first) * 100;
}

async function fetchChartData(range: TabRange, signal: AbortSignal): Promise<OhlcPoint[]> {
  const now   = Math.floor(Date.now() / 1000);
  const start = getRangeStart(range);
  const url   =
    `${TONAPI_BASE}/rates/chart?token=ton&currency=usd` +
    `&end_date=${now}&start_date=${start}&points_count=100`;
  const resp  = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`chart HTTP ${resp.status}`);
  const json  = await resp.json();
  const raw: [number, number][] = json.points ?? [];
  if (!raw.length) throw new Error('empty chart');
  return [...raw].sort((a, b) => a[0] - b[0]).map(([t, p]) => ({ time: t * 1000, close: p }));
}

async function fetchRatesAndMarket(
  signal: AbortSignal,
  chart1M: OhlcPoint[],
  currentPrice: number,
): Promise<{ marketData: MarketData; diffs: RateDiffs }> {
  const ratesResp = await fetch(`${TONAPI_BASE}/rates?tokens=ton&currencies=usd`, { signal });
  if (!ratesResp.ok) throw new Error(`rates HTTP ${ratesResp.status}`);
  const ratesJson = await ratesResp.json();

  const tonData: any =
    ratesJson?.rates?.TON ?? ratesJson?.rates?.ton ??
    ratesJson?.rates?.['the-open-network'] ?? {};

  const tonUsd = Number(
    tonData?.prices?.USD ?? tonData?.price?.USD ?? tonData?.price ?? currentPrice ?? 0,
  );

  let diffs = parseDiffs(tonData);
  if (diffs.diff_24h === 0 && diffs.diff_7d === 0) {
    const rootDiffs = parseDiffs(ratesJson);
    if (rootDiffs.diff_24h !== 0) diffs = rootDiffs;
  }
  if (diffs.diff_30d === 0 && chart1M.length) {
    diffs.diff_30d = pctFromChart(chart1M, currentPrice) ?? 0;
  }

  let volume24h = 0;
  try {
    const cgResp = await fetch(
      'https://api.coingecko.com/api/v3/simple/price' +
      '?ids=the-open-network&vs_currencies=usd&include_24hr_vol=true',
      { signal },
    );
    if (cgResp.ok) {
      const cgJson = await cgResp.json();
      volume24h = Number(cgJson?.['the-open-network']?.usd_24h_vol ?? 0);
    }
  } catch (_) {}

  return {
    diffs,
    marketData: {
      marketCap: (tonUsd || currentPrice) * 3_210_000_000,
      volume24h,
      circulatingSupply: 2_560_000_000,
      totalSupply: 5_155_981_645,
      maxSupply: null,
      allTimeHigh: 8.25,
      allTimeLow: 0.519,
      priceChange7d: diffs.diff_7d,
      priceChange30d: diffs.diff_30d,
    },
  };
}

export function getChangePctForRange(
  range: TabRange,
  diffs: RateDiffs,
  chartData: OhlcPoint[],
  currentPrice: number,
): number {
  switch (range) {
    case '1D': return diffs.diff_24h !== 0 ? diffs.diff_24h : (pctFromChart(chartData, currentPrice) ?? 0);
    case '1W': return diffs.diff_7d  !== 0 ? diffs.diff_7d  : (pctFromChart(chartData, currentPrice) ?? 0);
    case '1M': return diffs.diff_30d !== 0 ? diffs.diff_30d : (pctFromChart(chartData, currentPrice) ?? 0);
    case '1Y':
    case 'All': return pctFromChart(chartData, currentPrice) ?? 0;
  }
}

export const TonMarketPage: React.FC = () => {
  const { tonUsd } = useRates();

  const [range, setRange]                 = useState<TabRange>('1D');
  const [committedRange, setCommittedRange] = useState<TabRange>('1D');
  const [chartData, setChartData]         = useState<OhlcPoint[]>([]);
  const [chartLoading, setChartLoading]   = useState(true);
  const [marketData, setMarketData]       = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [diffs, setDiffs]                 = useState<RateDiffs>({ diff_24h: 0, diff_7d: 0, diff_30d: 0 });

  const requestIdRef   = useRef(0);
  const chart1MRef     = useRef<OhlcPoint[]>([]);
  const tonUsdRef      = useRef(tonUsd);
  const chartAbortRef  = useRef<AbortController | null>(null);
  const marketAbortRef = useRef<AbortController | null>(null);

  useEffect(() => { tonUsdRef.current = tonUsd; }, [tonUsd]);

  const loadChart = useCallback(async (r: TabRange) => {
    chartAbortRef.current?.abort();
    const ctrl = new AbortController();
    chartAbortRef.current = ctrl;

    requestIdRef.current += 1;
    const myId = requestIdRef.current;

    setChartLoading(true);

    try {
      const data = await fetchChartData(r, ctrl.signal);

      if (ctrl.signal.aborted || requestIdRef.current !== myId) return;

      setChartData(data);
      setCommittedRange(r);
      if (r === '1M') chart1MRef.current = data;
    } catch (e: any) {
      if (e?.name === 'AbortError' || ctrl.signal.aborted) return;
      console.error('Chart fetch error', e);
      if (requestIdRef.current === myId) setCommittedRange(r);
    } finally {
      if (!ctrl.signal.aborted && requestIdRef.current === myId) {
        setChartLoading(false);
      }
    }
  }, []);

  const loadMarket = useCallback(async () => {
    marketAbortRef.current?.abort();
    const ctrl = new AbortController();
    marketAbortRef.current = ctrl;
    setMarketLoading(true);

    if (!chart1MRef.current.length) {
      try {
        const d = await fetchChartData('1M', ctrl.signal);
        if (!ctrl.signal.aborted) chart1MRef.current = d;
      } catch (_) {}
    }

    try {
      const { marketData: md, diffs: d } = await fetchRatesAndMarket(
        ctrl.signal, chart1MRef.current, tonUsdRef.current,
      );
      if (!ctrl.signal.aborted) { setMarketData(md); setDiffs(d); }
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Market fetch error', e);
    } finally {
      if (!ctrl.signal.aborted) setMarketLoading(false);
    }
  }, []);

  useEffect(() => { loadChart(range); }, [range]);

  useEffect(() => {
    loadMarket();
    return () => { chartAbortRef.current?.abort(); marketAbortRef.current?.abort(); };
  }, []);

  const changePct = getChangePctForRange(committedRange, diffs, chartData, tonUsd);

  return (
    <Page back>
      <div className={styles.tonMarketPage}>

        <div className={styles.titleRow}>
          <motion.div
            className={styles.logoWrap}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, mass: 0.8 }}
          >
            <TonLogoIcon className={styles.tonLogo} />
            <motion.div
              className={styles.logoBubble}
              initial={{ scale: 0.6, opacity: 0.55 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
          >
            <h2 className={styles.coinName}>Toncoin</h2>
            <span className={styles.coinSymbol}>TON</span>
          </motion.div>
        </div>

        <div className={`${styles.card} glass-card`}>
          <TonChart
            data={chartData}
            range={range}
            onRangeChange={setRange}
            loading={chartLoading}
            currentPrice={tonUsd}
            changePct={changePct}
          />
        </div>

        <TonMarketStats data={marketData} loading={marketLoading} tonUsd={tonUsd} />
      </div>
    </Page>
  );
};