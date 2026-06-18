(function () {
  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://ai-digital-business.vercel.app/api';

  const widget = document.createElement('div');
  widget.innerHTML = `
    <style>
      #azlan-chat-btn {
        position:fixed;bottom:24px;right:24px;z-index:9999;
        width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
        background:linear-gradient(90deg,#2dd4bf,#a855f7);color:#fff;font-size:22px;
        box-shadow:0 4px 20px rgba(168,85,247,0.4);transition:transform .2s;
      }
      #azlan-chat-btn:hover { transform:scale(1.08); }
      #azlan-chat-panel {
        display:none;position:fixed;bottom:92px;right:24px;z-index:9999;
        width:340px;max-width:calc(100vw - 32px);height:440px;
        background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.15);
        border:1px solid #e2e8f0;flex-direction:column;overflow:hidden;
        font-family:Inter,system-ui,sans-serif;
      }
      #azlan-chat-panel.open { display:flex; }
      .chat-head {
        background:linear-gradient(90deg,#2dd4bf,#a855f7);color:#fff;
        padding:14px 16px;font-weight:700;display:flex;justify-content:space-between;align-items:center;
      }
      .chat-head button { background:none;border:none;color:#fff;font-size:18px;cursor:pointer; }
      .chat-messages { flex:1;overflow-y:auto;padding:14px;background:#f8fafc; }
      .chat-msg { margin-bottom:10px;max-width:85%;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.5; }
      .chat-msg.bot { background:#fff;border:1px solid #e2e8f0;color:#0f172a;border-bottom-left-radius:4px; }
      .chat-msg.user { background:#a855f7;color:#fff;margin-left:auto;border-bottom-right-radius:4px; }
      .chat-input { display:flex;border-top:1px solid #e2e8f0;padding:10px;gap:8px;background:#fff; }
      .chat-input input { flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;outline:none; }
      .chat-input button { background:linear-gradient(90deg,#2dd4bf,#a855f7);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-weight:600; }
    </style>
    <button id="azlan-chat-btn" title="AI Assistant"><i class="fas fa-robot"></i></button>
    <div id="azlan-chat-panel">
      <div class="chat-head"><span><i class="fas fa-robot"></i> AzlanAI Assistant</span><button id="azlan-chat-close">×</button></div>
      <div class="chat-messages" id="azlan-chat-messages">
        <div class="chat-msg bot">Hi! I'm your AzlanAI assistant. Ask me about domains, hosting, AI agents, or pricing!</div>
      </div>
      <form class="chat-input" id="azlan-chat-form">
        <input type="text" id="azlan-chat-input" placeholder="Ask a question..." autocomplete="off" />
        <button type="submit"><i class="fas fa-paper-plane"></i></button>
      </form>
    </div>`;
  document.body.appendChild(widget);

  const btn = document.getElementById('azlan-chat-btn');
  const panel = document.getElementById('azlan-chat-panel');
  const close = document.getElementById('azlan-chat-close');
  const form = document.getElementById('azlan-chat-form');
  const input = document.getElementById('azlan-chat-input');
  const messages = document.getElementById('azlan-chat-messages');

  btn.onclick = () => panel.classList.toggle('open');
  close.onclick = () => panel.classList.remove('open');

  function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    addMsg('Thinking...', 'bot');
    const thinking = messages.lastChild;
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      thinking.textContent = data.reply || 'Sorry, I could not answer that.';
    } catch {
      thinking.textContent = 'Connection error. Please try again.';
    }
  };
})();
