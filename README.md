# liss-ai-website
Official website of Liss AI, an AI automation studio creating custom AI assistants and smart solutions for small businesses.

## Live website chat

Both phones use `chat.js` and show the same conversation on the current page.
The greeting is **Hi! How can I help you today?** on all language versions;
controls and errors follow the page language. No build step is required.

Set `MAKE_CHAT_WEBHOOK_URL` at the top of `chat.js` to the HTTPS URL of a
dedicated Make chat scenario. It is intentionally empty until configured; the
existing demo-request form has its own webhook and is not used by the chat.
Do not add OpenAI keys, Make API keys, authorization tokens or other secrets to
these public files. The endpoint itself is public, not an authentication secret.

The chat sends `POST` with `Content-Type: application/json`:

```json
{"user_id":"browser-generated-uuid","message":"Hello!","channel":"website"}
```

Use `user_id` to retrieve/store conversation context in Make. The identifier is
kept in `sessionStorage` across reloads/navigation in the same tab; if storage is
blocked it survives only for the current page. Messages are kept only in memory
and the visible conversation resets on reload. This ID is not authentication.

End the Make scenario with a Webhook response returning HTTP 200, JSON content
type and a nonempty string reply (Make's default `Accepted` response is not enough):

```json
{"reply":"How can I help you?"}
```

### GitHub Pages and CORS

GitHub Pages only serves static files. The webhook or a server-side proxy must
handle the browser's OPTIONS preflight **without running chat/booking actions**
and return a successful response with:

```text
Access-Control-Allow-Origin: https://getlissai.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Vary: Origin
```

Include `Access-Control-Allow-Origin` on POST responses too, including errors.
Use the exact actual site origin (or an allowlist for the custom domain, Pages
origin and local testing). Do not use `mode: no-cors`: opaque responses cannot be
read. If Make cannot serve the required preflight, use a server-side proxy and
set its HTTPS URL as the endpoint. Keep credentials and rate limits on that
server/Make side; CORS alone does not prevent endpoint abuse.

Only one message can be in flight across the two phones. Requests time out after
30 seconds. HTTP/network/CORS errors, malformed JSON and missing replies show a
recoverable message and restore the input. Retrying is manual: a timeout does
not prove Make failed to process a message, so booking workflows should guard
against duplicates. Visitor messages and replies render as plain text.

### Manual verification

Serve the directory with any static HTTP server. On `/`, `/it/` and `/pt/`, check
the greeting, keyboard Enter and Send, scrolling, typing state, blank-input
rejection and error recovery. With a test endpoint, inspect the JSON payload,
reply rendering and the stable ID after reload. Check both phones at 320, 375,
390, 430, 768 and 1280 px. Verify the real deployed origin's CORS configuration
before recording the live demo. Do not test bookings against production data.
