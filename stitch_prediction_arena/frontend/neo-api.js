/**
 * Neo Prediction Arena — Shared API Client
 * All frontend pages include this script for backend communication
 */
const NEO_API = 'http://localhost:3000/v1';

function getToken() { return localStorage.getItem('neo_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('neo_user')); } catch { return null; } }

function requireAuth() {
    if (!getToken()) { window.location.href = 'index.html'; return false; }
    return true;
}

async function api(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    try {
        const res = await fetch(`${NEO_API}${path}`, { ...options, headers });
        if (res.status === 401) { localStorage.clear(); window.location.href = 'index.html'; return null; }
        return await res.json();
    } catch (err) {
        console.error('API Error:', path, err.message);
        return null;
    }
}

async function apiGet(path) { return api(path); }
async function apiPost(path, body) { return api(path, { method: 'POST', body: JSON.stringify(body) }); }

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

// Display user name in nav if element exists
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const el = document.getElementById('user-display-name');
    if (el && user) el.textContent = user.first_name || user.email;
});

// Global UI Modals (Settings & Notifications)
function showGlobalModal(title, contentHtml) {
    let overlay = document.getElementById('neo-global-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'neo-global-modal';
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300';
        overlay.innerHTML = `
            <div class="glass-panel p-6 rounded-2xl border border-primary/20 w-96 transform scale-95 transition-transform duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div class="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                    <h3 id="neo-modal-title" class="text-lg font-bold text-white tracking-widest uppercase"></h3>
                    <button onclick="closeGlobalModal()" class="text-slate-400 hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div id="neo-modal-content" class="text-sm text-slate-300 space-y-3"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        // Force reflow
        overlay.offsetHeight;
    }

    document.getElementById('neo-modal-title').textContent = title;
    document.getElementById('neo-modal-content').innerHTML = contentHtml;

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.querySelector('.glass-panel').classList.remove('scale-95');
    overlay.querySelector('.glass-panel').classList.add('scale-100');
}

function closeGlobalModal() {
    const overlay = document.getElementById('neo-global-modal');
    if (overlay) {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.querySelector('.glass-panel').classList.remove('scale-100');
        overlay.querySelector('.glass-panel').classList.add('scale-95');
        setTimeout(() => overlay.remove(), 300);
    }
}

window.showGlobalSettings = function () {
    const user = getUser() || { email: 'guest@neo.ai', first_name: 'Guest' };
    showGlobalModal('Platform Settings', `
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold">
                    ${user.first_name ? user.first_name[0] : 'U'}
                </div>
                <div>
                    <div class="text-white font-medium">${user.first_name || 'User'} ${user.last_name || ''}</div>
                    <div class="text-xs text-primary">${user.email}</div>
                </div>
            </div>
            <div class="space-y-2 mt-2">
                <label class="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">dark_mode</span> Dark Theme</span>
                    <input type="checkbox" checked class="rounded border-primary/30 text-primary bg-transparent focus:ring-primary h-4 w-4">
                </label>
                <label class="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">notifications_active</span> Push Alerts</span>
                    <input type="checkbox" checked class="rounded border-primary/30 text-primary bg-transparent focus:ring-primary h-4 w-4">
                </label>
                <label class="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">shield_person</span> 2FA Security</span>
                    <input type="checkbox" class="rounded border-primary/30 text-primary bg-transparent focus:ring-primary h-4 w-4">
                </label>
            </div>
            <button onclick="logout()" class="mt-4 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors">
                SIGN OUT
            </button>
        </div>
    `);
};

window.showGlobalNotifications = function () {
    showGlobalModal('Neural Alerts', `
        <div class="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            <div class="p-3 bg-primary/10 border-l-2 border-primary rounded-r-lg">
                <div class="text-xs text-primary font-bold mb-1">SYSTEM UPDATE</div>
                <div class="text-slate-200">Neural latency improved by 14ms across all predicting nodes.</div>
                <div class="text-[10px] text-slate-400 mt-2">Just now</div>
            </div>
            <div class="p-3 bg-white/5 border-l-2 border-slate-500 rounded-r-lg">
                <div class="text-xs text-slate-300 font-bold mb-1">SECURITY</div>
                <div class="text-slate-300">New login detected from unknown IP. Consider enabling 2FA.</div>
                <div class="text-[10px] text-slate-500 mt-2">2h ago</div>
            </div>
            <div class="p-3 bg-white/5 border-l-2 border-slate-500 rounded-r-lg">
                <div class="text-xs text-slate-300 font-bold mb-1">MARKET ALERt</div>
                <div class="text-slate-300">Your NVDA position reached the suggested target of $890.</div>
                <div class="text-[10px] text-slate-500 mt-2">1d ago</div>
            </div>
        </div>
        <button class="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors">
            Mark all as read
        </button>
    `);
};
