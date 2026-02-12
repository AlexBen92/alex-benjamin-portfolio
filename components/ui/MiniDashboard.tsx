'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(p: number) {
  return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderLevel { price: number; qty: number }
interface LogEntry { time: string; text: string; color: string }
interface Metrics { pnl: number; spread: number; latency: number; ordersPerSec: number; volatility: number; position: number }
interface CandlePoint { open: number; high: number; low: number; close: number; time: number }

// ─── Binance endpoints ──────────────────────────────────────────────────────

const SYMBOL = 'btcusdt';
// Try multiple WS endpoints (443 first for networks blocking 9443)
const WS_URLS = [
  `wss://stream.binance.com:443/ws/${SYMBOL}`,
  `wss://stream.binance.com:9443/ws/${SYMBOL}`,
];
const REST_DEPTH = `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=10`;
const REST_TRADES = `https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=20`;
const REST_KLINES = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=60`;
const REST_TICKER = `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`;

// ─── Sub-components ─────────────────────────────────────────────────────────

function OrderBookView({ bids, asks, midPrice }: { bids: OrderLevel[]; asks: OrderLevel[]; midPrice: number }) {
  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty), 0.001);
  const spread = asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0;
  const spreadBps = midPrice > 0 ? (spread / midPrice) * 10000 : 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold flex justify-between px-1">
        <span>Price (USDT)</span><span>Qty (BTC)</span>
      </div>
      <div className="flex-1 flex flex-col justify-end gap-[1px] min-h-0 overflow-hidden">
        {[...asks].reverse().slice(-8).map((a, i) => (
          <div key={`a-${i}`} className="relative flex justify-between items-center text-[11px] font-mono px-1 py-[1px]">
            <div className="absolute right-0 top-0 bottom-0 bg-red-500/15 transition-all duration-150" style={{ width: `${Math.min(100, (a.qty / maxQty) * 100)}%` }} />
            <span className="relative text-red-400">{formatPrice(a.price)}</span>
            <span className="relative text-gray-400">{a.qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
      <div className="text-center py-1.5 border-y border-gray-700/50 my-0.5">
        <span className="text-[11px] font-mono text-amber-400 font-bold">{formatPrice(midPrice)}</span>
        <span className="text-[9px] text-gray-500 ml-2">Spread: {spread.toFixed(2)} ({spreadBps.toFixed(1)} bps)</span>
      </div>
      <div className="flex-1 flex flex-col gap-[1px] min-h-0 overflow-hidden">
        {bids.slice(0, 8).map((b, i) => (
          <div key={`b-${i}`} className="relative flex justify-between items-center text-[11px] font-mono px-1 py-[1px]">
            <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 transition-all duration-150" style={{ width: `${Math.min(100, (b.qty / maxQty) * 100)}%` }} />
            <span className="relative text-emerald-400">{formatPrice(b.price)}</span>
            <span className="relative text-gray-400">{b.qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceChart({ candles }: { candles: CandlePoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length < 2) return;
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

    const prices = candles.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const pad = 52;
    const chartW = W - pad - 8;
    const chartH = H - 28;
    const toX = (i: number) => pad + (i / (candles.length - 1)) * chartW;
    const toY = (p: number) => 10 + (1 - (p - minP) / range) * chartH;

    ctx.strokeStyle = '#1a2440';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = 10 + (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - 8, y); ctx.stroke();
      ctx.fillStyle = '#4a5568'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText(formatPrice(maxP - (i / 4) * range), pad - 4, y + 3);
    }

    const candleW = Math.max(1.5, chartW / candles.length * 0.6);
    candles.forEach((c, i) => {
      const x = toX(i);
      const bullish = c.close >= c.open;
      const color = bullish ? '#00ff88' : '#ff4466';
      ctx.strokeStyle = color; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x, toY(c.high)); ctx.lineTo(x, toY(c.low)); ctx.stroke();
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBot = toY(Math.min(c.open, c.close));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, Math.max(bodyBot - bodyTop, 1));
    });

    const lastClose = candles[candles.length - 1].close;
    const lastY = toY(lastClose);
    ctx.strokeStyle = '#fbbf2480'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(pad, lastY); ctx.lineTo(W - 8, lastY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(formatPrice(lastClose), W - 65, lastY - 4);
  }, [candles]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

function ActivityFeed({ logs }: { logs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-none font-mono text-[10px] leading-[16px] space-y-[1px]">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-1.5 hover:bg-white/[0.02] px-1 rounded">
          <span className="text-gray-600 shrink-0">[{log.time}]</span>
          <span style={{ color: log.color }} className="break-all">{log.text}</span>
        </div>
      ))}
      {logs.length === 0 && <div className="text-gray-600 italic px-1">Press Connect to start live feed...</div>}
    </div>
  );
}

function MetricsBar({ metrics }: { metrics: Metrics }) {
  const items = [
    { label: 'PnL (sim)', value: `${metrics.pnl >= 0 ? '+' : ''}$${metrics.pnl.toFixed(2)}`, color: metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Spread', value: `${metrics.spread.toFixed(1)} bps`, color: 'text-amber-400' },
    { label: 'Latency', value: `${metrics.latency.toFixed(0)}ms`, color: metrics.latency < 150 ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Trades/s', value: metrics.ordersPerSec.toFixed(0), color: 'text-blue-400' },
    { label: 'Vol σ', value: metrics.volatility.toFixed(4), color: metrics.volatility > 0.003 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Position', value: `${metrics.position >= 0 ? '+' : ''}${metrics.position.toFixed(4)} BTC`, color: metrics.position >= 0 ? 'text-emerald-400' : 'text-red-400' },
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

function SpreadGauge({ volatility, spread }: { volatility: number; spread: number }) {
  const pct = Math.min(100, Math.max(0, ((volatility - 0.0005) / 0.0045) * 100));
  const hue = 120 - pct * 1.2;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Spread / Volatility</div>
      <div className="w-full h-3 bg-[#0a0e27] rounded-full overflow-hidden border border-gray-700/30">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(8, pct)}%`, background: `hsl(${hue}, 80%, 50%)`, boxShadow: `0 0 8px hsla(${hue}, 80%, 50%, 0.5)` }} />
      </div>
      <div className="flex justify-between w-full text-[9px] font-mono">
        <span className="text-emerald-500">Low vol</span>
        <span className="text-gray-500">{spread.toFixed(1)} bps</span>
        <span className="text-red-500">High vol</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function MiniDashboard() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'ws' | 'rest' | null>(null);
  const [midPrice, setMidPrice] = useState(0);
  const [orderBook, setOrderBook] = useState<{ bids: OrderLevel[]; asks: OrderLevel[] }>({ bids: [], asks: [] });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ pnl: 0, spread: 0, latency: 0, ordersPerSec: 0, volatility: 0, position: 0 });
  const [candles, setCandles] = useState<CandlePoint[]>([]);

  const cleanupRef = useRef<(() => void) | null>(null);
  const tradeCountRef = useRef(0);
  const lastCountRef = useRef(0);
  const lastPricesRef = useRef<number[]>([]);
  const pnlRef = useRef(0);
  const posRef = useRef(0);

  const addLog = useCallback((text: string, color: string) => {
    setLogs(prev => [...prev, { time: formatTime(new Date()), text, color }].slice(-120));
  }, []);

  // ─── Stop ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setRunning(false);
    setMode(null);
  }, []);

  // ─── Try WebSocket connection with timeout ──────────────────────────
  const tryWs = useCallback((url: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => { ws.close(); reject(new Error('timeout')); }, 4000);
      ws.onopen = () => { clearTimeout(timeout); resolve(ws); };
      ws.onerror = () => { clearTimeout(timeout); reject(new Error('error')); };
    });
  }, []);

  // ─── WebSocket mode ─────────────────────────────────────────────────
  const startWs = useCallback(async () => {
    addLog('Attempting WebSocket connection...', '#fbbf24');

    let baseWs: WebSocket | null = null;
    for (const url of WS_URLS) {
      try {
        baseWs = await tryWs(url);
        addLog(`Connected via ${url.includes('443/') ? 'port 443' : 'port 9443'}`, '#00ff88');
        break;
      } catch {
        continue;
      }
    }

    if (!baseWs) return false;

    setMode('ws');

    // Subscribe to streams via combined stream
    const ws = baseWs;

    // We need separate connections for each stream
    const depthUrl = ws.url.replace(SYMBOL, `${SYMBOL}@depth20@100ms`);
    const tradeUrl = ws.url.replace(SYMBOL, `${SYMBOL}@aggTrade`);
    const klineUrl = ws.url.replace(SYMBOL, `${SYMBOL}@kline_1s`);

    // Close the test connection
    ws.close();

    // Open the 3 real streams
    const sockets: WebSocket[] = [];

    const wsDepth = new WebSocket(depthUrl);
    wsDepth.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        const bids = (d.bids || []).slice(0, 10).map((b: string[]) => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) }));
        const asks = (d.asks || []).slice(0, 10).map((a: string[]) => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) }));
        setOrderBook({ bids, asks });
        if (bids.length && asks.length) {
          const mid = (bids[0].price + asks[0].price) / 2;
          setMidPrice(mid);
          setMetrics(prev => ({ ...prev, spread: ((asks[0].price - bids[0].price) / mid) * 10000 }));
        }
      } catch { /* skip */ }
    };
    wsDepth.onopen = () => addLog('Depth stream connected', '#8b8b8b');
    sockets.push(wsDepth);

    let lastLogTime = 0;
    const wsTrade = new WebSocket(tradeUrl);
    wsTrade.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        const price = parseFloat(d.p);
        const qty = parseFloat(d.q);
        const isSell = d.m;
        const latency = Date.now() - d.E;

        tradeCountRef.current++;
        lastPricesRef.current.push(price);
        if (lastPricesRef.current.length > 50) lastPricesRef.current.shift();

        let vol = 0;
        if (lastPricesRef.current.length > 5) {
          const ret: number[] = [];
          for (let i = 1; i < lastPricesRef.current.length; i++) ret.push(Math.log(lastPricesRef.current[i] / lastPricesRef.current[i - 1]));
          const mean = ret.reduce((s, r) => s + r, 0) / ret.length;
          vol = Math.sqrt(ret.reduce((s, r) => s + (r - mean) ** 2, 0) / ret.length);
        }

        const capture = qty * price * 0.00005;
        const posDelta = isSell ? -qty * 0.1 : qty * 0.1;
        posRef.current = Math.max(-0.5, Math.min(0.5, posRef.current + posDelta));
        pnlRef.current += capture - Math.abs(posDelta) * vol * price;

        setMetrics(prev => ({ ...prev, latency, volatility: vol, pnl: pnlRef.current, position: posRef.current }));

        const now = Date.now();
        if (now - lastLogTime > 300) {
          lastLogTime = now;
          addLog(`${isSell ? 'SELL' : 'BUY '} ${qty.toFixed(4)} BTC @ ${formatPrice(price)}`, isSell ? '#ff4466' : '#00ff88');
        }
      } catch { /* skip */ }
    };
    wsTrade.onopen = () => addLog('Trade stream connected', '#8b8b8b');
    sockets.push(wsTrade);

    const wsKline = new WebSocket(klineUrl);
    wsKline.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        const k = d.k;
        if (!k) return;
        const candle: CandlePoint = { open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c), time: k.t };
        setCandles(prev => {
          const copy = [...prev];
          if (copy.length > 0 && copy[copy.length - 1].time === candle.time) copy[copy.length - 1] = candle;
          else copy.push(candle);
          return copy.slice(-60);
        });
        if (k.x) addLog(`CANDLE ${candle.close >= candle.open ? '▲' : '▼'} C:${formatPrice(candle.close)}`, candle.close >= candle.open ? '#00ff88' : '#ff4466');
      } catch { /* skip */ }
    };
    wsKline.onopen = () => addLog('Kline stream connected', '#8b8b8b');
    sockets.push(wsKline);

    const countInt = setInterval(() => {
      setMetrics(prev => ({ ...prev, ordersPerSec: tradeCountRef.current - lastCountRef.current }));
      lastCountRef.current = tradeCountRef.current;
    }, 1000);

    cleanupRef.current = () => {
      sockets.forEach(s => { try { s.close(); } catch { /* */ } });
      clearInterval(countInt);
    };

    addLog('All streams active — live data from Binance', '#00ff88');
    return true;
  }, [addLog, tryWs]);

  // ─── REST fallback mode ─────────────────────────────────────────────
  const startRest = useCallback(() => {
    setMode('rest');
    addLog('WebSocket unavailable — using REST API fallback', '#f97316');
    addLog('Polling Binance REST API every 1.5s...', '#fbbf24');

    // Fetch initial klines for chart history
    fetch(REST_KLINES)
      .then(r => r.json())
      .then((data: (string | number)[][]) => {
        const hist: CandlePoint[] = data.map(k => ({
          open: parseFloat(k[1] as string), high: parseFloat(k[2] as string),
          low: parseFloat(k[3] as string), close: parseFloat(k[4] as string), time: k[0] as number,
        }));
        setCandles(hist.slice(-60));
        addLog(`Loaded ${hist.length} historical 1s candles`, '#8b8b8b');
      })
      .catch(() => addLog('Failed to load kline history', '#ff4466'));

    const poll = setInterval(async () => {
      const start = Date.now();
      try {
        const [depthRes, tradesRes, tickerRes] = await Promise.all([
          fetch(REST_DEPTH), fetch(REST_TRADES), fetch(REST_TICKER),
        ]);
        const latency = Date.now() - start;
        const depth = await depthRes.json();
        const trades = await tradesRes.json();
        const ticker = await tickerRes.json();

        // Order book
        const bids = (depth.bids || []).map((b: string[]) => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) }));
        const asks = (depth.asks || []).map((a: string[]) => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) }));
        setOrderBook({ bids, asks });

        const price = parseFloat(ticker.price);
        setMidPrice(price);

        // Spread
        const spreadBps = bids.length && asks.length ? ((asks[0].price - bids[0].price) / price) * 10000 : 0;

        // Volatility from recent trades
        const tradePrices = trades.map((t: { price: string }) => parseFloat(t.price));
        lastPricesRef.current = tradePrices;
        let vol = 0;
        if (tradePrices.length > 5) {
          const ret: number[] = [];
          for (let i = 1; i < tradePrices.length; i++) ret.push(Math.log(tradePrices[i] / tradePrices[i - 1]));
          const mean = ret.reduce((s: number, r: number) => s + r, 0) / ret.length;
          vol = Math.sqrt(ret.reduce((s: number, r: number) => s + (r - mean) ** 2, 0) / ret.length);
        }

        // Sim PnL from trades
        trades.forEach((t: { price: string; qty: string; isBuyerMaker: boolean }) => {
          const q = parseFloat(t.qty);
          const p = parseFloat(t.price);
          pnlRef.current += q * p * 0.00005;
          posRef.current += (t.isBuyerMaker ? -1 : 1) * q * 0.05;
          posRef.current = Math.max(-0.5, Math.min(0.5, posRef.current));
        });

        tradeCountRef.current += trades.length;

        setMetrics({
          pnl: pnlRef.current,
          spread: spreadBps,
          latency,
          ordersPerSec: trades.length,
          volatility: vol,
          position: posRef.current,
        });

        // Log latest trade
        if (trades.length > 0) {
          const last = trades[trades.length - 1];
          const isSell = last.isBuyerMaker;
          addLog(
            `${isSell ? 'SELL' : 'BUY '} ${parseFloat(last.qty).toFixed(4)} BTC @ ${formatPrice(parseFloat(last.price))}`,
            isSell ? '#ff4466' : '#00ff88'
          );
        }

        // Update candle
        setCandles(prev => {
          const copy = [...prev];
          const now = Date.now();
          const secStart = Math.floor(now / 1000) * 1000;
          if (copy.length > 0 && copy[copy.length - 1].time === secStart) {
            const c = copy[copy.length - 1];
            copy[copy.length - 1] = { ...c, high: Math.max(c.high, price), low: Math.min(c.low, price), close: price };
          } else {
            copy.push({ open: price, high: price, low: price, close: price, time: secStart });
          }
          return copy.slice(-60);
        });
      } catch {
        addLog('REST poll failed — retrying...', '#ff4466');
      }
    }, 1500);

    cleanupRef.current = () => clearInterval(poll);
    addLog('REST mode active — data updates every 1.5s', '#00ff88');
  }, [addLog]);

  // ─── Start: try WS first, fallback to REST ─────────────────────────
  const start = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setCandles([]);
    pnlRef.current = 0;
    posRef.current = 0;
    tradeCountRef.current = 0;
    lastCountRef.current = 0;
    lastPricesRef.current = [];
    setMetrics({ pnl: 0, spread: 0, latency: 0, ordersPerSec: 0, volatility: 0, position: 0 });

    const wsOk = await startWs();
    if (!wsOk) {
      addLog('WebSocket failed on all endpoints', '#ff4466');
      startRest();
    }
  }, [running, startWs, startRest, addLog]);

  // Cleanup on unmount
  useEffect(() => { return () => { cleanupRef.current?.(); }; }, []);

  return (
    <div className="w-full rounded-xl border border-gray-700/50 bg-[#0c1020] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0e1a] border-b border-gray-700/40">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-semibold text-gray-200">Live Market Data</span>
          {mode === 'ws' && <span className="text-[9px] text-emerald-400/80 font-mono uppercase tracking-wider">WebSocket</span>}
          {mode === 'rest' && <span className="text-[9px] text-orange-400/80 font-mono uppercase tracking-wider">REST Polling</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-500 font-mono hidden md:inline">BTC/USDT Spot</span>
          <button
            onClick={running ? stop : start}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${
              running
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
            }`}
          >
            {running ? '■ Disconnect' : '▶ Connect'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-[1px] bg-gray-700/20">
        <div className="bg-[#0c1020] p-2.5 min-h-[280px] md:min-h-[320px]">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2 text-center">Order Book BTC/USDT</div>
          {orderBook.bids.length > 0 ? (
            <OrderBookView bids={orderBook.bids} asks={orderBook.asks} midPrice={midPrice} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">
              {running ? 'Waiting for data...' : 'Connect to view'}
            </div>
          )}
        </div>

        <div className="bg-[#0c1020] p-2.5 min-h-[280px] md:min-h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">BTC/USDT 1s Candles</div>
            {midPrice > 0 && <div className="text-[11px] font-mono font-bold text-amber-400">{formatPrice(midPrice)}</div>}
          </div>
          <div className="h-[calc(100%-24px)]">
            {candles.length > 1 ? (
              <PriceChart candles={candles} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono">
                {running ? 'Receiving candles...' : 'Connect to view'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0c1020] p-2.5 min-h-[280px] md:min-h-[320px]">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Live Feed</div>
          <div className="h-[calc(100%-20px)]"><ActivityFeed logs={logs} /></div>
        </div>
      </div>

      <div className="px-4 py-2 bg-[#0a0e1a] border-t border-gray-700/20">
        <SpreadGauge volatility={metrics.volatility} spread={metrics.spread} />
      </div>

      <div className="px-3 py-2.5 bg-[#0a0e1a] border-t border-gray-700/40">
        <MetricsBar metrics={metrics} />
      </div>

      <div className="px-4 py-1.5 bg-[#080b15] border-t border-gray-700/20 flex items-center justify-between">
        <span className="text-[8px] text-gray-600 font-mono">Source: Binance Public API {mode === 'rest' ? '(REST)' : mode === 'ws' ? '(WebSocket)' : ''}</span>
        <span className="text-[8px] text-gray-600 font-mono">Trades: {tradeCountRef.current > 0 ? `${tradeCountRef.current} received` : 'N/A'}</span>
      </div>
    </div>
  );
}
