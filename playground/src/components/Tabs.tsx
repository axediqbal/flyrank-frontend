import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

// Tabs, hand-built against the W3C ARIA Authoring Practices pattern:
// tablist/tab/tabpanel roles, aria-selected + aria-controls wiring, a roving
// tabindex (only the selected tab is in the Tab order), arrow-key navigation
// with wrap-around, Home/End, and automatic activation (a tab selects when
// it receives focus).

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  ariaLabel: string;
  tabs: TabItem[];
}

export default function Tabs({ ariaLabel, tabs }: TabsProps) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        focusTab(selected + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusTab(selected - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
    }
  }

  return (
    <div>
      <div role="tablist" aria-label={ariaLabel} className="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={i === selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          hidden={i !== selected}
          className="tabpanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
