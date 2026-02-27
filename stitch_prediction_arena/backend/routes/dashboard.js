const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { holdings } = require('../data/mockData');
const finnhub = require('../services/finnhub');

// GET /dashboard/summary
router.get('/summary', authenticateToken, (req, res) => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_price * h.quantity), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.avg_cost * h.quantity), 0);
    const dayChange = totalValue * 0.015;

    res.json({
        net_worth: Math.round(totalValue * 100) / 100,
        day_change: Math.round(dayChange * 100) / 100,
        day_change_pct: 1.5,
        portfolio_value: Math.round(totalValue * 100) / 100,
        total_invested: Math.round(totalInvested * 100) / 100,
        ai_prediction_summary: 'BULLISH',
        accuracy_7d: 87.4
    });
});

module.exports = router;
