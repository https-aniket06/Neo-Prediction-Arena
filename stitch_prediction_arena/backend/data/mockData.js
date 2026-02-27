// In-memory mock data store for hackathon demo
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ========== USERS ==========
const users = [
    {
        id: 'usr_001',
        first_name: 'Alex',
        last_name: 'Chen',
        email: 'alex@neoprediction.ai',
        password_hash: bcrypt.hashSync('Demo@123', 10),
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBppmr_gS7hQTcRU11NUYFT6G-sD_0iMsAnhjdvG67rq-NIPNqXsBNPK73CNRpoJli7LXESx4_8qEW4JMfUMFpKX94nkMDMQ5XMYval3owsVTVKZyH225EdTQx8s0_4ziM08wYbXmKQ2rNPfaJtNzPLiSRFzDQjZRV9NsDdXsSglEyGDoua43h0LVgD0S92cFK46yzX6koeUVA28MOGOgoXpiNKEW7QAxjV6AWe6LexTpW6Daind-phxunciCsC6sLN2bJNtxIl5TzO',
        account_type: 'PREMIUM',
        created_at: '2026-01-15T08:00:00Z',
        preferences: { theme: 'dark', currency: 'USD', notifications: true }
    }
];

// ========== PORTFOLIO ==========
const holdings = [
    { id: 'hld_001', user_id: 'usr_001', symbol: 'BTC', name: 'Bitcoin', category: 'CRYPTO', quantity: 2.45, avg_cost: 45000, current_price: 64281.40, allocation_pct: 12.2 },
    { id: 'hld_002', user_id: 'usr_001', symbol: 'ETH', name: 'Ethereum', category: 'CRYPTO', quantity: 42.10, avg_cost: 2800, current_price: 3450.12, allocation_pct: 11.3 },
    { id: 'hld_003', user_id: 'usr_001', symbol: 'SOL', name: 'Solana', category: 'CRYPTO', quantity: 850, avg_cost: 95, current_price: 142.50, allocation_pct: 9.4 },
    { id: 'hld_004', user_id: 'usr_001', symbol: 'NVDA', name: 'NVIDIA Corp', category: 'STOCK', quantity: 150, avg_cost: 450, current_price: 892.30, allocation_pct: 10.4 },
    { id: 'hld_005', user_id: 'usr_001', symbol: 'TSLA', name: 'Tesla Inc', category: 'STOCK', quantity: 80, avg_cost: 210, current_price: 340.00, allocation_pct: 2.1 },
    { id: 'hld_006', user_id: 'usr_001', symbol: 'AAPL', name: 'Apple Inc', category: 'STOCK', quantity: 200, avg_cost: 145, current_price: 189.50, allocation_pct: 2.9 },
    { id: 'hld_007', user_id: 'usr_001', symbol: 'USDC', name: 'USD Coin', category: 'CRYPTO', quantity: 50000, avg_cost: 1, current_price: 1, allocation_pct: 3.9 }
];

// ========== TRANSACTIONS ==========
const transactions = [
    { id: 'txn_001', user_id: 'usr_001', type: 'SMART_CONTRACT', asset_symbol: 'ETH', asset_name: 'Ethereum', direction: 'OUT', amount: 1240.50, fee: 12.50, status: 'COMPLETED', counterparty: '0x1a2b...3c4d', network: 'Ethereum Mainnet', tx_hash: '0xabc123...def456', created_at: '2026-02-25T14:30:00Z', label: 'ETH Smart Contract' },
    { id: 'txn_002', user_id: 'usr_001', type: 'BUY', asset_symbol: 'TSLA', asset_name: 'Tesla', direction: 'OUT', amount: 8500, fee: 9.99, status: 'COMPLETED', shares: 25, price_per_share: 340, broker: 'Neo Trading Desk', created_at: '2026-02-24T09:15:00Z', label: 'TSLA Purchase' },
    { id: 'txn_003', user_id: 'usr_001', type: 'TRANSFER', direction: 'IN', amount: 25000, fee: 0, status: 'COMPLETED', from_account: 'Savings Wallet', to_account: 'Trading Account', created_at: '2026-02-23T11:00:00Z', label: 'Internal Transfer' },
    { id: 'txn_004', user_id: 'usr_001', type: 'BUY', asset_symbol: 'BTC', asset_name: 'Bitcoin', direction: 'OUT', amount: 15000, fee: 15.00, status: 'COMPLETED', shares: 0.234, created_at: '2026-02-22T16:45:00Z', label: 'BTC Purchase' },
    { id: 'txn_005', user_id: 'usr_001', type: 'SELL', asset_symbol: 'NVDA', asset_name: 'NVIDIA', direction: 'IN', amount: 4450.00, fee: 4.99, status: 'COMPLETED', shares: 5, created_at: '2026-02-21T10:20:00Z', label: 'NVDA Partial Sell' },
    { id: 'txn_006', user_id: 'usr_001', type: 'DEPOSIT', direction: 'IN', amount: 10000, fee: 0, status: 'COMPLETED', from_account: 'Bank Account', to_account: 'Neo Wallet', created_at: '2026-02-20T08:00:00Z', label: 'Fiat Deposit' }
];

