// Loading skeleton for /chat (FE-08). The skeleton mirrors the real
// layout — heading block, then the chat box at its real height — so the
// content swap causes no layout shift when the page arrives.

export default function ChatLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6" aria-hidden="true">
      <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-11 w-72 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded bg-neutral-100" />
      <div className="mt-8 space-y-3 rounded-2xl border border-line p-4">
        <div className="h-16 w-3/4 animate-pulse rounded-2xl rounded-bl-md bg-neutral-100" />
        <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl rounded-br-md bg-neutral-100" />
        <div className="h-24 w-2/3 animate-pulse rounded-2xl rounded-bl-md bg-neutral-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}
