'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function formatPrice(p: number) { return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatTime(d: Date) { return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─── Types ──────────────────────────────────────────────────────────────────

interface LogEntry { time: string; text: string; color: string }

interface Position {
  asset: string; side: 'LONG' | 'SHORT'; size: number; unit: string;
  entry: number; mark: number; pnl: number; liq: number;
}

interface StressScenario {
  name: string; impact: number; verdict: string; color: string; progress: number;
}

interface RiskState {
  var95: number; drawdown: number; exposure: number; leverage: number;
  positions: Position[]; pnlHistory: number[]; equityCurve: number[];
  mcBins: number[]; var95pct: number; var99pct: number;
  alertLevel: 'NOMINAL' | 'INFO' | 'WARNING' | 'CRITICAL';
  stressScenarios: StressScenario[];
  warningCount: number; criticalCount: number;
}

// ─── Gauge Component (Canvas) ───────────────────────────────────────────────

function Gauge({ value, min, max, label, unit, zones, size = 130 }: {
  value: number; min: number; max: number; label: string; unit: string;
  zones: { end: number; color: string }[]; size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animValueRef = useRef(value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      // Smooth animation
      animValueRef.current = lerp(animValueRef.current, value, 0.12);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = (size * 0.75) * dpr;
      ctx.scale(dpr, dpr);
      const W = size;
      const H = size * 0.75;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H - 12;
      const r = W * 0.38;
      const startAngle = Math.PI;
      const endAngle = 2 * Math.PI;
      const lineW = 8;

      // Background arc
      ctx.strokeStyle = '#1a2440';
      ctx.lineWidth = lineW;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();

      // Colored zone arcs
      zones.forEach((zone, i) => {
        const prevEnd = i === 0 ? 0 : zones[i - 1].end;
        const a1 = startAngle + ((prevEnd - min) / (max - min)) * Math.PI;
        const a2 = startAngle + ((zone.end - min) / (max - min)) * Math.PI;
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, clamp(a1, startAngle, endAngle), clamp(a2, startAngle, endAngle));
        ctx.stroke();
      });

      // Needle
      const norm = clamp((animValueRef.current - min) / (max - min), 0, 1);
      const needleAngle = startAngle + norm * Math.PI;
      const needleLen = r - 6;

      // Needle glow
      const currentZone = zones.find(z => animValueRef.current <= z.end) || zones[zones.length - 1];
      ctx.shadowColor = currentZone.color;
      ctx.shadowBlur = 8;

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center dot
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Value text
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = currentZone.color;
      ctx.textAlign = 'center';
      ctx.fillText(`${unit}${typeof value === 'number' && !unit.includes('x') && !unit.includes('%') ? formatPrice(Math.abs(animValueRef.current)) : unit.includes('%') ? animValueRef.current.toFixed(1) + '%' : animValueRef.current.toFixed(1) + 'x'}`, cx, cy - 16);

      // Label
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(label, cx, cy + 2);

      if (Math.abs(animValueRef.current - value) > 0.01) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [value, min, max, label, unit, zones, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size * 0.75 }} />;
}

// ─── Monte Carlo Histogram ──────────────────────────────────────────────────

function MonteCarloHist({ bins, var95, var99 }: { bins: number[]; var95: number; var99: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bins.length === 0) return;
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

    const maxBin = Math.max(...bins, 1);
    const pad = { l: 30, r: 8, t: 8, b: 20 };
    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;
    const barW = chartW / bins.length;

    // VaR line positions (bins index 0 = most negative)
    const var95Idx = Math.floor(bins.length * (1 - 0.95));
    const var99Idx = Math.floor(bins.length * (1 - 0.99));

    // Bars
    bins.forEach((b, i) => {
      const h = (b / maxBin) * chartH;
      const x = pad.l + i * barW;
      const y = pad.t + chartH - h;

      // Color: red for left tail, blue for body
      if (i < var95Idx) {
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
      } else if (i < var99Idx) {
        ctx.fillStyle = 'rgba(239,68,68,0.25)';
      } else {
        ctx.fillStyle = 'rgba(99,102,241,0.4)';
      }
      ctx.fillRect(x + 0.5, y, barW - 1, h);
    });

    // VaR 95% line
    const x95 = pad.l + var95Idx * barW;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x95, pad.t); ctx.lineTo(x95, pad.t + chartH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '8px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.fillText(`VaR 95%: ${var95.toFixed(1)}%`, x95 + 3, pad.t + 10);

    // VaR 99% line
    const x99 = pad.l + var99Idx * barW;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x99, pad.t); ctx.lineTo(x99, pad.t + chartH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f97316';
    ctx.fillText(`VaR 99%: ${var99.toFixed(1)}%`, x99 + 3, pad.t + 22);

    // Axis
    ctx.strokeStyle = '#1a2440';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + chartH); ctx.lineTo(W - pad.r, pad.t + chartH); ctx.stroke();
    ctx.font = '7px monospace';
    ctx.fillStyle = '#4a5568';
    ctx.textAlign = 'center';
    ctx.fillText('Losses ←', pad.l + 30, H - 4);
    ctx.fillText('→ Gains', W - pad.r - 30, H - 4);
  }, [bins, var95, var99]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ─── Position Table ─────────────────────────────────────────────────────────

