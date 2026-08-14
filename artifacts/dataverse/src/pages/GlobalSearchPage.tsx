import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import {
  Search,
  Database,
  Table2,
  Layers,
  AppWindow,
  Plug,
  Globe,
  ChevronRight,
} from 'lucide-react';
import {
  useListDataProducts,
  getListDataProductsQueryKey,
} from '@workspace/api-client-react';
import FuzzySearchBox, { fuzzyScore } from '../components/FuzzySearchBox';
import {
  catalogEntries,
  dataSets,
  applications,
  connections,
} from '../data/globalSearch';

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        {count} {count === 1 ? 'result' : 'results'}
      </span>
    </div>
  );
}

function ResultRow({
  title,
  subtitle,
  badge,
  badgeTone = 'slate',
  href,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: 'slate' | 'emerald' | 'amber' | 'violet';
  href?: string;
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  const inner = (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
          {badge && (
            <span className={`flex-none inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${tones[badgeTone]}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</div>
      </div>
      {href && <ChevronRight className="w-4 h-4 text-slate-300 flex-none" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/**
 * Whole-project search results: Data Catalog, Data Sets, Data Products,
 * Applications and Connections in one page.
 */
export default function GlobalSearchPage() {
  const searchString = useSearch();
  const urlQuery = new URLSearchParams(searchString).get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  const { data: products } = useListDataProducts(
    {},
    { query: { queryKey: getListDataProductsQueryKey({}) } },
  );

  const q = urlQuery.trim();

  const results = useMemo(() => {
    if (!q) return null;
    const match = (...texts: (string | null | undefined)[]) =>
      Math.max(...texts.map((t) => (t ? fuzzyScore(q, t) : 0))) > 0;
    return {
      catalog: catalogEntries.filter((c) => match(c.name, c.description, c.domain)),
      dataSets: dataSets.filter((d) => match(d.name, d.description)),
      products: (products ?? []).filter((p) =>
        match(p.name, p.description, p.domain, p.urn),
      ),
      applications: applications.filter((a) => match(a.name, a.description, a.owner)),
      connections: connections.filter((c) => match(c.name, c.description, c.type)),
    };
  }, [q, products]);

  const total = results
    ? results.catalog.length +
      results.dataSets.length +
      results.products.length +
      results.applications.length +
      results.connections.length
    : 0;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 inline-flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-500" />
          Search the whole project
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Results across Data Catalog, Data Sets, Data Products, Applications and Connections.
        </p>
      </div>

      <FuzzySearchBox
        value={query}
        onChange={setQuery}
        autoFocus={!urlQuery}
        placeholder="Search everywhere..."
        className="w-full"
        inputClassName="w-full h-12 pl-11 pr-4 bg-white border border-slate-300 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      >
        <Search className="w-4 h-4 absolute left-4 top-6 -translate-y-1/2 text-slate-400 z-10" />
      </FuzzySearchBox>

      {!q ? (
        <div className="text-sm text-slate-500 text-center py-8">
          Type a search and press Enter to see results from every corner of the project.
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-500">
            <b className="text-slate-900">{total}</b> {total === 1 ? 'result' : 'results'} for{' '}
            <b className="text-slate-900">“{q}”</b>
          </div>

          {total === 0 && (
            <div className="text-sm text-slate-500 px-4 py-6 bg-slate-100 border border-slate-200 rounded-lg text-center">
              Nothing matched anywhere in the project. Try a shorter or different keyword.
            </div>
          )}

          {results && results.products.length > 0 && (
            <section>
              <SectionHeader icon={Database} title="Data Products" count={results.products.length} />
              <div className="flex flex-col gap-2">
                {results.products.map((p) => (
                  <ResultRow
                    key={p.id}
                    title={p.name}
                    subtitle={`${p.domain} · ${p.description || p.urn}`}
                    badge={p.productType === 'external' ? 'External' : undefined}
                    badgeTone="violet"
                    href={`/products/${p.id}`}
                  />
                ))}
              </div>
            </section>
          )}

          {results && results.catalog.length > 0 && (
            <section>
              <SectionHeader icon={Table2} title="Data Catalog" count={results.catalog.length} />
              <div className="flex flex-col gap-2">
                {results.catalog.map((c) => (
                  <ResultRow
                    key={c.name}
                    title={c.name}
                    subtitle={`${c.domain} · ${c.description}`}
                    badge={c.type}
                  />
                ))}
              </div>
            </section>
          )}

          {results && results.dataSets.length > 0 && (
            <section>
              <SectionHeader icon={Layers} title="Data Sets" count={results.dataSets.length} />
              <div className="flex flex-col gap-2">
                {results.dataSets.map((d) => (
                  <ResultRow
                    key={d.name}
                    title={d.name}
                    subtitle={`${d.description} · ${d.rows} rows · refreshed ${d.refreshed}`}
                  />
                ))}
              </div>
            </section>
          )}

          {results && results.applications.length > 0 && (
            <section>
              <SectionHeader icon={AppWindow} title="Applications" count={results.applications.length} />
              <div className="flex flex-col gap-2">
                {results.applications.map((a) => (
                  <ResultRow
                    key={a.name}
                    title={a.name}
                    subtitle={`${a.description} · Owner: ${a.owner}`}
                    badge={a.status}
                    badgeTone={a.status === 'Live' ? 'emerald' : 'amber'}
                  />
                ))}
              </div>
            </section>
          )}

          {results && results.connections.length > 0 && (
            <section>
              <SectionHeader icon={Plug} title="Connections" count={results.connections.length} />
              <div className="flex flex-col gap-2">
                {results.connections.map((c) => (
                  <ResultRow
                    key={c.name}
                    title={c.name}
                    subtitle={`${c.type} · ${c.description}`}
                    badge={c.status}
                    badgeTone={c.status === 'Connected' ? 'emerald' : 'amber'}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
