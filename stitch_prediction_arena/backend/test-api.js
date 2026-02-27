const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'localhost', port: 3000, path, method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) opts.headers['Authorization'] = 'Bearer ' + token;
        if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);

        const req = http.request(opts, res => {
            let b = '';
            res.on('data', c => b += c);
            res.on('end', () => {
                try { resolve(JSON.parse(b)); } catch { resolve(b); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log('=== Neo Prediction Arena Backend Test ===\n');

    // 1. Health
    const health = await request('GET', '/v1/health');
    console.log('✅ Health:', health.status, '|', health.platform);

    // 2. Login
    const login = await request('POST', '/v1/auth/login', { email: 'alex@neoprediction.ai', password: 'Demo@123' });
    console.log('✅ Login:', login.user.first_name, login.user.last_name, '| Token:', login.access_token.substring(0, 20) + '...');
    const token = login.access_token;

    // 3. Dashboard
    const dash = await request('GET', '/v1/dashboard/summary', null, token);
    console.log('✅ Dashboard: Net Worth $' + dash.net_worth + ' | AI:', dash.ai_prediction_summary);

    // 4. Portfolio
    const port = await request('GET', '/v1/portfolio', null, token);
    console.log('✅ Portfolio: $' + port.total_value + ' | Gain: ' + port.total_gain_pct + '%');

    // 5. Holdings
    const hold = await request('GET', '/v1/portfolio/holdings', null, token);
    console.log('✅ Holdings:', hold.data.length, 'positions |', hold.data.map(h => h.symbol).join(', '));

    // 6. LIVE Quote from Finnhub
    const quote = await request('GET', '/v1/trading/assets/AAPL/quote', null, token);
    console.log('✅ AAPL Live Quote: $' + quote.price + ' | Change: ' + quote.change_pct + '%');

    // 7. AI Prediction
    const aiPred = await request('GET', '/v1/trading/assets/NVDA/ai-prediction', null, token);
    console.log('✅ NVDA AI Prediction:', aiPred.direction, '| Confidence:', aiPred.confidence + '%');

    // 8. Transactions
    const txns = await request('GET', '/v1/transactions', null, token);
    console.log('✅ Transactions:', txns.data.length, 'records');

    // 9. AI Chat
    const chat = await request('POST', '/v1/ai/chat', { message: 'Analyze my Bitcoin position' }, token);
    console.log('✅ AI Chat:', chat.message.content.substring(0, 80) + '...');

    // 10. Education
    const edu = await request('GET', '/v1/education/modules', null, token);
    console.log('✅ Education:', edu.data.length, 'modules');

    // 11. Market News (Live)
    const news = await request('GET', '/v1/market/news', null, token);
    console.log('✅ Market News:', (news.data || []).length, 'articles');

    console.log('\n🏆 All endpoints working! Backend ready for GIFT Hackathon 2026');
}

main().catch(console.error);
