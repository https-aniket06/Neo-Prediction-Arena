const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');
const tradingRoutes = require('./routes/trading');
const transactionRoutes = require('./routes/transactions');
const aiRoutes = require('./routes/ai');
const educationRoutes = require('./routes/education');
const userRoutes = require('./routes/users');
const marketRoutes = require('./routes/market');

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use('/v1/portfolio', portfolioRoutes);
app.use('/v1/trading', tradingRoutes);
app.use('/v1/transactions', transactionRoutes);
app.use('/v1/ai', aiRoutes);
app.use('/v1/education', educationRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/market', marketRoutes);

// Health check
app.get('/v1/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Neo Prediction Arena', version: '1.0.0', hackathon: 'GIFT 2026' });
});

// WebSocket setup for real-time data
const wss = new WebSocketServer({ server, path: '/ws' });
const setupWebSocket = require('./ws/handler');
setupWebSocket(wss);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Neo Prediction Arena Backend`);
  console.log(`   ✅ REST API: http://localhost:${PORT}/v1`);
  console.log(`   ✅ WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   ✅ Health: http://localhost:${PORT}/v1/health`);
  console.log(`   📡 Finnhub API: Connected`);
  console.log(`   🏆 GIFT Hackathon 2026\n`);
});
