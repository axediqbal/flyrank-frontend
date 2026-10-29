// Ship It — component coverage for the pieces FE-09 left untested:
// SmartButton (FE-AA1), Reveal, DownloadPdfButton, ButtonsDemo and Nav.
// Fake timers drive SmartButton's delays deterministically; the
// IntersectionObserver and next/navigation are mocked because jsdom
// provides neither.

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ButtonsDemo from '@/components/ButtonsDemo';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import Nav from '@/components/Nav';
import Reveal from '@/components/Reveal';
import SmartButton from '@/components/SmartButton';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SmartButton lifecycle', () => {
  it('renders idle with the caller label, then runs success and returns to idle', async () => {
    vi.useFakeTimers();
    const onStateChange = vi.fn();
    render(<SmartButton label="Try me" mode="success" onStateChange={onStateChange} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-state', 'idle');
    expect(button).toHaveTextContent('Try me');
    fireEvent.click(button);
    expect(button).toHaveAttribute('data-state', 'loading');
    expect(button).toHaveAttribute('aria-busy', 'true');
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveAttribute('data-state', 'success');
    expect(onStateChange).toHaveBeenCalledWith('success');
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveAttribute('data-state', 'idle');
  });

  it('stays in error until retried, and retries on click', async () => {
    vi.useFakeTimers();
    render(<SmartButton mode="failure" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveAttribute('data-state', 'error');
    expect(button).toHaveTextContent('Failed — tap to retry');
    fireEvent.click(button);
    expect(button).toHaveAttribute('data-state', 'loading');
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveAttribute('data-state', 'error');
  });

  it('ignores clicks while disabled', () => {
    render(<SmartButton disabled />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('data-state', 'idle');
  });
});

describe('Reveal', () => {
  it('adds .is-visible when the element enters the viewport', () => {
    let callback: IntersectionObserverCallback = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const { container } = render(<Reveal delay={120}>Hello</Reveal>);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('reveal');
    expect(div.style.getPropertyValue('--reveal-delay')).toBe('120ms');
    act(() => {
      callback(
        [{ isIntersecting: true, target: div } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(div).toHaveClass('is-visible');
  });
});

describe('DownloadPdfButton', () => {
  it('opens the print dialog on click', () => {
    window.print = vi.fn();
    render(<DownloadPdfButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});

describe('ButtonsDemo page', () => {
  it('renders the heading, mode switches and motion notes', () => {
    render(<ButtonsDemo />);
    expect(
      screen.getByRole('heading', { name: 'Buttons with a brain' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Force success')).toBeInTheDocument();
    expect(screen.getByText('Force failure')).toBeInTheDocument();
    expect(
      screen.getByText('State crossfades — 160–200ms, ease-out'),
    ).toBeInTheDocument();
  });
});

describe('Nav', () => {
  it('renders the main links', () => {
    render(<Nav />);
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Chat' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Contact' }).length).toBeGreaterThan(0);
  });
});
