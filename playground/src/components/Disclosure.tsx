import { useId, useState, type ReactNode } from 'react';

// Disclosure, hand-built against the W3C ARIA Authoring Practices pattern:
// a real <button> (so Enter/Space work natively) carrying aria-expanded and
// aria-controls, pointing at the region it shows and hides.

interface DisclosureProps {
  label: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
}

export default function Disclosure({
  label,
  children,
  initiallyExpanded = false,
}: DisclosureProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const regionId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={regionId}
        onClick={() => setExpanded((value) => !value)}
      >
        {label} {expanded ? '▾' : '▸'}
      </button>
      <div id={regionId} hidden={!expanded} className="disclosure-body">
        {children}
      </div>
    </div>
  );
}
