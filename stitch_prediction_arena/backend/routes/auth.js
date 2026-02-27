const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../firebase');
// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } });

    if (!db) return res.status(500).json({ error: { code: 'NO_FIREBASE', message: 'Firebase is not securely connected. Please add serviceAccountKey.json to the backend folder.' } });

    try {
        const querySnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (querySnapshot.empty) {
            return res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
        }

        const access_token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refresh_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            access_token, refresh_token, expires_in: 3600,
            user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, avatar_url: user.avatar_url || '' }
        });
    } catch (err) {
        console.error('Firebase Auth Login Error:', err);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error while logging in' } });
    }
});

// POST /auth/register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'All fields required' } });
    }

    if (!db) return res.status(500).json({ error: { code: 'NO_FIREBASE', message: 'Firebase is not securely connected. Please add serviceAccountKey.json to the backend folder.' } });

    try {
        const querySnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!querySnapshot.empty) {
            return res.status(409).json({ error: { code: 'DUPLICATE', message: 'Email already registered' } });
        }

        const newUser = {
            id: `usr_${Date.now()}`, first_name, last_name, email,
            password_hash: bcrypt.hashSync(password, 10),
            avatar_url: '', account_type: 'FREE',
            created_at: new Date().toISOString(),
            preferences: { theme: 'dark', currency: 'USD', notifications: true }
        };

        // Write the new user to Firebase Firestore
        await db.collection('users').doc(newUser.id).set(newUser);

        const access_token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refresh_token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            access_token, refresh_token, expires_in: 3600,
            user: { id: newUser.id, first_name, last_name, email, avatar_url: '' }
        });
    } catch (err) {
        console.error('Firebase Auth Register Error:', err);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error while registering' } });
    }
});

// POST /auth/refresh
router.post('/refresh', (req, res) => {
    const { refresh_token } = req.body;
    try {
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
        const access_token = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ access_token, expires_in: 3600 });
    } catch { res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } }); }
});

// POST /auth/logout
router.post('/logout', authenticateToken, (req, res) => { res.status(204).end(); });

// GET /auth/me
router.get('/me', authenticateToken, async (req, res) => {
    if (!db) {
        // Fallback for demo display if db disconnected
        return res.json({ id: req.user.id, first_name: 'Demo', last_name: 'User', email: req.user.email });
    }
    try {
        const userDoc = await db.collection('users').doc(req.user.id).get();
        if (!userDoc.exists) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found in Firebase database' } });
        const user = userDoc.data();
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Database error' } });
    }
});

// POST /auth/forgot-password
router.post('/forgot-password', (req, res) => {
    res.json({ message: 'Password reset email sent (demo mode)' });
});

// POST /auth/reset-password
router.post('/reset-password', (req, res) => {
    res.json({ message: 'Password reset successful (demo mode)' });
});

module.exports = router;
