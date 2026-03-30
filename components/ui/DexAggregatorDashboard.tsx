'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// --- Types ---
interface PoolState {
  name: string;
  reserveA: number; // SOL
  reserveB: number; // USDC
  fee: number;
  color: string;
}

interface Quote {
  dex: string;
  amountOut: number;
  priceImpact: number;
  fee: number;
  effectivePrice: number;
}

interface TradeLog {
  id: number;
  timestamp: string;
  dex: string;
  amountIn: number;
  amountOut: number;
  savings: number;
  priceImpact: number;
}

// --- Helpers ---
function getAmountOut(amountIn: number, reserveIn: number, reserveOut: number, fee: number): number {
  const amountInAfterFee = amountIn * (1 - fee);
  return (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
}

function formatNum(n: number, decimals = 4): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// --- Sub-components ---

function PoolVisual({ pool, solPrice }: { pool: PoolState; solPrice: number }) {
  const tvl = pool.reserveA * solPrice + pool.reserveB;
  const k = pool.reserveA * pool.reserveB;
  const spotPrice = pool.reserveB / pool.reserveA;

  return (
    <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold" style={{ color: pool.color }}>
          {pool.name}
        </span>
        <span className="font-mono text-[10px] text-[#8B9EC7]">
          Fee: {(pool.fee * 100).toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="font-mono text-[10px] text-[#4A5568] uppercase">SOL Reserve</div>
          <div className="font-mono text-sm text-[#E8EDF5]">{formatNum(pool.reserveA, 2)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-[#4A5568] uppercase">USDC Reserve</div>
          <div className="font-mono text-sm text-[#E8EDF5]">{formatNum(pool.reserveB, 2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[10px] text-[#4A5568] uppercase">Spot Price</div>
          <div className="font-mono text-sm text-[#00D4FF]">${formatNum(spotPrice, 2)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-[#4A5568] uppercase">TVL</div>
          <div className="font-mono text-sm text-[#E8EDF5]">${formatNum(tvl, 0)}</div>
        </div>
      </div>

      {/* k constant bar */}
      <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)]">
        <div className="font-mono text-[9px] text-[#4A5568]">
          k = {k.toExponential(2)}
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ quote, isBest }: { quote: Quote; isBest: boolean }) {
  return (
    <div className={`bg-[#0D1421] border p-4 transition-all duration-200 ${
      isBest
        ? 'border-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.15)]'
        : 'border-[rgba(255,255,255,0.06)]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-[#E8EDF5]">{quote.dex}</span>
        {isBest && (
          <span className="font-mono text-[9px] px-2 py-0.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#4ADE80]">
            BEST ROUTE
          </span>
        )}
      </div>
      <div className="font-mono text-lg text-[#00D4FF] mb-2">
        {formatNum(quote.amountOut, 4)} <span className="text-xs text-[#8B9EC7]">USDC</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="font-mono text-[9px] text-[#4A5568] uppercase">Price</div>
          <div className="font-mono text-[11px] text-[#E8EDF5]">${formatNum(quote.effectivePrice, 2)}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[#4A5568] uppercase">Impact</div>
          <div className={`font-mono text-[11px] ${quote.priceImpact > 1 ? 'text-[#F59E0B]' : 'text-[#4ADE80]'}`}>
            {quote.priceImpact.toFixed(3)}%
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[#4A5568] uppercase">Fee</div>
          <div className="font-mono text-[11px] text-[#8B9EC7]">{formatNum(quote.fee, 4)}</div>
        </div>
      </div>
    </div>
  );
}

function RoutingDiagram({ bestDex, amountIn, amountOut }: { bestDex: string; amountIn: number; amountOut: number }) {
  return (
    <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-5">
      <div className="font-mono text-[10px] text-[#4A5568] uppercase mb-4 tracking-widest">Routing Path</div>
      <div className="flex items-center justify-between gap-2">
        {/* User */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <span className="font-mono text-[9px] text-[#8B9EC7]">User</span>
          <span className="font-mono text-[10px] text-[#00D4FF]">{amountIn} SOL</span>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center">
          <div className="h-px flex-1 bg-[rgba(0,212,255,0.3)]" />
          <span className="font-mono text-[9px] text-[#00D4FF] px-1">→</span>
          <div className="h-px flex-1 bg-[rgba(0,212,255,0.3)]" />
        </div>

        {/* Aggregator */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <span className="font-mono text-[9px] text-[#A78BFA]">Aggregator</span>
          <span className="font-mono text-[10px] text-[#A78BFA]">route_swap()</span>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center">
          <div className="h-px flex-1" style={{ background: bestDex === 'Raydium' ? 'rgba(0,212,255,0.3)' : 'rgba(245,158,11,0.3)' }} />
          <span className="font-mono text-[9px] px-1" style={{ color: bestDex === 'Raydium' ? '#00D4FF' : '#F59E0B' }}>CPI →</span>
          <div className="h-px flex-1" style={{ background: bestDex === 'Raydium' ? 'rgba(0,212,255,0.3)' : 'rgba(245,158,11,0.3)' }} />
        </div>

        {/* Best DEX */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: bestDex === 'Raydium' ? 'rgba(0,212,255,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${bestDex === 'Raydium' ? 'rgba(0,212,255,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
            <span className="text-lg">{bestDex === 'Raydium' ? '🔷' : '🌊'}</span>
          </div>
          <span className="font-mono text-[9px]" style={{ color: bestDex === 'Raydium' ? '#00D4FF' : '#F59E0B' }}>
            {bestDex}
          </span>
          <span className="font-mono text-[10px] text-[#4ADE80]">{formatNum(amountOut, 2)} USDC</span>
        </div>
      </div>
    </div>
  );
}

function SpreadChart({ history }: { history: { raydium: number; orca: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Find range
    const allVals = history.flatMap(h => [h.raydium, h.orca]);
    const min = Math.min(...allVals) * 0.999;
    const max = Math.max(...allVals) * 1.001;
    const range = max - min || 1;

    const stepX = w / (history.length - 1);

    // Draw Raydium line
    ctx.beginPath();
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 1.5;
    history.forEach((p, i) => {
      const x = i * stepX;
      const y = h - ((p.raydium - min) / range) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Orca line
    ctx.beginPath();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    history.forEach((p, i) => {
      const x = i * stepX;
      const y = h - ((p.orca - min) / range) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [history]);

  return (
    <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-[#4A5568] uppercase tracking-widest">Price Spread History</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#00D4FF]" />
            <span className="font-mono text-[9px] text-[#8B9EC7]">Raydium</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#F59E0B]" />
            <span className="font-mono text-[9px] text-[#8B9EC7]">Orca</span>
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-24" />
    </div>
  );
}

// --- Main Dashboard ---
export default function DexAggregatorDashboard() {
  const [amountIn, setAmountIn] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [solPrice] = useState(145.32);

  const [pools, setPools] = useState<PoolState[]>([
    { name: 'Raydium', reserveA: 50000, reserveB: 7266000, fee: 0.0025, color: '#00D4FF' },
    { name: 'Orca Whirlpool', reserveA: 42000, reserveB: 6105600, fee: 0.003, color: '#F59E0B' },
  ]);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ raydium: number; orca: number }[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [avgLatency, setAvgLatency] = useState(32);
  const tradeIdRef = useRef(Date.now());

  const computeQuotes = useCallback((amt: number, currentPools: PoolState[]): Quote[] => {
    return currentPools.map((pool) => {
      const amountInLamports = amt;
      const out = getAmountOut(amountInLamports, pool.reserveA, pool.reserveB, pool.fee);
      const spotPrice = pool.reserveB / pool.reserveA;
      const effectivePrice = out / amt;
      const priceImpact = ((spotPrice - effectivePrice) / spotPrice) * 100;
      return {
        dex: pool.name,
        amountOut: out,
        priceImpact: Math.abs(priceImpact),
        fee: amt * pool.fee,
        effectivePrice,
      };
    });
  }, []);

  // Simulate pool fluctuations
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPools((prev) => {
        const newPools = prev.map((pool) => {
          const drift = 1 + (Math.random() - 0.5) * 0.002;
          const driftB = 1 + (Math.random() - 0.5) * 0.003;
          return {
            ...pool,
            reserveA: pool.reserveA * drift,
            reserveB: pool.reserveB * driftB,
          };
        });

        // Compute new quotes
        const newQuotes = computeQuotes(amountIn, newPools);
        setQuotes(newQuotes);

        // Track price history
        setPriceHistory((prev) => {
          const next = [
            ...prev,
            {
              raydium: newQuotes[0]?.effectivePrice || 0,
              orca: newQuotes[1]?.effectivePrice || 0,
            },
          ];
          return next.slice(-80);
        });

        // Simulate trade every ~5 ticks
        if (Math.random() < 0.2) {
          const best = newQuotes.reduce((a, b) => (a.amountOut > b.amountOut ? a : b));
          const worst = newQuotes.reduce((a, b) => (a.amountOut < b.amountOut ? a : b));
          const savings = best.amountOut - worst.amountOut;
          tradeIdRef.current += 1;

          setTrades((prev) => [
            {
              id: tradeIdRef.current,
              timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
              dex: best.dex,
              amountIn,
              amountOut: best.amountOut,
              savings,
              priceImpact: best.priceImpact,
            },
            ...prev.slice(0, 14),
          ]);

          setTotalSavings((s) => s + savings);
          setTotalTrades((t) => t + 1);
          setAvgLatency(25 + Math.random() * 20);
        }

        return newPools;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning, amountIn, computeQuotes]);

  // Initial quotes
  useEffect(() => {
    setQuotes(computeQuotes(amountIn, pools));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bestQuote = quotes.length > 0
    ? quotes.reduce((a, b) => (a.amountOut > b.amountOut ? a : b))
    : null;

  return (
    <div className="space-y-4">
      {/* Top metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: totalTrades.toString(), color: '#00D4FF' },
          { label: 'Avg Latency', value: `${avgLatency.toFixed(0)}ms`, color: '#4ADE80' },
          { label: 'Savings', value: `$${formatNum(totalSavings, 2)}`, color: '#F59E0B' },
          { label: 'Best Route', value: bestQuote?.dex || '—', color: bestQuote?.dex === 'Raydium' ? '#00D4FF' : '#F59E0B' },
        ].map((m) => (
          <div key={m.label} className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-3 text-center">
            <div className="font-mono text-[9px] text-[#4A5568] uppercase tracking-widest">{m.label}</div>
            <div className="font-mono text-lg font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#8B9EC7]">Amount:</span>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              className="w-24 bg-[#080C14] border border-[rgba(0,212,255,0.25)] text-[#E8EDF5] font-mono text-sm px-2 py-1 outline-none focus:border-[#00D4FF]"
            />
            <span className="font-mono text-[11px] text-[#00D4FF]">SOL</span>
          </div>
          <div className="font-mono text-[11px] text-[#4A5568]">
            ≈ ${formatNum(amountIn * solPrice, 2)} USD
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`ml-auto font-mono text-[11px] px-4 py-1.5 border transition-all duration-200 ${
              isRunning
                ? 'border-[#22C55E] text-[#4ADE80] bg-[rgba(34,197,94,0.06)] hover:bg-[rgba(34,197,94,0.12)]'
                : 'border-[rgba(0,212,255,0.25)] text-[#8B9EC7] hover:text-[#00D4FF] hover:border-[#00D4FF]'
            }`}
          >
            {isRunning ? '● LIVE' : '○ PAUSED'}
          </button>
        </div>
      </div>

      {/* Pool states */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pools.map((pool) => (
          <PoolVisual key={pool.name} pool={pool} solPrice={solPrice} />
        ))}
      </div>

      {/* Quotes comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quotes.map((q) => (
          <QuoteCard key={q.dex} quote={q} isBest={bestQuote?.dex === q.dex} />
        ))}
      </div>

      {/* Routing diagram */}
      {bestQuote && (
        <RoutingDiagram
          bestDex={bestQuote.dex}
          amountIn={amountIn}
          amountOut={bestQuote.amountOut}
        />
      )}

      {/* Spread chart */}
      <SpreadChart history={priceHistory} />

      {/* Trade log */}
      <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-4">
        <div className="font-mono text-[10px] text-[#4A5568] uppercase tracking-widest mb-3">
          Recent Trades — Auto-routed
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {trades.length === 0 && (
            <div className="font-mono text-[11px] text-[#4A5568] text-center py-4">
              Waiting for trades...
            </div>
          )}
          {trades.map((t) => (
            <div key={t.id} className="flex items-center justify-between font-mono text-[11px] py-1.5 border-b border-[rgba(255,255,255,0.03)]">
              <span className="text-[#4A5568] w-20">{t.timestamp}</span>
              <span className={t.dex === 'Raydium' ? 'text-[#00D4FF]' : 'text-[#F59E0B]'} style={{ width: 100 }}>
                → {t.dex}
              </span>
              <span className="text-[#E8EDF5]">{t.amountIn} SOL</span>
              <span className="text-[#00D4FF]">{formatNum(t.amountOut, 2)} USDC</span>
              <span className="text-[#4ADE80]">+${formatNum(t.savings, 4)}</span>
              <span className={`${t.priceImpact > 0.5 ? 'text-[#F59E0B]' : 'text-[#4A5568]'}`}>
                {t.priceImpact.toFixed(3)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="bg-[#0D1421] border border-[rgba(0,212,255,0.12)] p-4">
        <div className="font-mono text-[10px] text-[#4A5568] uppercase tracking-widest mb-2">Architecture</div>
        <div className="font-mono text-[11px] text-[#8B9EC7] leading-relaxed">
          <div className="text-[#E8EDF5] mb-1">Frontend (React + Solana Web3.js)</div>
          <div className="text-[#4A5568] pl-4">↓ sends transaction</div>
          <div className="text-[#A78BFA] mb-1 pl-4">Programme Anchor (on-chain, Rust) → route_swap()</div>
          <div className="text-[#4A5568] pl-8">↓ CPI call</div>
          <div className="pl-8">
            <span className="text-[#00D4FF]">Raydium Pool</span>
            <span className="text-[#4A5568]"> OR </span>
            <span className="text-[#F59E0B]">Orca Whirlpool</span>
          </div>
        </div>
      </div>
    </div>
  );
}
