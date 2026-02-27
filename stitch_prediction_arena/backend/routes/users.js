const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { users } = require('../data/mockData');

// GET /users/profile
router.get('/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id) || users[0];
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
});

// PUT /users/profile
router.put('/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id) || users[0];
    const { first_name, last_name } = req.body;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
});

// GET /users/preferences
router.get('/preferences', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id) || users[0];
    res.json(user.preferences || { theme: 'dark', currency: 'USD', notifications: true });
});

// PUT /users/preferences
router.put('/preferences', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id) || users[0];
    user.preferences = { ...user.preferences, ...req.body };
    res.json(user.preferences);
});

module.exports = router;
