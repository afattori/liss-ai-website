document.getElementById('year').textContent = new Date().getFullYear();

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

    formNote.textContent = "Sending your request…";

    fetch('https://hook.eu1.make.com/fyshtg4teadjg8t6oh10r14r7l8yu03g', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'form',
        name: name,
        email: email,
        business_type: businessType,
        message: message
      })
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
