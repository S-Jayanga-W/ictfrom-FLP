/**
 * ictfrom AI Assistant — floating chat widget
 * ---------------------------------------------------------------
 * Add this ONE line to every page (before </body>), and it works everywhere:
 *
 *   <script src="assets/ai-widget.js"></script>
 *
 * Before using: deploy worker.js to Cloudflare Workers (see its own comments),
 * then paste your worker's URL below into WORKER_URL.
 */

const WORKER_URL = "https://calm-hall-4de2ictfrom-worker.sithijawa2009.workers.dev";

(function () {
  if (document.getElementById("flp-ai-widget-root")) return; // avoid double-init

  const style = document.createElement("style");
  style.textContent = `
    #flp-ai-widget-root{
      position:fixed; right:18px; bottom:18px; z-index:9999;
      font-family:'Consolas','Courier New',monospace;
    }
    #flp-ai-fab{
      width:68px; height:68px; border-radius:50%;
      background:radial-gradient(circle at 32% 28%, #1c1414, #0a0808);
      border:1px solid rgba(230,35,30,.45);
      cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 10px 30px -8px rgba(229,18,26,.55), 0 0 0 0 rgba(229,18,26,.4);
      transition:transform .2s, box-shadow .25s;
    }
    #flp-ai-fab:hover{
      transform:scale(1.07);
      box-shadow:0 12px 34px -6px rgba(229,18,26,.75);
    }
    #flp-ai-fab svg{ width:34px; height:34px; display:block; }
    #flp-ai-panel{
      position:absolute; right:0; bottom:84px;
      width:340px; max-width:88vw; height:460px; max-height:70vh;
      background:#141110; border:1px solid #2a2422; border-radius:14px;
      display:none; flex-direction:column; overflow:hidden;
      box-shadow:0 20px 50px -15px rgba(0,0,0,.8);
      animation:flpFadeUp .25s ease;
    }
    @keyframes flpFadeUp{ from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }
    #flp-ai-panel.open{ display:flex; }
    #flp-ai-head{
      padding:12px 14px; border-bottom:1px solid #2a2422;
      display:flex; align-items:center; justify-content:space-between;
      background:rgba(229,18,26,.06);
    }
    #flp-ai-head .t{
      color:#f5f5f5; font-size:13px; font-weight:700; letter-spacing:.5px;
      display:flex; align-items:center; gap:8px;
    }
    #flp-ai-head .t span{ color:#e5121a; }
    #flp-ai-head .t svg{ width:15px; height:15px; flex-shrink:0; }
    #flp-ai-close{ background:none; border:none; color:#8a8a8a; font-size:16px; cursor:pointer; }
    #flp-ai-body{
      flex:1; overflow-y:auto; padding:12px 14px; display:flex; flex-direction:column; gap:10px;
    }
    .flp-msg{ font-size:12.5px; line-height:1.6; max-width:88%; padding:8px 11px; border-radius:10px; white-space:pre-wrap; }
    .flp-msg.bot{ background:#1b1615; color:#f5f5f5; align-self:flex-start; border:1px solid #2a2422; }
    .flp-msg.user{ background:#e5121a; color:#fff; align-self:flex-end; }
    .flp-msg.typing{ color:#8a8a8a; font-style:italic; }
    #flp-ai-inputRow{
      display:flex; gap:8px; padding:10px; border-top:1px solid #2a2422;
    }
    #flp-ai-input{
      flex:1; background:#1b1615; border:1px solid #2a2422; border-radius:8px;
      color:#f5f5f5; font-family:inherit; font-size:12.5px; padding:9px 10px; outline:none;
    }
    #flp-ai-input:focus{ border-color:#7a0c11; }
    #flp-ai-send{
      background:#e5121a; color:#fff; border:none; border-radius:8px;
      padding:0 14px; font-size:12px; font-weight:700; cursor:pointer;
    }
    #flp-ai-send:disabled{ opacity:.5; cursor:not-allowed; }
  `;
  document.head.appendChild(style);

  // Reusable "AI sparkle" icon — a 4-point glint/star, filled with a
  // red gradient, standing in for the old 💬 emoji. Generic "auto-awesome"
  // style sparkle shape, not any brand's specific logo mark.
  const sparkleSvg = (gradientId) => `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff6a5e"/>
          <stop offset="55%" stop-color="#e6231e"/>
          <stop offset="100%" stop-color="#8f0f0c"/>
        </linearGradient>
      </defs>
      <path fill="url(#${gradientId})" d="M11.5 2.5c.35 2.6 1.02 4.42 2 5.4.98.98 2.8 1.65 5.4 2-2.6.35-4.42 1.02-5.4 2-.98.98-1.65 2.8-2 5.4-.35-2.6-1.02-4.42-2-5.4-.98-.98-2.8-1.65-5.4-2 2.6-.35 4.42-1.02 5.4-2 .98-.98 1.65-2.8 2-5.4z"/>
      <path fill="url(#${gradientId})" opacity="0.85" d="M18.3 15.2c.16 1.15.45 1.95.88 2.38.43.43 1.23.72 2.38.88-1.15.16-1.95.45-2.38.88-.43.43-.72 1.23-.88 2.38-.16-1.15-.45-1.95-.88-2.38-.43-.43-1.23-.72-2.38-.88 1.15-.16 1.95-.45 2.38-.88.43-.43.72-1.23.88-2.38z"/>
    </svg>
  `;

  const root = document.createElement("div");
  root.id = "flp-ai-widget-root";
  root.innerHTML = `
    <div id="flp-ai-panel">
      <div id="flp-ai-head">
        <div class="t">${sparkleSvg('flp-spark-head')} ictfrom <span>AI</span> Assistant</div>
        <button id="flp-ai-close" aria-label="Close">✕</button>
      </div>
      <div id="flp-ai-body">
        <div class="flp-msg bot">ආයුබෝවන්! 👋 ICT ගැන ප්‍රශ්නයක් තියෙනවද, නැත්නම් site එකේ navigate වෙන්න help ඕනද? අහන්න.</div>
      </div>
      <div id="flp-ai-inputRow">
        <input id="flp-ai-input" type="text" placeholder="Type a message..." autocomplete="off" />
        <button id="flp-ai-send">Send</button>
      </div>
    </div>
    <button id="flp-ai-fab" aria-label="Open AI assistant">${sparkleSvg('flp-spark-fab')}</button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector("#flp-ai-panel");
  const fab = root.querySelector("#flp-ai-fab");
  const closeBtn = root.querySelector("#flp-ai-close");
  const body = root.querySelector("#flp-ai-body");
  const input = root.querySelector("#flp-ai-input");
  const sendBtn = root.querySelector("#flp-ai-send");

  const history = []; // { role: 'user'|'assistant', content: string }

  fab.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) input.focus();
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `flp-msg ${who}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendBtn.disabled = true;

    addMessage(text, "user");
    history.push({ role: "user", content: text });

    const typingEl = addMessage("Typing...", "bot typing");

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typingEl.remove();

      if (!res.ok || data.error) {
        addMessage("⚠️ Sorry, something went wrong. Try again in a bit.", "bot");
      } else {
        addMessage(data.reply, "bot");
        history.push({ role: "assistant", content: data.reply });
      }
    } catch (err) {
      typingEl.remove();
      addMessage("⚠️ Couldn't reach the AI service. Check your connection.", "bot");
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
