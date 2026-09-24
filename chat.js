/* Public chat endpoint configuration. Set this to your Make chat webhook URL.
 * This URL is visible to every visitor: NEVER put API keys or secrets here.
 * Make must handle JSON POST + OPTIONS/CORS; see README.md before enabling.
 * Dedicated chat scenario; the contact form uses a separate endpoint.
 */
const MAKE_CHAT_WEBHOOK_URL = 'https://hook.eu1.make.com/ragavi79fiie16973f9x3xo6bdw8inxk';

// Keep the role styles available on every language page, including deployments
// where a previously cached 404 for chat-roles.css might otherwise persist.
const roleStyle = document.createElement('style');
roleStyle.textContent = `
.live-chat .bubble.assistant {
  align-self: flex-start;
  background: var(--orange);
  color: white;
  border: 0;
  border-bottom-left-radius: 4px;
  max-width: 82%;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.live-chat .bubble.user {
  align-self: flex-end;
  background: #2E3141;
  border: 1px solid var(--line-dark);
  color: var(--cream);
  border-bottom-right-radius: 4px;
  max-width: 82%;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.live-chat .bubble.typing.assistant {
  align-self: flex-start;
  background: var(--orange);
  border: 0;
  border-bottom-left-radius: 4px;
}
.live-chat .bubble.typing.assistant span { background: white; }
`;
document.head.append(roleStyle);

(() => {
  const lang = document.documentElement.lang;
  const copy = lang === 'it' ? {
    greeting: 'Ciao! Come posso aiutarti oggi?',
    placeholder: 'Scrivi un messaggio…', send: 'Invia', label: 'Messaggio a Liss',
    ready: 'Prova la chat', typing: 'Liss sta scrivendo…',
    unavailable: 'La chat non è ancora disponibile. Riprova più tardi.',
    error: 'Risposta non ricevuta. Riprova: il messaggio potrebbe essere già arrivato.',
    timeout: 'La risposta tarda ad arrivare. Riprova: il messaggio potrebbe essere già arrivato.'
  } : lang === 'pt' ? {
    greeting: 'Olá! Como posso ajudar hoje?',
    placeholder: 'Escreva uma mensagem…', send: 'Enviar', label: 'Mensagem para a Liss',
    ready: 'Experimente o chat', typing: 'A Liss está a escrever…',
    unavailable: 'O chat ainda não está disponível. Tente mais tarde.',
    error: 'Não recebemos resposta. Tente novamente: a mensagem pode já ter chegado.',
    timeout: 'A resposta está a demorar. Tente novamente: a mensagem pode já ter chegado.'
  } : {
    greeting: 'Hi! How can I help you today?',
    placeholder: 'Type a message…', send: 'Send', label: 'Message Liss',
    ready: 'Try the live chat', typing: 'Liss is typing…',
    unavailable: 'Chat is not available yet. Please try again later.',
    error: 'No reply received. Please try again: your message may already have arrived.',
    timeout: 'The reply is taking too long. Please try again: your message may already have arrived.'
  };

  let userId;
  function getUserId() {
    if (userId) return userId;
    try { userId = sessionStorage.getItem('liss_chat_user_id'); } catch (_) {}
    if (!userId) {
      userId = crypto.randomUUID();
      try { sessionStorage.setItem('liss_chat_user_id', userId); } catch (_) {}
    }
    return userId;
  }

  let busy = false;
  // Only the second phone is connected to Make. The first phone remains scripted.
  const widgets = [...document.querySelectorAll('#demoChat')].map((log) => {
    const screen = log.closest('.phone-screen');
    screen.classList.add('live-chat');
    const status = screen.querySelector('.chat-status');
    status.textContent = copy.ready;

    const greeting = log.querySelector('.bubble');
    if (greeting) {
      greeting.classList.remove('in', 'out', 'user', 'assistant');
      greeting.classList.add('assistant');
      greeting.textContent = copy.greeting;
      greeting.lang = lang;
    }

    const form = document.createElement('form');
    form.className = 'chat-compose';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = copy.placeholder;
    input.setAttribute('aria-label', copy.label);
    input.maxLength = 2000;
    input.required = true;
    const send = document.createElement('button');
    send.type = 'submit';
    send.textContent = copy.send;
    send.disabled = true;
    form.append(input, send);

    const error = document.createElement('p');
    error.className = 'chat-error';
    error.id = `${log.id}-error`;
    error.setAttribute('role', 'alert');
    error.hidden = true;
    input.setAttribute('aria-describedby', error.id);
    screen.append(error, form);

    const widget = { log, status, form, input, send, error };
    input.addEventListener('input', () => { send.disabled = busy || !input.value.trim(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submit(widget);
    });
    return widget;
  });

  function appendMessage(text, role) {
    widgets.forEach(({ log }) => {
      const bubble = document.createElement('div');
      bubble.className = `bubble ${role}`;
      bubble.textContent = text;
      log.append(bubble);
      log.scrollTop = log.scrollHeight;
    });
  }

  function setBusy(value) {
    busy = value;
    widgets.forEach(({ log, input, send, status }) => {
      input.disabled = value;
      send.disabled = value || !input.value.trim();
      status.textContent = value ? copy.typing : copy.ready;
      log.querySelector('.typing')?.remove();
      if (value) {
        const typing = document.createElement('div');
        typing.className = 'bubble typing assistant';
        typing.setAttribute('role', 'status');
        typing.setAttribute('aria-label', copy.typing);
        for (let i = 0; i < 3; i++) typing.append(document.createElement('span'));
        log.append(typing);
      }
      log.scrollTop = log.scrollHeight;
    });
  }

  function showError(text) {
    widgets.forEach(({ error }) => {
      error.textContent = text;
      error.hidden = !text;
    });
  }

  async function submit(widget) {
    const message = widget.input.value.trim();
    if (busy || !message || message.length > 2000) return;
    showError('');

    let endpoint;
    try {
      endpoint = new URL(MAKE_CHAT_WEBHOOK_URL);
      if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Invalid endpoint');
    } catch (_) {
      showError(copy.unavailable);
      return;
    }

    appendMessage(message, 'user');
    widget.input.value = '';
    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint.href, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: getUserId(), message, channel: 'website' }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP error');
      const data = await response.json();
      if (typeof data?.reply !== 'string' || !data.reply.trim()) throw new Error('Missing reply');
      appendMessage(data.reply, 'assistant');
    } catch (error) {
      widget.input.value = message;
      showError(error.name === 'AbortError' ? copy.timeout : copy.error);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      widget.input.focus({ preventScroll: true });
    }
  }
})();
