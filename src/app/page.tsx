import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

const cases = [
  {
    slug: 'lumiere',
    title: 'Lumière — restaurant site with working reservations',
    summary:
      'Next.js site for a fine-dining restaurant: menu, gallery and a reservation flow backed by MongoDB. Live and taking bookings.',
    image: '/images/lumiere.jpg',
    alt: 'The hero dish photography on the live Lumière restaurant site',
    live: 'https://lamier.vercel.app',
  },
  {
    slug: 'apexmediaco',
    title: 'ApexMediaCo — brand & commerce storefront',
    summary:
      'Next.js storefront with MongoDB Atlas: product catalogue, cart and an admin-seeded catalogue. Built as a SafeX internship deliverable.',
    image: '/images/apexmediaco.jpg',
    alt: 'The design team photograph leading the live ApexMediaCo storefront',
    live: 'https://apexmediaco.vercel.app',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero — the claim, one line of live proof, one action (Week 1 spec). */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <Image
          src="/images/hero-texture.webp"
          alt=""
          fill
          priority
          className="-z-10 object-cover opacity-15"
        />
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          I ship production-grade front ends at AI speed.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-700">
          Proof, not promises: every project below is live. Open one, use it,
          then tell me about yours.
        </p>
        <p className="mt-6">
          <a
            href="#contact"
            className="inline-block rounded-md bg-accent px-5 py-2.5 font-medium text-white"
          >
            Start your project
          </a>
        </p>
      </section>

      {/* Featured work — strongest case leads (Week 3 content map). */}
      <section id="work" className="border-t border-line py-12">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Featured work
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {cases.map((c) => (
            <article
              key={c.slug}
              className="overflow-hidden rounded-lg border border-line bg-white"
            >
              <Image
                src={c.image}
                alt={c.alt}
                width={800}
                height={500}
                className="h-44 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-700">{c.summary}</p>
                <p className="mt-4 flex gap-4 text-sm">
                  <Link
                    href={`/work/${c.slug}`}
                    className="font-medium text-accent underline"
                  >
                    Read the case study
                  </Link>
                  <a href={c.live} className="font-medium text-ink underline">
                    Visit the live site
                  </a>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About — a block, not a page (Week 1 sitemap decision). */}
      <section className="border-t border-line py-12">
        <h2 className="font-display text-2xl font-semibold text-ink">About</h2>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <Image
            src="/images/ahmed.jpg"
            alt="Portrait of Ahmed Iqbal"
            width={150}
            height={150}
            className="h-[150px] w-[150px] rounded-lg object-cover"
          />
          <p className="max-w-2xl text-neutral-700">
            I am Ahmed Iqbal, a final-year Software Engineering student in
            Karachi and a front-end developer who builds with AI in the open:
            specs first, tests where they count, and a human review on
            everything that ships. My work has taken a Java game to 2nd place
            at a university exhibition and production sites to live URLs for
            real businesses. This portfolio is the FlyRank Front-end AI
            Engineering capstone — it is itself one of the builds.
          </p>
        </div>
      </section>

      {/* Contact — a component, not a page (Week 1 sitemap decision). */}
      <section id="contact" className="border-t border-line py-12">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Start your project
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-700">
          One action, as designed: tell me what you are building.
        </p>
        <div className="mt-6 max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
