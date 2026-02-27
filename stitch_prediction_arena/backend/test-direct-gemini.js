require('dotenv').config();
const fetch = require('node-fetch');

const key = process.env.GEMINI_API_KEY;
console.log('Key:', key ? key.substring(0, 15) + '...' : 'MISSING');

async function test() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'You are a financial AI advisor. The user has BTC, ETH, NVDA. Give a short 2-sentence portfolio recommendation.' }] }]
        })
    });

    const data = await res.json();
    if (data.candidates) {
        console.log('\n✅ Gemini response:', data.candidates[0].content.parts[0].text);
    } else {
        console.log('\n❌ Gemini error:', JSON.stringify(data, null, 2));
    }
}

test().catch(e => console.log('Error:', e.message));
