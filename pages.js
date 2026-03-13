/* ======================================================
   COSMIC MAGIC — Page-Specific Logic
   (Hero, Analytics, Users, Settings)
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroPage();
    initAnalyticsPage();
    initUsersPage();
    initSettingsPage();
});

/* ══════════════════════════════════════════════════════
   MOBILE NAV TOGGLE (shared across all pages)
   ══════════════════════════════════════════════════════ */
function initMobileNav() {
    const toggle = document.getElementById('hero-mobile-toggle');
    const dropdown = document.getElementById('hero-mobile-dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

/* ══════════════════════════════════════════════════════
   HERO PAGE
   ══════════════════════════════════════════════════════ */
function initHeroPage() {
    if (!document.body.classList.contains('page-hero')) return;

    // Hero stat counters
    const statEls = document.querySelectorAll('.hero-stat-value');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateHeroCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    statEls.forEach(el => observer.observe(el));

    // Mini chart
    initHeroMiniChart();
}

function animateHeroCounter(el) {
    const target = parseFloat(el.dataset.heroTarget);
    const decimals = parseInt(el.dataset.heroDecimals) || 0;
    const suffix = el.dataset.heroSuffix || '';
    const prefix = el.dataset.heroPrefix !== undefined ? el.dataset.heroPrefix : '';
    const duration = 2200;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * ease;

        if (decimals > 0) {
            el.textContent = prefix + current.toFixed(decimals) + suffix;
        } else if (target >= 1000000) {
            el.textContent = prefix + (current / 1000000).toFixed(1) + 'M' + suffix;
        } else if (target >= 1000) {
            el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        } else {
            el.textContent = prefix + Math.floor(current) + suffix;
        }

        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function initHeroMiniChart() {
    const canvas = document.getElementById('hero-mini-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = [30, 55, 42, 68, 52, 78, 65, 90, 72, 95, 82, 105, 88, 110, 95];
    let progress = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = (rect.width - 40) * dpr;
        canvas.height = 160 * dpr;
        canvas.style.width = (rect.width - 40) + 'px';
        canvas.style.height = '160px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', () => { resize(); draw(1); });

    function draw(prog) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const padding = { top: 10, right: 10, bottom: 10, left: 10 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const max = Math.max(...data) * 1.15;

        const points = data.map((val, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartW,
            y: padding.top + chartH - (val / max) * chartH * prog,
        }));

        // Gradient fill
        const gf = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gf.addColorStop(0, `rgba(168, 85, 247, ${0.3 * prog})`);
        gf.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, h - padding.bottom);
        smoothLine(ctx, points);
        ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gf;
        ctx.fill();

        // Line
        const gl = ctx.createLinearGradient(padding.left, 0, w - padding.right, 0);
        gl.addColorStop(0, '#a855f7');
        gl.addColorStop(0.5, '#06b6d4');
        gl.addColorStop(1, '#e879f9');
        ctx.beginPath();
        smoothLine(ctx, points);
        ctx.strokeStyle = gl;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Dots on a few points
        [0, 4, 9, 14].forEach(i => {
            if (i >= points.length) return;
            const p = points[i];
            const pulse = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 85, 247, ${0.15 * pulse * prog})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#a855f7';
            ctx.fill();
        });
    }

    function smoothLine(ctx, pts) {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }

    // Animate in
    const startTime = performance.now();
    function animLoop(now) {
        const elapsed = now - startTime;
        progress = Math.min(elapsed / 1200, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        draw(ease);
        if (progress < 1) requestAnimationFrame(animLoop);
        else {
            // Continuous pulse loop
            function pulseLoop() { draw(1); requestAnimationFrame(pulseLoop); }
            pulseLoop();
        }
    }
    requestAnimationFrame(animLoop);
}

/* ══════════════════════════════════════════════════════
   ANALYTICS PAGE — Charts
   ══════════════════════════════════════════════════════ */
function initAnalyticsPage() {
    if (!document.body.classList.contains('page-analytics')) return;

    drawAnalyticsChart('analytics-traffic-chart', generateWave(60, 200, 1200), '#a855f7', '#06b6d4');
    drawAnalyticsBars('analytics-funnel-chart', [
        { label: 'Visits', value: 100, color: '#a855f7' },
        { label: 'Sign-ups', value: 62, color: '#8b5cf6' },
        { label: 'Activated', value: 41, color: '#06b6d4' },
        { label: 'Subscribed', value: 24, color: '#e879f9' },
        { label: 'Retained', value: 18, color: '#ec4899' },
    ]);
    drawAnalyticsDoughnut('analytics-region-chart', [
        { label: 'North America', value: 38, color: '#a855f7' },
        { label: 'Europe', value: 28, color: '#06b6d4' },
        { label: 'Asia', value: 22, color: '#e879f9' },
        { label: 'Other', value: 12, color: '#3b82f6' },
    ]);
    drawAnalyticsBars('analytics-device-chart', [
        { label: 'Desktop', value: 52, color: '#a855f7' },
        { label: 'Mobile', value: 34, color: '#06b6d4' },
        { label: 'Tablet', value: 10, color: '#e879f9' },
        { label: 'Other', value: 4, color: '#3b82f6' },
    ]);
}

function generateWave(count, min, max) {
    const data = [];
    let val = min + (max - min) * 0.3;
    for (let i = 0; i < count; i++) {
        val += (Math.random() - 0.45) * (max - min) * 0.08;
        val = Math.max(min, Math.min(max, val));
        data.push(Math.round(val));
    }
    return data;
}

function drawAnalyticsChart(canvasId, data, color1, color2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = canvas.parentElement.classList.contains('full-width') ? 280 * dpr : 220 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = (canvas.parentElement.classList.contains('full-width') ? 280 : 220) + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', () => { resize(); draw(1); });

    function draw(prog) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const pad = { top: 15, right: 15, bottom: 25, left: 45 };
        const cw = w - pad.left - pad.right;
        const ch = h - pad.top - pad.bottom;
        const max = Math.max(...data) * 1.15;

        // Grid
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (ch / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
            const val = max - (max / 4) * i;
            ctx.fillStyle = 'rgba(160,160,200,0.35)';
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val), pad.left - 8, y + 4);
        }
        ctx.setLineDash([]);

        const pts = data.map((v, i) => ({
            x: pad.left + (i / (data.length - 1)) * cw,
            y: pad.top + ch - (v / max) * ch * prog,
        }));

        // Fill
        const gf = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
        gf.addColorStop(0, hexToRgba(color1, 0.25 * prog));
        gf.addColorStop(1, hexToRgba(color2, 0));
        ctx.beginPath();
        ctx.moveTo(pts[0].x, h - pad.bottom);
        smoothLine(ctx, pts);
        ctx.lineTo(pts[pts.length - 1].x, h - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = gf;
        ctx.fill();

        // Line
        const gl = ctx.createLinearGradient(pad.left, 0, w - pad.right, 0);
        gl.addColorStop(0, color1);
        gl.addColorStop(1, color2);
        ctx.beginPath();
        smoothLine(ctx, pts);
        ctx.strokeStyle = gl;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        smoothLine(ctx, pts);
        ctx.strokeStyle = hexToRgba(color1, 0.2);
        ctx.lineWidth = 6;
        ctx.filter = 'blur(4px)';
        ctx.stroke();
        ctx.filter = 'none';
    }

    function smoothLine(c, pts) {
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            c.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        c.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }

    // Animate
    const t0 = performance.now();
    (function anim(now) {
        const p = Math.min((now - t0) / 1200, 1);
        draw(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(anim);
    })(t0);
}