function PositionTable({ positions }: { positions: Position[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px] font-mono">
        <thead>
          <tr className="text-gray-500 border-b border-gray-700/40">
            <th className="text-left py-1 px-1.5">Asset</th>
            <th className="text-left py-1 px-1.5">Side</th>
            <th className="text-right py-1 px-1.5">Size</th>
            <th className="text-right py-1 px-1.5">Entry</th>
            <th className="text-right py-1 px-1.5">Mark</th>
            <th className="text-right py-1 px-1.5">PnL</th>
            <th className="text-right py-1 px-1.5">Liq.</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const nearLiq = p.side === 'LONG'
              ? (p.mark - p.liq) / p.mark < 0.15
              : (p.liq - p.mark) / p.mark < 0.15;
            const up = p.side === 'LONG' ? p.mark > p.entry : p.mark < p.entry;
            return (
              <tr key={p.asset} className={`border-b border-gray-700/20 ${nearLiq ? 'bg-orange-500/5' : ''}`}>
                <td className="py-1.5 px-1.5 text-white font-semibold">{p.asset}</td>
                <td className={`py-1.5 px-1.5 ${p.side === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>{p.side}</td>
                <td className="py-1.5 px-1.5 text-right text-gray-300">{p.size} {p.unit}</td>
                <td className="py-1.5 px-1.5 text-right text-gray-400">{formatPrice(p.entry)}</td>
                <td className="py-1.5 px-1.5 text-right text-gray-300">
                  {formatPrice(p.mark)} <span className={up ? 'text-emerald-400' : 'text-red-400'}>{up ? '▲' : '▼'}</span>
                </td>
                <td className={`py-1.5 px-1.5 text-right font-semibold ${p.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p.pnl >= 0 ? '+' : ''}{formatPrice(p.pnl)}
                </td>
                <td className={`py-1.5 px-1.5 text-right ${nearLiq ? 'text-orange-400 animate-pulse' : 'text-gray-500'}`}>
                  {formatPrice(p.liq)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Alert Feed ─────────────────────────────────────────────────────────────

function AlertFeed({ logs, warningCount, criticalCount }: { logs: LogEntry[]; warningCount: number; criticalCount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Alerts</div>
        <div className="flex gap-2 text-[8px] font-mono">
          {warningCount > 0 && <span className="text-yellow-400">{warningCount} warn</span>}
          {criticalCount > 0 && <span className="text-red-400">{criticalCount} crit</span>}
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none font-mono text-[9px] leading-[14px] space-y-[1px] min-h-0">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-1 hover:bg-white/[0.02] px-1 rounded">
            <span className="text-gray-600 shrink-0">[{log.time}]</span>
            <span style={{ color: log.color }} className="break-all">{log.text}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-600 italic px-1">Start monitoring to see alerts...</div>}
      </div>
    </div>
  );
}

// ─── Stress Test Cards ──────────────────────────────────────────────────────

function StressCards({ scenarios }: { scenarios: StressScenario[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {scenarios.map((s) => (
        <div key={s.name} className="bg-[#0a0e27]/60 rounded-lg p-2 border border-gray-700/30">
          <div className="text-[9px] text-gray-400 font-semibold mb-1 truncate">{s.name}</div>
          <div className="text-[11px] font-mono font-bold text-red-400 mb-1">-${formatPrice(Math.abs(s.impact))}</div>
          <div className="w-full h-1.5 bg-[#1a2440] rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${s.progress}%`, backgroundColor: s.color }}
            />
          </div>
          <div className="text-[8px] font-mono" style={{ color: s.color }}>{s.verdict}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Equity & Drawdown Chart ────────────────────────────────────────────────

function EquityChart({ equity, drawdown }: { equity: number[]; drawdown: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || equity.length < 2) return;
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

    const half = H * 0.6;
    const pad = 4;

    // Equity curve (top 60%)
    const minE = Math.min(...equity);
    const maxE = Math.max(...equity);
    const rangeE = maxE - minE || 1;
    const toEX = (i: number) => pad + (i / (equity.length - 1)) * (W - pad * 2);
    const toEY = (v: number) => pad + (1 - (v - minE) / rangeE) * (half - pad * 2);

    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, half);
    grad.addColorStop(0, 'rgba(34,197,94,0.12)');
    grad.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(toEX(0), half);
    equity.forEach((v, i) => ctx.lineTo(toEX(i), toEY(v)));
    ctx.lineTo(toEX(equity.length - 1), half);
    ctx.fill();

    // Line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    equity.forEach((v, i) => { i === 0 ? ctx.moveTo(toEX(i), toEY(v)) : ctx.lineTo(toEX(i), toEY(v)); });
    ctx.stroke();

    // Drawdown (bottom 40%)
    const ddTop = half + 4;
    const ddH = H - ddTop - pad;
    const minDD = Math.min(...drawdown, -0.01);
    const toDD = (v: number) => ddTop + (v / minDD) * ddH;

    ctx.fillStyle = 'rgba(239,68,68,0.2)';
    ctx.beginPath();
    ctx.moveTo(toEX(0), ddTop);
    drawdown.forEach((v, i) => ctx.lineTo(toEX(i), toDD(v)));
    ctx.lineTo(toEX(drawdown.length - 1), ddTop);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    drawdown.forEach((v, i) => { i === 0 ? ctx.moveTo(toEX(i), toDD(v)) : ctx.lineTo(toEX(i), toDD(v)); });
    ctx.stroke();

    // Labels
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'left';
    ctx.fillText('Equity', pad + 2, pad + 10);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Drawdown', pad + 2, ddTop + 10);
  }, [equity, drawdown]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

// ─── Generate Monte Carlo bins ──────────────────────────────────────────────

function generateMCBins(center: number, vol: number): number[] {
  const N = 10000;
  const samples: number[] = [];
  for (let i = 0; i < N; i++) {
    // Box-Muller
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(center + z * vol);
  }
  // Bin
  const nBins = 60;
  const mn = Math.min(...samples);
  const mx = Math.max(...samples);
  const binW = (mx - mn) / nBins;
  const bins = new Array(nBins).fill(0);
  samples.forEach(s => {
    const idx = Math.min(nBins - 1, Math.floor((s - mn) / binW));
    bins[idx]++;
  });
  return bins;
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function RiskDashboard() {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<RiskState>({
    var95: -2200, drawdown: -2.5, exposure: 25, leverage: 2.0,
    positions: [
      { asset: 'BTC-PERP', side: 'LONG', size: 0.5, unit: 'BTC', entry: 64200, mark: 64200, pnl: 0, liq: 58100 },
      { asset: 'ETH-PERP', side: 'SHORT', size: 8.2, unit: 'ETH', entry: 3450, mark: 3450, pnl: 0, liq: 3890 },
      { asset: 'SOL-PERP', side: 'LONG', size: 120, unit: 'SOL', entry: 142.80, mark: 142.80, pnl: 0, liq: 118.50 },
      { asset: 'ARB-PERP', side: 'LONG', size: 5000, unit: 'ARB', entry: 1.12, mark: 1.12, pnl: 0, liq: 0.82 },
    ],
    pnlHistory: [], equityCurve: [100000], mcBins: generateMCBins(-0.01, 0.03),
    var95pct: -3.2, var99pct: -5.1, alertLevel: 'NOMINAL',
    stressScenarios: [
      { name: 'Flash Crash -15%', impact: 8420, verdict: '⚠️ SURVIVABLE', color: '#f59e0b', progress: 0 },
      { name: 'Liquidation Cascade', impact: 12100, verdict: '🔴 MARGIN CALL', color: '#ef4444', progress: 0 },
      { name: 'Funding Spike +0.1%', impact: 1890, verdict: '🟢 MANAGEABLE', color: '#22c55e', progress: 0 },
      { name: 'Correlation Break', impact: 6750, verdict: '⚠️ REDUCE EXPOSURE', color: '#f97316', progress: 0 },
    ],
    warningCount: 0, criticalCount: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [flashCrash, setFlashCrash] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const flashRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { flashRef.current = flashCrash; }, [flashCrash]);

  const addLog = useCallback((text: string, color: string) => {
    setLogs(prev => [...prev, { time: formatTime(new Date()), text, color }].slice(-100));
  }, []);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setRunning(false);
    setFlashCrash(false);
  }, []);

  const doStressTest = useCallback(() => {
    addLog('⚡ Running stress test scenarios...', '#f97316');
    setState(prev => ({
      ...prev,
      stressScenarios: prev.stressScenarios.map(s => ({ ...s, progress: 0 })),
    }));
    // Animate progress bars sequentially
    [0, 1, 2, 3].forEach((idx) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          stressScenarios: prev.stressScenarios.map((s, i) =>
            i === idx ? { ...s, progress: 100 } : s
          ),
        }));
        addLog(`Stress: ${['Flash Crash', 'Liq. Cascade', 'Funding Spike', 'Corr. Break'][idx]} — analyzed`, '#8b8b8b');
      }, (idx + 1) * 800);
    });
    setTimeout(() => addLog('Stress test complete — 4/4 scenarios evaluated', '#22c55e'), 4000);
  }, [addLog]);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    setLogs([]);

    addLog('🟢 Risk monitoring system initializing...', '#22c55e');
    addLog('Connecting to Bitget API (simulated)...', '#8b8b8b');
    addLog('Monte Carlo engine: 10,000 simulations/cycle', '#8b8b8b');
    addLog('Alert thresholds: INFO=2% | WARNING=5% | CRITICAL=10%', '#fbbf24');
    addLog('System online — monitoring 4 positions', '#22c55e');

    let btcMark = 64200;
    let ethMark = 3450;
    let solMark = 142.80;
    let arbMark = 1.12;
    let equity = 100000;
    let peak = equity;
    let warnings = 0;
    let criticals = 0;
    let tickCount = 0;

    const mainInt = setInterval(() => {
      const crash = flashRef.current;
      const vol = crash ? 8 : 1;

      // Price simulation
      btcMark += btcMark * rand(-0.0003, 0.0003) * vol * (crash ? -2 : 1);
      ethMark += ethMark * rand(-0.0004, 0.0004) * vol * (crash ? -1.5 : 1);
      solMark += solMark * rand(-0.0006, 0.0006) * vol * (crash ? -3 : 1);
      arbMark += arbMark * rand(-0.0005, 0.0005) * vol * (crash ? -2.5 : 1);

      // PnL calculation
      const btcPnl = (btcMark - 64200) * 0.5;
      const ethPnl = (3450 - ethMark) * 8.2;
      const solPnl = (solMark - 142.80) * 120;
      const arbPnl = (arbMark - 1.12) * 5000;
      const totalPnl = btcPnl + ethPnl + solPnl + arbPnl;

      equity = 100000 + totalPnl;
      peak = Math.max(peak, equity);
      const drawdown = ((equity - peak) / peak) * 100;

      // Exposure & leverage
      const longVal = btcMark * 0.5 + solMark * 120 + arbMark * 5000;
      const shortVal = ethMark * 8.2;
      const exposure = ((longVal - shortVal) / equity) * 100;
      const leverage = (longVal + shortVal) / equity;

      // VaR (simplified Monte Carlo)
      const portfolioVol = crash ? 0.06 : 0.03;
      const var95 = equity * (-1.645 * portfolioVol);
      const var99 = equity * (-2.326 * portfolioVol);
      const var95pct = -1.645 * portfolioVol * 100;
      const var99pct = -2.326 * portfolioVol * 100;

      // Alert level
      let alertLevel: RiskState['alertLevel'] = 'NOMINAL';
      if (Math.abs(drawdown) > 10 || crash) { alertLevel = 'CRITICAL'; }
      else if (Math.abs(drawdown) > 5) { alertLevel = 'WARNING'; }
      else if (Math.abs(drawdown) > 2) { alertLevel = 'INFO'; }

      // Re-generate MC histogram every 8 ticks
      tickCount++;
      const mcBins = tickCount % 8 === 0
        ? generateMCBins(-portfolioVol * 0.5, portfolioVol)
        : stateRef.current.mcBins;

      // Positions update
      const positions: Position[] = [
        { asset: 'BTC-PERP', side: 'LONG', size: 0.5, unit: 'BTC', entry: 64200, mark: btcMark, pnl: btcPnl, liq: 58100 },
        { asset: 'ETH-PERP', side: 'SHORT', size: 8.2, unit: 'ETH', entry: 3450, mark: ethMark, pnl: ethPnl, liq: 3890 },
        { asset: 'SOL-PERP', side: 'LONG', size: 120, unit: 'SOL', entry: 142.80, mark: solMark, pnl: solPnl, liq: 118.50 },
        { asset: 'ARB-PERP', side: 'LONG', size: 5000, unit: 'ARB', entry: 1.12, mark: arbMark, pnl: arbPnl, liq: 0.82 },
      ];

      // Drawdown curve
      const ddPct = equity < peak ? (equity - peak) / peak : 0;

      setState(prev => ({
        ...prev,
        var95, drawdown, exposure, leverage, positions,
        var95pct, var99pct, mcBins, alertLevel,
        equityCurve: [...prev.equityCurve, equity].slice(-120),
        pnlHistory: [...prev.pnlHistory, ddPct].slice(-120),
        warningCount: warnings, criticalCount: criticals,
      }));

      // Log alerts based on transitions
      if (tickCount % 5 === 0) {
        if (alertLevel === 'NOMINAL') {
          addLog('🟢 NOMINAL — All risk metrics within bounds', '#22c55e');
        } else if (alertLevel === 'INFO') {
          addLog(`🔵 INFO — VaR 95% approaching threshold: $${formatPrice(Math.abs(var95))}`, '#3b82f6');
        } else if (alertLevel === 'WARNING') {
          warnings++;
          addLog(`🟡 WARNING — Drawdown exceeded 5%: currently ${drawdown.toFixed(1)}%`, '#eab308');
          const nearLiq = positions.find(p => {
            if (p.side === 'LONG') return (p.mark - p.liq) / p.mark < 0.15;
            return (p.liq - p.mark) / p.mark < 0.15;
          });
          if (nearLiq) addLog(`🟡 WARNING — ${nearLiq.asset} approaching liquidation zone`, '#eab308');
        } else if (alertLevel === 'CRITICAL') {
          criticals++;
          addLog(`🔴 CRITICAL — Portfolio VaR breached 99% limit: $${formatPrice(Math.abs(var99))}`, '#ef4444');
          if (crash) addLog('🔴 CRITICAL — Flash crash detected — auto-deleveraging initiated', '#ef4444');
        }
      }

      // Position PnL logs
      if (tickCount % 8 === 0) {
        const p = positions[Math.floor(Math.random() * positions.length)];
        addLog(`${p.asset}: mark ${formatPrice(p.mark)} | PnL ${p.pnl >= 0 ? '+' : ''}$${formatPrice(p.pnl)}`, p.pnl >= 0 ? '#22c55e' : '#ef4444');
      }
    }, 700);

    cleanupRef.current = () => clearInterval(mainInt);
  }, [running, addLog]);

  // Flash crash auto-reset
  useEffect(() => {
    if (!flashCrash) return;
    addLog('💥 FLASH CRASH SIMULATION — prices dropping rapidly', '#ef4444');
    const t = setTimeout(() => {
      setFlashCrash(false);
      addLog('🟢 RESOLVED — Markets stabilizing, risk levels recovering', '#22c55e');
    }, 6000);
    return () => clearTimeout(t);
  }, [flashCrash, addLog]);

  useEffect(() => { return () => { cleanupRef.current?.(); }; }, []);

  const alertColor = { NOMINAL: '#22c55e', INFO: '#3b82f6', WARNING: '#eab308', CRITICAL: '#ef4444' }[state.alertLevel];

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'VaR 99%', value: `-$${formatPrice(Math.abs(state.var95 * 1.4))}`, color: 'from-red-500 to-orange-600' },
          { label: 'MC Simulations', value: '10,000/cycle', color: 'from-blue-500 to-indigo-600' },
          { label: 'Alert Latency', value: '<2s', color: 'from-emerald-500 to-green-600' },
          { label: 'Stress Scenarios', value: '12 tested', color: 'from-amber-500 to-orange-600' },
        ].map(c => (
          <div key={c.label} className="bg-[#1a1f3a]/60 rounded-xl p-3 border border-gray-700/30 text-center">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">{c.label}</div>
            <div className={`text-lg font-bold font-mono bg-gradient-to-r ${c.color} bg-clip-text text-transparent`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main Dashboard */}
      <div className="w-full rounded-xl border border-gray-700/50 bg-[#0c1020] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0e1a] border-b border-gray-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: running ? alertColor : '#4b5563' }} />
            <span className="text-sm font-semibold text-gray-200">Risk Monitor Live</span>
            {running && (
              <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: alertColor }}>
                {state.alertLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <>
                <button onClick={() => setFlashCrash(true)} disabled={flashCrash}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${flashCrash ? 'bg-red-500/20 text-red-400 cursor-not-allowed' : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'}`}>
                  {flashCrash ? '💥 Crashing...' : '💥 Flash Crash'}
                </button>
                <button onClick={doStressTest}
                  className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30">
                  ⚡ Stress Test
                </button>
              </>
            )}
            <button onClick={running ? stop : start}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${running ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'}`}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-gray-700/20">
          <div className="bg-[#0c1020] flex flex-col items-center justify-center p-2 min-h-[120px]">
            <Gauge value={state.var95} min={-6000} max={0} label="Value at Risk (95%)" unit="-$"
              zones={[{ end: -4000, color: '#ef4444' }, { end: -2000, color: '#eab308' }, { end: 0, color: '#22c55e' }]} size={120} />
          </div>
          <div className="bg-[#0c1020] flex flex-col items-center justify-center p-2 min-h-[120px]">
            <Gauge value={state.drawdown} min={-15} max={0} label="Current Drawdown" unit="%"
              zones={[{ end: -10, color: '#ef4444' }, { end: -5, color: '#eab308' }, { end: 0, color: '#22c55e' }]} size={120} />
          </div>
          <div className="bg-[#0c1020] flex flex-col items-center justify-center p-2 min-h-[120px]">
            <Gauge value={state.exposure} min={-100} max={100} label="Net Exposure" unit="%"
              zones={[{ end: -50, color: '#ef4444' }, { end: -20, color: '#eab308' }, { end: 20, color: '#22c55e' }, { end: 50, color: '#eab308' }, { end: 100, color: '#ef4444' }]} size={120} />
          </div>
          <div className="bg-[#0c1020] flex flex-col items-center justify-center p-2 min-h-[120px]">
            <Gauge value={state.leverage} min={0} max={10} label="Portfolio Leverage" unit="x"
              zones={[{ end: 3, color: '#22c55e' }, { end: 5, color: '#eab308' }, { end: 10, color: '#ef4444' }]} size={120} />
          </div>
        </div>

        {/* Middle: MC Histogram + Positions + Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px] gap-[1px] bg-gray-700/20">
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Monte Carlo Distribution (10K sims)</div>
            <div className="h-[calc(100%-14px)]">
              <MonteCarloHist bins={state.mcBins} var95={state.var95pct} var99={state.var99pct} />
            </div>
          </div>
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Open Positions</div>
            <PositionTable positions={state.positions} />
          </div>
          <div className="bg-[#0c1020] p-2.5 min-h-[180px]">
            <AlertFeed logs={logs} warningCount={state.warningCount} criticalCount={state.criticalCount} />
          </div>
        </div>

        {/* Stress Scenarios */}
        <div className="px-3 py-2.5 bg-[#0a0e1a] border-t border-gray-700/30">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Stress Test Scenarios</div>
          <StressCards scenarios={state.stressScenarios} />
        </div>

        {/* Equity & Drawdown */}
        <div className="bg-[#0c1020] p-2.5 min-h-[120px] border-t border-gray-700/20">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Equity & Drawdown</div>
          <div className="h-[100px]">
            {state.equityCurve.length > 1 ? (
              <EquityChart equity={state.equityCurve} drawdown={state.pnlHistory.length > 0 ? state.pnlHistory : [0]} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">Start monitoring to view</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-1.5 bg-[#080b15] border-t border-gray-700/20 flex items-center justify-between">
          <span className="text-[8px] text-gray-600 font-mono">Engine: Monte Carlo Risk System v2.0</span>
          <span className="text-[8px] text-gray-600 font-mono">Simulated portfolio — no real positions</span>
        </div>
      </div>
    </div>
  );
}
