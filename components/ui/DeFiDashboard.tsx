'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── types ─── */
interface Pool {
  name: string;
  chain: string;
  apy: number;
  tvl: number;
  risk: number;
  allocation: number;
  color: string;
}

interface FrontierPoint {
  risk: number;
  ret: number;
}

interface OptLog {
  id: number;
  time: string;
  type: 'optimize' | 'rebalance' | 'alert' | 'discovery';
  message: string;
}

/* ─── constants ─── */
const ACCENT = '#8B5CF6';
const BG = '#0c1020';
const CARD = '#111827';
const BORDER = '#1f2937';

const CHAINS = ['Ethereum', 'Arbitrum', 'Polygon', 'Optimism', 'BSC'];
const PROTOCOLS = ['Aave', 'Compound', 'Curve', 'Uniswap', 'Yearn', 'Convex', 'GMX', 'Stargate'];

const INITIAL_POOLS: Pool[] = [
  { name: 'Aave ETH', chain: 'Ethereum', apy: 4.2, tvl: 3200, risk: 0.12, allocation: 25, color: '#8B5CF6' },
  { name: 'Curve 3Pool', chain: 'Ethereum', apy: 6.8, tvl: 1800, risk: 0.18, allocation: 20, color: '#3B82F6' },
  { name: 'GMX GLP', chain: 'Arbitrum', apy: 18.5, tvl: 520, risk: 0.35, allocation: 15, color: '#10B981' },
  { name: 'Uniswap ETH/USDC', chain: 'Polygon', apy: 12.3, tvl: 890, risk: 0.28, allocation: 15, color: '#F59E0B' },
  { name: 'Yearn USDC', chain: 'Ethereum', apy: 5.1, tvl: 2100, risk: 0.10, allocation: 10, color: '#EC4899' },
  { name: 'Stargate USDT', chain: 'Optimism', apy: 8.7, tvl: 430, risk: 0.22, allocation: 10, color: '#06B6D4' },
  { name: 'Convex cvxCRV', chain: 'Ethereum', apy: 9.4, tvl: 670, risk: 0.25, allocation: 5, color: '#EF4444' },
];