/* Bar / Funnel chart */
function drawAnalyticsBars(canvasId, items) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const h = canvas.closest('.full-width') ? 280 : 220;
        canvas.width = rect.width * dpr;
        canvas.height = h * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', () => { resize(); draw(1); });

    function draw(prog) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const pad = { top: 15, right: 20, bottom: 36, left: 20 };
        const cw = w - pad.left - pad.right;
        const ch = h - pad.top - pad.bottom;
        const maxVal = Math.max(...items.map(d => d.value));
        const barW = Math.min(60, (cw / items.length) - 20);
        const gap = (cw - barW * items.length) / (items.length + 1);

        items.forEach((item, i) => {
            const x = pad.left + gap + i * (barW + gap);
            const barH = (item.value / maxVal) * ch * prog;
            const y = pad.top + ch - barH;

            // Bar glow
            ctx.fillStyle = hexToRgba(item.color, 0.08);
            ctx.filter = 'blur(8px)';
            roundRect(ctx, x - 4, y - 4, barW + 8, barH + 8, 8);
            ctx.fill();
            ctx.filter = 'none';

            // Bar
            const grad = ctx.createLinearGradient(0, y, 0, y + barH);
            grad.addColorStop(0, item.color);
            grad.addColorStop(1, hexToRgba(item.color, 0.5));
            ctx.fillStyle = grad;
            roundRect(ctx, x, y, barW, barH, 6);
            ctx.fill();

            // Value
            ctx.fillStyle = '#f0f0ff';
            ctx.font = '600 11px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(item.value + '%', x + barW / 2, y - 8);

            // Label
            ctx.fillStyle = 'rgba(160,160,200,0.5)';
            ctx.font = '10px Inter';
            ctx.fillText(item.label, x + barW / 2, h - pad.bottom + 18);
        });
    }

    function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }

    const t0 = performance.now();
    (function anim(now) {
        const p = Math.min((now - t0) / 1200, 1);
        draw(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(anim);
    })(t0);
}

