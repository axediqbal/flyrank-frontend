// Health check — renders real fetched data (the repository this site is
// built from, via the public GitHub API). Server Component; revalidates
// hourly. If the fetch fails, the page says so instead of faking a status.

interface RepoInfo {
  full_name: string;
  html_url: string;
  pushed_at: string;
  stargazers_count: number;
  open_issues_count: number;
  default_branch: string;
}

async function getRepo(): Promise<RepoInfo | null> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/axediqbal/flyrank-frontend',
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as RepoInfo;
  } catch {
    return null;
  }
}

export default async function HealthPage() {
  const repo = await getRepo();
  const now = new Date();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        System status
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Health
      </h1>
      <p className="mt-2 text-neutral-700">
        This page renders live data fetched at request time — not a static
        badge.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4">
          <dt className="text-sm text-neutral-500">Site status</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-ink">
            Up — this page rendered
          </dd>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <dt className="text-sm text-neutral-500">Rendered at</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-ink">
            {now.toUTCString()}
          </dd>
        </div>
        {repo ? (
          <>
            <div className="rounded-lg border border-line bg-white p-4">
              <dt className="text-sm text-neutral-500">Source repository</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">
                <a href={repo.html_url} className="text-accent underline">
                  {repo.full_name}
                </a>
              </dd>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <dt className="text-sm text-neutral-500">Last push (default branch: {repo.default_branch})</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">
                {new Date(repo.pushed_at).toUTCString()}
              </dd>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <dt className="text-sm text-neutral-500">Stars / open issues</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">
                {repo.stargazers_count} / {repo.open_issues_count}
              </dd>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-line bg-white p-4">
            <dt className="text-sm text-neutral-500">Source repository</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-ink">
              Unavailable right now — the GitHub fetch failed, and this page
              would rather say so than invent a status.
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
