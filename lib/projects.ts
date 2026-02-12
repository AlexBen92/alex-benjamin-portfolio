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
}

export const projects: Project[] = [
  {
    slug: 'market-making-bot',
    title: 'Bot Market-Making Rust',
    shortTitle: 'Market-Making Bot',
    icon: '🦀',
    tags: ['Rust', 'Low-Latency', 'Binance', 'WebSocket', 'Market-Making'],
    tagColors: ['bg-orange-500/20 text-orange-400', 'bg-red-500/20 text-red-400', 'bg-yellow-500/20 text-yellow-400', 'bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400'],
    shortDescription: 'Bot market-making low-latency en Rust pour BTC/USDT sur Binance avec spreads dynamiques basés sur volatilité.',
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
  },
  {
    slug: 'crypto-arbitrage-backtester',
    title: 'Backtester Arbitrage Crypto',
    shortTitle: 'Crypto Arbitrage Backtester',
    icon: '📊',
    tags: ['Python', 'Arbitrage', 'HMM', 'DeFi', 'Uniswap', 'CCXT', 'TheGraph'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-green-500/20 text-green-400', 'bg-purple-500/20 text-purple-400', 'bg-pink-500/20 text-pink-400', 'bg-indigo-500/20 text-indigo-400', 'bg-cyan-500/20 text-cyan-400', 'bg-violet-500/20 text-violet-400'],
    shortDescription: 'Backtester Python pour arbitrage triangulaire DEX vs CEX, optimisé avec Hidden Markov Models pour détecter les opportunités.',
    context: 'Système de backtesting avancé conçu pour détecter et exploiter les opportunités d\'arbitrage triangulaire entre exchanges décentralisés (Uniswap, SushiSwap) et centralisés (Binance, Kraken). Le moteur de détection utilise des Hidden Markov Models (HMM) pour identifier les régimes de marché favorables à l\'arbitrage, filtrant le bruit et réduisant les faux signaux. Le backtester intègre les coûts réels (gas fees, slippage, frais exchange) pour un PnL net réaliste.',
    steps: [
      { number: 1, text: 'Data Pipeline — Récupération données prix via CCXT (CEX) et TheGraph (DEX Uniswap)' },
      { number: 2, text: 'HMM Modeling — Implémentation Hidden Markov Models pour détection de régimes de marché' },
      { number: 3, text: 'PnL Engine — Calcul profit net incluant gas fees, slippage, frais exchange' },
      { number: 4, text: 'Analytics & Visualization — Dashboard Sharpe ratio, drawdown, distribution des trades' },
    ],
    skills: ['Backtesting', 'Arbitrage triangulaire', 'Modélisation statistique (HMM)', 'DeFi', 'Quantitative analysis'],
    color: 'from-violet-500 to-purple-600',
    glowColor: 'shadow-violet-500/30',
    hasDashboard: true,
  },
  {
    slug: 'hft-risk-dashboard',
    title: 'Système Risque HFT',
    shortTitle: 'HFT Risk Dashboard',
    icon: '🛡️',
    tags: ['Python', 'Risk Management', 'VaR', 'Monte Carlo', 'Streamlit', 'Bitget', 'Futures'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-red-500/20 text-red-400', 'bg-yellow-500/20 text-yellow-400', 'bg-green-500/20 text-green-400', 'bg-teal-500/20 text-teal-400', 'bg-orange-500/20 text-orange-400', 'bg-amber-500/20 text-amber-400'],
    shortDescription: 'Dashboard temps réel pour monitoring risques (VaR, drawdown) sur portfolio futures crypto avec alertes automatiques.',
    context: 'Dashboard de monitoring des risques en temps réel conçu pour superviser un portfolio de futures crypto sur Bitget. Le système calcule en continu les métriques de risque critiques — Value at Risk (VaR), Conditional VaR (CVaR), drawdown, exposition nette — via des simulations Monte Carlo. Un moteur d\'alertes automatiques déclenche des notifications graduées (info → warning → critical) en cas de dépassement des seuils de risque prédéfinis. Testé et validé sous scénarios de stress extrêmes (flash crash, liquidation cascade, black swan).',
    steps: [
      { number: 1, text: 'API Integration — Connexion Bitget API pour positions live, ordres ouverts, funding rates' },
      { number: 2, text: 'Monte Carlo Engine — Implémentation simulations Monte Carlo (10,000 scénarios) pour VaR/CVaR' },
      { number: 3, text: 'Streamlit Dashboard — Construction interface interactive avec charts, gauges, tables' },
      { number: 4, text: 'Stress Testing — Validation sous scénarios extrêmes (flash crash -30%, liquidation cascade)' },
    ],
    skills: ['Gestion des risques', 'HFT monitoring', 'Monte Carlo simulation', 'Stress testing', 'Statistiques avancées'],
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30',
    hasDashboard: true,
  },
  {
    slug: 'order-flow-lstm-predictor',
    title: 'Prédicteur LSTM Order Flow',
    shortTitle: 'Order Flow LSTM Predictor',
    icon: '🧠',
    tags: ['Python', 'Bi-LSTM', 'Machine Learning', 'Market Microstructure', 'Scalping'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-pink-500/20 text-pink-400', 'bg-violet-500/20 text-violet-400', 'bg-cyan-500/20 text-cyan-400', 'bg-amber-500/20 text-amber-400'],
    shortDescription: 'Modèle Bi-LSTM prédisant les mouvements de prix via order flow L2, appliqué au scalping ETH.',
    context: 'Modèle de deep learning Bi-LSTM entraîné sur les données d\'order flow de profondeur L2 pour prédire les mouvements de prix à court terme sur ETH.',
    steps: [
      { number: 1, text: 'Collecte données tick-by-tick' },
      { number: 2, text: 'Feature engineering (imbalance, métriques microstructure)' },
      { number: 3, text: 'Entraînement/test avec walk-forward validation' },
      { number: 4, text: 'Intégration à un bot de trading simple' },
    ],
    skills: ['Machine learning (Bi-LSTM)', 'Market microstructure', 'Algo trading'],
    color: 'from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/30',
    hasDashboard: true,
  },
  {
    slug: 'defi-portfolio-optimizer',
    title: 'Optimiseur Portfolio DeFi',
    shortTitle: 'DeFi Portfolio Optimizer',
    icon: '💎',
    tags: ['Python', 'Portfolio Optimization', 'DeFi', 'CVaR', 'SciPy', 'Yield Farming'],
    tagColors: ['bg-blue-500/20 text-blue-400', 'bg-amber-500/20 text-amber-400', 'bg-pink-500/20 text-pink-400', 'bg-red-500/20 text-red-400', 'bg-green-500/20 text-green-400', 'bg-indigo-500/20 text-indigo-400'],
    shortDescription: 'Optimiseur Python pour allocation DeFi (yield farming), maximisant le Sharpe ratio sous contraintes risque/liquidité.',
    context: 'Système d\'optimisation de portfolio DeFi automatisé pour allocation yield farming, utilisant des méthodes quantitatives avancées.',
    steps: [
      { number: 1, text: 'Scrapping APY via DefiLlama API' },
      { number: 2, text: 'Optimisation avec CVaR via SciPy' },
      { number: 3, text: 'Backtest multi-chain' },
      { number: 4, text: 'Script d\'auto-rebalancement' },
    ],
    skills: ['Portfolio optimisation', 'DeFi/tokenomics', 'Quantitative research'],
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'shadow-blue-500/30',
    hasDashboard: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}
