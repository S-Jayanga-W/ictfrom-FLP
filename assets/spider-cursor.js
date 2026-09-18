/* =========================================================
   SPIDER-WEB CURSOR EFFECT
   ictfrom | FLP — red/white theme
   - Threads connect near the mouse pointer (web network)
   - Click / tap fires a "web-shoot" line (Spider-Man style)
   Drop this file in /assets/spider-cursor.js and add
   <script src="assets/spider-cursor.js"></script>
   right before </body> on every page.
   ========================================================= */
(function () {
  "use strict";

  // Respect users who prefer reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const RED = "230,35,30";   // matches --red in site CSS
  const WHITE = "245,245,245";

  const canvas = document.createElement("canvas");
  canvas.id = "spider-cursor-fx";
  canvas.style.cssText = `
    position:fixed; inset:0; width:100%; height:100%;
    pointer-events:none; z-index:99998; display:block;
  `;
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(canvas));
  if (document.body) document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------------- pointer tracking ----------------
  const pointer = { x: W / 2, y: H / 2, active: false };
  let lastMove = 0;

  function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    lastMove = performance.now();
  }
  window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // ---------------- floating web nodes (network around cursor) ----------------
  const NODE_COUNT = window.innerWidth < 700 ? 16 : 28;
  const LINK_DIST = 130;
  const CURSOR_LINK_DIST = 190;
  const nodes = [];

  function makeNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6
    };
  }
  for (let i = 0; i < NODE_COUNT; i++) nodes.push(makeNode());

  // ---------------- click web-shoot lines ----------------
  const shots = []; // {fromX, fromY, toX, toY, t, dur}

  function fireWebShot(x, y) {
    // shoot from the two nearest screen corners (like two wrists), spidey-style
    const corners = [
      { x: 0, y: 0 }, { x: W, y: 0 }, { x: 0, y: H }, { x: W, y: H }
    ];
    corners.sort((a, b) => dist(a, { x, y }) - dist(b, { x, y }));
    const origin = corners[0];

    shots.push({
      fromX: origin.x, fromY: origin.y,
      toX: x, toY: y,
      start: performance.now(),
      dur: 260
    });

    // little impact burst
    shots.push({ burst: true, x, y, start: performance.now(), dur: 420 });
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  window.addEventListener("click", (e) => fireWebShot(e.clientX, e.clientY));
  window.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) fireWebShot(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // ---------------- draw loop ----------------
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // idle fade: if mouse hasn't moved in a while, ease pointer influence down
    const idleFor = now - lastMove;
    const cursorAlpha = pointer.active ? Math.max(0, 1 - idleFor / 4000) : 0;

    // update + draw nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${WHITE},0.35)`;
      ctx.fill();
    }

    // node-to-node web threads
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = dist(a, b);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${WHITE},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // node-to-cursor web threads (the spider-web-follows-mouse part)
    if (cursorAlpha > 0) {
      for (const n of nodes) {
        const d = dist(n, pointer);
        if (d < CURSOR_LINK_DIST) {
          const alpha = (1 - d / CURSOR_LINK_DIST) * 0.55 * cursorAlpha;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(${RED},${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      // cursor glow node
      const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 22);
      g.addColorStop(0, `rgba(${RED},${0.55 * cursorAlpha})`);
      g.addColorStop(1, `rgba(${RED},0)`);
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(pointer.x, pointer.y, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RED},${0.9 * cursorAlpha})`;
      ctx.fill();
    }

    // click web-shoot lines + burst
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      const t = (now - s.start) / s.dur;
      if (t >= 1) { shots.splice(i, 1); continue; }

      if (s.burst) {
        const rad = 4 + t * 26;
        const alpha = (1 - t) * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RED},${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // small radiating strands
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2;
          const len = rad * 0.9;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + Math.cos(ang) * len, s.y + Math.sin(ang) * len);
          ctx.strokeStyle = `rgba(${WHITE},${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        const ease = 1 - Math.pow(1 - Math.min(t * 1.4, 1), 3);
        const cx = s.fromX + (s.toX - s.fromX) * ease;
        const cy = s.fromY + (s.toY - s.fromY) * ease;
        const alpha = 1 - t;

        ctx.beginPath();
        ctx.moveTo(s.fromX, s.fromY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `rgba(${RED},${alpha * 0.9})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${WHITE},${alpha})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
