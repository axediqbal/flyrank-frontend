'use client';

// Floating glass navigation. One translucent pill (backdrop blur, hairline
// border, soft shadow) holds the brand and — on wide screens — the links.
// On narrow screens the links move into an expanding glass panel under the
// pill: 44px+ touch targets, aria-expanded on the toggle, Escape closes,
// and choosing a link closes it too. Colours and type are the identity
// kit's; only the execution is glass.

import { useEffect, useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/chat', label: 'Chat' },
  { href: '/health', label: 'Health' },
  { href: '/#contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open ]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className="relative mx-auto max-w-6xl rounded-2xl border border-white/60 bg-paper/70 shadow-[0_10px_36px_-14px_rgba(18,21,26,0.35)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-paper transition-colors group-hover:bg-accent">
              ai
            </span>
            <span className="whitespace-nowrap font-display text-[15px] font-semibold tracking-tight text-ink sm:text-base">
              Ahmed Iqbal
            </span>
          </Link>

          {/* Wide screens: inline links + CTA */}
          <ul className="hidden items-center gap-7 text-sm lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="u-sweep text-coal hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="/#contact"
                className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-all hover:-translate-y-px hover:bg-accent"
              >
                Start a project
              </a>
            </li>
          </ul>

          {/* Narrow screens: menu toggle */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-white/70 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-coal transition-transform duration-300 ${
                  open ? 'translate-y-[5px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-coal transition-transform duration-300 ${
                  open ? '-translate-y-[5px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>

        {/* Narrow screens: expanding glass panel */}
        {open && (
          <div
            id="mobile-menu"
            className="menu-panel absolute inset-x-0 top-full mt-2 rounded-2xl border border-white/60 bg-paper/85 p-2 shadow-[0_18px_44px_-16px_rgba(18,21,26,0.4)] backdrop-blur-xl lg:hidden"
          >
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center rounded-xl px-3 font-display text-base font-medium text-coal transition-colors hover:bg-white hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-2">
                <a
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center justify-center rounded-xl bg-ink px-3 font-medium text-paper transition-colors hover:bg-accent"
                >
                  Start a project
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
