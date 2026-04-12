// ── CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) *.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, .project-item, .theme-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursor.style.background = 'var(--accent-warm)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursor.style.background = 'var(--ember)';
  });
});

// ── CANVAS: Mathematical curves
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let t = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── STAR CONSTELLATION ANIMATION
const STAR_COUNT = 85;
const CONNECT_DIST = 130;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.15,
  vy: (Math.random() - 0.5) * 0.15,
  r: Math.random() * 1.2 + 0.4,
  pulse: Math.random() * Math.PI * 2,
  isAnchor: false,
}));

// Make some nodes brighter anchor points
[0, 8, 17, 26, 38, 51, 64, 73].forEach(i => {
  if (stars[i]) { stars[i].r = 2.4; stars[i].isAnchor = true; }
});

function drawCurves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const now = performance.now() * 0.001;

  // Drift stars
  stars.forEach(s => {
    s.x += s.vx; s.y += s.vy;
    if (s.x < -10) s.x = canvas.width + 10;
    if (s.x > canvas.width + 10) s.x = -10;
    if (s.y < -10) s.y = canvas.height + 10;
    if (s.y > canvas.height + 10) s.y = -10;
    s.pulse += 0.008;
  });

  // Draw edges
  for (let i = 0; i < STAR_COUNT; i++) {
    for (let j = i + 1; j < STAR_COUNT; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < CONNECT_DIST) {
        const alpha = (1 - d / CONNECT_DIST) * 0.2;
        ctx.beginPath();
        ctx.strokeStyle = d < 65
          ? `rgba(62,207,170,${alpha})`
          : `rgba(155,111,212,${alpha * 0.8})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  stars.forEach(s => {
    const pr = s.r + Math.sin(s.pulse + now) * 0.35;
    if (s.isAnchor) {
      // Soft glow ring
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, pr * 6);
      grd.addColorStop(0, 'rgba(62,207,170,0.15)');
      grd.addColorStop(1, 'rgba(62,207,170,0)');
      ctx.beginPath();
      ctx.arc(s.x, s.y, pr * 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = s.isAnchor
      ? `rgba(100,220,200,0.95)`
      : `rgba(180,230,240,0.5)`;
    ctx.fill();
  });

  t += 0.004;
  requestAnimationFrame(drawCurves);
}
drawCurves();

// ── RECENT WIDGET: appear after hero, hide after about
const widget = document.getElementById('recent-widget');
const heroSection = document.getElementById('hero');
const aboutSection = document.getElementById('about');
const researchSection = document.getElementById('research');

function updateWidget() {
  // Respect the close button: once dismissed, never re-show
  if (widget.dataset.dismissed === '1') return;
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  const researchTop = researchSection.getBoundingClientRect().top;
  const windowH = window.innerHeight;

  // Show when hero scrolls out of view
  const shouldShow = heroBottom < windowH * 0.3 && researchTop > windowH * 0.5;
  widget.classList.toggle('visible', shouldShow);
}

window.addEventListener('scroll', updateWidget, { passive: true });
// ── SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));