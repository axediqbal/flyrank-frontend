import type { Metadata } from 'next';
import ButtonsDemo from '@/components/ButtonsDemo';

// /buttons — the FE-AA1 demo: the SmartButton state machine, its
// on-demand success/failure triggers, and the written motion note.

export const metadata: Metadata = {
  title: 'Buttons with a brain — Ahmed Iqbal',
  description:
    'A button that communicates its full lifecycle — idle, loading, success, error — through intentional motion.',
};

export default function ButtonsPage() {
  return <ButtonsDemo />;
}
