const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { predictions } = require('../data/mockData');
const finnhub = require('../services/finnhub');

// GET /trading/assets - available assets
router.get('/assets', authenticateToken, (req, res) => {
    res.json({
        data: [
            { symbol: 'AAPL', name: 'Apple Inc', category: 'STOCK' },
            { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'STOCK' },
            { symbol: 'TSLA', name: 'Tesla Inc', category: 'STOCK' },
            { symbol: 'MSFT', name: 'Microsoft Corp', category: 'STOCK' },
            { symbol: 'GOOGL', name: 'Alphabet Inc', category: 'STOCK' },
            { symbol: 'AMZN', name: 'Amazon.com', category: 'STOCK' }
        ]
    });
});

// GET /trading/assets/:symbol/quote — LIVE from Finnhub
router.get('/assets/:symbol/quote', authenticateToken, async (req, res) => {
    try {
        const quote = await finnhub.getQuote(req.params.symbol.toUpperCase());
        res.json({
            symbol: req.params.symbol.toUpperCase(),
            price: quote.c,
            change: quote.d,
            change_pct: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            prev_close: quote.pc,
            timestamp: new Date(quote.t * 1000).toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: { code: 'API_ERROR', message: 'Failed to fetch quote' } });
    }
});

// GET /trading/assets/:symbol/candles — LIVE from Finnhub
router.get('/assets/:symbol/candles', authenticateToken, async (req, res) => {
    try {
        const { interval = '60', limit = '100' } = req.query;
        const resolutionMap = { '1m': '1', '5m': '5', '15m': '15', '1h': '60', '1d': 'D' };
        const resolution = resolutionMap[interval] || interval;
        const to = Math.floor(Date.now() / 1000);
        const from = to - (parseInt(limit) * 3600);

        const candles = await finnhub.getCandles(req.params.symbol.toUpperCase(), resolution, from, to);
        if (candles.s === 'no_data') {
            return res.json({ data: [], message: 'No candle data available for this period' });
        }

        const data = candles.t ? candles.t.map((t, i) => ({
            timestamp: new Date(t * 1000).toISOString(),
            open: candles.o[i], high: candles.h[i], low: candles.l[i], close: candles.c[i], volume: candles.v[i]
        })) : [];

        res.json({ symbol: req.params.symbol.toUpperCase(), interval, data });
    } catch (err) {
        res.status(500).json({ error: { code: 'API_ERROR', message: 'Failed to fetch candles' } });
    }
});

// GET /trading/assets/:symbol/ai-prediction
router.get('/assets/:symbol/ai-prediction', authenticateToken, (req, res) => {
    const confidence = 70 + Math.floor(Math.random() * 28);
    const direction = confidence > 80 ? 'BULLISH' : confidence > 60 ? 'NEUTRAL' : 'BEARISH';
    res.json({
        symbol: req.params.symbol.toUpperCase(),
        direction, confidence,
        predicted_change_pct: direction === 'BULLISH' ? +(Math.random() * 8 + 1).toFixed(1) : -(Math.random() * 5 + 0.5).toFixed(1),
        timeframe: '24h',
        sentiment_score: 60 + Math.floor(Math.random() * 35),
        model_version: 'NeuralEngine-v3.1',
        generated_at: new Date().toISOString(),
        reasoning: direction === 'BULLISH'
            ? 'Strong momentum indicators, positive on-chain activity, RSI above 60. Social sentiment trending positive.'
            : 'Mixed signals detected. RSI approaching overbought territory. Consider risk management.'
    });
});

// GET /trading/assets/:symbol/sentiment
router.get('/assets/:symbol/sentiment', authenticateToken, (req, res) => {
    res.json({
        symbol: req.params.symbol.toUpperCase(),
        overall: 'BULLISH', bull_score: 72, bear_score: 28,
        social_signals: { twitter: 'positive', reddit: 'very_positive', news: 'neutral' },
        news_signals: 3, updated_at: new Date().toISOString()
    });
});

// POST /trading/predictions
router.post('/predictions', authenticateToken, (req, res) => {
    const { symbol, direction, position_size, timeframe = '24h' } = req.body;
    if (!symbol || !direction || !position_size) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'symbol, direction, position_size required' } });
    }

    const pred = {
        id: `pred_${Date.now()}`, user_id: req.user.id, symbol, direction, position_size,
        timeframe, prediction_type: 'MANUAL', status: 'PENDING',
        entry_price: 64281.40, ai_confidence: 70 + Math.floor(Math.random() * 28),
        submitted_at: new Date().toISOString()
    };
    predictions.push(pred);

    res.status(201).json({
        ...pred,
        ai_prediction: { direction: 'BULLISH', confidence: pred.ai_confidence, predicted_change_pct: 5.2 }
    });
});

// GET /trading/predictions
router.get('/predictions', authenticateToken, (req, res) => {
    const userPreds = predictions.filter(p => p.user_id === req.user.id || p.user_id === 'usr_001');
    res.json({ data: userPreds });
});

// GET /trading/predictions/:id
router.get('/predictions/:id', authenticateToken, (req, res) => {
    const pred = predictions.find(p => p.id === req.params.id);
    if (!pred) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prediction not found' } });
    res.json(pred);
});

// GET /trading/leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
    res.json({
        data: [
            { rank: 1, user_id: 'usr_042', username: 'AlphaTrader', total_predictions: 142, win_rate: 74.6, total_pnl: 48250, avatar_url: '' },
            { rank: 2, user_id: 'usr_017', username: 'QuantKing', total_predictions: 98, win_rate: 71.2, total_pnl: 35890, avatar_url: '' },
            { rank: 3, user_id: 'usr_001', username: 'AlexChen', total_predictions: 45, win_rate: 68.9, total_pnl: 12450, avatar_url: '' },
            { rank: 4, user_id: 'usr_089', username: 'CryptoNova', total_predictions: 210, win_rate: 65.3, total_pnl: 28900, avatar_url: '' },
            { rank: 5, user_id: 'usr_056', username: 'BullRunner', total_predictions: 78, win_rate: 62.8, total_pnl: 9870, avatar_url: '' }
        ],
        user_rank: 3
    });
});

// GET /trading/insights/live
router.get('/insights/live', authenticateToken, (req, res) => {
    res.json({
        data: [
            { type: 'NEURAL_SPIKE', title: 'Neural Spike', description: 'Whale activity detected on Binance. Prediction confidence increasing.', asset: 'BTC', priority: 'HIGH', timestamp: new Date().toISOString() },
            { type: 'MACRO_EVENT', title: 'Macro Event', description: 'FOMC meeting minutes released. Volatility expected in 14 minutes.', priority: 'MEDIUM', timestamp: new Date().toISOString() },
            { type: 'SENTIMENT', title: 'Social Surge', description: 'ETH mentions up 340% on Twitter in the last hour.', asset: 'ETH', priority: 'LOW', timestamp: new Date().toISOString() }
        ]
    });
});

module.exports = router;
