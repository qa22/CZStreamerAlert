const socket = io();

const root = document.getElementById('overlay-root');
const sound = document.getElementById('alert-sound');
const queue = [];
let showing = false;
let settings = { soundUrl: '/alert.mp3', cooldownSeconds: 3, messageOverride: '', specialEffectThresholdUSD: 10, enabled: true };
let lastShownAt = 0;

fetch('/api/settings').then(r=>r.json()).then(s=>{ settings = {...settings,...s}; if (settings.soundUrl) sound.src = settings.soundUrl; });

socket.on('settings', (s)=>{ settings = {...settings,...s}; if (settings.soundUrl) sound.src = settings.soundUrl; });

socket.on('donation', (data) => {
  if (!settings.enabled) return;
  queue.push(data);
  showNext();
});

function showNext() {
  if (showing || queue.length === 0) return;
  const now = Date.now();
  if (now - lastShownAt < (settings.cooldownSeconds || 0) * 1000) return; // respect cooldown
  showing = true;
  const data = queue.shift();
  const displayData = {
    ...data,
    message: settings.messageOverride || data.message
  };
  const el = buildAlert(displayData);
  root.appendChild(el);
  lastShownAt = Date.now();
  // play sound
  if (sound && sound.play) {
    sound.currentTime = 0;
    sound.play().catch(()=>{});
  }
  // remove after animation ends (4s per CSS)
  setTimeout(() => {
    el.remove();
    showing = false;
    // try to show next in queue after cooldown
    setTimeout(showNext, (settings.cooldownSeconds || 0) * 1000);
  }, 4000);
}

function buildAlert({ name, amount, currency, message }) {
  const container = document.createElement('div');
  container.className = 'alert';
  if (currency === 'USD' && amount >= (settings.specialEffectThresholdUSD || 10)) container.classList.add('big');
  container.innerHTML = `
    <div class="avatar">${escapeHtml((name||'').charAt(0) || '')}</div>
    <div class="meta">
      <div class="name">${escapeHtml(name)}</div>
      <div class="amount">${formatAmount(amount, currency)}</div>
      <div class="message">${escapeHtml(message)}</div>
    </div>
  `;
  // trigger animation class
  requestAnimationFrame(()=>container.classList.add('show'));
  return container;
}

function formatAmount(amount, currency){
  if (currency === 'USD') return `$${Number(amount).toFixed(2)}`;
  return `${Number(amount).toFixed(0)} ${currency}`;
}

function escapeHtml(s){
  return (s||'').replace(/[&<>\"]/g, (c)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
  }[c]));
}
