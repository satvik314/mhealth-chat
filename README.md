# The Mindful Digest

A retro magazine–styled, AI-powered mental wellness chatbot. Share what's on
your mind as a "letter to the editor," and **The Counsel** — a warm, empathetic
companion — writes back like a vintage advice columnist.

> The Mindful Digest is a supportive companion, **not** a clinician. It is not a
> substitute for professional care. In crisis (U.S.), call or text **988**; if
> life is in danger, call **911**.

## Features

- 📰 **Retro magazine theme** — aged-paper textures, double-rule mastheads,
  drop caps, typewriter letters, and a hand-set advice column layout.
- 🤖 **AI companion** powered by OpenAI's **GPT-5.4**, with a wellness-focused
  persona and built-in safety guidance.
- 🔑 **Bring your own key** — users enter their own OpenAI API key before
  chatting. The key is stored only in the browser's `localStorage` and sent
  straight to OpenAI via the app's serverless proxy — never persisted on a
  server.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Edge API route proxying OpenAI Chat Completions
- Google Fonts (Playfair Display, Lora, Special Elite, Oswald) via `next/font`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit you'll be
asked to "sign the register" with your OpenAI API key (`sk-...`). Then start
writing to The Counsel.

### Build for production

```bash
npm run build
npm run start
```

## How it works

1. The browser stores your OpenAI key locally and sends it with each request in
   an `x-openai-key` header.
2. `app/api/chat/route.ts` injects the wellness system prompt and forwards the
   conversation to OpenAI's `gpt-5.4` model.
3. The reply is rendered as the columnist's response in the transcript.

## Project structure

```
app/
  api/chat/route.ts      # OpenAI GPT-5.4 proxy (edge runtime)
  components/
    ApiKeyGate.tsx       # "Sign the register" API-key modal
  globals.css            # Retro magazine theme
  layout.tsx             # Fonts + metadata
  page.tsx               # Masthead, transcript, composer
```

## Privacy & safety

- Your API key never leaves your browser except to authenticate calls to
  OpenAI through the proxy route; it is not logged or stored server-side.
- The assistant is instructed to encourage professional help and to surface
  crisis resources when needed. It does not diagnose or prescribe.
