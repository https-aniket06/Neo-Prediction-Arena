const fetch = require('node-fetch');
const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

async function getQuote(symbol) {
    const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
    return res.json();
}

async function getCandles(symbol, resolution = '60', from, to) {
    if (!from) from = Math.floor(Date.now() / 1000) - 86400;
    if (!to) to = Math.floor(Date.now() / 1000);
    const res = await fetch(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
    return res.json();
}

async function searchSymbol(query) {
    const res = await fetch(`${BASE_URL}/search?q=${query}&token=${API_KEY}`);
    return res.json();
}

async function getCompanyProfile(symbol) {
    const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
    return res.json();
}

async function getMarketNews() {
    const res = await fetch(`${BASE_URL}/news?category=general&minId=0&token=${API_KEY}`);
    return res.json();
}

async function getCryptoCandles(symbol, resolution = '60', from, to) {
    if (!from) from = Math.floor(Date.now() / 1000) - 86400;
    if (!to) to = Math.floor(Date.now() / 1000);
    const res = await fetch(`${BASE_URL}/crypto/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`);
    return res.json();
}

module.exports = { getQuote, getCandles, searchSymbol, getCompanyProfile, getMarketNews, getCryptoCandles };
