const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { watchlist } = require('../data/mockData');
const finnhub = require('../services/finnhub');

// GET /market/ticker — LIVE from Finnhub
router.get('/ticker', authenticateToken, async (req, res) => {
    try {
        const symbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT'];
        const quotes = await Promise.all(symbols.map(async (symbol) => {
            const q = await finnhub.getQuote(symbol);
            return { symbol, price: q.c, change_pct: q.dp, change: q.d };
        }));
        res.json({ data: quotes });
    } catch (err) {
        // Fallback to mock data
        res.json({
            data: [
                { symbol: 'AAPL', price: 189.50, change_pct: 0.8, change: 1.50 },
                { symbol: 'NVDA', price: 892.30, change_pct: -0.8, change: -7.20 },
                { symbol: 'TSLA', price: 340.00, change_pct: 1.2, change: 4.00 },
                { symbol: 'MSFT', price: 415.60, change_pct: 0.3, change: 1.20 }
            ]
        });
    }
});

// GET /market/watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
    try {
        const data = await Promise.all(watchlist.map(async (item) => {
            let price, change;
            if (item.category === 'STOCK') {
                const q = await finnhub.getQuote(item.symbol);
                price = q.c; change = q.dp;
            } else {
                price = item.symbol === 'BTC' ? 64281.40 : item.symbol === 'ETH' ? 3450.12 : 142.50;
                change = item.symbol === 'BTC' ? 2.41 : item.symbol === 'ETH' ? -1.1 : 3.2;
            }
            const aiLabels = ['Strong Buy', 'Buy', 'Neutral', 'Sell', 'Strong Buy'];
            return {
                symbol: item.symbol, name: item.name, category: item.category, price,
                ai_prediction: aiLabels[Math.floor(Math.random() * aiLabels.length)],
                change_24h: change, sentiment: change > 0 ? 'BULLISH' : 'BEARISH',
                sentiment_bars: Math.floor(Math.random() * 3) + 2
            };
        }));
        res.json({ data });
    } catch (err) {
        res.status(500).json({ error: { code: 'API_ERROR', message: 'Failed to fetch watchlist data' } });
    }
});

// POST /market/watchlist
router.post('/watchlist', authenticateToken, (req, res) => {
    const { symbol, name, category } = req.body;
    if (!watchlist.find(w => w.symbol === symbol)) {
        watchlist.push({ symbol, name, category });
    }
    res.status(201).json({ symbol, name, category });
});

// DELETE /market/watchlist/:symbol
router.delete('/watchlist/:symbol', authenticateToken, (req, res) => {
    const idx = watchlist.findIndex(w => w.symbol === req.params.symbol);
    if (idx !== -1) watchlist.splice(idx, 1);
    res.status(204).end();
});

// GET /market/search — LIVE from Finnhub
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const results = await finnhub.searchSymbol(req.query.q || '');
        res.json({ data: (results.result || []).slice(0, 10).map(r => ({ symbol: r.symbol, name: r.description, type: r.type })) });
    } catch (err) {
        res.status(500).json({ error: { code: 'API_ERROR', message: 'Search failed' } });
    }
});

// GET /market/news — LIVE from Finnhub
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const news = await finnhub.getMarketNews();
        res.json({ data: (news || []).slice(0, 10).map(n => ({ id: n.id, headline: n.headline, summary: n.summary, source: n.source, url: n.url, image: n.image, datetime: new Date(n.datetime * 1000).toISOString() })) });
    } catch (err) {
        res.json({ data: [] });
    }
});

module.exports = router;
