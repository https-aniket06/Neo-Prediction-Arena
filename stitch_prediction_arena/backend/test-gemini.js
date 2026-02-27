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
    console.log('=== Testing Gemini AI Integration ===\n');

    // Login
    const login = await request('POST', '/v1/auth/login', { email: 'alex@neoprediction.ai', password: 'Demo@123' });
    console.log('✅ Logged in as:', login.user.first_name, login.user.last_name);
    const token = login.access_token;

    // Test AI Chat with Gemini
    console.log('\n📤 Sending: "Should I buy more Bitcoin right now?"\n');
    const chat = await request('POST', '/v1/ai/chat', { message: 'Should I buy more Bitcoin right now? Give me a detailed analysis.' }, token);

    if (chat.message) {
        console.log('🤖 Gemini AI Response:\n');
        console.log(chat.message.content);
        console.log('\n✅ Conversation ID:', chat.conversation_id);
    } else {
        console.log('❌ Error:', JSON.stringify(chat));
    }

    // Test AI Insights
    console.log('\n--- AI Insights ---');
    const insights = await request('GET', '/v1/ai/insights', null, token);
    if (insights.data) {
        insights.data.forEach(i => console.log(`  [${i.priority}] ${i.title}: ${i.description}`));
    }

    console.log('\n🏆 Gemini AI integration test complete!');
}

main().catch(console.error);
