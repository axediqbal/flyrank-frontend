'use client';

// One-click PDF for the /cv page: opens the browser print dialog, where
// "Save as PDF" is the destination. The page's print styles already hide
// the nav and buttons, so the PDF is the clean CV.

export default function DownloadPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
    >
      Download PDF
    </button>
  );
}
