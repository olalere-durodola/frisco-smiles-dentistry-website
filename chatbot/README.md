# Frisco Smiles — AI chat backend

A tiny server that powers the website's chat widget. It keeps your Anthropic API
key **server-side** (never in the browser) and forwards messages to **Claude
Haiku 4.5**, with a system prompt that makes the bot the Frisco Smiles assistant.

The browser widget (in `../index.html` / `../script.js`) POSTs to `/api/chat`.

---

## 1. Get an API key

Create one at <https://console.anthropic.com/> → **Settings → API Keys**. Usage
is paid (Haiku 4.5 is the cheap tier: ~$1 per 1M input tokens, ~$5 per 1M output).

## 2. Run it locally (one server serves the site + the API)

```bash
cd chatbot
npm install
cp .env.example .env        # then paste your real key into .env
npm start
```

Open <http://localhost:3000> — the site loads and the chat bubble works,
because the widget's default `/api/chat` is same-origin with this server.

> The widget points at `CHAT_API_URL = '/api/chat'` (top of `../script.js`).
> If you host the API on a **different** domain than the site, change that
> constant to the full URL, e.g. `https://your-api.example.com/api/chat`.

---

## 3. Deploy

### Option A — one host for site + API (simplest)

Any Node host that runs `npm start` works: **Render**, **Railway**, **Fly.io**, or a VPS.
Set the env var `ANTHROPIC_API_KEY` in the host's dashboard (don't upload `.env`).
The server already serves the static site, so this single service is your whole site.

### Option B — static site + serverless function

Host `index.html` / `styles.css` / `script.js` as a static site (Netlify, Vercel,
GitHub Pages, Cloudflare Pages) and run the chat as a serverless function.

**Vercel** — put this at `api/chat.js` in the deployed project and set
`ANTHROPIC_API_KEY` in Vercel's Environment Variables. The system prompt is the
same string as in `server.js`:

```js
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = `...copy from server.js...`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages.at(-1).role !== 'user')
    return res.status(400).json({ error: 'Expected a user message.' });
  try {
    const r = await client.messages.create({
      model: 'claude-haiku-4-5', max_tokens: 1024,
      system: SYSTEM_PROMPT, messages,
    });
    const reply = r.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: 'chat_failed' }); }
}
```

(**Netlify** is the same idea under `netlify/functions/chat.js`, exporting a
`handler` — see Netlify Functions docs. If the function lives at a path other
than `/api/chat`, update `CHAT_API_URL` in `../script.js`.)

---

## Security & cost notes

- **Never commit `.env`** (the repo's `.gitignore` already excludes it). Rotate the
  key immediately if it ever leaks.
- The key lives only on the server; the browser only ever talks to your `/api/chat`.
- History is capped to the last 20 turns and 2000 chars/message to bound token cost.
- **Rate limiting & CORS are built in.** `/api/chat` is limited to 15 requests per
  IP per minute (tune via `RATE_LIMIT` / `RATE_WINDOW_MS`). Set `ALLOWED_ORIGINS`
  to your site's domain(s) before going public so the endpoint can't be used as a
  free Claude proxy from other origins (unset = open, for local dev only).
  The in-memory limiter is per-instance — for multi-instance/serverless hosting,
  back it with a shared store (Redis) or your platform's built-in rate limiting.

## Customizing the bot

Edit `SYSTEM_PROMPT` in `server.js` (and your serverless copy) to change tone,
add services, update hours, etc. Swap `MODEL` to `claude-sonnet-4-6` or
`claude-opus-4-8` for higher quality at higher cost.
