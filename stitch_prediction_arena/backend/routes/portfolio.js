const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { holdings } = require('../data/mockData');

// GET /portfolio
router.get('/', authenticateToken, (req, res) => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_price * h.quantity), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.avg_cost * h.quantity), 0);
    const gain = totalValue - totalInvested;

    res.json({
        total_value: Math.round(totalValue * 100) / 100,
        total_invested: Math.round(totalInvested * 100) / 100,
        total_gain: Math.round(gain * 100) / 100,
        total_gain_pct: Math.round((gain / totalInvested) * 10000) / 100,
        ai_risk_score: 'Moderate',
        diversification_score: 74,
        last_updated: new Date().toISOString()
    });
});

// GET /portfolio/allocation
router.get('/allocation', authenticateToken, (req, res) => {
    const crypto = holdings.filter(h => h.category === 'CRYPTO');
    const stocks = holdings.filter(h => h.category === 'STOCK');
    const cryptoValue = crypto.reduce((s, h) => s + h.current_price * h.quantity, 0);
    const stockValue = stocks.reduce((s, h) => s + h.current_price * h.quantity, 0);
    const total = cryptoValue + stockValue;

    res.json({
        data: [
            { category: 'Crypto Assets', value: Math.round(cryptoValue), pct: Math.round(cryptoValue / total * 1000) / 10, color: '#00F2FF' },
            { category: 'Growth Stocks', value: Math.round(stockValue), pct: Math.round(stockValue / total * 1000) / 10, color: '#BD34FE' }
        ]
    });
});

// GET /portfolio/holdings
router.get('/holdings', authenticateToken, (req, res) => {
    const data = holdings.map(h => ({
        ...h,
        market_value: Math.round(h.current_price * h.quantity * 100) / 100,
        unrealized_pnl: Math.round((h.current_price - h.avg_cost) * h.quantity * 100) / 100,
        unrealized_pnl_pct: Math.round((h.current_price - h.avg_cost) / h.avg_cost * 10000) / 100
    }));
    res.json({ data });
});

// GET /portfolio/performance
router.get('/performance', authenticateToken, (req, res) => {
    const period = req.query.period || '1m';
    const points = period === '1d' ? 24 : period === '1w' ? 7 : 30;
    const baseValue = 800000;
    const data = Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(Date.now() - (points - i) * 86400000).toISOString(),
        value: Math.round(baseValue + (Math.random() * 50000) + (i * 1500))
    }));
    res.json({ period, data });
});

// GET /portfolio/stats
router.get('/stats', authenticateToken, (req, res) => {
    const totalValue = holdings.reduce((s, h) => s + h.current_price * h.quantity, 0);
    const totalInvested = holdings.reduce((s, h) => s + h.avg_cost * h.quantity, 0);
    res.json({
        total_invested: Math.round(totalInvested),
        unrealized_pnl: Math.round(totalValue - totalInvested),
        realized_pnl: 12450,
        win_rate: 74.6,
        diversification_score: 74
    });
});

// GET /portfolio/pulse
router.get('/pulse', authenticateToken, (req, res) => {
    res.json({
        data: [
            { type: 'PRICE_ALERT', message: 'BTC crossed $64,000 resistance', asset: 'BTC', timestamp: new Date().toISOString(), priority: 'HIGH' },
            { type: 'AI_SIGNAL', message: 'Strong buy signal detected for ETH', asset: 'ETH', timestamp: new Date().toISOString(), priority: 'MEDIUM' },
            { type: 'TRADE', message: 'NVDA partial sell executed', asset: 'NVDA', timestamp: new Date(Date.now() - 3600000).toISOString(), priority: 'LOW' }
        ]
    });
});

module.exports = router;
