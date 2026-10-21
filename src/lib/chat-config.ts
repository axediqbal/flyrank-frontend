// Chat configuration — the ONE place the streaming chat's brain lives.
//
// FE-06 (Streaming AI chat interface) asks for the system prompt and model
// config to sit in a single, well-commented module. This is that module:
// if you want to change how the assistant behaves, this file is the edit —
// the route handler and the client component contain no prompt text at all.

// The assistant's job: qualify a potential project for Ahmed, briefly and
// factually. It asks; it does not quote. Prices are never invented here —
// a real quote only ever comes from Ahmed after the contact form.
export const SYSTEM_PROMPT = `You are the project assistant on Ahmed Iqbal's portfolio site. Ahmed is a front-end developer in Karachi who builds websites and web apps for businesses.

Your job is to qualify a visitor's project in a short conversation:
1. Find out what they are building (a storefront, a restaurant site, a dashboard, a landing page, something else).
2. Ask what pages or features it needs.
3. Ask about their timeline.
4. Summarise what you heard and point them to the contact form on the home page — that is how a project actually starts.

Rules: keep every reply to one to three short sentences. Ask one question at a time. Never quote a price or a delivery date. Never claim a feature exists that the visitor has not described. If asked something unrelated to hiring Ahmed for a project, answer briefly and steer back to the project.`;

// Model configuration. The provider is Google's Gemini API because this
// track provides no credits and Gemini has a genuine free tier; the key is
// read from the GEMINI_API_KEY environment variable on the server ONLY
// (see src/app/api/chat/route.ts) and is never exposed to the browser.
// To move to another model, change these two values — nothing else in the
// codebase names a model.
export const MODEL = {
  provider: 'google',
  id: 'gemini-2.0-flash',
  maxOutputTokens: 300,
} as const;

// Demo mode: while no API key is configured, the route handler streams
// replies from this scripted qualification flow instead of a model. The
// streaming, stop button and state handling are identical in both modes —
// demo mode exists so the interface is testable end-to-end before the key
// is added, and the UI badges it honestly.
export const DEMO_REPLIES = {
  greeting:
    "Hello — I can help you scope a project with Ahmed. What are you looking to build: a storefront, a restaurant site, a dashboard, a landing page, or something else?",
  scope:
    'Good — that is the kind of build Ahmed ships. What pages or features does it need? For example: a product catalogue, online reservations, a booking flow, or an admin view.',
  timeline:
    'Noted. And what timeline are you working to — is there a launch date you need to hit?',
  summary:
    'Thank you — I have the shape of it: the kind of project, what it needs, and your timeline. The next step is the contact form on the home page (Start your project); Ahmed replies from there and a real conversation about scope and price happens with him, not with me.',
  fallback:
    'I am a small assistant whose one job is scoping projects for Ahmed — I cannot help with that one. If you would like to describe a project instead, tell me what you are building.',
} as const;
