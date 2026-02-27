const WebSocket = require('ws');
const fetch = require('node-fetch');

function setupWebSocket(wss) {
    const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
    let finnhubWs;
    const subscribedSymbols = new Set();

    // Connect to Finnhub WebSocket for live market data
    function connectFinnhub() {
        finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);

        finnhubWs.on('open', () => {
            console.log('   📡 Finnhub WebSocket connected');
            // Subscribe to default symbols
            ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'].forEach(symbol => {
                finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol }));
                subscribedSymbols.add(symbol);
            });
        });

        finnhubWs.on('message', (data) => {
            try {
                const parsed = JSON.parse(data.toString());
                if (parsed.type === 'trade' && parsed.data) {
                    // Broadcast to all connected clients
                    const message = JSON.stringify({
                        channel: 'market_ticker',
                        data: parsed.data.map(t => ({
                            symbol: t.s, price: t.p, volume: t.v,
                            timestamp: new Date(t.t).toISOString()
                        }))
                    });

                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(message);
                        }
                    });
                }
            } catch (e) { /* ignore parse errors */ }
        });

        finnhubWs.on('close', () => {
            console.log('   ⚠️ Finnhub WebSocket disconnected, reconnecting...');
            setTimeout(connectFinnhub, 5000);
        });

        finnhubWs.on('error', (err) => {
            console.error('   ❌ Finnhub WS error:', err.message);
        });
    }

    // Connect to Finnhub
    connectFinnhub();

    // Handle client connections
    wss.on('connection', (ws, req) => {
        console.log('   🔌 Client connected to WebSocket');

        ws.send(JSON.stringify({
            channel: 'system',
            data: { message: 'Connected to Neo Prediction Arena real-time feed', status: 'connected' }
        }));

        // Simulate portfolio updates every 5 seconds
        const portfolioInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    channel: 'portfolio_live',
                    data: {
                        total_value: 842500 + (Math.random() * 2000 - 1000),
                        day_change: 12450 + (Math.random() * 500 - 250),
                        positions_updated: Math.floor(Math.random() * 3) + 1,
                        timestamp: new Date().toISOString()
                    }
                }));
            }
        }, 5000);

        // Simulate trading insights every 15 seconds
        const insightsInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const insights = [
                    { type: 'NEURAL_SPIKE', title: 'Neural Spike', description: 'Large order detected', asset: 'BTC', priority: 'HIGH' },
                    { type: 'MACRO_EVENT', title: 'Economic Data', description: 'CPI data release incoming', priority: 'MEDIUM' },
                    { type: 'SENTIMENT', title: 'Social Trend', description: 'AI stocks trending on social media', priority: 'LOW' }
                ];
                ws.send(JSON.stringify({
                    channel: 'trading_insights',
                    data: insights[Math.floor(Math.random() * insights.length)]
                }));
            }
        }, 15000);

        // Simulate Drastic Event Alert every 20 seconds
        const drasticInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const events = [
                    { headline: 'BREAKING: Federal Reserve announces unexpected 50 bps rate cut.', source: 'Global Intel', level: 'CRITICAL', impact: 'BULLISH', asset: 'ALL' },
                    { headline: 'FLASH CRASH: $1.2B liquidated in crypto markets within 5 minutes.', source: 'On-Chain Intel', level: 'CRITICAL', impact: 'BEARISH', asset: 'BTC/ETH' },
                    { headline: 'URGENT: SEC approves comprehensive Ethereum derivatives trading.', source: 'Regulatory Intel', level: 'CRITICAL', impact: 'BULLISH', asset: 'ETH' },
                    { headline: 'BREAKING: Global tech outage affects major exchange liquidity providers.', source: 'System Intel', level: 'CRITICAL', impact: 'BEARISH', asset: 'TECH' }
                ];
                ws.send(JSON.stringify({
                    channel: 'drastic_event',
                    data: events[Math.floor(Math.random() * events.length)],
                    timestamp: new Date().toISOString()
                }));
            }
        }, 20000);

        ws.on('message', (msg) => {
            try {
                const parsed = JSON.parse(msg.toString());
                // Handle subscribe/unsubscribe for specific symbols
                if (parsed.action === 'subscribe' && parsed.symbol && finnhubWs?.readyState === WebSocket.OPEN) {
                    finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: parsed.symbol }));
                    subscribedSymbols.add(parsed.symbol);
                }
            } catch (e) { /* ignore */ }
        });

        ws.on('close', () => {
            clearInterval(portfolioInterval);
            clearInterval(insightsInterval);
            clearInterval(drasticInterval);
            console.log('   🔌 Client disconnected');
        });
    });
}

module.exports = setupWebSocket;
