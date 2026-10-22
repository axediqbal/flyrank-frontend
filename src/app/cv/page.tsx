import type { Metadata } from 'next';
import Link from 'next/link';

// /cv — the CV link the personal site points to (PF-04). A real CV page,
// kept in the same repo and design kit as the rest of the site, printable
// from the browser (Print → Save as PDF). Facts are Ahmed's real record:
// internships first, Impel Marketing last, per his resume convention.

export const metadata: Metadata = {
  title: 'CV — Ahmed Iqbal',
  description:
    'Ahmed Iqbal — front-end developer and full-stack intern. Experience, projects, skills, education.',
};

const EXPERIENCE = [
  {
    role: 'Full Stack Intern — SafeX (Batch 2026, Group 60)',
    period: '2026 — ongoing',
    points: [
      'Group Leader for the Week 1 build (Subscription Billing Portal).',
      'Shipped Lumière (luxury restaurant site) and ApexMediaCo (brand-commerce storefront) as weekly deliverables.',
      'Week 4: DevPulse, a public API with a live key directory — planned, built and QA’d end to end.',
    ],
  },
  {
    role: 'Software Quality Engineering Intern — Big Brains Learning',
    period: 'Sep – Oct 2026',
    points: [
      'Completed all 15 tasks at a 99% average — Selenium WebDriver (Python, Page Object Model), Jira test management, regression suites.',
      'Received a completion certificate and a recommendation letter from the founder.',
    ],
  },
  {
    role: 'Full Stack Intern — Oasis Infobyte (SIP Level 3)',
    period: '2026',
    points: ['Built SliceHub, a MERN pizza-ordering platform (auth, cart, ordering flow).'],
  },
  {
    role: 'Full Stack Intern — DecodeLabs',
    period: 'Sep 2026',
    points: ['Built InternDesk, a full-stack intern directory console (Express + SQLite), deployed live.'],
  },
  {
    role: 'Lead Generation Executive — Impel Marketing',
    period: 'Aug 2024 – Feb 2025',
    points: [
      'Outbound client communication and lead qualification for tourism packages — the client-communication experience behind my freelance outreach work.',
    ],
  },
];

const PROJECTS = [
  {
    name: 'Lumière',
    detail: 'Luxury restaurant site — Next.js 16, MongoDB reservations. Live at lamier.vercel.app.',
  },
  {
    name: 'ApexMediaCo',
    detail: 'Brand-commerce storefront — Next.js, MongoDB Atlas. Live at apexmediaco.vercel.app.',
  },
  {
    name: 'Genesis AI (Final Year Project, defended)',
    detail: 'Multi-agent system (CrewAI + LangChain) that assembles a digital business on free-tier tools; I built the Research Agent and the Frontend.',
  },
  {
    name: 'Bone Fracture Detection AI',
    detail: 'Computer vision — Python, OpenCV, TensorFlow.',
  },
  {
    name: 'Stickman Fight',
    detail: 'Java 2D game — 2nd place at the SSUET project exhibition.',
  },
];

export default function CvPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        Curriculum vitae
      </p>
      <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-ink">
        Ahmed Iqbal
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-neutral-700">
        Front-end developer and full-stack intern in Karachi. I ship
        production-grade front ends at AI speed — from art direction to
        deployed, optimized code.
      </p>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
        <a className="text-ink underline-offset-4 hover:text-accent hover:underline" href="mailto:ahmediqbal2003f9@gmail.com">
          ahmediqbal2003f9@gmail.com
        </a>
        <a className="text-ink underline-offset-4 hover:text-accent hover:underline" href="https://www.linkedin.com/in/ahmediqball" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="text-ink underline-offset-4 hover:text-accent hover:underline" href="https://github.com/axediqbal" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="text-ink underline-offset-4 hover:text-accent hover:underline" href="https://calendar.app.google/Cwb1oMgfazWdUfPy8" target="_blank" rel="noreferrer">
          Book a call
        </a>
        <Link className="text-ink underline-offset-4 hover:text-accent hover:underline" href="/">
          Portfolio home
        </Link>
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold text-ink">Experience</h2>
      <div className="mt-4 space-y-6">
        {EXPERIENCE.map((job) => (
          <div key={job.role} className="border-l-2 border-line pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-coal">{job.role}</h3>
              <span className="text-sm text-neutral-500">{job.period}</span>
            </div>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-neutral-700">
              {job.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold text-ink">Selected projects</h2>
      <div className="mt-4 space-y-3">
        {PROJECTS.map((project) => (
          <p key={project.name} className="text-[15px] leading-relaxed text-neutral-700">
            <span className="font-semibold text-coal">{project.name}.</span> {project.detail}
          </p>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold text-ink">Skills</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        React, Next.js, TypeScript, Node.js / Express, MongoDB, Firebase,
        Tailwind CSS · Java, Spring Boot, Python, SQL · QA automation:
        Selenium WebDriver (Python, Page Object Model), Jira · AI-assisted
        development workflows, computer vision (OpenCV, TensorFlow).
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold text-ink">Education</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
        B.S. Software Engineering (final year) — Sir Syed University of
        Engineering &amp; Technology, Karachi. CGPA 3.21 with a strong upward
        trend (6th semester: 3.66). Graduating mid-2027.
      </p>

      <p className="mt-10 border-t border-line pt-4 text-sm text-neutral-500">
        This page lives at flyrank-frontend-five.vercel.app/cv — print it
        (Ctrl/Cmd + P) for a PDF copy. For project work, the{' '}
        <Link href="/chat" className="font-medium text-ink underline-offset-4 hover:underline">
          project chat
        </Link>{' '}
        or the contact form on the home page is the fastest route.
      </p>
    </div>
  );
}
