/* ======================================================
   COSMIC MAGIC DASHBOARD — App Logic
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initSidebar();
  initKPICounters();
  initChart();
  initActivityFeed();
  initCardTilt();
});

/* ══════════════════════════════════════════════════════
   1. ANIMATED STARFIELD
   ══════════════════════════════════════════════════════ */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 220;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create stars
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.7 ? (Math.random() > 0.5 ? 270 : 190) : 0,
    });
  }

  // Shooting stars
  let shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.008) {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.4,
        len: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 4,
        alpha: 1,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;

    // Draw twinkling stars
    stars.forEach(s => {
      const twinkle = Math.sin(time * s.speed * 600 + s.phase) * 0.5 + 0.5;
      const a = s.alpha * 0.3 + twinkle * 0.7;
      if (s.hue > 0) {
        ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${a * 0.8})`;
      } else {
        ctx.fillStyle = `rgba(220, 220, 255, ${a})`;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glow for larger stars
      if (s.radius > 1.2) {
        ctx.fillStyle = s.hue > 0
          ? `hsla(${s.hue}, 80%, 75%, ${a * 0.15})`
          : `rgba(200, 200, 255, ${a * 0.12})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Shooting stars
    spawnShootingStar();
    shootingStars = shootingStars.filter(ss => {
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.015;

      if (ss.alpha <= 0) return false;

      const grad = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      grad.addColorStop(0, `rgba(200, 180, 255, ${ss.alpha})`);
      grad.addColorStop(1, `rgba(200, 180, 255, 0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      ctx.stroke();

      return ss.x < canvas.width + 50 && ss.y < canvas.height + 50;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ══════════════════════════════════════════════════════
   2. SIDEBAR TOGGLE
   ══════════════════════════════════════════════════════ */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const wrapper = document.getElementById('main-wrapper');

  toggle.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    }
  });

  // Close mobile sidebar on outside click
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768
      && sidebar.classList.contains('mobile-open')
      && !sidebar.contains(e.target)
      && !toggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  // Nav item click
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   3. KPI COUNTER ANIMATION
   ══════════════════════════════════════════════════════ */
function initKPICounters() {
  const kpiValues = document.querySelectorAll('.kpi-value');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  kpiValues.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals) || 0;
  const suffix = el.dataset.suffix || '';
  const isRevenue = el.closest('#kpi-revenue') !== null;
  const prefix = isRevenue ? '$' : '';
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out expo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = target * ease;

    if (decimals > 0) {
      el.textContent = prefix + current.toFixed(decimals) + suffix;
    } else {
      el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════════════
   4. CHART (Pure Canvas — no dependencies)
   ══════════════════════════════════════════════════════ */
function initChart() {
  const canvas = document.getElementById('main-chart');
  const ctx = canvas.getContext('2d');
  let animProgress = 0;
  let currentData = null;
  let hoveredPoint = -1;

  const datasets = {
    '7d':  [420, 580, 510, 720, 650, 810, 780],
    '30d': [320, 380, 410, 550, 480, 620, 570, 690, 640, 780, 720, 850, 800, 910, 870, 950, 900, 980, 940, 1020, 990, 1100, 1050, 1150, 1120, 1200, 1180, 1250, 1220, 1300],
    '90d': generateData(90, 300, 1400),
    '1y':  generateData(52, 200, 1600),
  };

  const labels = {
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30d': Array.from({length: 30}, (_, i) => `${i + 1}`),
    '90d': Array.from({length: 90}, (_, i) => (i % 7 === 0) ? `W${Math.floor(i/7)+1}` : ''),
    '1y':  ['J','F','M','A','M','J','J','A','S','O','N','D'].flatMap(m => [m,'','','','']).slice(0, 52),
  };

  function generateData(count, min, max) {
    const data = [];
    let val = min + (max - min) * 0.3;
    for (let i = 0; i < count; i++) {
      val += (Math.random() - 0.45) * (max - min) * 0.08;
      val = Math.max(min, Math.min(max, val));
      data.push(Math.round(val));
    }
    return data;
  }

  function setData(range) {
    currentData = datasets[range];
    animProgress = 0;
    animateChart();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (currentData) drawChart(1);
  }

  window.addEventListener('resize', resize);

  function drawChart(progress) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    if (!currentData || currentData.length === 0) return;

    const padding = { top: 20, right: 20, bottom: 40, left: 55 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const max = Math.max(...currentData) * 1.15;
    const min = 0;
    const range = max - min;

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = max - (range / gridLines) * i;
      ctx.fillStyle = 'rgba(160, 160, 200, 0.45)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val), padding.left - 10, y + 4);
    }
    ctx.setLineDash([]);

    // X-axis labels
    const currentLabels = labels[getCurrentRange()];
    const step = Math.max(1, Math.floor(currentData.length / 12));
    ctx.fillStyle = 'rgba(160, 160, 200, 0.4)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    for (let i = 0; i < currentData.length; i += step) {
      const x = padding.left + (i / (currentData.length - 1)) * chartW;
      const label = currentLabels && currentLabels[i] ? currentLabels[i] : '';
      if (label) ctx.fillText(label, x, h - padding.bottom + 22);
    }

    // Build points
    const points = currentData.map((val, i) => ({
      x: padding.left + (i / (currentData.length - 1)) * chartW,
      y: padding.top + chartH - ((val - min) / range) * chartH * progress,
    }));

    // Gradient fill
    const gradFill = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradFill.addColorStop(0, `rgba(168, 85, 247, ${0.25 * progress})`);
    gradFill.addColorStop(0.5, `rgba(6, 182, 212, ${0.12 * progress})`);
    gradFill.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding.bottom);
    drawSmoothLine(ctx, points);
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradFill;
    ctx.fill();

    // Line
    const gradLine = ctx.createLinearGradient(padding.left, 0, w - padding.right, 0);
    gradLine.addColorStop(0, '#a855f7');
    gradLine.addColorStop(0.5, '#06b6d4');
    gradLine.addColorStop(1, '#e879f9');

    ctx.beginPath();
    drawSmoothLine(ctx, points);
    ctx.strokeStyle = gradLine;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Line glow
    ctx.beginPath();
    drawSmoothLine(ctx, points);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 6;
    ctx.filter = 'blur(4px)';
    ctx.stroke();
    ctx.filter = 'none';

    // Data points (show only a subset for readability)
    const pointStep = Math.max(1, Math.floor(currentData.length / 14));
    points.forEach((p, i) => {
      if (i % pointStep !== 0 && i !== hoveredPoint) return;

      const isHovered = i === hoveredPoint;
      const radius = isHovered ? 6 : 3.5;
      const glowRadius = isHovered ? 16 : 8;

      // Pulsing glow
      const pulsePhase = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;

      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${0.15 * pulsePhase * progress})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#e879f9' : '#a855f7';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tooltip on hover
      if (isHovered) {
        const val = currentData[i];
        const text = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toString();
        ctx.font = '600 12px Orbitron';
        const tw = ctx.measureText(text).width;
        const tooltipW = tw + 20;
        const tooltipH = 30;
        let tx = p.x - tooltipW / 2;
        let ty = p.y - 42;
        if (ty < 5) ty = p.y + 18;
        if (tx < 5) tx = 5;
        if (tx + tooltipW > w - 5) tx = w - tooltipW - 5;

        ctx.fillStyle = 'rgba(14, 16, 35, 0.9)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1;
        roundRect(ctx, tx, ty, tooltipW, tooltipH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e879f9';
        ctx.textAlign = 'center';
        ctx.fillText(text, tx + tooltipW / 2, ty + 19);
        ctx.textAlign = 'start';
      }
    });
  }

  function drawSmoothLine(ctx, points) {
    if (points.length < 2) return;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function getCurrentRange() {
    const activeBtn = document.querySelector('.chart-btn.active');
    return activeBtn ? activeBtn.dataset.range : '7d';
  }

  // Hover detection
  canvas.addEventListener('mousemove', (e) => {
    if (!currentData) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const w = rect.width;
    const padding = { left: 55, right: 20 };
    const chartW = w - padding.left - padding.right;
    const relX = mx - padding.left;
    const index = Math.round((relX / chartW) * (currentData.length - 1));
    hoveredPoint = (index >= 0 && index < currentData.length) ? index : -1;
    drawChart(animProgress);
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredPoint = -1;
    if (currentData) drawChart(animProgress);
  });

  // Animate chart draw
  function animateChart() {
    const startTime = performance.now();
    const duration = 1200;

    function tick(now) {
      const elapsed = now - startTime;
      animProgress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - animProgress, 3);
      drawChart(ease);
      if (animProgress < 1) requestAnimationFrame(tick);
      else animProgress = 1;
    }
    requestAnimationFrame(tick);
  }

  // Button click handlers
  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setData(btn.dataset.range);
    });
  });

  // Init
  resize();
  setData('7d');

  // Continuous redraw for pulsing points
  function renderLoop() {
    if (currentData && animProgress >= 1) drawChart(1);
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}

/* ══════════════════════════════════════════════════════
   5. ACTIVITY FEED
   ══════════════════════════════════════════════════════ */
function initActivityFeed() {
  const feed = document.getElementById('activity-feed');
  const activities = [
    { color: 'purple',  text: '<strong>Nova Project</strong> deployment completed successfully', time: '2 min ago' },
    { color: 'cyan',    text: '<strong>Stellar User</strong> joined the galaxy cluster', time: '8 min ago' },
    { color: 'magenta', text: 'Revenue milestone of <strong>$250K</strong> reached 🎉', time: '15 min ago' },
    { color: 'pink',    text: '<strong>API Gateway</strong> response time improved by 32%', time: '28 min ago' },
    { color: 'cyan',    text: 'New cosmic report generated for <strong>Q4 Analytics</strong>', time: '42 min ago' },
    { color: 'purple',  text: '<strong>Nebula Cache</strong> cleared and optimized', time: '1 hr ago' },
    { color: 'magenta', text: 'User engagement up <strong>18%</strong> across all dimensions', time: '1.5 hr ago' },
    { color: 'cyan',    text: '<strong>Dark Matter DB</strong> migration completed', time: '2 hr ago' },
  ];

  activities.forEach((act, i) => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.animationDelay = `${i * 0.07}s`;
    item.innerHTML = `
      <div class="activity-dot ${act.color}"></div>
      <div class="activity-body">
        <span class="activity-text">${act.text}</span>
        <span class="activity-time">${act.time}</span>
      </div>
    `;
    feed.appendChild(item);
  });
}

/* ══════════════════════════════════════════════════════
   6. 3D TILT ON KPI CARDS
   ══════════════════════════════════════════════════════ */
function initCardTilt() {
  const cards = document.querySelectorAll('.kpi-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // 0..width
      const y = e.clientY - rect.top;  // 0..height
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6; // tilt up/down
      const rotateY = ((x - cx) / cx) * 6;  // tilt left/right

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}
