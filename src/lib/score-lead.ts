// score_lead — the capstone chat's server-side tool (FE-07).
//
// The tool contract, in one file:
//   name        score_lead
//   purpose     Score how strong a sales lead is for a website build, from
//               the few facts a visitor can state in one message.
//   input       LeadInput (the Zod schema below — the schema IS the
//               contract; its describe() text doubles as model guidance)
//   output      LeadScore: a 0–100 score, a verdict, a per-signal breakdown
//               and one recommendation line. Deterministic: the same input
//               always scores the same, which is what makes the result
//               renderable as a stable component instead of prose.
//   errors      Input that fails the schema never reaches execute(); the
//               route turns the validation issues into a designed
//               output-error tool part (see src/app/api/chat/route.ts).
//
// The schema is deliberately small and honest (per the FE-07 mentor notes):
// every field is a field a model — or a form — could invent, so each one
// is either required and checkable, or optional with a rendering plan for
// when it is missing (the breakdown shows "not provided", never a guess).

import { z } from 'zod';

export const leadInputSchema = z.object({
  business: z
    .string()
    .min(1, 'A business name is required to score a lead.')
    .describe('The business name, exactly as the visitor gave it.'),
  type: z
    .enum(['cafe', 'restaurant', 'gym', 'clinic', 'salon', 'retail', 'other'])
    .describe('The kind of business. Pick the closest fit; use other when none fits.'),
  rating: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .describe('Average review rating out of 5, when the visitor knows it. Omit when unknown — never estimate.'),
  reviews: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Roughly how many reviews the business has. Omit when unknown.'),
  hasWebsite: z
    .boolean()
    .describe('True when the business already has a working website of its own.'),
  runningAds: z
    .boolean()
    .describe('True when the business is currently paying for social or search ads.'),
  contactPaths: z
    .array(z.enum(['phone', 'whatsapp', 'instagram', 'form']))
    .default([])
    .describe('How customers can reach the business today. Empty when unknown.'),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export interface ScoreRow {
  label: string;
  points: number;
  max: number;
  note: string;
}

export interface LeadScore {
  score: number;
  verdict: 'Strong fit' | 'Worth a conversation' | 'Weak fit';
  breakdown: ScoreRow[];
  recommendation: string;
}

// The execute function: pure and deterministic. Points reward the signals
// that make a website build valuable to THIS business — paying for ads
// with nowhere to send the traffic, an audience that already reviews
// them, reachable owners — and never reward facts we do not have.
export function executeScoreLead(input: LeadInput): LeadScore {
  const rows: ScoreRow[] = [];

  rows.push(
    input.hasWebsite
      ? {
          label: 'Website today',
          points: 5,
          max: 30,
          note: 'Already has a site — the pitch is an upgrade, not a first build.',
        }
      : {
          label: 'Website today',
          points: 30,
          max: 30,
          note: 'No working website — the whole opportunity is open.',
        },
  );

  rows.push(
    input.runningAds
      ? {
          label: 'Paying for ads',
          points: 20,
          max: 20,
          note: 'Ad spend exists; a real landing page gives it somewhere to land.',
        }
      : {
          label: 'Paying for ads',
          points: 4,
          max: 20,
          note: 'No ad spend yet — budget is unproven.',
        },
  );

  if (input.reviews === undefined) {
    rows.push({
      label: 'Review volume',
      points: 0,
      max: 20,
      note: 'Not provided — scored zero rather than guessed.',
    });
  } else if (input.reviews >= 100) {
    rows.push({
      label: 'Review volume',
      points: 20,
      max: 20,
      note: `${input.reviews} reviews — an audience that already talks about them.`,
    });
  } else if (input.reviews >= 25) {
    rows.push({
      label: 'Review volume',
      points: 12,
      max: 20,
      note: `${input.reviews} reviews — a real, growing audience.`,
    });
  } else {
    rows.push({
      label: 'Review volume',
      points: 5,
      max: 20,
      note: `${input.reviews} reviews — early days, thinner proof.`,
    });
  }

  if (input.rating === undefined) {
    rows.push({
      label: 'Rating',
      points: 0,
      max: 15,
      note: 'Not provided — scored zero rather than guessed.',
    });
  } else if (input.rating >= 4.5) {
    rows.push({
      label: 'Rating',
      points: 15,
      max: 15,
      note: `${input.rating} out of 5 — customers love them; the site can trade on it.`,
    });
  } else if (input.rating >= 4.0) {
    rows.push({
      label: 'Rating',
      points: 10,
      max: 15,
      note: `${input.rating} out of 5 — solid reputation to build on.`,
    });
  } else {
    rows.push({
      label: 'Rating',
      points: 4,
      max: 15,
      note: `${input.rating} out of 5 — reputation needs care in the pitch.`,
    });
  }

  const paths = input.contactPaths;
  const reachPoints =
    (paths.includes('whatsapp') ? 8 : 0) +
    (paths.includes('phone') ? 4 : 0) +
    (paths.includes('form') ? 3 : 0);
  rows.push({
    label: 'Reachable today',
    points: Math.min(reachPoints, 15),
    max: 15,
    note:
      paths.length === 0
        ? 'No contact path known — finding the owner is step one.'
        : `Reachable by ${paths.join(', ')} — a conversation can actually start.`,
  });

  const score = rows.reduce((sum, r) => sum + r.points, 0);
  const verdict: LeadScore['verdict'] =
    score >= 65 ? 'Strong fit' : score >= 40 ? 'Worth a conversation' : 'Weak fit';
  const recommendation =
    verdict === 'Strong fit'
      ? 'Open with the gap their ads are already paying to expose, and offer a demo page before any price talk.'
      : verdict === 'Worth a conversation'
        ? 'Start a conversation, qualify budget and timing before building anything.'
        : 'Park it — work stronger leads first and revisit if their signals improve.';

  return { score, verdict, breakdown: rows, recommendation };
}
