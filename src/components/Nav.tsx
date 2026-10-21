import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/chat', label: 'Chat' },
  { href: '/health', label: 'Health' },
  { href: '/#contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Main"
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-paper transition-colors group-hover:bg-accent">
            ai
          </span>
          <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-ink">
            Ahmed Iqbal
          </span>
        </Link>
        <ul className="flex items-center gap-4 text-[13px] sm:gap-8 sm:text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="u-sweep text-coal hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
          <li className="hidden sm:block">
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
  );
}
