import type { Metadata } from 'next';
import { Suspense } from 'react';
import Chat from '@/components/Chat';

// /chat — the FE-06 streaming interface: the capstone's central AI
// interaction, a project-qualification chat. The streaming behaviour lives
// in src/app/api/chat/route.ts + src/components/Chat.tsx; the prompt and
// model config live in src/lib/chat-config.ts.

export const metadata: Metadata = {
  title: 'Project chat — Ahmed Iqbal',
  description:
    'Scope a project in a streaming conversation with the portfolio assistant.',
};

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
        Start a conversation
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Scope your project
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-neutral-700">
        Three questions — what you are building, what it needs, when it has to
        launch — and the assistant walks you through them, streaming as it
        goes. For the actual quote, the contact form on the home page is
        where Ahmed picks it up.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <Chat />
        </Suspense>
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        This is a demo of the assistant — messages stay in this browser. To
        start a real project, use the{' '}
        <a href="/#contact" className="font-medium text-ink underline">
          contact form
        </a>{' '}
        or{' '}
        <a
          href="https://calendar.app.google/Cwb1oMgfazWdUfPy8"
          className="font-medium text-ink underline"
        >
          book a discovery call
        </a>
        .
      </p>
    </div>
  );
}
