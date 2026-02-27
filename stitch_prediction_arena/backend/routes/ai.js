const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { aiConversations } = require('../data/mockData');
const gemini = require('../services/gemini');

// Fallback AI responses when Gemini is unavailable
function getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('portfolio') || lowerMsg.includes('holdings')) {
        return '📊 **Portfolio Analysis:**\n\nYour portfolio is valued at **$842,500** with a diversification score of **74/100**.\n\n**Top Performers:**\n- BTC: +42.6% unrealized gain\n- NVDA: +98.3% unrealized gain\n\n**Recommendations:**\n1. Consider taking partial profits on NVDA at resistance\n2. Your crypto allocation (35%) is well-balanced\n3. Add fixed-income positions to reduce volatility';
    } else if (lowerMsg.includes('bitcoin') || lowerMsg.includes('btc')) {
        return '₿ **Bitcoin Analysis:**\n\nCurrent price: **$64,281.40** (+2.41%)\nAI Confidence: **84.2% BULLISH**\n\n- RSI: 62.4 (neutral-bullish)\n- MACD: Positive crossover\n- Support: $62,000 | Resistance: $66,500\n\nRecommendation: **Hold** with target $67,800 within 7 days.';
    }
    return '🤖 **AI Advisor:**\n\nBased on current market conditions, your portfolio is performing well at +22.3% YTD. BTC shows strong bullish momentum. Consider dollar-cost averaging into ETH.\n\nWould you like me to dive deeper into any specific area?';
}

// POST /ai/chat — Real Gemini AI
router.post('/chat', authenticateToken, async (req, res) => {
    const { message, conversation_id } = req.body;
    if (!message) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Message required' } });

    // Find or create conversation
    let conv = conversation_id ? aiConversations.find(c => c.id === conversation_id) : null;
    if (!conv) {
        conv = { id: `conv_${Date.now()}`, user_id: req.user.id, created_at: new Date().toISOString(), messages: [] };
        aiConversations.push(conv);
    }

    // Add user message
    conv.messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    // Try Gemini first, fallback to mock
    let aiResponse = await gemini.chat(message, conv.messages.slice(-10)); // last 10 messages for context
    if (!aiResponse) {
        aiResponse = getFallbackResponse(message);
    }

    const responseMsg = { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() };
    conv.messages.push(responseMsg);

    res.json({ conversation_id: conv.id, message: responseMsg });
});

// GET /ai/conversations
router.get('/conversations', authenticateToken, (req, res) => {
    res.json({ data: aiConversations.map(c => ({ id: c.id, created_at: c.created_at, message_count: c.messages.length, last_message: c.messages[c.messages.length - 1]?.content?.substring(0, 100) })) });
});

// GET /ai/conversations/:id
router.get('/conversations/:id', authenticateToken, (req, res) => {
    const conv = aiConversations.find(c => c.id === req.params.id);
    if (!conv) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
    res.json(conv);
});

// DELETE /ai/conversations/:id
router.delete('/conversations/:id', authenticateToken, (req, res) => {
    const idx = aiConversations.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    aiConversations.splice(idx, 1);
    res.status(204).end();
});

// GET /ai/insights — Real Gemini AI insights
router.get('/insights', authenticateToken, async (req, res) => {
    // Try to generate real insights via Gemini
    const aiInsights = await gemini.generateInsights();

    if (aiInsights && aiInsights.length > 0) {
        const data = aiInsights.map((ins, i) => ({
            id: `ins_${Date.now()}_${i}`,
            ...ins,
            created_at: new Date().toISOString()
        }));
        return res.json({ data });
    }

    // Fallback
    res.json({
        data: [
            { id: 'ins_001', title: 'Portfolio Rebalancing Alert', description: 'Your tech stock allocation exceeds 40%. Consider diversifying into healthcare or energy sectors.', priority: 'HIGH', category: 'PORTFOLIO', created_at: new Date().toISOString() },
            { id: 'ins_002', title: 'BTC Accumulation Zone', description: 'Bitcoin is showing classic accumulation patterns. Historical data suggests a breakout within 48 hours.', priority: 'MEDIUM', category: 'MARKET', created_at: new Date().toISOString() },
            { id: 'ins_003', title: 'Earnings Season Impact', description: 'NVDA earnings next week could cause 5-10% price movement. Consider setting protective stops.', priority: 'HIGH', category: 'EARNINGS', created_at: new Date().toISOString() }
        ]
    });
});

// GET /ai/plan — AI-generated strategy
router.get('/plan', authenticateToken, async (req, res) => {
    res.json({
        plan_id: 'plan_001',
        strategy: 'Growth with Risk Management',
        target_return: '25% annualized',
        risk_tolerance: 'Moderate',
        recommendations: [
            { action: 'HOLD', asset: 'BTC', reason: 'Strong bullish trend, key support at $62K' },
            { action: 'BUY', asset: 'ETH', reason: 'Undervalued relative to BTC ratio' },
            { action: 'REDUCE', asset: 'NVDA', reason: 'Take 20% profits at resistance' },
            { action: 'ADD', asset: 'BONDS', reason: 'Increase fixed-income to 10% for stability' }
        ],
        generated_at: new Date().toISOString()
    });
});

// GET /ai/market-stream
router.get('/market-stream', authenticateToken, (req, res) => {
    res.json({
        data: [
            { symbol: 'BTC', name: 'Bitcoin', price: 64281.40, change_pct: 2.41, direction: 'up' },
            { symbol: 'ETH', name: 'Ethereum', price: 3450.12, change_pct: -1.1, direction: 'down' },
            { symbol: 'NVDA', name: 'NVIDIA', price: 892.30, change_pct: 0.8, direction: 'up' },
            { symbol: 'SOL', name: 'Solana', price: 142.50, change_pct: 3.2, direction: 'up' }
        ]
    });
});

module.exports = router;
