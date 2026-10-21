import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/health', label: 'Health' },
  { href: '/#contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <header className="border-b border-line bg-paper">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Main"
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-bold text-paper">
            ai
          </span>
          <span className="font-display text-base font-semibold text-ink">
            Ahmed Iqbal
          </span>
        </Link>
        <ul className="flex items-center gap-4 text-sm sm:gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-coal hover:text-accent">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
