'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function formatPrice(p: number, dec = 2) { return p.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function formatTime(d: Date) { return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

// ─── Types ──────────────────────────────────────────────────────────────────

type Regime = 'LOW_VOL' | 'TRENDING' | 'HIGH_VOL';

interface LogEntry { time: string; text: string; color: string }

interface SimState {
  ethBtc: number;
  btcUsdt: number;
  ethUsdt: number;
  regime: Regime;
  regimeProbs: [number, number, number]; // lowvol, trending, highvol
  pnl: number;
  trades: number;
  wins: number;
  sharpe: number;
  avgGas: number;
  arbDetected: boolean;
  arbProfit: number;
  spreadHistory: { cex: number; dex: number }[];
  pnlHistory: number[];
}

const REGIME_CONFIG: Record<Regime, { label: string; color: string; bg: string; arbChance: number }> = {
  LOW_VOL: { label: 'LOW VOLATILITY', color: '#22c55e', bg: 'bg-emerald-500/10 border-emerald-500/30', arbChance: 0.05 },
  TRENDING: { label: 'TRENDING', color: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/30', arbChance: 0.15 },
  HIGH_VOL: { label: 'HIGH VOLATILITY', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/30', arbChance: 0.35 },
};

// ─── Triangle Visualizer ────────────────────────────────────────────────────

function TriangleVisualizer({ ethBtc, btcUsdt, ethUsdt, arbDetected, arbProfit }: {
  ethBtc: number; btcUsdt: number; ethUsdt: number; arbDetected: boolean; arbProfit: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const dashOffsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const r = Math.min(W, H) * 0.32;

      // Triangle vertices
      const nodes = [
        { x: cx, y: cy - r, label: 'ETH', price: '' },
        { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6), label: 'USDT', price: '' },
        { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6), label: 'BTC', price: '' },
      ];

      const edges = [
        { from: 0, to: 2, label: ethBtc.toFixed(5) },
        { from: 2, to: 1, label: formatPrice(btcUsdt) },
        { from: 1, to: 0, label: formatPrice(ethUsdt) },
      ];

      dashOffsetRef.current -= 1.5;

      // Draw edges
      edges.forEach(({ from, to, label }) => {
        const f = nodes[from];
        const t = nodes[to];

        // Glow for arb
        if (arbDetected) {
          ctx.strokeStyle = 'rgba(34,197,94,0.15)';
          ctx.lineWidth = 8;
          ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y); ctx.stroke();
        }

        // Main line
        ctx.strokeStyle = arbDetected ? '#22c55e' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = dashOffsetRef.current;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.setLineDash([]);

        // Arrow at midpoint
        const mx = (f.x + t.x) / 2;
        const my = (f.y + t.y) / 2;
        const angle = Math.atan2(t.y - f.y, t.x - f.x);
        const arrowSize = 8;
        ctx.fillStyle = arbDetected ? '#22c55e' : '#6b7280';
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(angle) * arrowSize, my + Math.sin(angle) * arrowSize);
        ctx.lineTo(mx + Math.cos(angle + 2.5) * arrowSize * 0.6, my + Math.sin(angle + 2.5) * arrowSize * 0.6);
        ctx.lineTo(mx + Math.cos(angle - 2.5) * arrowSize * 0.6, my + Math.sin(angle - 2.5) * arrowSize * 0.6);
        ctx.fill();

        // Price label on edge
        const lx = mx + Math.cos(angle + Math.PI / 2) * 16;
        const ly = my + Math.sin(angle + Math.PI / 2) * 16;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, ly);
      });

      // Draw nodes
      nodes.forEach(({ x, y, label }) => {
        // Glow
        if (arbDetected) {
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 16;
        }
        ctx.fillStyle = arbDetected ? '#1a2e1a' : '#1a1f3a';
        ctx.strokeStyle = arbDetected ? '#22c55e' : '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = arbDetected ? '#22c55e' : '#e5e7eb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
      });

      // Center status
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      if (arbDetected) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('ARBITRAGE DETECTED', cx, cy - 6);
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`+${arbProfit.toFixed(3)}%`, cx, cy + 10);
      } else {
        ctx.fillStyle = '#6b7280';
        ctx.fillText('SCANNING...', cx, cy);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [ethBtc, btcUsdt, ethUsdt, arbDetected, arbProfit]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ─── Spread Chart ───────────────────────────────────────────────────────────

function SpreadChart({ data }: { data: { cex: number; dex: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
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

    const allPrices = data.flatMap(d => [d.cex, d.dex]);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP || 1;
    const pad = 50;
    const chartW = W - pad - 8;
    const chartH = H - 24;

    const toX = (i: number) => pad + (i / (data.length - 1)) * chartW;
    const toY = (p: number) => 8 + (1 - (p - minP) / range) * chartH;

    // Grid
    ctx.strokeStyle = '#1a2440';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = 8 + (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - 8, y); ctx.stroke();
      ctx.fillStyle = '#4a5568'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
      ctx.fillText(formatPrice(maxP - (i / 4) * range), pad - 4, y + 3);
    }

    // Opportunity zones (where spread > threshold)
    const threshold = range * 0.003;
    for (let i = 0; i < data.length - 1; i++) {
      const spread = Math.abs(data[i].dex - data[i].cex);
      if (spread > threshold) {
        ctx.fillStyle = 'rgba(34,197,94,0.06)';
        ctx.fillRect(toX(i), 8, toX(i + 1) - toX(i), chartH);
      }
    }

    // CEX line (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((d, i) => { i === 0 ? ctx.moveTo(toX(i), toY(d.cex)) : ctx.lineTo(toX(i), toY(d.cex)); });
    ctx.stroke();

    // DEX line (purple)
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((d, i) => { i === 0 ? ctx.moveTo(toX(i), toY(d.dex)) : ctx.lineTo(toX(i), toY(d.dex)); });
    ctx.stroke();

    // Legend
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(W - 95, 4, 8, 8);
    ctx.fillStyle = '#9ca3af'; ctx.textAlign = 'left'; ctx.fillText('CEX', W - 83, 12);
    ctx.fillStyle = '#8b5cf6'; ctx.fillRect(W - 55, 4, 8, 8);
    ctx.fillStyle = '#9ca3af'; ctx.fillText('DEX', W - 43, 12);
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ─── PnL Equity Curve ───────────────────────────────────────────────────────

function PnlCurve({ data }: { data: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
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

    const minV = Math.min(...data, 0);
    const maxV = Math.max(...data, 1);
    const range = maxV - minV || 1;
    const pad = 45;
    const chartW = W - pad - 4;
    const chartH = H - 16;

    const toX = (i: number) => pad + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => 8 + (1 - (v - minV) / range) * chartH;

    // Fill area under curve
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, 'rgba(34,197,94,0.15)');
    gradient.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(0));
    data.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(data.length - 1), toY(0));
    ctx.fill();

    // Drawdown zones (red)
    let peak = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] > peak) { peak = data[i]; continue; }
      const dd = peak - data[i];
      if (dd > range * 0.02) {
        ctx.fillStyle = 'rgba(239,68,68,0.08)';
        ctx.fillRect(toX(i), toY(peak), toX(Math.min(i + 1, data.length - 1)) - toX(i), toY(data[i]) - toY(peak));
      }
    }

    // Line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => { i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)); });
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#4a5568'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
    ctx.fillText(`$${formatPrice(maxV)}`, pad - 4, 14);
    ctx.fillText(`$${formatPrice(minV)}`, pad - 4, H - 4);
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ─── HMM Regime Panel ───────────────────────────────────────────────────────