// ========== PREDICTIONS ==========
const predictions = [
    { id: 'pred_001', user_id: 'usr_001', symbol: 'BTC', direction: 'BULLISH', position_size: 5000, timeframe: '24h', prediction_type: 'MANUAL', status: 'WIN', entry_price: 62800, exit_price: 64281.40, pnl: 1175, ai_confidence: 84, submitted_at: '2026-02-24T10:00:00Z', resolved_at: '2026-02-25T10:00:00Z' },
    { id: 'pred_002', user_id: 'usr_001', symbol: 'ETH', direction: 'BULLISH', position_size: 3000, timeframe: '24h', prediction_type: 'AI_ASSISTED', status: 'WIN', entry_price: 3380, exit_price: 3450.12, pnl: 621, ai_confidence: 91, submitted_at: '2026-02-23T14:00:00Z', resolved_at: '2026-02-24T14:00:00Z' },
    { id: 'pred_003', user_id: 'usr_001', symbol: 'NVDA', direction: 'BEARISH', position_size: 2000, timeframe: '4h', prediction_type: 'MANUAL', status: 'LOSS', entry_price: 895, exit_price: 892.30, pnl: -60, ai_confidence: 45, submitted_at: '2026-02-25T08:00:00Z', resolved_at: '2026-02-25T12:00:00Z' },
    { id: 'pred_004', user_id: 'usr_001', symbol: 'BTC', direction: 'BULLISH', position_size: 1250, timeframe: '24h', prediction_type: 'MANUAL', status: 'PENDING', entry_price: 64281.40, ai_confidence: 84, submitted_at: '2026-02-26T10:01:00Z' }
];

// ========== EDUCATION ==========
const educationModules = [
    { id: 'mod_001', title: 'Stocks & Equity', description: 'Master equity markets, valuations, and stock analysis.', category: 'EQUITIES', lesson_count: 12, is_locked: false, order: 1 },
    { id: 'mod_002', title: 'Risk Management', description: 'Learn to protect your capital using stop-losses and hedge strategies.', category: 'RISK', lesson_count: 8, is_locked: false, order: 2 },
    { id: 'mod_003', title: 'Technical Indicators', description: 'Master RSI, MACD, Bollinger Bands, and chart patterns.', category: 'INDICATORS', lesson_count: 15, is_locked: false, order: 3 },
    { id: 'mod_004', title: 'Cryptocurrency Essentials', description: 'Blockchain, DeFi, tokenomics, and crypto trading strategies.', category: 'CRYPTO', lesson_count: 10, is_locked: true, unlock_after: 'mod_001', order: 4 },
    { id: 'mod_005', title: 'Advanced Derivatives', description: 'Options, futures, and complex trading instruments.', category: 'DERIVATIVES', lesson_count: 14, is_locked: true, unlock_after: 'mod_003', order: 5 }
];

const userProgress = {
    'usr_001': {}
};

const badges = [
    { id: 'badge_first_trade', name: 'First Trade', description: 'Made your first prediction', earned: false },
    { id: 'badge_streak_5', name: '5-Win Streak', description: 'Won 5 predictions in a row', earned: false },
    { id: 'badge_supernova', name: 'Supernova', description: 'Scored 90%+ on a quiz', earned: false },
    { id: 'badge_diamond', name: 'Diamond Hands', description: 'Held a position for 30+ days', earned: false }
];

// ========== AI CONVERSATIONS ==========
const aiConversations = [
    {
        id: 'conv_001', user_id: 'usr_001', created_at: '2026-02-26T09:00:00Z',
        messages: [
            { role: 'user', content: 'What should I do with my portfolio given current market conditions?', timestamp: '2026-02-26T09:00:00Z' },
            { role: 'assistant', content: 'Based on your portfolio analysis, your crypto allocation (35%) is performing well with BTC showing strong bullish momentum. I recommend:\n\n1. **Hold BTC & ETH** — Both show strong technical indicators with RSI above 60\n2. **Consider taking partial profits on NVDA** — It has reached resistance levels\n3. **Increase SOL position** — On-chain metrics suggest significant growth potential\n\nYour overall portfolio diversification score is 74/100. Consider adding some bonds or fixed income to reduce volatility.', timestamp: '2026-02-26T09:00:05Z' }
        ]
    }
];

// ========== WATCHLIST ==========
const watchlist = [
    { symbol: 'BTC', name: 'Bitcoin', category: 'CRYPTO' },
    { symbol: 'ETH', name: 'Ethereum', category: 'CRYPTO' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'STOCK' },
    { symbol: 'TSLA', name: 'Tesla Inc', category: 'STOCK' },
    { symbol: 'AAPL', name: 'Apple Inc', category: 'STOCK' },
    { symbol: 'SOL', name: 'Solana', category: 'CRYPTO' }
];

module.exports = { users, holdings, transactions, predictions, educationModules, userProgress, badges, aiConversations, watchlist };
