document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================
   Animated chat sequences
   ============================================ */
const heroScript = [
  { side: 'in', text: "Hi! Do you have any free slots for a haircut this Saturday afternoon?" },
  { side: 'out', text: "Hi! Yes — 3:30pm or 4:45pm are both open. Which works better for you?" },
  { side: 'in', text: "3:30pm please 🙂" },
  { side: 'out', text: "Booked for Saturday at 3:30pm. You'll get a reminder the day before. See you then!" },
];

const demoScript = [
  { side: 'in', text: "Hey, can I book a table for 4 people tonight around 8pm?" },
  { side: 'out', text: "Let me check... yes, I have a table for 4 at 8:15pm tonight. Want me to hold it?" },
  { side: 'in', text: "Yes please!" },
  { side: 'out', text: "Table for 4 confirmed for 8:15pm tonight. Just give your name at the door — see you soon!" },
];

function renderChat(containerId, script, { loop = false } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cancelled = false;
  container.dataset.cancelled = 'false';

  async function play() {
    container.innerHTML = '';
    for (let i = 0; i < script.length; i++) {
      if (container.dataset.cancelled === 'true') return;
      const line = script[i];

      // typing indicator before "out" (AI) replies
      if (line.side === 'out') {
        const typing = document.createElement('div');
        typing.className = 'bubble typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        await wait(reduceMotion ? 50 : 900);
        typing.remove();
      }

      const bubble = document.createElement('div');
      bubble.className = 'bubble ' + line.side;
      bubble.textContent = line.text;
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;

      await wait(reduceMotion ? 50 : 1100);
    }

    if (loop && container.dataset.cancelled !== 'true') {
      await wait(2200);
      if (container.dataset.cancelled !== 'true') play();
    }
  }

  play();
  return {
    restart: () => {
      container.dataset.cancelled = 'true';
      requestAnimationFrame(() => {
        container.dataset.cancelled = 'false';
        play();
      });
    }
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const heroChatHandle = renderChat('heroChat', heroScript, { loop: true });
const demoChatHandle = renderChat('demoChat', demoScript, { loop: false });

const replayBtn = document.getElementById('replayDemo');
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    demoChatHandle && demoChatHandle.restart();
  });
}

/* ============================================
   FAQ accordion
   ============================================ */
document.querySelectorAll('.acc-item').forEach((item) => {
  const trigger = item.querySelector('.acc-trigger');
  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach((openItem) => {
      if (openItem !== item) openItem.classList.remove('open');
    });
    item.classList.toggle('open', !isOpen);
  });
});

/* ============================================
   Demo request form
   ============================================
   No backend is wired up yet. This opens the visitor's email client
   pre-filled with their request. Replace with Formspree / EmailJS /
   your own backend when ready — see README.md.
*/
const demoForm = document.getElementById('demoForm');
const formNote = document.getElementById('formNote');

if (demoForm) {
  demoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(demoForm);
    const name = data.get('name');
    const email = data.get('email');
    const businessType = data.get('business_type');
    const message = data.get('message');

    const subject = encodeURIComponent(`Demo request — ${name} (${businessType})`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nBusiness type: ${businessType}\nMessage: ${message || '—'}`
    );

    window.location.href = `mailto:hello@getlissai.com?subject=${subject}&body=${body}`;
    formNote.textContent = "Opening your email client to send the request…";
  });
}

/* ============================================
   Status pill: business-hours aware copy (optional nicety)
   ============================================ */
const statusPill = document.getElementById('statusPill');
if (statusPill) {
  const hour = new Date().getHours();
  const label = statusPill.querySelector('span:last-child');
  if (hour >= 22 || hour < 7) {
    label.textContent = "Liss AI is answering calls right now — even at this hour";
  }
}
