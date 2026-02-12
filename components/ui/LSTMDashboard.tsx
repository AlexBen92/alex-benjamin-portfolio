'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── types ─── */
interface PricePoint {
  time: number;
  price: number;
  predicted: number;
  correct: boolean;
}

interface Feature {
  name: string;
  value: number;
  color: string;
}

interface PredictionLog {
  id: number;
  time: string;
  direction: 'UP' | 'DOWN';
  confidence: number;
  actual: 'UP' | 'DOWN';
  correct: boolean;
  pnl: number;
}

interface Neuron {
  x: number;
  y: number;
  activation: number;
  targetActivation: number;
}

/* ─── constants ─── */
const ACCENT = '#10B981';
const ACCENT2 = '#34D399';
const BG = '#0c1020';
const CARD = '#111827';
const BORDER = '#1f2937';
const MAX_POINTS = 120;
const TICK = 80; // ms

export default function LSTMDashboard() {
  /* refs */
  const priceCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<number>(0);

  /* state */
  const [running, setRunning] = useState(true);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [features, setFeatures] = useState<Feature[]>([
    { name: 'Bid Imbalance', value: 0.65, color: '#10B981' },
    { name: 'Ask Pressure', value: 0.42, color: '#EF4444' },
    { name: 'Trade Flow', value: 0.58, color: '#3B82F6' },
    { name: 'Spread Δ', value: 0.31, color: '#F59E0B' },
    { name: 'Volume Accel', value: 0.73, color: '#8B5CF6' },
    { name: 'VWAP Deviation', value: 0.49, color: '#EC4899' },
  ]);
  const [logs, setLogs] = useState<PredictionLog[]>([]);
  const [metrics, setMetrics] = useState({
    accuracy: 72.4,
    sharpe: 2.18,
    totalTrades: 0,
    pnl: 0,
    winRate: 0,
    avgConfidence: 0,
  });
  const [neurons, setNeurons] = useState<Neuron[][]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [sweepActive, setSweepActive] = useState(false);
  const [regimeChange, setRegimeChange] = useState(false);

  /* state refs for animation loop */
  const runRef = useRef(running);
  const pricesRef = useRef(prices);
  const logsRef = useRef(logs);
  const metricsRef = useRef(metrics);
  const featuresRef = useRef(features);
  const neuronsRef = useRef(neurons);
  const heatmapRef = useRef(heatmapData);
  const sweepRef = useRef(sweepActive);
  const regimeRef = useRef(regimeChange);

  useEffect(() => { runRef.current = running; }, [running]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { featuresRef.current = features; }, [features]);
  useEffect(() => { neuronsRef.current = neurons; }, [neurons]);
  useEffect(() => { heatmapRef.current = heatmapData; }, [heatmapData]);
  useEffect(() => { sweepRef.current = sweepActive; }, [sweepActive]);
  useEffect(() => { regimeRef.current = regimeChange; }, [regimeChange]);

  /* init neurons */
  useEffect(() => {
    const layers = [8, 12, 12, 6, 2];
    const net: Neuron[][] = layers.map((count, li) => {
      const xPos = (li / (layers.length - 1)) * 0.8 + 0.1;
      return Array.from({ length: count }, (_, ni) => ({
        x: xPos,
        y: (ni + 1) / (count + 1),
        activation: Math.random(),
        targetActivation: Math.random(),
      }));
    });
    setNeurons(net);
  }, []);

  /* init heatmap */
  useEffect(() => {
    const rows = 20;
    const cols = 30;
    const data: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * 0.5)
    );
    setHeatmapData(data);
  }, []);

  /* ─── simulation tick ─── */
  const tick = useCallback(() => {
    if (!runRef.current) return;

    const prev = pricesRef.current;
    const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 2450;
    const sweep = sweepRef.current;
    const regime = regimeRef.current;

    // price dynamics
    let drift = 0;
    let vol = 0.15;
    if (sweep) { drift = (Math.random() > 0.5 ? 1 : -1) * 3; vol = 0.8; }
    if (regime) { vol = 0.5; drift = -0.5; }

    const change = drift + (Math.random() - 0.5) * vol;
    const newPrice = lastPrice + change;

    // prediction
    const confidence = 0.55 + Math.random() * 0.4;
    const predictedDir = change > 0 ? 'UP' as const : 'DOWN' as const;
    // model accuracy ~72%
    const accuracyBias = regime ? 0.55 : 0.72;
    const isCorrect = Math.random() < accuracyBias;
    const actualDir = isCorrect ? predictedDir : (predictedDir === 'UP' ? 'DOWN' as const : 'UP' as const);
    const actualChange = actualDir === 'UP' ? Math.abs(change) : -Math.abs(change);
    const predictedPrice = lastPrice + (isCorrect ? actualChange : -actualChange);

    const point: PricePoint = {
      time: Date.now(),
      price: newPrice,
      predicted: newPrice + (isCorrect ? 0 : (Math.random() - 0.5) * 2),
      correct: isCorrect,
    };

    const newPrices = [...prev, point].slice(-MAX_POINTS);
    setPrices(newPrices);

    // features
    setFeatures(f =>
      f.map(feat => ({
        ...feat,
        value: Math.max(0, Math.min(1,
          feat.value + (Math.random() - 0.5) * (sweep ? 0.15 : 0.06)
        )),
      }))
    );

    // prediction log every ~4 ticks
    tickRef.current++;
    if (tickRef.current % 4 === 0) {
      const pnl = isCorrect ? Math.random() * 50 + 10 : -(Math.random() * 30 + 5);
      const log: PredictionLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        direction: predictedDir,
        confidence,
        actual: actualDir,
        correct: isCorrect,
        pnl,
      };
      const newLogs = [log, ...logsRef.current].slice(0, 50);
      setLogs(newLogs);

      // update metrics
      const totalTrades = metricsRef.current.totalTrades + 1;
      const totalPnl = metricsRef.current.pnl + pnl;
      const wins = newLogs.filter(l => l.correct).length;
      const winRate = (wins / newLogs.length) * 100;
      const avgConf = newLogs.reduce((s, l) => s + l.confidence, 0) / newLogs.length * 100;
      setMetrics({
        accuracy: winRate,
        sharpe: 1.5 + Math.random() * 1.5,
        totalTrades,
        pnl: totalPnl,
        winRate,
        avgConfidence: avgConf,
      });
    }

    // neurons: smoothly animate activations
    setNeurons(prev =>
      prev.map(layer =>
        layer.map(n => {
          let act = n.activation + (n.targetActivation - n.activation) * 0.15;
          const newTarget = Math.random() < 0.05
            ? Math.random()
            : n.targetActivation;
          return { ...n, activation: act, targetActivation: newTarget };
        })
      )
    );

    // heatmap
    setHeatmapData(prev => {
      const rows = prev.length;
      const cols = prev[0]?.length || 30;
      return prev.map((row, ri) => {
        // shift left, add new column
        const newRow = [...row.slice(1)];
        const bidSide = ri < rows / 2;
        let intensity = Math.random() * 0.6;
        if (sweep) intensity = bidSide ? Math.random() * 0.3 : 0.6 + Math.random() * 0.4;
        newRow.push(intensity);
        return newRow;
      });
    });
  }, []);

  /* ─── animation loop ─── */
  useEffect(() => {
    let lastTick = 0;

    const loop = (ts: number) => {
      if (ts - lastTick >= TICK) {
        lastTick = ts;
        tick();
      }
      // draw canvases
      drawPriceChart();
      drawNetwork();
      drawHeatmap();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  /* ─── draw: price chart ─── */
  const drawPriceChart = () => {
    const canvas = priceCanvasRef.current;
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

    const pts = pricesRef.current;
    if (pts.length < 2) return;

    const prices = pts.map(p => p.price);
    const predicted = pts.map(p => p.predicted);
    const all = [...prices, ...predicted];
    const min = Math.min(...all) - 1;
    const max = Math.max(...all) + 1;
    const range = max - min || 1;

    const toX = (i: number) => (i / (pts.length - 1)) * W;
    const toY = (v: number) => H - ((v - min) / range) * H * 0.85 - H * 0.05;

    // grid
    ctx.strokeStyle = '#1f293770';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = H * 0.05 + (i / 4) * H * 0.85;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // accuracy background zones
    for (let i = 1; i < pts.length; i++) {
      const x1 = toX(i - 1);
      const x2 = toX(i);
      ctx.fillStyle = pts[i].correct ? '#10B98110' : '#EF444410';
      ctx.fillRect(x1, 0, x2 - x1, H);
    }

    // predicted line (dashed)
    ctx.strokeStyle = '#F59E0B80';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.predicted);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // actual price line
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#10B981');
    grad.addColorStop(1, '#34D399');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.price);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // fill under price
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, '#10B98120');
    fillGrad.addColorStop(1, '#10B98100');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // prediction dots on last few points
    const lastN = Math.min(20, pts.length);
    for (let i = pts.length - lastN; i < pts.length; i++) {
      const p = pts[i];
      const x = toX(i);
      const y = toY(p.price);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.correct ? '#10B981' : '#EF4444';
      ctx.fill();
    }

    // latest price label
    const last = pts[pts.length - 1];
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`$${last.price.toFixed(2)}`, W - 8, toY(last.price) - 8);

    // legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = ACCENT;
    ctx.fillRect(8, 8, 12, 3);
    ctx.fillText('Actual', 24, 12);
    ctx.fillStyle = '#F59E0B80';
    ctx.fillRect(8, 20, 12, 3);
    ctx.fillText('Predicted', 24, 24);
  };

  /* ─── draw: neural network ─── */
  const drawNetwork = () => {
    const canvas = networkCanvasRef.current;
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

    const net = neuronsRef.current;
    if (net.length === 0) return;

    // draw connections
    for (let li = 0; li < net.length - 1; li++) {
      const layer = net[li];
      const nextLayer = net[li + 1];
      for (const n of layer) {
        for (const n2 of nextLayer) {
          const weight = (n.activation + n2.activation) / 2;
          ctx.strokeStyle = `rgba(16, 185, 129, ${weight * 0.3})`;
          ctx.lineWidth = weight * 1.5;
          ctx.beginPath();
          ctx.moveTo(n.x * W, n.y * H);
          ctx.lineTo(n2.x * W, n2.y * H);
          ctx.stroke();
        }
      }
    }

    // draw neurons
    const labels = ['Input', 'LSTM₁', 'LSTM₂', 'Dense', 'Output'];
    for (let li = 0; li < net.length; li++) {
      const layer = net[li];
      // layer label
      ctx.fillStyle = '#6B728080';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[li] || '', layer[0].x * W, H - 4);

      for (const n of layer) {
        const r = 4 + n.activation * 5;
        // glow
        const grd = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, r * 3);
        grd.addColorStop(0, `rgba(16, 185, 129, ${n.activation * 0.4})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // neuron
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, r, 0, Math.PI * 2);
        const bright = Math.floor(n.activation * 200 + 55);
        ctx.fillStyle = `rgb(16, ${bright}, 129)`;
        ctx.fill();
        ctx.strokeStyle = '#10B98140';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  /* ─── draw: heatmap ─── */
  const drawHeatmap = () => {
    const canvas = heatmapCanvasRef.current;
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

    const data = heatmapRef.current;
    if (data.length === 0) return;

    const rows = data.length;
    const cols = data[0].length;
    const cellW = W / cols;
    const cellH = H / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = data[r][c];
        const bidSide = r < rows / 2;
        if (bidSide) {
          // green for bids
          const g = Math.floor(80 + v * 175);
          ctx.fillStyle = `rgba(16, ${g}, 129, ${0.3 + v * 0.7})`;
        } else {
          // red for asks
          const red = Math.floor(80 + v * 175);
          ctx.fillStyle = `rgba(${red}, 68, 68, ${0.3 + v * 0.7})`;
        }
        ctx.fillRect(c * cellW, r * cellH, cellW - 0.5, cellH - 0.5);
      }
    }

    // mid line
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // labels
    ctx.fillStyle = '#10B98180';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BIDS', 4, 14);
    ctx.fillStyle = '#EF444480';
    ctx.fillText('ASKS', 4, H - 6);
  };

  /* ─── controls ─── */
  const handleSweep = () => {
    setSweepActive(true);
    setTimeout(() => setSweepActive(false), 6000);
  };

  const handleRegime = () => {
    setRegimeChange(true);
    setTimeout(() => setRegimeChange(false), 8000);
  };

  const handleReset = () => {
    setPrices([]);
    setLogs([]);
    setMetrics({ accuracy: 72.4, sharpe: 2.18, totalTrades: 0, pnl: 0, winRate: 0, avgConfidence: 0 });
    tickRef.current = 0;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-emerald-500/20" style={{ background: BG }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-emerald-400 text-sm font-mono font-semibold">
            🧠 LSTM Order Flow Predictor — ETH/USDT
          </span>
          {sweepActive && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full animate-pulse">
              LARGE SWEEP
            </span>
          )}
          {regimeChange && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
              REGIME CHANGE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              running
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={handleSweep}
            disabled={sweepActive}
            className="px-3 py-1 text-xs rounded font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-40"
          >
            Large Sweep
          </button>
          <button
            onClick={handleRegime}
            disabled={regimeChange}
            className="px-3 py-1 text-xs rounded font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
          >
            Regime Δ
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
        {/* Price Prediction Chart */}
        <div className="lg:col-span-2 p-4" style={{ background: CARD }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Price & Prediction
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Wrong
              </span>
            </div>
          </div>
          <canvas ref={priceCanvasRef} className="w-full" style={{ height: 200 }} />
        </div>

        {/* Feature Bars */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Microstructure Features
          </h3>
          <div className="space-y-3">
            {features.map(f => (
              <div key={f.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-400">{f.name}</span>
                  <span className="text-gray-500 font-mono">{f.value.toFixed(3)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${f.value * 100}%`,
                      backgroundColor: f.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Neural Network */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Bi-LSTM Network Activations
          </h3>
          <canvas ref={networkCanvasRef} className="w-full" style={{ height: 180 }} />
        </div>

        {/* Order Flow Heatmap */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Order Flow Heatmap (L2)
          </h3>
          <canvas ref={heatmapCanvasRef} className="w-full" style={{ height: 180 }} />
        </div>

        {/* Prediction Log */}
        <div className="p-4" style={{ background: CARD }}>
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Prediction Log
          </h3>
          <div className="space-y-1 max-h-[180px] overflow-y-auto custom-scrollbar">
            {logs.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-4">Awaiting predictions...</p>
            )}
            {logs.slice(0, 15).map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded"
                style={{ background: log.correct ? '#10B98110' : '#EF444410' }}
              >
                <span className="text-gray-500 font-mono w-16">{log.time}</span>
                <span className={`font-bold w-10 ${log.direction === 'UP' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {log.direction === 'UP' ? '▲' : '▼'} {log.direction}
                </span>
                <span className="text-gray-400 w-12 text-right">{(log.confidence * 100).toFixed(0)}%</span>
                <span className={`w-5 text-center ${log.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                  {log.correct ? '✓' : '✗'}
                </span>
                <span className={`font-mono w-16 text-right ${log.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {log.pnl >= 0 ? '+' : ''}{log.pnl.toFixed(1)}$
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px border-t" style={{ borderColor: BORDER, background: BORDER }}>
        {[
          { label: 'Accuracy', value: `${metrics.accuracy.toFixed(1)}%`, color: metrics.accuracy >= 70 ? '#10B981' : '#EF4444' },
          { label: 'Sharpe', value: metrics.sharpe.toFixed(2), color: '#F59E0B' },
          { label: 'Trades', value: metrics.totalTrades.toString(), color: '#3B82F6' },
          { label: 'PnL', value: `${metrics.pnl >= 0 ? '+' : ''}$${metrics.pnl.toFixed(0)}`, color: metrics.pnl >= 0 ? '#10B981' : '#EF4444' },
          { label: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, color: '#8B5CF6' },
          { label: 'Avg Conf', value: `${metrics.avgConfidence.toFixed(1)}%`, color: '#EC4899' },
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
          Bi-LSTM Order Flow Predictor • Walk-Forward Validation • Tick-by-Tick L2 Data • Latency &lt;5ms
        </span>
      </div>
    </div>
  );
}
