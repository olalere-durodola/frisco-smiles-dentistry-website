// Frisco Smiles Dentistry — chat backend.
//
// Holds your Anthropic API key server-side (NEVER ship the key to the browser)
// and proxies chat requests to Claude Haiku 4.5. Also serves the static site so
// the widget's same-origin POST to /api/chat works out of the box.
//
// Setup:
//   cd chatbot
//   npm install
//   cp .env.example .env      # then put your real key in .env
//   npm start                 # serves the site + API at http://localhost:3000
//
// See README.md for serverless (Vercel/Netlify) deployment.

require('dotenv').config();
const path = require('path');
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key.');
  process.exit(1);
}

const client = new Anthropic({ apiKey });
const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `You are the friendly virtual assistant for Frisco Smiles Dentistry, a family and cosmetic dental practice in Frisco, Texas, led by Dr. Thanh K. Hong, DMD.

Practice facts (use these; do not invent others):
- Address: 2955 Eldorado Pkwy, Suite 110, Frisco, TX 75033.
- Phone — New patients: (469) 212-9064. Existing patients: (469) 294-4239.
- Hours: Monday–Friday, 8:00am–5:00pm. Closed weekends.
- Services: Preventive (cleanings & exams, oral cancer screening, fluoride & sealants, pediatric dentistry, periodontal care, night guards); Restorative (ceramic crowns, implants, tooth-colored fillings, bridges & dentures, inlays & onlays, emergency care); Cosmetic (Invisalign®, teeth whitening, porcelain veneers, cosmetic bonding, smile makeovers).
- Insurance: We work with most major PPO plans and file claims for patients. Not insured? Ask about our in-house membership program for affordable routine care.
- New patients welcome. For an emergency, advise calling right away — we reserve same-day appointments.
- Invisalign and treatment costs depend on a personalized plan mapped out at a complimentary consultation; we offer flexible financing. Do NOT quote specific prices.

How to behave:
- Be warm, concise, and helpful. Keep answers short (1–3 short paragraphs).
- Only discuss this dental practice and general dentistry. If asked about unrelated topics, gently steer back.
- You cannot book appointments yourself. To book, direct people to call the new-patient line (469) 212-9064 or use the "Book a visit" button on the website.
- Do not give specific medical diagnoses or treatment advice. For clinical concerns, recommend scheduling a visit or calling the office.
- If you don't know something, say so and point them to call the office.`;

const app = express();
app.set('trust proxy', 1); // honor X-Forwarded-For behind a host's proxy (for correct client IPs)
app.use(express.json({ limit: '32kb' }));

// ── CORS allow-list for the chat API ──
// Set ALLOWED_ORIGINS to a comma-separated list of the sites permitted to call
// /api/chat, e.g. "https://friscosmilesdentistry.com,https://www.friscosmilesdentistry.com".
// Leave it unset for local development (same-origin needs no CORS; cross-origin is then open).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
if (!ALLOWED_ORIGINS.length) {
  console.warn('[warn] ALLOWED_ORIGINS not set — cross-origin requests to /api/chat are unrestricted. Set it before going public.');
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin / curl — no CORS headers needed
  const allowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  return allowed;
}

// ── Simple in-memory rate limiter (per IP) ──
// Bounds abuse without an external dependency. For multi-instance hosting,
// swap this for a shared store (Redis) — see README.
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 15);   // requests
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS || 60_000); // per window
const hits = new Map(); // ip -> { count, resetAt }

function rateLimited(req, res) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  let rec = hits.get(ip);
  if (!rec || now > rec.resetAt) { rec = { count: 0, resetAt: now + RATE_WINDOW_MS }; hits.set(ip, rec); }
  rec.count += 1;
  const remaining = Math.max(0, RATE_LIMIT - rec.count);
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  if (rec.count > RATE_LIMIT) {
    res.setHeader('Retry-After', String(Math.ceil((rec.resetAt - now) / 1000)));
    return true;
  }
  return false;
}

// Opportunistically evict stale buckets so the Map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits) if (now > rec.resetAt) hits.delete(ip);
}, RATE_WINDOW_MS).unref?.();

// Preflight for the chat endpoint.
app.options('/api/chat', (req, res) => {
  const ok = applyCors(req, res);
  res.status(ok ? 204 : 403).end();
});

// Serve the static site (project root is one level up from /chatbot).
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/chat', async (req, res) => {
  if (!applyCors(req, res)) return res.status(403).json({ error: 'origin_not_allowed' });
  if (rateLimited(req, res)) return res.status(429).json({ error: 'rate_limited' });
  try {
    const incoming = Array.isArray(req.body && req.body.messages) ? req.body.messages : [];
    // Keep only well-formed turns, cap history to the last 20 to bound token use.
    const messages = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Expected a user message.' });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    res.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" });
  } catch (err) {
    console.error('chat error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'chat_failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Frisco Smiles site + chat running at http://localhost:${port}`));
