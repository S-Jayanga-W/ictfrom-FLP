/* =========================================================
   SPIDER-WEB CURSOR EFFECT
   ictfrom | FLP — red/white theme
   - Threads connect near the mouse pointer (web network)
   - Click / tap: a spider drops down on a thread from the
     top of the screen to the click point, hangs a moment,
     then climbs back up.
   Drop this file in /assets/spider-cursor.js and add
   <script src="assets/spider-cursor.js"></script>
   (or "../../assets/spider-cursor.js" from a nested page)
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

  // ---------------- floating ambient web nodes (background decoration) ----------------
  const NODE_COUNT = window.innerWidth < 700 ? 16 : 28;
  const LINK_DIST = 130;
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

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // ---------------- click: spider drops down on a thread ----------------
  const spiders = []; // active drop-in spiders

  function fireSpiderDrop(x, y) {
    // cap concurrent spiders so rapid clicking doesn't pile up
    if (spiders.length >= 4) spiders.shift();

    spiders.push({
      x: x,
      targetY: y,
      dropStart: performance.now(),
      dropDur: 420 + Math.random() * 120,
      holdDur: 480 + Math.random() * 260,
      retractDur: 340,
      swingSeed: Math.random() * Math.PI * 2,
      phase: "drop" // drop -> hold -> retract -> done
    });
  }

  window.addEventListener("click", (e) => fireSpiderDrop(e.clientX, e.clientY));
  window.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) fireSpiderDrop(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t) { return t * t * t; }

  // small decorative web anchor, drawn once at the top of each thread
  function drawWebAnchor(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = `rgba(${WHITE},0.8)`;
    ctx.lineWidth = 1 * scale;
    ctx.lineCap = "round";
    const R = 11 * scale;
    const spokes = 6;
    // radial spokes
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.55 - R * 0.15);
      ctx.stroke();
    }
    // concentric rings
    for (let ring = 1; ring <= 2; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        const rr = R * (ring / 2);
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr * 0.55 - R * 0.15 * (ring / 2);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // a proper hanging spider: glossy red body + 8 long splayed legs,
  // styled after a classic dangling-spider silhouette
  function drawSpider(cx, cy, scale, swing) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(swing * 0.3);

    const legColor = `rgba(${RED},0.95)`;

    // legs: 4 pairs, each a 3-segment bent line that splays outward then
    // curls slightly inward at the foot, like the reference dangling pose
    ctx.strokeStyle = legColor;
    ctx.lineCap = "round";
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const spread = (i + 1) / 4;               // 0.25 -> 1
        const upBias = i < 2 ? 1 : -0.4;           // front legs angle up, back legs angle down
        const hipX = side * 2.2 * scale;
        const hipY = -1 * scale + i * 2.6 * scale;

        const kneeX = side * (10 + spread * 6) * scale;
        const kneeY = hipY - 3 * scale * upBias * 0.5;

        const footX = side * (7 + spread * 4) * scale;
        const footY = kneeY + (9 + spread * 5) * scale;

        ctx.lineWidth = (2.1 - i * 0.25) * scale;
        ctx.beginPath();
        ctx.moveTo(hipX * 0.3, hipY);
        ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
        ctx.stroke();
      }
    }

    // cephalothorax + abdomen as one glossy teardrop body
    const bodyGrad = ctx.createRadialGradient(-1.5 * scale, -2 * scale, 0.6 * scale, 0, 2 * scale, 9 * scale);
    bodyGrad.addColorStop(0, "rgba(255,140,120,1)");
    bodyGrad.addColorStop(0.45, `rgba(${RED},1)`);
    bodyGrad.addColorStop(1, "rgba(150,15,12,1)");

    ctx.beginPath();
    ctx.ellipse(0, 3.5 * scale, 4.6 * scale, 6.4 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -3.2 * scale, 3.4 * scale, 3.7 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // subtle highlight for the glossy look
    ctx.beginPath();
    ctx.ellipse(-1.4 * scale, -3.6 * scale, 1.1 * scale, 1.5 * scale, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();

    ctx.restore();
  }

  // ---------------- draw loop ----------------
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // update + draw ambient web nodes
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

    // ---- click spiders: drop from top, hang & swing, climb back up ----
    for (let i = spiders.length - 1; i >= 0; i--) {
      const s = spiders[i];
      const topY = -18;

      if (s.phase === "drop") {
        const t = Math.min((now - s.dropStart) / s.dropDur, 1);
        s.spiderY = topY + (s.targetY - topY) * easeOutCubic(t);
        if (t >= 1) {
          s.phase = "hold";
          s.holdStart = now;
          s.spiderY = s.targetY;
        }
      } else if (s.phase === "hold") {
        s.spiderY = s.targetY;
        if (now - s.holdStart >= s.holdDur) {
          s.phase = "retract";
          s.retractStart = now;
        }
      } else if (s.phase === "retract") {
        const t = Math.min((now - s.retractStart) / s.retractDur, 1);
        s.spiderY = s.targetY + (topY - s.targetY) * easeInCubic(t);
        if (t >= 1) {
          spiders.splice(i, 1);
          continue;
        }
      }

      // gentle pendulum swing, stronger while hanging, settling over time
      const elapsed = (now - s.dropStart) / 1000;
      const swingDamp = s.phase === "retract" ? 0.15 : Math.max(0.15, 1 - elapsed * 0.6);
      const swing = Math.sin(elapsed * 4.5 + s.swingSeed) * 0.5 * swingDamp;
      const swingX = s.x + swing * 14;

      // thread
      ctx.beginPath();
      ctx.moveTo(s.x + swing * 2, topY);
      ctx.lineTo(swingX, s.spiderY);
      ctx.strokeStyle = `rgba(${WHITE},0.55)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // small web anchor where the thread meets the top of the screen
      const anchorFade = Math.min((now - s.dropStart) / 200, 1);
      ctx.globalAlpha = anchorFade * (s.phase === "retract" ? 1 - (now - s.retractStart) / s.retractDur : 1);
      drawWebAnchor(s.x + swing * 2, topY + 8, 1.1);
      ctx.globalAlpha = 1;

      // fade spider in/out slightly at the very start/end
      const fadeIn = s.phase === "drop" ? Math.min((now - s.dropStart) / 120, 1) : 1;
      ctx.globalAlpha = fadeIn;
      drawSpider(swingX, s.spiderY, 2, swing);
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
