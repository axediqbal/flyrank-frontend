'use client';

// Navigation, two executions of the same kit:
//  - Wide screens: a floating glass pill at the top with inline links.
//  - Narrow screens (phones): a slim glass brand bar at the top and an
//    iOS-style glass TAB BAR fixed at the bottom — Home, Work, Chat,
//    Contact with icons and labels, the current page lit in ink
//    with an amber dot. Thumb-reachable, 44px+ targets, safe-area aware.
// The layout adds bottom padding on mobile so the tab bar never covers
// page content.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const items: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...stroke} aria-hidden>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),
  },
  {
    href: '/#work',
    label: 'Work',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...stroke} aria-hidden>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...stroke} aria-hidden>
        <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
      </svg>
    ),
  },
  {
    href: '/#contact',
    label: 'Contact',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...stroke} aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href.startsWith('/#')) return false; // in-page anchors aren't "pages"
  return pathname === href;
}

export default function Nav() {
  const pathname = usePathname() ?? '/';

  return (
    <>
      {/* Wide screens — floating glass pill */}
      <header className="sticky top-0 z-50 hidden px-3 pt-3 sm:px-6 sm:pt-4 lg:block">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-paper/70 px-4 py-2 shadow-[0_10px_36px_-14px_rgba(18,21,26,0.35)] backdrop-blur-xl"
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-paper transition-colors group-hover:bg-accent">
              ai
            </span>
            <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-ink">
              Ahmed Iqbal
            </span>
          </Link>
          <ul className="flex items-center gap-7 text-sm">
            {items.map((l) => (
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
        </nav>
      </header>

      {/* Phones — slim glass brand bar */}
      <header className="sticky top-0 z-40 px-3 pt-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-paper/70 px-3 py-2 shadow-[0_10px_36px_-14px_rgba(18,21,26,0.35)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-paper">
              ai
            </span>
            <span className="whitespace-nowrap font-display text-[15px] font-semibold tracking-tight text-ink">
              Ahmed Iqbal
            </span>
          </Link>
          <a
            href="/#contact"
            className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper"
          >
            Start a project
          </a>
        </div>
      </header>

      {/* Phones — iOS-style glass tab bar, fixed at the bottom */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 lg:hidden"
      >
        <ul className="grid grid-cols-4 rounded-full border border-white/60 bg-paper/75 px-1.5 py-1.5 shadow-[0_16px_40px_-12px_rgba(18,21,26,0.45)] backdrop-blur-xl">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
                    active ? 'text-ink' : 'text-neutral-500 hover:text-ink'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute -top-0.5 h-1 w-1 rounded-full bg-accent"
                      aria-hidden
                    />
                  )}
                  {item.icon}
                  <span
                    className={`text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
