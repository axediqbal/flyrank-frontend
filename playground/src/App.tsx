import { useState } from 'react';
import Modal from './components/Modal';
import Tabs from './components/Tabs';
import Disclosure from './components/Disclosure';

// Demo page for the three hand-built accessible components. Everything on
// this page is operable with the keyboard alone — that is the test the
// assignment sets, and the instructions under each component say how.

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [name, setName] = useState('');

  return (
    <main>
      <h1>Accessible components, built by hand</h1>
      <p className="lede">
        A modal dialog, a tab set, and a disclosure — each built from scratch
        in React + TypeScript against its W3C ARIA Authoring Practices
        pattern, before any library was allowed near them. Put the mouse
        away: every component below works by keyboard alone.
      </p>

      <h2>1 · Modal dialog</h2>
      <p className="lede">
        Open it, then try <kbd>Tab</kbd> (focus cycles inside and cannot
        escape), <kbd>Shift</kbd>+<kbd>Tab</kbd>, and <kbd>Escape</kbd>{' '}
        (closes — and focus returns to the button that opened it).
      </p>
      <button type="button" className="primary" onClick={() => setModalOpen(true)}>
        Open the dialog
      </button>
      {savedName && (
        <p className="lede" role="status">
          Saved name: {savedName}
        </p>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Introduce yourself">
        <p className="lede">
          A dialog with real controls inside, so the focus trap has something
          to hold.
        </p>
        <label htmlFor="visitor-name">Your name</label>
        <input
          id="visitor-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
        />
        <div className="row">
          <button type="button" onClick={() => setModalOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setSavedName(name);
              setModalOpen(false);
            }}
          >
            Save
          </button>
        </div>
      </Modal>

      <h2>2 · Tabs</h2>
      <p className="lede">
        <kbd>Tab</kbd> reaches only the selected tab; move between tabs with{' '}
        <kbd>←</kbd> <kbd>→</kbd>, jump with <kbd>Home</kbd> / <kbd>End</kbd>.
        Activation is automatic — a tab selects when it gets focus.
      </p>
      <Tabs
        ariaLabel="About the three patterns"
        tabs={[
          {
            id: 'modal',
            label: 'Modal',
            content:
              'The modal pattern is about focus custody: while the dialog is open it owns the keyboard, and when it closes it hands focus back to exactly where it was. aria-modal tells assistive technology that everything behind the dialog is inert.',
          },
          {
            id: 'tabs',
            label: 'Tabs',
            content:
              'The tabs pattern keeps the Tab key cheap: one stop for the whole tab list (the roving tabindex), arrow keys do the travelling. Panels are wired to their tabs with aria-controls and aria-labelledby so the relationship exists in the accessibility tree, not just on screen.',
          },
          {
            id: 'disclosure',
            label: 'Disclosure',
            content:
              'The disclosure pattern is the smallest of the three: one button, one region, aria-expanded telling the truth about the state. Its simplicity is the point — most "custom accordions" fail by using a div with a click handler instead of this.',
          },
        ]}
      />

      <h2>3 · Disclosure</h2>
      <p className="lede">
        A native button, so <kbd>Enter</kbd> and <kbd>Space</kbd> toggle it
        with no key handling of mine at all.
      </p>
      <Disclosure label="How was the focus trap tested?">
        Keyboard only, in this order: open the dialog with Enter, Tab through
        every control three times and confirm focus never reaches the page
        behind, Shift+Tab back around the wrap, then Escape and confirm focus
        is back on the “Open the dialog” button. Then the same pass with a
        screen-reader mindset: the dialog announces its title because
        aria-labelledby points at it, and aria-modal keeps the rest of the
        page out of the reading order while it is open.
      </Disclosure>
    </main>
  );
}
