import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Database, Clock, Search, Globe } from 'lucide-react';
import {
  useListDataProducts,
  getListDataProductsQueryKey,
} from '@workspace/api-client-react';

/* ------------------------------------------------------------------ */
/* Fuzzy scoring                                                       */
/* ------------------------------------------------------------------ */

// Simple fuzzy score: exact substring beats subsequence; earlier match beats later.
export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx; // substring match, weighted by position
  // subsequence match
  let ti = 0;
  let matched = 0;
  let firstHit = -1;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) continue;
    if (firstHit === -1) firstHit = found;
    matched++;
    ti = found + 1;
  }
  if (matched < Math.ceil(q.length * 0.7)) return 0;
  return matched * 10 - (firstHit >= 0 ? firstHit : 0);
}

/* ------------------------------------------------------------------ */
/* Recent searches (localStorage)                                      */
/* ------------------------------------------------------------------ */

const RECENTS_KEY = 'dataverse-recent-searches';
const GLOBAL_KEY = 'dataverse-search-everywhere';
const SEARCH_MODE_EVENT = 'dataverse-search-mode-changed';
const MAX_RECENTS = 6;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string) {
  const v = q.trim();
  if (!v) return;
  const next = [v, ...getRecentSearches().filter((s) => s.toLowerCase() !== v.toLowerCase())].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

interface Props {
  /** Controlled query value */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Extra content rendered inside the input row (e.g. a leading icon) */
  children?: React.ReactNode;
  /** Class for the wrapper that also anchors the dropdown */
  className?: string;
  inputClassName?: string;
}

/**
 * Text input with:
 *  - recent searches shown on click/focus (before 3 characters are typed)
 *  - fuzzy suggestions across all data products after 3+ characters
 *  - Enter submits the typed text to the search results page
 *  - a toggle to search the whole project (Data Catalog, Data Sets,
 *    Data Products, Applications, Connections) via /global-search
 */
export default function FuzzySearchBox({
  value: query,
  onChange,
  placeholder,
  autoFocus,
  children,
  className = '',
  inputClassName = '',
}: Props) {
  const [, navigate] = useLocation();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);
  const [searchEverywhere, setSearchEverywhere] = useState(
    () => {
      try { return localStorage.getItem(GLOBAL_KEY) === '1'; } catch { return false; }
    },
  );
  const boxRef = useRef<HTMLDivElement>(null);

  // Keep the whole-project toggle in sync across all mounted search boxes
  // (header + page). localStorage is the single source of truth.
  useEffect(() => {
    const sync = () => {
      try { setSearchEverywhere(localStorage.getItem(GLOBAL_KEY) === '1'); } catch { /* ignore */ }
    };
    window.addEventListener(SEARCH_MODE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SEARCH_MODE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const { data: products } = useListDataProducts(
    {},
    { query: { queryKey: getListDataProductsQueryKey({}) } },
  );

  const active = query.trim().length >= 3;
  const mode: 'suggestions' | 'recents' = active ? 'suggestions' : 'recents';

  const suggestions = useMemo(() => {
    if (!active || !products) return [];
    return products
      .map((p) => {
        const score = Math.max(
          fuzzyScore(query, p.name),
          fuzzyScore(query, p.description ?? '') * 0.6,
          fuzzyScore(query, p.domain) * 0.8,
          fuzzyScore(query, p.urn) * 0.5,
        );
        return { product: p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [active, query, products]);

  const itemCount = mode === 'suggestions' ? suggestions.length : recents.length;

  // Reopen and reset the highlight whenever the query itself changes —
  // but not on mount (e.g. landing on a results page with ?q= already set)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (active) setOpen(true);
    setHighlight(-1);
  }, [query, active]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleEverywhere = () => {
    const next = !searchEverywhere;
    try { localStorage.setItem(GLOBAL_KEY, next ? '1' : '0'); } catch { /* ignore */ }
    setSearchEverywhere(next);
    window.dispatchEvent(new Event(SEARCH_MODE_EVENT));
  };

  const go = (id: number) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    addRecentSearch(q);
    setRecents(getRecentSearches());
    onChange(q);
    setOpen(false);
    navigate(
      searchEverywhere
        ? `/global-search?q=${encodeURIComponent(q)}`
        : `/search?q=${encodeURIComponent(q)}`,
    );
  };

  const onFocus = () => {
    setRecents(getRecentSearches());
    setOpen(true);
    setHighlight(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlight >= 0) {
        if (mode === 'suggestions' && suggestions[highlight]) {
          go(suggestions[highlight].product.id);
        } else if (mode === 'recents' && recents[highlight]) {
          submit(recents[highlight]);
        }
      } else {
        submit(query);
      }
      return;
    }
    if (!open || itemCount === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % itemCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? itemCount - 1 : h - 1));
    }
  };

  const showRecents = open && mode === 'recents' && recents.length > 0;
  const showSuggestions = open && mode === 'suggestions' && suggestions.length > 0;
  const showEmpty = open && mode === 'suggestions' && suggestions.length === 0;
  const showPanel = showRecents || showSuggestions || showEmpty || open;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      {children}
      <input
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        aria-label="Search data products"
        aria-expanded={open}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={
          open && highlight >= 0 ? `${listboxId}-option-${highlight}` : undefined
        }
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40 text-left">
          {/* Recent searches */}
          {showRecents && (
            <>
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recent searches
              </div>
              <ul role="listbox" id={listboxId}>
                {recents.map((r, i) => (
                  <li
                    key={r}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === highlight}
                  >
                    <div
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => submit(r)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer transition-colors ${
                        i === highlight ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-none" />
                      <span className="text-sm text-slate-700 truncate">{r}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Hint when nothing to show yet */}
          {open && mode === 'recents' && recents.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Type 3 or more characters for suggestions, or press Enter to search.
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <>
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suggested data products
              </div>
              <ul role="listbox" id={listboxId}>
                {suggestions.map((s, i) => (
                  <li
                    key={s.product.id}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === highlight}
                  >
                    <div
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => go(s.product.id)}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors ${
                        i === highlight ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <span className="flex-none w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5">
                        <Database className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="block text-sm font-semibold text-slate-900 truncate">
                            {s.product.name}
                          </span>
                          {s.product.productType === 'external' && (
                            <span className="flex-none inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
                              External
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-slate-500 truncate">
                          {s.product.domain} · {s.product.description || s.product.urn}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => submit(query)}
                className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Search for “{query.trim()}”
              </button>
            </>
          )}

          {showEmpty && (
            <div className="px-4 py-3 text-sm text-slate-500">
              No matching data products found.
              {searchEverywhere && (
                <> Press Enter to search the whole project.</>
              )}
            </div>
          )}

          {/* Whole-project toggle */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-none" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-700">Search whole project</div>
                <div className="text-[10px] text-slate-400 truncate">
                  Data Catalog · Data Sets · Data Products · Applications · Connections
                </div>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={searchEverywhere}
              aria-label="Search whole project"
              onClick={toggleEverywhere}
              className={`flex-none w-9 h-5 rounded-full transition-colors relative ${
                searchEverywhere ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  searchEverywhere ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
