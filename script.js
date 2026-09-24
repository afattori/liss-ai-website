document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================
   Original animated chat sequence for the first phone
   ============================================ */
const path = window.location.pathname.toLowerCase();
const isIT = path.includes('/it') || path.includes('/it/');
const isPT = path.includes('/pt') || path.includes('/pt/');

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
  { side: 'in', text: "Hi! Do you have any free slots for a haircut this Saturday afternoon?" },
  { side: 'out', text: "Hi! I've logged your request. What time works best for you?" },
  { side: 'in', text: "Around 3:30pm please 🙂" },
  { side: 'out', text: "Got it! I've notified the team with your preferred time. We'll confirm with you shortly!" }
];

function renderHeroChat(containerId, script) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.dataset.cancelled = 'false';

  async function play() {
    container.innerHTML = '';
    for (const line of script) {
      if (container.dataset.cancelled === 'true') return;

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

    await wait(2200);
    if (container.dataset.cancelled !== 'true') play();
  }

  play();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

renderHeroChat('heroChat', heroScript);

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
   ============================================ */
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

    formNote.textContent = "Sending your request…";
    fetch('https://hook.eu1.make.com/fyshtg4teadjg8t6oh10r14r7l8yu03g', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'form', name, email, business_type: businessType, message })
    })
      .then(() => {
        formNote.textContent = "Thanks! We'll get back to you within one business day.";
        demoForm.reset();
      })
      .catch(() => {
        formNote.textContent = "Something went wrong — please try again or email us directly.";
      });
  });
}

/* ============================================
   Status pill
   ============================================ */
const statusPill = document.getElementById('statusPill');
if (statusPill) {
  const hour = new Date().getHours();
  const label = statusPill.querySelector('span:last-child');
  if (hour >= 22 || hour < 7) {
    label.textContent = "Liss AI is answering calls right now — even at this hour";
  }
}
