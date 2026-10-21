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
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© 2026 Ahmed Iqbal — built with AI assistance, reviewed by hand.</p>
            <p>
              Design frames the work. The work is the loudest thing on the page.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
