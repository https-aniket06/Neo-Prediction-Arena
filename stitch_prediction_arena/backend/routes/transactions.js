const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { transactions } = require('../data/mockData');

// GET /transactions
router.get('/', authenticateToken, (req, res) => {
    let data = [...transactions];
    const { type, status, asset, page = 1, limit = 20 } = req.query;
    if (type) data = data.filter(t => t.type === type);
    if (status) data = data.filter(t => t.status === status);
    if (asset) data = data.filter(t => t.asset_symbol === asset);

    const total = data.length;
    const start = (page - 1) * limit;
    data = data.slice(start, start + parseInt(limit));

    res.json({ data, pagination: { page: parseInt(page), limit: parseInt(limit), total, total_pages: Math.ceil(total / limit) } });
});

// GET /transactions/:id
router.get('/summary', authenticateToken, (req, res) => {
    const inflow = transactions.filter(t => t.direction === 'IN').reduce((s, t) => s + t.amount, 0);
    const outflow = transactions.filter(t => t.direction === 'OUT').reduce((s, t) => s + t.amount, 0);
    const byType = {};
    transactions.forEach(t => { byType[t.type] = (byType[t.type] || 0) + 1; });

    res.json({ period: '30d', total_inflow: inflow, total_outflow: outflow, net_flow: inflow - outflow, transaction_count: transactions.length, by_type: byType });
});

// GET /transactions/chart
router.get('/chart', authenticateToken, (req, res) => {
    const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        return d.toISOString().split('T')[0];
    });
    res.json({
        labels,
        inflow: labels.map(() => Math.floor(Math.random() * 15000 + 5000)),
        outflow: labels.map(() => Math.floor(Math.random() * 12000 + 3000))
    });
});

// GET /transactions/:id
router.get('/:id', authenticateToken, (req, res) => {
    const txn = transactions.find(t => t.id === req.params.id);
    if (!txn) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    res.json(txn);
});

// POST /transactions
router.post('/', authenticateToken, (req, res) => {
    const { type, direction, amount, asset_symbol, label } = req.body;
    const txn = {
        id: `txn_${Date.now()}`, user_id: req.user.id, type, direction, amount, asset_symbol,
        fee: 0, status: 'COMPLETED', label: label || `${type} Transaction`,
        created_at: new Date().toISOString()
    };
    transactions.push(txn);
    res.status(201).json(txn);
});

// GET /transactions/types
router.get('/types', (req, res) => {
    res.json({ types: ['BUY', 'SELL', 'TRANSFER', 'SMART_CONTRACT', 'DEPOSIT', 'WITHDRAWAL'] });
});

module.exports = router;
