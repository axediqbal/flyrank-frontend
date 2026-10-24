import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';

const cases = [
  {
    slug: 'lumiere',
    index: '01',
    title: 'Lumière',
    kind: 'Restaurant site · reservations',
    summary:
      'Next.js site for a fine-dining restaurant: menu, gallery and a reservation flow backed by MongoDB. Live and taking bookings.',
    image: '/images/lumiere.jpg',
    alt: 'The hero dish photography on the live Lumière restaurant site',
    live: 'https://lamier.vercel.app',
  },
  {
    slug: 'apexmediaco',
    index: '02',
    title: 'ApexMediaCo',
    kind: 'Brand & commerce storefront',
    summary:
      'Next.js storefront with MongoDB Atlas: product catalogue, cart and an admin-seeded catalogue. QA’d before launch.',
    image: '/images/apexmediaco.jpg',
    alt: 'The design team photograph leading the live ApexMediaCo storefront',
    live: 'https://apexmediaco.vercel.app',
  },
];

const proof = [
  { label: 'lamier.vercel.app', href: 'https://lamier.vercel.app' },
  { label: 'apexmediaco.vercel.app', href: 'https://apexmediaco.vercel.app' },
  { label: 'interndesk.vercel.app', href: 'https://interndesk.vercel.app' },
  { label: 'safexweek4.vercel.app', href: 'https://safexweek4.vercel.app' },
];

function SectionHead({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-t-2 border-ink pt-5">
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        <span className="mr-3 align-top font-body text-sm font-semibold eyebrow">
          {index}
        </span>
        {title}
      </h2>
      <p className="hidden max-w-[220px] text-right text-sm text-neutral-500 sm:block">
        {note}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero — the claim at display scale, live proof, one action (Week 1 spec). */}
      <section className="pb-10 pt-12 sm:pt-16">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
            <span className="inline-flex items-center gap-2 font-medium text-coal">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Available for new projects
            </span>
            <span aria-hidden>·</span>
            <span>Karachi, Pakistan</span>
            <span aria-hidden>·</span>
            <span>Front-end developer</span>
          </p>

        <h1 className="mt-6 font-display text-[13.5vw] font-bold leading-[0.98] tracking-tight text-ink sm:text-7xl lg:text-[86px]">
            I ship production-grade front ends at{' '}
            <span className="text-accent">AI speed.</span>
          </h1>

        <div className="mt-8 grid items-end gap-8 sm:grid-cols-[1fr_auto]">
            <p className="max-w-xl text-lg leading-relaxed text-neutral-700">
              Proof, not promises: every project below is live. Open one, use
              it, then tell me about yours.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all hover:-translate-y-0.5 hover:bg-accent"
              >
                Start your project
              </a>
              <a
                href="#work"
                className="rounded-full border border-ink px-6 py-3 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                See the work
              </a>
            </div>
          </div>

        {/* Live-proof marquee */}
        <div
            className="mt-12 overflow-hidden border-y border-line py-3"
            aria-label="Live projects"
          >
            <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
              {[...proof, ...proof].map((p, i) => (
                <a
                  key={i}
                  href={p.href}
                  className="flex items-center gap-8 font-display text-sm font-semibold uppercase tracking-widest text-ink"
                >
                  {p.label}
                  <span className="eyebrow" aria-hidden>
                    ●
                  </span>
                </a>
              ))}
            </div>
          </div>
      </section>

      {/* 01 — Featured work */}
      <section id="work" className="py-12">
        <Reveal>
          <SectionHead
            index="01"
            title="Featured work"
            note="Strongest first. Every card is a live URL, not a mockup."
          />
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {cases.map((c, i) => (
            <Reveal key={c.slug} delay={i * 120}>
              <article className="group h-full overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-300 hover:shadow-[0_18px_50px_-20px_rgba(18,21,26,0.35)]">
                <div className="relative overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.alt}
                    width={900}
                    height={560}
                    className="card-media h-52 w-full object-cover sm:h-60"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-display text-xs font-bold text-ink">
                    {c.index}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest eyebrow">
                    {c.kind}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-neutral-700">
                    {c.summary}
                  </p>
                  <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                    <Link
                      href={`/work/${c.slug}`}
                      className="u-sweep text-ink"
                    >
                      Read the case study →
                    </Link>
                    <a href={c.live} className="u-sweep text-accent">
                      Visit the live site →
                    </a>
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 02 — About */}
      <section className="py-12">
        <Reveal>
          <SectionHead
            index="02"
            title="About"
            note="The short version — the full story is a call away."
          />
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-8 grid items-start gap-8 sm:grid-cols-[auto_1fr]">
            <div className="relative aspect-square w-[min(240px,72vw)] shrink-0">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <Image
                  src="/images/ahmed.jpg"
                  alt="Portrait of Ahmed Iqbal"
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="max-w-2xl">
              <p className="font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
                A final-year Software Engineering student in Karachi who
                builds with AI in the open — specs first, a human review on
                everything that ships.
              </p>
              <p className="mt-4 leading-relaxed text-neutral-700">
                My work has taken a Java game to 2nd place at a university
                exhibition and production sites to live URLs for real
                businesses. This portfolio is itself one of the builds —
                every project here is a live URL, not a mockup.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 03 — Contact */}
      <section id="contact" className="py-12 pb-16">
        <Reveal>
          <SectionHead
            index="03"
            title="Contact"
            note="One action, as designed: tell me what you are building."
          />
        </Reveal>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <Reveal delay={60}>
            <h3 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Tell me what you are{' '}
              <span className="text-accent">building.</span>
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-neutral-700">
              A storefront, a dashboard, a landing page that has to convert —
              if it needs a front end, it starts here.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-2xl border border-line bg-white p-6">
              <ContactForm />
            </div>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
            <span className="font-semibold uppercase tracking-widest text-neutral-500">
              Find me
            </span>
            <a
              href="https://www.linkedin.com/in/ahmediqball"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/axediqbal"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              GitHub
            </a>
            <Link
              href="/cv"
              className="py-1.5 font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              CV
            </Link>
            <a
              href="https://calendar.app.google/Cwb1oMgfazWdUfPy8"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              Book a call
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
