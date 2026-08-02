document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================
   Animated chat sequences
   ============================================ */
// Detect language based on URL path (/it/, /pt/ or English)
const path = window.location.pathname;
const isIT = path.includes('/it/');
const isPT = path.includes('/pt/');

// Hero Chat Script Top Phone)
const heroScript = isIT ? [
  { side: 'in', text: "Ciao! Avete posto per un taglio questo sabato pomeriggio?" },
  { side: 'out', text: "Ciao! Ho preso nota della tua richiesta. A che ora preferiresti?" },
  { side: 'in', text: "Verso le 15:30 se possibile 🙂" },
  { side: 'out', text: "Perfetto! Ho girato la richiesta allo staff. Ti confermeremo la disponibilità a breve!" }
] : isPT ? [
  { side: 'in', text: "Olá! Têm alguma vaga para corte de cabelo este sábado à tarde?" },
  { side: 'out', text: "Olá! Tomei nota do seu pedido. A que horas preferia?" },
  { side: 'in', text: "Por volta das 15:30, por favor 🙂" },
  { side: 'out', text: "Perfeito! Já notifiquei a equipa. Vamos confirmar a disponibilidade em breve!" }
] : [
  // English (default)
  { side: 'in', text: "Hi! Do you have any free slots for a haircut this Saturday afternoon?" },
  { side: 'out', text: "Hi! I've logged your request. What time works best for you?" },
  { side: 'in', text: "Around 3:30pm please 🙂" },
  { side: 'out', text: "Got it! I've notified the team with your preferred time. We'll confirm with you shortly!" }
];

// Demo Chat Script (Restaurant / Bottom Phone)
const demoScript = isIT ? [
  { side: 'in', text: "Ciao, posso prenotare un tavolo per 4 persone stasera verso le 20:00?" },
  { side: 'out', text: "Ciao! Ho registrato la tua richiesta per 4 persone verso le 20:00. A che nome segno?" },
  { side: 'in', text: "Marco, per favore!" },
  { side: 'out', text: "Grazie Marco! Ho avvisato il team. Verifichiamo la disponibilità e ti rispondiamo a breve per confermare!" }
] : isPT ? [
  { side: 'in', text: "Olá, posso reservar uma mesa para 4 pessoas hoje às 20h?" },
  { side: 'out', text: "Olá! Registei o seu pedido para 4 pessoas por volta das 20h. Em que nome fica?" },
  { side: 'in', text: "Alex, por favor!" },
  { side: 'out', text: "Obrigado Alex! Já notifiquei a equipa. Vamos verificar a disponibilidade e enviamos mensagem a confirmar!" }
] : [
  // English (default)
  { side: 'in', text: "Hey, can I book a table for 4 people tonight around 8pm?" },
  { side: 'out', text: "Hi! I've logged your request for 4 people around 8pm. What name should I put it under?" },
  { side: 'in', text: "Alex, please!" },
  { side: 'out', text: "Thanks Alex! I've notified the team. We'll check availability and text you back shortly to confirm!" }
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
