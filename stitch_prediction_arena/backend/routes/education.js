const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { educationModules, userProgress, badges } = require('../data/mockData');

// GET /education/modules
router.get('/modules', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const progress = userProgress[userId] || userProgress['usr_001'] || {};
    const data = educationModules.map(m => ({
        ...m,
        user_progress: progress[m.id] || { completed_lessons: 0, pct: 0, status: 'NOT_STARTED' }
    }));
    res.json({ data });
});

// GET /education/modules/:id
router.get('/modules/:id', authenticateToken, (req, res) => {
    const mod = educationModules.find(m => m.id === req.params.id);
    if (!mod) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    const progress = (userProgress[req.user.id] || userProgress['usr_001'] || {})[mod.id];
    res.json({ ...mod, user_progress: progress || { completed_lessons: 0, pct: 0, status: 'NOT_STARTED' } });
});

// GET /education/quizzes/:id
router.get('/quizzes/:id', authenticateToken, (req, res) => {
    res.json({
        quiz_id: req.params.id, module_id: req.params.id, title: 'Stocks & Equity Quiz',
        questions: [
            { id: 'q_01', text: 'What is a P/E ratio?', options: ['A: Price to Earnings', 'B: Profit to Expense', 'C: Price to Equity', 'D: Profit to Earnings'] },
            { id: 'q_02', text: 'What does RSI measure?', options: ['A: Revenue', 'B: Momentum', 'C: Volume', 'D: Volatility'] },
            { id: 'q_03', text: 'Which order type guarantees execution?', options: ['A: Limit', 'B: Stop', 'C: Market', 'D: Trailing Stop'] }
        ]
    });
});

// POST /education/quizzes/:id/submit
router.post('/quizzes/:id/submit', authenticateToken, (req, res) => {
    const { answers } = req.body;
    // Assume all provided answers are correct for the hackathon demo, guaranteeing a pass if they answered all questions.
    const total = answers ? answers.length : 3;
    const correct = answers ? answers.length : 3;
    const score = Math.round((correct / total) * 100) || 100;
    const passed = score >= 70;

    const userId = req.user.id || 'usr_001';
    if (!userProgress[userId]) {
        userProgress[userId] = {};
    }

    // Mutate state so Continue Learning and Timeline dynamically update
    if (passed) {
        userProgress[userId][req.params.id] = { completed_lessons: 10, pct: score, status: 'COMPLETED', completed_at: new Date().toISOString().split('T')[0] };
    } else {
        userProgress[userId][req.params.id] = { completed_lessons: 1, pct: score, status: 'IN_PROGRESS' };
    }

    res.json({
        score_pct: score, correct, total, passed, xp_earned: passed ? 150 : 50,
        badge_unlocked: score >= 90 ? { id: 'badge_supernova', name: 'Supernova', description: 'Scored 90%+ on a quiz.' } : null
    });
});

// GET /education/badges
router.get('/badges', authenticateToken, (req, res) => { res.json({ data: badges }); });

// GET /education/leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
    res.json({
        data: [
            { rank: 1, username: 'FinanceGuru', xp: 4200, modules_completed: 5 },
            { rank: 2, username: 'MarketMaven', xp: 2800, modules_completed: 3 },
            { rank: 3, username: 'CryptoLearner', xp: 1900, modules_completed: 2 },
            { rank: 4, username: 'StockNewbie', xp: 900, modules_completed: 1 },
            { rank: 5, username: 'AlexChen', xp: 0, modules_completed: 0 }
        ]
    });
});

module.exports = router;
