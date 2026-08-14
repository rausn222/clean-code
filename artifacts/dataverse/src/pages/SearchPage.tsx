import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { Search, Database, ChevronRight } from 'lucide-react';
import {
  useListDataProducts,
  getListDataProductsQueryKey,
} from '@workspace/api-client-react';
import FuzzySearchBox, { fuzzyScore } from '../components/FuzzySearchBox';

/**
 * Dedicated search page. With a ?q= in the URL (typed + Enter anywhere),
 * shows the matching data products as a result list.
 */
export default function SearchPage() {
  const searchString = useSearch();
  const urlQuery = new URLSearchParams(searchString).get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  // Keep the input in sync if the URL query changes while mounted
  // (back/forward navigation, header search, in-app links)
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
    if (!q || !products) return [];
    return products
      .map((p) => {
        const score = Math.max(
          fuzzyScore(q, p.name),
          fuzzyScore(q, p.description ?? '') * 0.6,
          fuzzyScore(q, p.domain) * 0.8,
          fuzzyScore(q, p.urn) * 0.5,
        );
        return { product: p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [q, products]);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <div className={`text-center ${q ? 'mt-6' : 'mt-8 sm:mt-16'}`}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Search the world of data
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Type 3 or more characters to get instant suggestions across product names, domains,
          descriptions, and URNs. Typos and partial words are fine — the search is fuzzy.
        </p>
      </div>

      <FuzzySearchBox
        value={query}
        onChange={setQuery}
        autoFocus={!urlQuery}
        placeholder="Search by keywords such as Dealer, Customer, and more..."
        className="w-full"
        inputClassName="w-full h-12 pl-11 pr-4 bg-white border border-slate-300 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      >
        <Search className="w-4 h-4 absolute left-4 top-6 -translate-y-1/2 text-slate-400 z-10" />
      </FuzzySearchBox>

      {q && (
        <>
          <div className="text-sm text-slate-500">
            <b className="text-slate-900">{results.length}</b>{' '}
            {results.length === 1 ? 'data product' : 'data products'} for{' '}
            <b className="text-slate-900">“{q}”</b>
          </div>

          {results.length === 0 ? (
            <div className="text-sm text-slate-500 px-4 py-6 bg-slate-100 border border-slate-200 rounded-lg text-center">
              No data products matched. Try a shorter keyword, or turn on “Search whole project”
              in the search box to look everywhere.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map(({ product: p }) => (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer">
                    <span className="flex-none w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Database className="w-4.5 h-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{p.name}</span>
                        {p.productType === 'external' && (
                          <span className="flex-none inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
                            External
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {p.domain} · {p.description || p.urn}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-none" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
