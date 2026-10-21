import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import Nav from '@/components/Nav';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  weight: ['500', '600', '700'],
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body-loaded',
});

export const metadata: Metadata = {
  title: 'Ahmed Iqbal — Front-End Developer',
  description:
    'I ship production-grade front ends at AI speed. Portfolio of Ahmed Iqbal, front-end developer and FlyRank AI intern.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-paper font-body text-coal antialiased">
        <Nav />
        <main>{children}</main>
        <footer className="border-t-2 border-ink">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-end">
            <p className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-paper">
                ai
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-ink">
                Ahmed Iqbal
              </span>
            </p>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600">
              Design frames the work. The work is the loudest thing on the
              page. Built with AI assistance, reviewed by hand.
            </p>
            <p className="text-sm text-neutral-500">© 2026 · Karachi, PK</p>
          </div>
        </footer>
        {/* Spacer: on phones the fixed bottom tab bar must never cover the footer */}
        <div aria-hidden className="h-24 lg:hidden" />
      </body>
    </html>
  );
}