export default function DeFiDashboard() {
  /* refs */
  const frontierCanvasRef = useRef<HTMLCanvasElement>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const optimizerCountdown = useRef(30);

  /* state */
  const [running, setRunning] = useState(true);
  const [pools, setPools] = useState<Pool[]>(INITIAL_POOLS);
  const [frontier, setFrontier] = useState<FrontierPoint[]>([]);
  const [optimalPoint, setOptimalPoint] = useState<FrontierPoint>({ risk: 0.2, ret: 9.5 });
  const [currentPoint, setCurrentPoint] = useState<FrontierPoint>({ risk: 0.22, ret: 8.8 });
  const [logs, setLogs] = useState<OptLog[]>([]);
  const [metrics, setMetrics] = useState({
    sharpe: 2.34,
    portfolioAPY: 8.92,
    totalTVL: 9610,
    cvar95: -4.2,
    rebalances: 0,
    countdown: 30,
  });
  const [yieldMap, setYieldMap] = useState<number[][]>([]);
  const [crashActive, setCrashActive] = useState(false);
  const [discoveryActive, setDiscoveryActive] = useState(false);

  /* state refs */
  const runRef = useRef(running);
  const poolsRef = useRef(pools);
  const frontierRef = useRef(frontier);
  const optimalRef = useRef(optimalPoint);
  const currentRef = useRef(currentPoint);
  const logsRef = useRef(logs);
  const metricsRef = useRef(metrics);
  const yieldMapRef = useRef(yieldMap);
  const crashRef = useRef(crashActive);
  const discoveryRef = useRef(discoveryActive);

  useEffect(() => { runRef.current = running; }, [running]);
  useEffect(() => { poolsRef.current = pools; }, [pools]);
  useEffect(() => { frontierRef.current = frontier; }, [frontier]);
  useEffect(() => { optimalRef.current = optimalPoint; }, [optimalPoint]);
  useEffect(() => { currentRef.current = currentPoint; }, [currentPoint]);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { yieldMapRef.current = yieldMap; }, [yieldMap]);
  useEffect(() => { crashRef.current = crashActive; }, [crashActive]);
  useEffect(() => { discoveryRef.current = discoveryActive; }, [discoveryActive]);

  /* init frontier */
  useEffect(() => {
    const pts: FrontierPoint[] = [];
    for (let i = 0; i <= 40; i++) {
      const risk = 0.05 + (i / 40) * 0.5;
      const ret = 2 + Math.sqrt(risk) * 18 - risk * 5 + (Math.random() - 0.5) * 1.5;
      pts.push({ risk, ret });
    }
    setFrontier(pts);
  }, []);

  /* init yield map */
  useEffect(() => {
    const rows = PROTOCOLS.length;
    const cols = CHAINS.length;
    const data: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * 20 + 1)
    );
    setYieldMap(data);
  }, []);

  /* ─── simulation tick ─── */
  const tick = useCallback(() => {
    if (!runRef.current) return;
    tickRef.current++;

    const crash = crashRef.current;
    const discovery = discoveryRef.current;

    // update pool APYs
    setPools(prev =>
      prev.map(p => {
        let apyDelta = (Math.random() - 0.5) * 0.4;
        if (crash) apyDelta -= Math.random() * 2;
        if (discovery && p.name === prev[0].name) apyDelta += Math.random() * 1.5;
        return {
          ...p,
          apy: Math.max(0.5, p.apy + apyDelta),
          tvl: Math.max(50, p.tvl + (Math.random() - 0.5) * 30),
        };
      })
    );

    // update yield heatmap
    setYieldMap(prev =>
      prev.map(row =>
        row.map(v => {
          let delta = (Math.random() - 0.5) * 0.8;
          if (crash) delta -= Math.random() * 1.5;
          return Math.max(0.1, v + delta);
        })
      )
    );

    // current portfolio drifts
    setCurrentPoint(prev => ({
      risk: Math.max(0.05, Math.min(0.5, prev.risk + (Math.random() - 0.5) * 0.01)),
      ret: Math.max(1, prev.ret + (Math.random() - 0.5) * 0.15 - (crash ? 0.3 : 0)),
    }));

    // countdown and auto-optimize
    optimizerCountdown.current--;
    if (optimizerCountdown.current <= 0) {
      optimizerCountdown.current = 30;
      // re-optimize: move current toward optimal
      setCurrentPoint(prev => ({
        risk: prev.risk + (optimalRef.current.risk - prev.risk) * 0.5,
        ret: prev.ret + (optimalRef.current.ret - prev.ret) * 0.5,
      }));

      // rebalance allocations
      setPools(prev => {
        const total = prev.reduce((s, p) => s + p.apy, 0);
        return prev.map(p => ({
          ...p,
          allocation: Math.max(2, Math.round((p.apy / total) * 100)),
        }));
      });

      const newRebalances = metricsRef.current.rebalances + 1;
      setLogs(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'rebalance' as const,
        message: `Portfolio rebalanced — Sharpe optimized to ${(2 + Math.random()).toFixed(2)}`,
      }, ...prev].slice(0, 50));

      setMetrics(prev => ({ ...prev, rebalances: newRebalances }));
    }

    // occasional logs
    if (tickRef.current % 8 === 0) {
      const types: Array<OptLog['type']> = ['optimize', 'alert', 'discovery'];
      const type = types[Math.floor(Math.random() * types.length)];
      const messages: Record<string, string[]> = {
        optimize: [
          'CVaR recalculated — updating frontier',
          'Scipy minimize converged in 42 iterations',
          'Efficient frontier updated with new yields',
        ],
        alert: [
          'APY deviation detected on Curve 3Pool',
          'TVL drop >10% on GMX GLP — monitoring',
          'Gas fees spike on Ethereum — delaying rebalance',
        ],
        discovery: [
          'New pool detected: Pendle PT-stETH (15.2% APY)',
          'Arbitrum bridge yields rising — opportunity',
          'New vault: Yearn ETH Strategy v3',
        ],
      };
      const msg = messages[type][Math.floor(Math.random() * messages[type].length)];
      const logEntry: OptLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type,
        message: msg,
      };
      setLogs(prev => [logEntry, ...prev].slice(0, 50));
    }

    // update metrics
    const p = poolsRef.current;
    const totalAlloc = p.reduce((s, pl) => s + pl.allocation, 0) || 1;
    const weightedAPY = p.reduce((s, pl) => s + pl.apy * (pl.allocation / totalAlloc), 0);
    const totalTVL = p.reduce((s, pl) => s + pl.tvl, 0);
    setMetrics(prev => ({
      ...prev,
      portfolioAPY: weightedAPY,
      totalTVL,
      sharpe: Math.max(0, 2 + (Math.random() - 0.5) * 0.5 - (crash ? 1 : 0)),
      cvar95: -(3 + Math.random() * 3 + (crash ? 5 : 0)),
      countdown: optimizerCountdown.current,
    }));
  }, []);

  /* ─── animation loop ─── */
  useEffect(() => {
    let lastTick = 0;
    const INTERVAL = 100;

    const loop = (ts: number) => {
      if (ts - lastTick >= INTERVAL) {
        lastTick = ts;
        tick();
      }
      drawFrontier();
      drawDonut();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  /* ─── draw: efficient frontier ─── */
  const drawFrontier = () => {
    const canvas = frontierCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const pts = frontierRef.current;
    if (pts.length === 0) return;

    const PAD = 30;
    const riskMin = 0;
    const riskMax = 0.55;
    const retMin = 0;
    const retMax = 20;

    const toX = (r: number) => PAD + ((r - riskMin) / (riskMax - riskMin)) * (W - PAD * 2);
    const toY = (ret: number) => H - PAD - ((ret - retMin) / (retMax - retMin)) * (H - PAD * 2);

    // grid
    ctx.strokeStyle = '#1f293740';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = PAD + (i / 4) * (H - PAD * 2);
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
      const x = PAD + (i / 4) * (W - PAD * 2);
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
    }

    // axis labels
    ctx.fillStyle = '#6B728060';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Risk (σ)', W / 2, H - 4);
    ctx.save();
    ctx.translate(10, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Return (%)', 0, 0);
    ctx.restore();

    // scatter random portfolios
    for (let i = 0; i < 80; i++) {
      const r = 0.05 + Math.random() * 0.45;
      const ret = Math.sqrt(r) * 15 + (Math.random() - 0.5) * 6;
      ctx.beginPath();
      ctx.arc(toX(r), toY(ret), 2, 0, Math.PI * 2);
      ctx.fillStyle = '#6B728030';
      ctx.fill();
    }

    // efficient frontier curve
    const sortedPts = [...pts].sort((a, b) => a.risk - b.risk);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    sortedPts.forEach((p, i) => {
      const x = toX(p.risk);
      const y = toY(p.ret);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // optimal portfolio (star)
    const opt = optimalRef.current;
    const ox = toX(opt.risk);
    const oy = toY(opt.ret);
    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 12;
    drawStar(ctx, ox, oy, 8);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Optimal', ox + 12, oy - 4);
    ctx.font = '8px monospace';
    ctx.fillText(`σ=${opt.risk.toFixed(2)} R=${opt.ret.toFixed(1)}%`, ox + 12, oy + 8);

    // current portfolio
    const cur = currentRef.current;
    const cx = toX(cur.risk);
    const cy = toY(cur.ret);
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.strokeStyle = '#10B98150';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Current', cx - 10, cy - 4);

    // arrow from current to optimal
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const spikes = 5;
    const outerR = r;
    const innerR = r * 0.4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  /* ─── draw: donut chart ─── */
  const drawDonut = () => {
    const canvas = donutCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    const p = poolsRef.current;
    const totalAlloc = p.reduce((s, pl) => s + pl.allocation, 0) || 1;
    const cx = W / 2;
    const cy = H / 2 - 5;
    const R = Math.min(W, H) * 0.35;
    const innerR = R * 0.55;

    let angle = -Math.PI / 2;
    for (const pool of p) {
      const sweep = (pool.allocation / totalAlloc) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, angle, angle + sweep);
      ctx.arc(cx, cy, innerR, angle + sweep, angle, true);
      ctx.closePath();
      ctx.fillStyle = pool.color;
      ctx.fill();

      // label
      if (sweep > 0.3) {
        const mid = angle + sweep / 2;
        const lx = cx + Math.cos(mid) * (R + 14);
        const ly = cy + Math.sin(mid) * (R + 14);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '8px sans-serif';
        ctx.textAlign = Math.cos(mid) > 0 ? 'left' : 'right';
        ctx.fillText(`${pool.name}`, lx, ly);
        ctx.fillStyle = '#6B7280';
        ctx.fillText(`${pool.allocation}%`, lx, ly + 10);
      }

      angle += sweep;
    }

    // center text
    const weightedAPY = p.reduce((s, pl) => s + pl.apy * (pl.allocation / totalAlloc), 0);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${weightedAPY.toFixed(1)}%`, cx, cy);
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px sans-serif';
    ctx.fillText('APY', cx, cy + 14);
  };

  /* ─── controls ─── */
  const handleCrash = () => {
    setCrashActive(true);
    setLogs(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'alert' as const,
      message: '⚠️ APY CRASH — Major protocol exploit detected, yields collapsing',
    }, ...prev].slice(0, 50));
    setTimeout(() => setCrashActive(false), 8000);
  };

  const handleDiscovery = () => {
    setDiscoveryActive(true);
    const newPool: Pool = {
      name: `Pendle PT-${['stETH', 'rETH', 'cbETH'][Math.floor(Math.random() * 3)]}`,
      chain: ['Ethereum', 'Arbitrum'][Math.floor(Math.random() * 2)],
      apy: 15 + Math.random() * 10,
      tvl: 100 + Math.random() * 300,
      risk: 0.2 + Math.random() * 0.2,
      allocation: 0,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
    };
    setPools(prev => [...prev.slice(0, 7), newPool].slice(0, 8));
    setLogs(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'discovery' as const,
      message: `🔍 New pool: ${newPool.name} on ${newPool.chain} — ${newPool.apy.toFixed(1)}% APY`,
    }, ...prev].slice(0, 50));
    setTimeout(() => setDiscoveryActive(false), 5000);
  };

  const handleRebalance = () => {
    optimizerCountdown.current = 0;
    setLogs(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'rebalance' as const,
      message: '🔄 Manual rebalance triggered — running CVaR optimization...',
    }, ...prev].slice(0, 50));
  };

  const handleReset = () => {
    setPools(INITIAL_POOLS);
    setLogs([]);
    setMetrics({ sharpe: 2.34, portfolioAPY: 8.92, totalTVL: 9610, cvar95: -4.2, rebalances: 0, countdown: 30 });
    setCurrentPoint({ risk: 0.22, ret: 8.8 });
    optimizerCountdown.current = 30;
    tickRef.current = 0;
  };

  /* ─── yield heatmap color ─── */
  const yieldColor = (v: number) => {
    if (v < 3) return 'bg-gray-800 text-gray-500';
    if (v < 6) return 'bg-violet-900/40 text-violet-400';
    if (v < 10) return 'bg-violet-700/40 text-violet-300';
    if (v < 15) return 'bg-violet-500/40 text-violet-200';
    return 'bg-violet-400/50 text-white font-bold';
  };

  const logColor = (type: string) => {
    switch (type) {
      case 'optimize': return 'text-violet-400';
      case 'rebalance': return 'text-blue-400';
      case 'alert': return 'text-amber-400';
      case 'discovery': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const logIcon = (type: string) => {
    switch (type) {
      case 'optimize': return '⚙️';
      case 'rebalance': return '🔄';
      case 'alert': return '⚠️';
      case 'discovery': return '🔍';
      default: return '•';
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-violet-500/20" style={{ background: BG }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-violet-400 text-sm font-mono font-semibold">
            💎 DeFi Portfolio Optimizer — Multi-Chain
          </span>
          {crashActive && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
              APY CRASH
            </span>
          )}
          {discoveryActive && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full animate-pulse">
              NEW POOL
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              running
                ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            {running ? '⏸ Pause' : '▶ Optimize'}
          </button>
          <button
            onClick={handleCrash}
            disabled={crashActive}
            className="px-3 py-1 text-xs rounded font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
          >
            APY Crash
          </button>
          <button
            onClick={handleDiscovery}
            disabled={discoveryActive}
            className="px-3 py-1 text-xs rounded font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-40"
          >
            New Pool
          </button>
          <button
            onClick={handleRebalance}
            className="px-3 py-1 text-xs rounded font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            Rebalance
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs rounded font-medium bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px" style={{ background: BORDER }}>
        {/* Efficient Frontier */}
        <div className="lg:col-span-2 p-4" style={{ background: CARD }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Efficient Frontier — CVaR Optimized
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">
              Next rebalance: {metrics.countdown}s
            </span>
          </div>
          <canvas ref={frontierCanvasRef} className="w-full" style={{ height: 220 }} />
        </div>

        {/* Allocation Donut */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Allocation
          </h3>
          <canvas ref={donutCanvasRef} className="w-full" style={{ height: 220 }} />
        </div>

        {/* Yield Heatmap */}
        <div className="lg:col-span-2 p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
            Yield Heatmap — Protocol × Chain (APY %)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 pb-2 pr-2" />
                  {CHAINS.map(c => (
                    <th key={c} className="text-center text-gray-500 pb-2 px-1 font-normal">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROTOCOLS.map((proto, ri) => (
                  <tr key={proto}>
                    <td className="text-gray-400 pr-2 py-0.5 font-medium whitespace-nowrap">{proto}</td>
                    {CHAINS.map((chain, ci) => {
                      const val = yieldMap[ri]?.[ci] ?? 0;
                      return (
                        <td key={chain} className="px-1 py-0.5">
                          <div className={`text-center rounded px-1 py-0.5 ${yieldColor(val)} transition-colors duration-300`}>
                            {val.toFixed(1)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optimization Log */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Optimization Log
          </h3>
          <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
            {logs.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-6">Optimizer idle...</p>
            )}
            {logs.slice(0, 20).map(log => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-[10px] px-2 py-1.5 rounded"
                style={{ background: '#ffffff05' }}
              >
                <span className="shrink-0">{logIcon(log.type)}</span>
                <div>
                  <span className="text-gray-500 font-mono mr-2">{log.time}</span>
                  <span className={logColor(log.type)}>{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pool Table */}
      <div className="border-t" style={{ borderColor: BORDER, background: CARD }}>
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Active Pools
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase">
                  <th className="text-left pb-2">Pool</th>
                  <th className="text-left pb-2">Chain</th>
                  <th className="text-right pb-2">APY</th>
                  <th className="text-right pb-2">TVL ($M)</th>
                  <th className="text-right pb-2">Risk</th>
                  <th className="text-right pb-2">Alloc %</th>
                </tr>
              </thead>
              <tbody>
                {pools.map(pool => (
                  <tr key={pool.name} className="border-t border-gray-800/30">
                    <td className="py-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pool.color }} />
                      <span className="text-gray-300">{pool.name}</span>
                    </td>
                    <td className="text-gray-500 py-1.5">{pool.chain}</td>
                    <td className={`text-right py-1.5 font-mono ${pool.apy >= 10 ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {pool.apy.toFixed(1)}%
                    </td>
                    <td className="text-right text-gray-400 py-1.5 font-mono">${(pool.tvl / 1000).toFixed(1)}B</td>
                    <td className="text-right py-1.5">
                      <span className={`font-mono ${pool.risk > 0.3 ? 'text-red-400' : pool.risk > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {(pool.risk * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="text-right text-violet-400 py-1.5 font-mono font-bold">{pool.allocation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px border-t" style={{ borderColor: BORDER, background: BORDER }}>
        {[
          { label: 'Sharpe', value: metrics.sharpe.toFixed(2), color: metrics.sharpe >= 2 ? '#10B981' : '#EF4444' },
          { label: 'Portfolio APY', value: `${metrics.portfolioAPY.toFixed(1)}%`, color: '#8B5CF6' },
          { label: 'Total TVL', value: `$${(metrics.totalTVL / 1000).toFixed(1)}B`, color: '#3B82F6' },
          { label: 'CVaR 95%', value: `${metrics.cvar95.toFixed(1)}%`, color: '#EF4444' },
          { label: 'Rebalances', value: metrics.rebalances.toString(), color: '#F59E0B' },
          { label: 'Next Opt', value: `${metrics.countdown}s`, color: '#6B7280' },
        ].map(m => (
          <div key={m.label} className="px-4 py-3 text-center" style={{ background: CARD }}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{m.label}</div>
            <div className="text-sm font-bold font-mono mt-0.5" style={{ color: m.color }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 text-center border-t" style={{ borderColor: BORDER, background: '#0a0e1a' }}>
        <span className="text-[10px] text-gray-600">
          CVaR Portfolio Optimizer • SciPy Minimize • DefiLlama API • Multi-Chain Yield Aggregation • Auto-Rebalancing
        </span>
      </div>
    </div>
  );
}
