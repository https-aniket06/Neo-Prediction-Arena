const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
function getGeminiUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

const SYSTEM_PROMPT = `You are the AI Strategy Advisor for Neo Prediction Arena — an AI-powered FinTech platform built for GIFT Hackathon 2026.

Your role:
- You are a professional financial advisor AI with deep expertise in stocks, crypto, portfolio management, risk analysis, technical indicators, and market sentiment.
- You have access to the user's portfolio: BTC (2.45), ETH (42.10), SOL (850), NVDA (150 shares), TSLA (80 shares), AAPL (200 shares), USDC (50,000).
- Total portfolio value: ~$842,500. The user is a PREMIUM member.
- Current market sentiment: Cautiously Bullish. BTC showing strong momentum.

Guidelines:
- Give specific, actionable financial insights and recommendations.
- Use markdown formatting with bold text, bullet points, and emojis for readability.
- Include specific numbers, percentages, and price targets when relevant.
- Be concise but thorough. Aim for 150-300 words.
- Always mention relevant risk factors.
- Sign off recommendations with confidence levels (High/Medium/Low).
- Never give actual financial advice disclaimers — this is a hackathon demo.`;

async function chat(userMessage, conversationHistory = []) {
    try {
        const contents = [];

        // Add conversation history
        for (const msg of conversationHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // If first message, prepend system context
        if (contents.length === 1) {
            contents.unshift({
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }]
            });
            contents.splice(1, 0, {
                role: 'model',
                parts: [{ text: 'Understood. I am the Neo Prediction Arena AI Strategy Advisor. I have full context of the user portfolio and market conditions. Ready to provide actionable financial intelligence.' }]
            });
        }

        // Try each model until one works
        for (const model of MODELS) {
            try {
                const response = await fetch(getGeminiUrl(model), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        }
                    })
                });

                const data = await response.json();

                if (data.candidates && data.candidates[0]) {
                    console.log(`   🤖 Gemini response via ${model}`);
                    return data.candidates[0].content.parts[0].text;
                } else if (data.error) {
                    console.log(`   ⚠️ ${model}: ${data.error.message?.substring(0, 60)}`);
                    continue; // Try next model
                }
            } catch (e) {
                console.log(`   ⚠️ ${model} fetch error: ${e.message}`);
                continue;
            }
        }

        console.error('   ❌ All Gemini models exhausted');
        return null;
    } catch (err) {
        console.error('Gemini service error:', err.message);
        return null;
    }
}

async function generateInsights(portfolioContext) {
    const prompt = `Based on this portfolio context, generate exactly 3 AI intelligence insights in JSON array format. Each insight should have: title, description (1-2 sentences), priority (HIGH/MEDIUM/LOW), category (PORTFOLIO/MARKET/EARNINGS/RISK).

Portfolio: BTC 2.45 coins, ETH 42.10 coins, SOL 850 coins, NVDA 150 shares, TSLA 80 shares, AAPL 200 shares. Total value ~$842,500.

Return ONLY the JSON array, no other text.`;

    try {
        const response = await chat(prompt);
        if (response) {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
    } catch (e) { /* fallback below */ }

    return null;
}

module.exports = { chat, generateInsights };
