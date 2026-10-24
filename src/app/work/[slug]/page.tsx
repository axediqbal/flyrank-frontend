import Link from 'next/link';
import { notFound } from 'next/navigation';

// Case-study template (Week 1 spec): claim + live link above the fold, the
// problem, what was built and the key decision, three metrics, role, timeline.
// Skeleton stage: structure is final; metrics land when measured (see the
// Week 3 Through-Line gather list).

const CASES: Record<
  string,
  {
    title: string;
    live: string;
    problem: string;
    built: string;
    outcome: string;
    role: string;
  }
> = {
  lumiere: {
    title: 'Lumière — restaurant site with working reservations',
    live: 'https://lamier.vercel.app',
    problem:
      'A fine-dining restaurant with no web presence beyond a social page: no menu online, and reservations meant phone calls during opening hours only.',
    built:
      'A Next.js site with the menu, gallery and a reservation flow stored in MongoDB — plus the unglamorous parts: form validation, confirmation states and an admin view of bookings.',
    outcome:
      'No client revenue data: this is a portfolio build, so the honest outcome is the working product itself — menu, gallery, and reservations stored in MongoDB, live and usable today.',
    role: 'Designed and built end to end by Ahmed Iqbal — front end, reservations data wiring, QA — AI-assisted, with a human review on everything that ships.',
  },
  apexmediaco: {
    title: 'ApexMediaCo — brand & commerce storefront',
    live: 'https://apexmediaco.vercel.app',
    problem:
      'A brand-commerce concept that needed a real storefront — catalogue, cart and managed products — not a static brochure.',
    built:
      'A Next.js storefront on MongoDB Atlas with a seeded product catalogue, cart flow and QA pass (functional + SEO checks) before it shipped live.',
    outcome:
      'No client revenue data: this was an internship build, so the outcome is the working storefront itself — seeded catalogue, cart flow, and a functional + SEO QA pass before launch.',
    role: 'Designed and built end to end by Ahmed Iqbal — storefront, catalogue, cart, QA — in September 2026.',
  },
};

export function generateStaticParams() {
  return Object.keys(CASES).map((slug) => ({ slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
        Case study
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-3">
        <a href={c.live} className="font-medium eyebrow underline">
          Visit the live site
        </a>{' '}
        — it is the proof; this page is the story.
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">
        The problem
      </h2>
      <p className="mt-2 text-neutral-700">{c.problem}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">
        What I built, and the key decision
      </h2>
      <p className="mt-2 text-neutral-700">{c.built}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">
        Outcome
      </h2>
      <p className="mt-2 text-neutral-700">{c.outcome}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">
        Role &amp; timeline
      </h2>
      <p className="mt-2 text-neutral-700">{c.role}</p>

      <p className="mt-10 border-t border-line pt-6">
        <Link href="/#contact" className="font-medium eyebrow underline">
          Want one like this? Start your project →
        </Link>
      </p>
    </div>
  );
}
