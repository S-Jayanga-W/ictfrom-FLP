/* =========================================================
   SHOOT CURSOR EFFECT
   ictfrom | FLP — red/white theme
   - Click / tap: a tracer bullet is fired from the bottom of
     the screen to the click point. On impact: flash, shockwave
     ring, flying sparks and a web-like bullet-hole crack that
     fades away.
   - Links: navigation is delayed briefly so the shot is seen.
   - Same helper as before: window.FLP_spiderNavigate(url, ev)
   Usage: <script src="assets/shoot-cursor.js"></script>
   right before </body>.
   ========================================================= */
(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const RED = "230,35,30";
  const WHITE = "245,245,245";

  const canvas = document.createElement("canvas");
  canvas.id = "shoot-cursor-fx";
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99998;display:block;";
  function attach() {
    if (!canvas.parentNode) document.body.appendChild(canvas);
  }
  if (document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);

  const ctx = canvas.getContext("2d");
  let W, H, DPR;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------------- state ----------------
  const bullets = [];  // tracer in flight
  const impacts = [];  // flash + ring + crack
  const sparks = [];   // flying particles
  const MAX_SHOTS = 12;

  const BULLET_SPEED = 2600; // px per second
  const TRAIL_LEN = 140;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function fireShot(x, y) {
    if (bullets.length >= MAX_SHOTS) bullets.shift();
    // muzzle at bottom of the screen, a bit off-centre so it feels natural
    const ox = W / 2 + rand(-W * 0.12, W * 0.12);
    const oy = H + 10;
    const dx = x - ox, dy = y - oy;
    const len = Math.hypot(dx, dy) || 1;
    bullets.push({
      ox, oy, x: ox, y: oy, tx: x, ty: y,
      ux: dx / len, uy: dy / len,
      len, travelled: 0,
      muzzleT: performance.now()
    });
  }

  function spawnImpact(x, y, ux, uy, now) {
    // web-like crack lines: radial spokes with a couple of jagged rings
    const spokes = Math.floor(rand(7, 10));
    const cracks = [];
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + rand(-0.2, 0.2);
      const L = rand(22, 46);
      // jagged path along the spoke
      const pts = [];
      const steps = 3;
      for (let s = 1; s <= steps; s++) {
        const r = (L * s) / steps;
        const jitter = rand(-0.12, 0.12);
        pts.push([Math.cos(a + jitter) * r, Math.sin(a + jitter) * r]);
      }
      cracks.push(pts);
    }
    impacts.push({ x, y, t0: now, cracks, life: 1500 });

    // sparks
    const n = 22;
    for (let i = 0; i < n; i++) {
      // spray mostly back toward where the bullet came from
      const a = Math.atan2(-uy, -ux) + rand(-1.5, 1.5);
      const sp = rand(80, 380);
      sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(300, 700),
        t0: now,
        red: Math.random() < 0.6
      });
    }
  }

  // ---------------- click handling ----------------
  const NAV_DELAY = 700;

  function handleActivate(x, y, e) {
    if (e.__flpHandled) return;
    fireShot(x, y);

    const link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    const h = href ? href.trim().toLowerCase() : "";
    const isHash = h.startsWith("#");
    const isJs = h.startsWith("javascript:");
    const newTab = link.target && link.target !== "_self";
    const isDownload = link.hasAttribute("download");
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0);
    if (!href || isHash || isJs || newTab || isDownload || modified) return;

    e.preventDefault();
    setTimeout(() => { window.location.href = href; }, NAV_DELAY);
  }
  window.addEventListener("click", (e) => handleActivate(e.clientX, e.clientY, e));

  // ---------------- draw ----------------
  let last = performance.now();

  function draw(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";

    // ---- bullets ----
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.travelled += BULLET_SPEED * dt;
      const done = b.travelled >= b.len;
      const d = Math.min(b.travelled, b.len);
      b.x = b.ox + b.ux * d;
      b.y = b.oy + b.uy * d;

      // muzzle flash (first ~90ms)
      const mt = now - b.muzzleT;
      if (mt < 90) {
        const a = 1 - mt / 90;
        const g = ctx.createRadialGradient(b.ox, H, 0, b.ox, H, 46);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
        g.addColorStop(0.4, `rgba(${RED},${0.6 * a})`);
        g.addColorStop(1, `rgba(${RED},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.ox, H, 46, 0, Math.PI * 2);
        ctx.fill();
      }

      // tracer streak: red tail -> white hot tip
      const tailD = Math.max(0, d - TRAIL_LEN);
      const tx = b.ox + b.ux * tailD;
      const ty = b.oy + b.uy * tailD;
      const grad = ctx.createLinearGradient(tx, ty, b.x, b.y);
      grad.addColorStop(0, `rgba(${RED},0)`);
      grad.addColorStop(0.7, `rgba(${RED},0.8)`);
      grad.addColorStop(1, `rgba(${WHITE},1)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // glowing tip
      const tip = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 8);
      tip.addColorStop(0, "rgba(255,255,255,1)");
      tip.addColorStop(1, `rgba(${RED},0)`);
      ctx.fillStyle = tip;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fill();

      if (done) {
        spawnImpact(b.tx, b.ty, b.ux, b.uy, now);
        bullets.splice(i, 1);
      }
    }

    // ---- impacts: flash, shockwave ring, crack ----
    for (let i = impacts.length - 1; i >= 0; i--) {
      const m = impacts[i];
      const age = now - m.t0;
      if (age > m.life) { impacts.splice(i, 1); continue; }

      // flash (first 120ms)
      if (age < 120) {
        const a = 1 - age / 120;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 34);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(0.5, `rgba(${RED},${0.6 * a})`);
        g.addColorStop(1, `rgba(${RED},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 34, 0, Math.PI * 2);
        ctx.fill();
      }

      // shockwave ring (first 450ms)
      if (age < 450) {
        const t = age / 450;
        ctx.strokeStyle = `rgba(${WHITE},${0.7 * (1 - t)})`;
        ctx.lineWidth = 2 * (1 - t) + 0.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6 + t * 46, 0, Math.PI * 2);
        ctx.stroke();
      }

      // crack: grows fast in first 150ms, then fades over the rest
      const grow = Math.min(age / 150, 1);
      const fade = age < 400 ? 1 : 1 - (age - 400) / (m.life - 400);
      ctx.strokeStyle = `rgba(${WHITE},${0.8 * fade})`;
      ctx.lineWidth = 1;
      for (const pts of m.cracks) {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        for (const p of pts) ctx.lineTo(m.x + p[0] * grow, m.y + p[1] * grow);
        ctx.stroke();
      }
      // connecting web ring through the crack midpoints
      ctx.strokeStyle = `rgba(${RED},${0.7 * fade})`;
      ctx.beginPath();
      m.cracks.forEach((pts, k) => {
        const p = pts[1];
        const px = m.x + p[0] * grow, py = m.y + p[1] * grow;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();

      // bullet hole dot
      ctx.fillStyle = `rgba(${RED},${fade})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- sparks ----
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const age = now - s.t0;
      if (age > s.life) { sparks.splice(i, 1); continue; }
      s.vy += 520 * dt; // gravity
      const px = s.x, py = s.y;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const a = 1 - age / s.life;
      ctx.strokeStyle = `rgba(${s.red ? RED : WHITE},${a})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  // ---------------- public helper (same name as the spider version) ----------------
  window.FLP_spiderNavigate = function (url, evOrX, maybeY) {
    let x, y;
    if (typeof evOrX === "object" && evOrX !== null) {
      x = evOrX.clientX;
      y = evOrX.clientY;
      try { evOrX.__flpHandled = true; } catch (e) {}
    } else {
      x = evOrX;
      y = maybeY;
    }
    if (typeof x !== "number" || typeof y !== "number") { x = W / 2; y = H / 3; }
    fireShot(x, y);
    setTimeout(() => { window.location.href = url; }, NAV_DELAY);
  };
  window.FLP_shootNavigate = window.FLP_spiderNavigate;

  requestAnimationFrame(draw);
})();