function RegimePanel({ regime, probs }: { regime: Regime; probs: [number, number, number] }) {
  const regimes: { key: Regime; label: string; color: string; emoji: string }[] = [
    { key: 'LOW_VOL', label: 'Low Volatility', color: '#22c55e', emoji: '🟢' },
    { key: 'TRENDING', label: 'Trending', color: '#eab308', emoji: '🟡' },
    { key: 'HIGH_VOL', label: 'High Volatility', color: '#ef4444', emoji: '🔴' },
  ];

  return (
    <div className="space-y-3">
      {/* Active regime */}
      <div className={`p-2.5 rounded-lg border ${REGIME_CONFIG[regime].bg} text-center`}>
        <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">Current Regime</div>
        <div className="font-mono font-bold text-sm" style={{ color: REGIME_CONFIG[regime].color }}>
          {REGIME_CONFIG[regime].label}
        </div>
      </div>

      {/* Probability bars */}
      <div className="space-y-2">
        {regimes.map((r, i) => (
          <div key={r.key}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] text-gray-500">{r.emoji} {r.label}</span>
              <span className="text-[9px] font-mono text-gray-400">{(probs[i] * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a0e27] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${probs[i] * 100}%`, backgroundColor: r.color, boxShadow: regime === r.key ? `0 0 6px ${r.color}50` : 'none' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Feed ──────────────────────────────────────────────────────────

function ActivityFeed({ logs }: { logs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-none font-mono text-[10px] leading-[15px] space-y-[1px]">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-1.5 hover:bg-white/[0.02] px-1 rounded">
          <span className="text-gray-600 shrink-0">[{log.time}]</span>
          <span style={{ color: log.color }} className="break-all">{log.text}</span>
        </div>
      ))}
      {logs.length === 0 && <div className="text-gray-600 italic px-1">Press Start to begin backtest simulation...</div>}
    </div>
  );
}

// ─── Metrics Bar ────────────────────────────────────────────────────────────

function MetricsBar({ state }: { state: SimState }) {
  const winRate = state.trades > 0 ? (state.wins / state.trades) * 100 : 0;
  const items = [
    { label: 'Cumul. PnL', value: `${state.pnl >= 0 ? '+' : ''}$${formatPrice(state.pnl)}`, color: state.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Trades', value: state.trades.toString(), color: 'text-blue-400' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate > 60 ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Sharpe', value: state.sharpe.toFixed(2), color: state.sharpe > 1.5 ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Avg Gas', value: `$${state.avgGas.toFixed(2)}`, color: 'text-orange-400' },
    { label: 'Regime', value: REGIME_CONFIG[state.regime].label.split(' ')[0], color: REGIME_CONFIG[state.regime].color === '#22c55e' ? 'text-emerald-400' : REGIME_CONFIG[state.regime].color === '#eab308' ? 'text-yellow-400' : 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {items.map((item) => (
        <div key={item.label} className="bg-[#0a0e27]/60 rounded-lg px-2 py-1.5 text-center border border-gray-700/30">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">{item.label}</div>
          <div className={`font-mono text-xs font-bold ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Key Metrics Cards ──────────────────────────────────────────────────────

function KeyMetrics({ state }: { state: SimState }) {
  const winRate = state.trades > 0 ? (state.wins / state.trades) * 100 : 0;
  const avgPnl = state.trades > 0 ? state.pnl / state.trades : 0;
  const cards = [
    { label: 'Sharpe Ratio', value: state.sharpe.toFixed(2), target: '1.87', color: 'from-violet-500 to-purple-600' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, target: '73.2%', color: 'from-emerald-500 to-green-600' },
    { label: 'Avg Trade PnL', value: `+$${avgPnl.toFixed(2)}`, target: '+$42.60', color: 'from-blue-500 to-cyan-600' },
    { label: 'Opps/day', value: Math.floor(state.trades * 3.2).toString(), target: '147', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-[#1a1f3a]/60 rounded-xl p-3 border border-gray-700/30 text-center">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">{c.label}</div>
          <div className={`text-lg font-bold font-mono bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function ArbitrageDashboard() {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<SimState>({
    ethBtc: 0.05234, btcUsdt: 64987, ethUsdt: 3402,
    regime: 'LOW_VOL', regimeProbs: [0.6, 0.25, 0.15],
    pnl: 0, trades: 0, wins: 0, sharpe: 0, avgGas: 3.14,
    arbDetected: false, arbProfit: 0,
    spreadHistory: [], pnlHistory: [],
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [forceHighVol, setForceHighVol] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  const forceRef = useRef(forceHighVol);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { forceRef.current = forceHighVol; }, [forceHighVol]);

  const addLog = useCallback((text: string, color: string) => {
    setLogs(prev => [...prev, { time: formatTime(new Date()), text, color }].slice(-120));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev, pnl: 0, trades: 0, wins: 0, sharpe: 0,
      spreadHistory: [], pnlHistory: [], arbDetected: false, arbProfit: 0,
    }));
    setLogs([]);
    addLog('Backtest counters reset', '#fbbf24');
  }, [addLog]);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setRunning(false);
    setForceHighVol(false);
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setState(prev => ({ ...prev, pnl: 0, trades: 0, wins: 0, sharpe: 0, spreadHistory: [], pnlHistory: [] }));
    addLog('Initializing backtest engine...', '#fbbf24');
    addLog('Loading price data from CCXT + TheGraph...', '#8b8b8b');
    addLog('HMM regime detector calibrated (3 states)', '#8b8b8b');
    addLog('Triangular arbitrage scanner online', '#22c55e');

    let ethBtc = 0.05234;
    let btcUsdt = 64987;
    let ethUsdt = 3402;
    let pnl = 0;
    let trades = 0;
    let wins = 0;
    let regime: Regime = 'LOW_VOL';
    let ticksSinceRegimeChange = 0;
    const pnlReturns: number[] = [];

    // Main tick: every 600ms
    const mainInt = setInterval(() => {
      const spike = forceRef.current;

      // Price random walk with mean reversion
      const volMult = regime === 'HIGH_VOL' || spike ? 3 : regime === 'TRENDING' ? 1.8 : 1;
      btcUsdt += btcUsdt * rand(-0.0003, 0.0003) * volMult;
      ethUsdt += ethUsdt * rand(-0.0004, 0.0004) * volMult;
      ethBtc = ethUsdt / btcUsdt + rand(-0.00002, 0.00002) * volMult;

      // DEX price has slight lag / deviation
      const dexEthUsdt = ethUsdt + rand(-2, 2) * volMult;
      const cexEthUsdt = ethUsdt;

      // HMM regime transitions
      ticksSinceRegimeChange++;
      if (ticksSinceRegimeChange > (spike ? 3 : 12) && Math.random() < 0.08) {
        const oldRegime = regime;
        if (spike) {
          regime = 'HIGH_VOL';
        } else {
          const r = Math.random();
          if (r < 0.4) regime = 'LOW_VOL';
          else if (r < 0.75) regime = 'TRENDING';
          else regime = 'HIGH_VOL';
        }
        ticksSinceRegimeChange = 0;
        if (oldRegime !== regime) {
          addLog(`REGIME SHIFT: ${REGIME_CONFIG[oldRegime].label} → ${REGIME_CONFIG[regime].label}`, '#f97316');
        }
      }

      // Regime probabilities (simulate HMM posterior)
      const regimeProbs: [number, number, number] = [
        regime === 'LOW_VOL' ? rand(0.5, 0.75) : rand(0.05, 0.25),
        regime === 'TRENDING' ? rand(0.45, 0.65) : rand(0.1, 0.3),
        regime === 'HIGH_VOL' || spike ? rand(0.55, 0.8) : rand(0.05, 0.2),
      ];
      const sum = regimeProbs[0] + regimeProbs[1] + regimeProbs[2];
      regimeProbs[0] /= sum; regimeProbs[1] /= sum; regimeProbs[2] /= sum;

      // Triangular arbitrage detection
      const cyclicRate = (1 / ethBtc) * (1 / btcUsdt) * dexEthUsdt;
      const arbProfitPct = (cyclicRate - 1) * 100;
      const arbChance = REGIME_CONFIG[regime].arbChance * (spike ? 2.5 : 1);
      const detected = Math.random() < arbChance && arbProfitPct > 0.02;

      // Spread history
      const newSpreadHistory = [...stateRef.current.spreadHistory, { cex: cexEthUsdt, dex: dexEthUsdt }].slice(-60);

      if (detected) {
        const gasCost = rand(1.2, 7.5);
        const grossPnl = ethUsdt * 2.1 * (arbProfitPct / 100);
        const netPnl = grossPnl - gasCost;
        const won = netPnl > 0;

        trades++;
        if (won) wins++;
        pnl += netPnl;

        pnlReturns.push(netPnl);

        // Compute Sharpe (annualized approx)
        let sharpe = 0;
        if (pnlReturns.length > 3) {
          const mean = pnlReturns.reduce((s, r) => s + r, 0) / pnlReturns.length;
          const std = Math.sqrt(pnlReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / pnlReturns.length);
          sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
        }

        // Scan paths
        const paths = ['ETH→BTC→USDT→ETH', 'ETH→USDT→BTC→ETH'];
        const path = paths[Math.floor(Math.random() * paths.length)];
        addLog(`SCAN: ${path} | spread: +${arbProfitPct.toFixed(2)}% | EXECUTE ✓`, '#22c55e');
        addLog(`BUY 2.1 ETH @ ${formatPrice(dexEthUsdt)} (Uniswap)`, '#8b5cf6');
        addLog(`SELL 2.1 ETH @ ${formatPrice(cexEthUsdt)} (Binance)`, '#3b82f6');
        addLog(`PnL: ${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)} (net of $${gasCost.toFixed(2)} gas)`, netPnl >= 0 ? '#22c55e' : '#ef4444');

        setState(prev => ({
          ...prev,
          ethBtc, btcUsdt, ethUsdt, regime, regimeProbs,
          pnl, trades, wins, sharpe, avgGas: gasCost * 0.3 + prev.avgGas * 0.7,
          arbDetected: true, arbProfit: arbProfitPct,
          spreadHistory: newSpreadHistory,
          pnlHistory: [...prev.pnlHistory, pnl].slice(-100),
        }));

        // Reset arb detection after brief flash
        setTimeout(() => setState(prev => ({ ...prev, arbDetected: false, arbProfit: 0 })), 1200);
      } else {
        // Occasional scan log for skipped opportunities
        if (Math.random() < 0.12) {
          const smallSpread = rand(0.01, 0.09);
          addLog(`SCAN: ETH→BTC→USDT→ETH | spread: +${smallSpread.toFixed(2)}% | SKIP (< threshold)`, '#6b7280');
        }

        setState(prev => ({
          ...prev,
          ethBtc, btcUsdt, ethUsdt, regime, regimeProbs,
          arbDetected: false, arbProfit: 0,
          spreadHistory: newSpreadHistory,
          pnlHistory: prev.pnlHistory.length > 0 ? [...prev.pnlHistory, pnl].slice(-100) : prev.pnlHistory,
        }));
      }
    }, 600);

    cleanupRef.current = () => clearInterval(mainInt);
  }, [running, addLog]);

  // Cleanup on unmount
  useEffect(() => { return () => { cleanupRef.current?.(); }; }, []);

  // Force high vol auto-reset
  useEffect(() => {
    if (!forceHighVol) return;
    addLog('⚡ VOLATILITY EVENT TRIGGERED — HMM shifting to HIGH_VOL', '#f97316');
    const t = setTimeout(() => setForceHighVol(false), 8000);
    return () => clearTimeout(t);
  }, [forceHighVol, addLog]);

  return (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <KeyMetrics state={state} />

      {/* Main Dashboard */}
      <div className="w-full rounded-xl border border-gray-700/50 bg-[#0c1020] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0e1a] border-b border-gray-700/40">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-sm font-semibold text-gray-200">Backtest Simulation</span>
            {running && <span className="text-[9px] text-emerald-400/80 font-mono uppercase tracking-wider">Active</span>}
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <>
                <button
                  onClick={() => setForceHighVol(true)}
                  disabled={forceHighVol}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                    forceHighVol
                      ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                      : 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30'
                  }`}
                >
                  {forceHighVol ? '⚡ Spike Active' : '⚡ Vol Event'}
                </button>
                <button onClick={reset} className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 border border-gray-600/30">
                  📊 Reset
                </button>
              </>
            )}
            <button
              onClick={running ? stop : start}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${
                running
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
              }`}
            >
              {running ? '⏸ Pause' : '▶ Start Backtest'}
            </button>
          </div>
        </div>

        {/* Top Grid: Triangle + Spread Chart */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-[1px] bg-gray-700/20">
          {/* Triangle Visualizer */}
          <div className="bg-[#0c1020] p-2.5 min-h-[220px] md:min-h-[260px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1 text-center">Triangular Arbitrage Cycle</div>
            <div className="h-[calc(100%-16px)]">
              <TriangleVisualizer
                ethBtc={state.ethBtc} btcUsdt={state.btcUsdt} ethUsdt={state.ethUsdt}
                arbDetected={state.arbDetected} arbProfit={state.arbProfit}
              />
            </div>
          </div>

          {/* Spread Chart */}
          <div className="bg-[#0c1020] p-2.5 min-h-[220px] md:min-h-[260px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">ETH/USDT Spread — CEX vs DEX</div>
            <div className="h-[calc(100%-16px)]">
              {state.spreadHistory.length > 1 ? (
                <SpreadChart data={state.spreadHistory} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">
                  {running ? 'Collecting data...' : 'Start backtest to view'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid: HMM + Feed + PnL Curve */}
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_200px] gap-[1px] bg-gray-700/20">
          {/* HMM Regime */}
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2 text-center">HMM Regime</div>
            <RegimePanel regime={state.regime} probs={state.regimeProbs} />
          </div>

          {/* Trade Log */}
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Backtest Feed</div>
            <div className="h-[calc(100%-20px)]"><ActivityFeed logs={logs} /></div>
          </div>

          {/* PnL Curve */}
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">PnL Equity Curve</div>
            <div className="h-[calc(100%-14px)]">
              {state.pnlHistory.length > 1 ? (
                <PnlCurve data={state.pnlHistory} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">
                  {running ? 'Waiting for trades...' : 'Start to view'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="px-3 py-2.5 bg-[#0a0e1a] border-t border-gray-700/40">
          <MetricsBar state={state} />
        </div>

        {/* Footer */}
        <div className="px-4 py-1.5 bg-[#080b15] border-t border-gray-700/20 flex items-center justify-between">
          <span className="text-[8px] text-gray-600 font-mono">Engine: HMM Triangular Arb Backtester v1.0</span>
          <span className="text-[8px] text-gray-600 font-mono">Simulated data — no real trades</span>
        </div>
      </div>
    </div>
  );
}