/* Doughnut chart */
function drawAnalyticsDoughnut(canvasId, items) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 220 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '220px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', () => { resize(); draw(1); });

    const total = items.reduce((s, d) => s + d.value, 0);

    function draw(prog) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w * 0.35;
        const cy = h / 2;
        const outerR = Math.min(cx - 20, cy - 20);
        const innerR = outerR * 0.6;

        let startAngle = -Math.PI / 2;

        items.forEach((item) => {
            const angle = (item.value / total) * Math.PI * 2 * prog;

            // Glow
            ctx.beginPath();
            ctx.arc(cx, cy, outerR + 2, startAngle, startAngle + angle);
            ctx.strokeStyle = hexToRgba(item.color, 0.3);
            ctx.lineWidth = 8;
            ctx.filter = 'blur(6px)';
            ctx.stroke();
            ctx.filter = 'none';

            // Segment
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
            ctx.arc(cx, cy, innerR, startAngle + angle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            startAngle += angle;
        });

        // Center text
        ctx.fillStyle = '#f0f0ff';
        ctx.font = '700 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(total * prog), cx, cy + 4);
        ctx.fillStyle = 'rgba(160,160,200,0.5)';
        ctx.font = '10px Inter';
        ctx.fillText('TOTAL %', cx, cy + 20);

        // Legend
        const legendX = w * 0.65;
        let legendY = cy - items.length * 15;
        items.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(legendX, legendY + 5, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f0f0ff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${item.label}  ${item.value}%`, legendX + 14, legendY + 9);
            legendY += 30;
        });
    }

    const t0 = performance.now();
    (function anim(now) {
        const p = Math.min((now - t0) / 1400, 1);
        draw(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(anim);
    })(t0);
}

/* ══════════════════════════════════════════════════════
   USERS PAGE — Populate Table
   ══════════════════════════════════════════════════════ */
function initUsersPage() {
    if (!document.body.classList.contains('page-users')) return;

    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const users = [
        { name: 'Aria Starweaver', email: 'aria@nebula.io', status: 'online', role: 'admin', lastActive: '2 min ago', sessions: 342, color: '#a855f7' },
        { name: 'Kai Nebula', email: 'kai@cosmos.dev', status: 'online', role: 'editor', lastActive: '5 min ago', sessions: 218, color: '#06b6d4' },
        { name: 'Luna Eclipse', email: 'luna@stardust.co', status: 'away', role: 'editor', lastActive: '22 min ago', sessions: 156, color: '#e879f9' },
        { name: 'Orion Chase', email: 'orion@galaxy.io', status: 'online', role: 'viewer', lastActive: '1 min ago', sessions: 89, color: '#3b82f6' },
        { name: 'Nova Bright', email: 'nova@cosmic.app', status: 'offline', role: 'admin', lastActive: '3 hours ago', sessions: 467, color: '#ec4899' },
        { name: 'Zephyr Comet', email: 'zephyr@astro.net', status: 'online', role: 'editor', lastActive: '8 min ago', sessions: 201, color: '#a855f7' },
        { name: 'Celeste Moon', email: 'celeste@orbit.dev', status: 'away', role: 'viewer', lastActive: '45 min ago', sessions: 73, color: '#06b6d4' },
        { name: 'Atlas Void', email: 'atlas@darkm.io', status: 'offline', role: 'viewer', lastActive: '1 day ago', sessions: 42, color: '#e879f9' },
        { name: 'Vega Pulsar', email: 'vega@quasar.io', status: 'online', role: 'admin', lastActive: 'Just now', sessions: 589, color: '#a855f7' },
        { name: 'Sirius Flux', email: 'sirius@warp.dev', status: 'online', role: 'editor', lastActive: '12 min ago', sessions: 167, color: '#3b82f6' },
    ];

    users.forEach((u, i) => {
        const initials = u.name.split(' ').map(w => w[0]).join('');
        const tr = document.createElement('tr');
        tr.style.animation = `fadeSlideIn 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s both`;
        tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm" style="background: ${u.color}">${initials}</div>
          <div class="user-name-col">
            <strong>${u.name}</strong>
            <span>${u.email}</span>
          </div>
        </div>
      </td>
      <td><span class="status-badge ${u.status}">${u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td>
      <td><span class="role-tag ${u.role}">${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span></td>
      <td>${u.lastActive}</td>
      <td>${u.sessions.toLocaleString()}</td>
    `;
        tbody.appendChild(tr);
    });
}

/* ══════════════════════════════════════════════════════
   SETTINGS PAGE — Sidebar Navigation
   ══════════════════════════════════════════════════════ */
function initSettingsPage() {
    if (!document.body.classList.contains('page-settings')) return;

    const links = document.querySelectorAll('.settings-sidebar a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Save button
    const saveBtn = document.querySelector('.cosmic-btn.primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Saved!';
            saveBtn.style.background = 'linear-gradient(135deg, #34d399, #06b6d4)';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 2000);
        });
    }
}

/* ══════════════════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════════════════ */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
