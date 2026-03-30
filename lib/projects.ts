export interface ProjectStep {
  number: number;
  text: string;
}

export interface Project {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  tags: string[];
  tagColors: string[];
  shortDescription: string;
  context: string;
  steps: ProjectStep[];
  skills: string[];
  color: string;
  glowColor: string;
  hasDashboard?: boolean;
  // New fields for the redesigned cards
  category: string;
  categoryStyle: string;
  status: 'live' | 'wip';
  statusLabel: string;
  stackPills: string[];
  metric: string;
}

export const projects: Project[] = [
  {
    slug: 'market-making-bot',
    title: 'Rust Market Maker — Avellaneda-Stoikov',
    shortTitle: 'Rust Market Maker',
    icon: '🦀',
    category: 'RUST · HFT',
    categoryStyle: 'cat-rust',
    status: 'live',
    statusLabel: 'LIVE',
    tags: ['Rust', 'Low-Latency', 'Binance', 'WebSocket', 'Market-Making'],
    tagColors: ['bg-orange-500/20 text-orange-400', 'bg-red-500/20 text-red-400', 'bg-yellow-500/20 text-yellow-400', 'bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400'],
    shortDescription: 'Async HFT market-making engine implementing the Avellaneda-Stoikov model with VPIN adverse selection filter, Hawkes process for order flow, and real-time WebSocket feed on Hyperliquid.',
    context: 'Bot market-making haute fréquence développé en Rust pour la paire BTC/USDT sur Binance, exploitant des spreads dynamiques ajustés en fonction de la volatilité en temps réel.',
    steps: [
      { number: 1, text: 'Setup WebSocket pour order book en temps réel' },
      { number: 2, text: 'Implémentation zero-copy parsing pour performance maximale' },
      { number: 3, text: 'Backtest sur données historiques' },
      { number: 4, text: 'Déploiement en simulation live' },
    ],
    skills: ['Rust low-latency', 'Market-making', 'Order books', 'Real-time data processing'],
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30',
    hasDashboard: true,
    stackPills: ['Rust', 'tokio', 'WebSocket', 'Hyperliquid'],
    metric: 'Latency: < 10μs order generation',
  },
  {
    slug: 'solana-dex-aggregator',
    title: 'Solana DEX Aggregator',
    shortTitle: 'DEX Aggregator',
    icon: '⚡',
    category: 'RUST · SOLANA',
    categoryStyle: 'cat-rust',
    status: 'wip',
    statusLabel: 'IN PROGRESS',
    tags: ['Rust', 'Anchor', 'Solana Web3.js', 'CPI', 'PDA', 'Raydium SDK', 'Orca Whirlpools'],
    tagColors: ['bg-orange-500/20 text-orange-400', 'bg-purple-500/20 text-purple-400', 'bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400', 'bg-cyan-500/20 text-cyan-400', 'bg-yellow-500/20 text-yellow-400', 'bg-teal-500/20 text-teal-400'],
    shortDescription: 'Mini-Jupiter routing swaps between Raydium and Orca. Off-chain quote comparison with real-time slippage calculation, CPI calls via Anchor, and PDA-based account management.',
    context: 'A mini-Jupiter DEX aggregator built on Solana. When a user wants to swap SOL → USDC, the system queries Raydium and Orca pools in parallel, compares prices and slippage off-chain (to save compute units), then routes the swap to the best pool via an Anchor program using Cross-Program Invocations (CPI). The on-chain program uses PDA-based account management for secure, deterministic state. Architecture: Frontend (React + Solana Web3.js) → Anchor Program (route_swap instruction) → CPI to Raydium AMM or Orca Whirlpool. Price comparison runs off-chain because executing it on-chain would exceed compute unit budgets.',
    steps: [
      { number: 1, text: 'Phase 1 — Environment setup: Rust + Solana CLI + Anchor CLI + devnet wallet with airdrop. anchor init solana-dex-aggregator to scaffold the project structure.' },
      { number: 2, text: 'Phase 2 — Anchor program (lib.rs): route_swap instruction with dex_choice parameter (0=Raydium, 1=Orca), PDA-based account structs with #[account(mut, constraint=...)] validation, CPI calls to Raydium AMM and Orca Whirlpool programs, custom errors (InvalidAmount, InvalidDex, SlippageExceeded).' },
      { number: 3, text: 'Phase 3 — Off-chain quote engine: Fetch pool reserves from both DEXes via Raydium SDK V2 and Orca Whirlpools SDK, compute x*y=k AMM output with fee deduction, compare effective prices and select best route with savings calculation, 500ms debounce for real-time UX.' },
      { number: 4, text: 'Phase 4 — React frontend: Solana Wallet Adapter integration (Phantom, Solflare), swap interface with real-time quote comparison, transaction builder with ComputeBudgetProgram.setComputeUnitLimit(400_000) to handle CPI overhead, Solana Explorer link on success.' },
      { number: 5, text: 'Phase 5 — Testing & deployment: anchor test on devnet with simulated swaps, slippage protection validation, pool address dynamic fetching via Raydium API to avoid stale hardcoded addresses.' },
    ],
    skills: ['Solana/Anchor', 'Cross-Program Invocation (CPI)', 'PDA account management', 'AMM math (x*y=k)', 'Off-chain quote routing', 'Raydium SDK V2', 'Orca Whirlpools SDK', 'Solana Wallet Adapter'],
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30',
    hasDashboard: true,
    stackPills: ['Rust', 'Anchor', 'Solana Web3.js', 'Next.js'],
    metric: 'Best quote routing: < 50ms',
  },
  {
    slug: 'crypto-arbitrage-backtester',
    title: 'Arbitrum Stylus AMM — Rust on EVM',
    shortTitle: 'Stylus AMM',
    icon: '📊',
    category: 'SOLIDITY · L2',
    categoryStyle: 'cat-sol',
    status: 'live',
    statusLabel: 'DEVNET LIVE',
    tags: ['Rust', 'Stylus SDK', 'WASM', 'Arbitrum'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400', 'bg-purple-500/20 text-purple-400', 'bg-pink-500/20 text-pink-400'],
    shortDescription: 'x*y=k AMM written entirely in Rust, compiled to WASM via the Stylus SDK and deployed on Arbitrum. One of the first production-grade Stylus contracts using OpenZeppelin rust-contracts.',
    context: 'Système de backtesting avancé conçu pour détecter et exploiter les opportunités d\'arbitrage triangulaire entre exchanges décentralisés et centralisés.',
    steps: [
      { number: 1, text: 'Rust AMM implementation with constant product formula' },
      { number: 2, text: 'WASM compilation via Stylus SDK' },
      { number: 3, text: 'Deployment on Arbitrum devnet' },
      { number: 4, text: 'Frontend integration for swap interface' },
    ],
    skills: ['Arbitrum Stylus', 'Rust WASM', 'AMM design', 'L2 deployment'],
    color: 'from-violet-500 to-purple-600',
    glowColor: 'shadow-violet-500/30',
    hasDashboard: true,
    stackPills: ['Rust', 'Stylus SDK', 'WASM', 'Arbitrum'],
    metric: 'Gas savings: 10–100× vs Solidity',
  },
  {
    slug: 'hft-risk-dashboard',
    title: 'AI DeFi Agent — ElizaOS + On-Chain',
    shortTitle: 'AI DeFi Agent',
    icon: '🤖',
    category: 'AI · SOLIDITY',
    categoryStyle: 'cat-ai',
    status: 'wip',
    statusLabel: 'IN PROGRESS',
    tags: ['ElizaOS', 'Solidity', 'LangChain', 'Next.js'],
    tagColors: ['bg-red-500/20 text-red-400', 'bg-yellow-500/20 text-yellow-400', 'bg-green-500/20 text-green-400', 'bg-teal-500/20 text-teal-400'],
    shortDescription: 'Autonomous agent monitoring DeFi positions, computing rebalancing recommendations, and executing swaps via smart contracts. Built on ElizaOS with custom Solidity execution layer.',
    context: 'Dashboard de monitoring des risques en temps réel conçu pour superviser un portfolio de futures crypto sur Bitget.',
    steps: [
      { number: 1, text: 'ElizaOS agent setup with DeFi plugins' },
      { number: 2, text: 'Solidity execution contracts' },
      { number: 3, text: 'LangChain integration for strategy decisions' },
      { number: 4, text: 'Autonomous loop with safety checks' },
    ],
    skills: ['AI agents', 'ElizaOS', 'Solidity', 'DeFi automation'],
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30',
    hasDashboard: true,
    stackPills: ['ElizaOS', 'Solidity', 'LangChain', 'Next.js'],
    metric: 'Agent cycle: < 4h autonomous loop',
  },
  {
    slug: 'order-flow-lstm-predictor',
    title: 'ArbitrageX — Delta-Neutral Vault',
    shortTitle: 'Delta-Neutral Vault',
    icon: '💎',
    category: 'SOLIDITY · DEFI',
    categoryStyle: 'cat-sol',
    status: 'live',
    statusLabel: 'SEPOLIA LIVE',
    tags: ['Solidity', 'ERC-4626', 'Hardhat', 'RainbowKit'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-pink-500/20 text-pink-400', 'bg-violet-500/20 text-violet-400', 'bg-cyan-500/20 text-cyan-400'],
    shortDescription: 'ERC-4626 yield vault implementing delta-neutral strategies across DEX pairs. Includes a Gnosis Safe multisig admin layer, automated rebalancing, and a full-stack Next.js dashboard.',
    context: 'Modèle de deep learning Bi-LSTM entraîné sur les données d\'order flow de profondeur L2 pour prédire les mouvements de prix à court terme sur ETH.',
    steps: [
      { number: 1, text: 'ERC-4626 vault contract implementation' },
      { number: 2, text: 'Delta-neutral strategy engine' },
      { number: 3, text: 'Gnosis Safe multisig integration' },
      { number: 4, text: 'Full-stack dashboard with RainbowKit' },
    ],
    skills: ['ERC-4626', 'Delta-neutral strategies', 'Multisig admin', 'Full-stack'],
    color: 'from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/30',
    hasDashboard: true,
    stackPills: ['Solidity', 'ERC-4626', 'Hardhat', 'RainbowKit'],
    metric: 'Delta-neutral slippage: < 0.3%',
  },
  {
    slug: 'defi-portfolio-optimizer',
    title: 'Smart Wallet ERC-4337',
    shortTitle: 'Smart Wallet',
    icon: '🔐',
    category: 'SOLIDITY · DEFI',
    categoryStyle: 'cat-sol',
    status: 'wip',
    statusLabel: 'IN PROGRESS',
    tags: ['Solidity', 'ERC-4337', 'Foundry', 'Alchemy'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-amber-500/20 text-amber-400', 'bg-pink-500/20 text-pink-400', 'bg-red-500/20 text-red-400'],
    shortDescription: 'Account-abstracted wallet supporting gasless transactions via paymaster, social recovery with guardian rotation, and batch calls. Fully compatible with Alchemy AccountKit and Biconomy SDK.',
    context: 'Système d\'optimisation de portfolio DeFi automatisé pour allocation yield farming.',
    steps: [
      { number: 1, text: 'ERC-4337 account contract' },
      { number: 2, text: 'Paymaster for gasless tx' },
      { number: 3, text: 'Social recovery with guardians' },
      { number: 4, text: 'Frontend with Alchemy AccountKit' },
    ],
    skills: ['Account abstraction', 'ERC-4337', 'Gasless transactions', 'Social recovery'],
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'shadow-blue-500/30',
    hasDashboard: true,
    stackPills: ['Solidity', 'ERC-4337', 'Foundry', 'Alchemy'],
    metric: '40M+ smart accounts standard',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
