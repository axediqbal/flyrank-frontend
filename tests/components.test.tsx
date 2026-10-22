// FE-09 — the tool-result component (ScoreCard) tested directly, and
// the validated contact form tested through its labels and roles.
// The form's /api/contact endpoint is mocked; nothing leaves the test.

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScoreCard } from '@/components/Chat';
import ContactForm from '@/components/ContactForm';
import { executeScoreLead } from '@/lib/score-lead';

describe('ScoreCard (tool-result component)', () => {
  it('renders the score, verdict and breakdown for a strong lead', () => {
    const output = executeScoreLead({
      business: 'Boss Cafe',
      type: 'cafe',
      rating: 4.4,
      reviews: 210,
      hasWebsite: false,
      runningAds: true,
      contactPaths: ['phone', 'instagram'],
    });
    render(<ScoreCard output={output} />);
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('Strong fit')).toBeInTheDocument();
    expect(screen.getByText('Website today')).toBeInTheDocument();
    expect(screen.getByText(/No working website/)).toBeInTheDocument();
  });

  it('says "not provided" instead of inventing missing facts', () => {
    const output = executeScoreLead({
      business: 'Quiet Corner',
      type: 'retail',
      hasWebsite: true,
      runningAds: false,
      contactPaths: [],
    });
    render(<ScoreCard output={output} />);
    expect(screen.getAllByText(/Not provided/).length).toBeGreaterThan(0);
    expect(screen.getByText('Weak fit')).toBeInTheDocument();
  });
});

describe('ContactForm (validated form)', () => {
  it('announces a validation error for every empty field', async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole('button', { name: /start your project/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(3);
    expect(screen.getByText('Your name is required.')).toBeInTheDocument();
    expect(screen.getByText('Your email is required.')).toBeInTheDocument();
  });

  it('sends a valid message and confirms it', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ ok: true }) }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Test Visitor' } });
    fireEvent.change(screen.getByLabelText(/your email/i), { target: { value: 'visitor@example.com' } });
    fireEvent.change(screen.getByLabelText(/about your project/i), {
      target: { value: 'A landing page for my bakery, please.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start your project/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/message sent/i);
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
    vi.unstubAllGlobals();
  });

  it('keeps the text and shows a fallback when the send fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 502, json: async () => ({}) })));
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Test Visitor' } });
    fireEvent.change(screen.getByLabelText(/your email/i), { target: { value: 'visitor@example.com' } });
    fireEvent.change(screen.getByLabelText(/about your project/i), {
      target: { value: 'A landing page for my bakery, please.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start your project/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be sent/i);
    expect(screen.getByLabelText(/about your project/i)).toHaveValue(
      'A landing page for my bakery, please.',
    );
    vi.unstubAllGlobals();
  });
});
