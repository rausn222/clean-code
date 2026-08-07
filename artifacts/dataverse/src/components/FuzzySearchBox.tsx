import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Database } from 'lucide-react';
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
 * Text input with a fuzzy-matching suggestions dropdown over all data
 * products. Suggestions appear after 3+ typed characters; arrow keys /
 * Enter navigate, Escape or an outside click dismisses. Selecting a
 * suggestion opens the product's detail page.
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
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const { data: products } = useListDataProducts(
    {},
    { query: { queryKey: getListDataProductsQueryKey({}) } },
  );

  const active = query.trim().length >= 3;
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

  // Reopen and reset the highlight whenever the query itself changes
  useEffect(() => {
    setOpen(active);
    setHighlight(0);
  }, [query, active]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (id: number) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(suggestions[highlight].product.id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      {children}
      <input
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(active)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        aria-label="Search data products"
        aria-expanded={open}
        role="combobox"
        aria-autocomplete="list"
        aria-controls="fuzzy-search-listbox"
        aria-activedescendant={
          open && suggestions.length > 0
            ? `fuzzy-suggestion-${suggestions[highlight]?.product.id}`
            : undefined
        }
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40 text-left">
          <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suggested data products
          </div>
          <ul role="listbox" id="fuzzy-search-listbox">
            {suggestions.map((s, i) => (
              <li
                key={s.product.id}
                id={`fuzzy-suggestion-${s.product.id}`}
                role="option"
                aria-selected={i === highlight}
              >
                <button
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => go(s.product.id)}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === highlight ? 'bg-indigo-50' : ''
                  }`}
                >
                  <span className="flex-none w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5">
                    <Database className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">
                      {s.product.name}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {s.product.domain} · {s.product.description || s.product.urn}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open && active && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 px-4 py-3 z-40 text-left text-sm text-slate-500">
          No matching data products found.
        </div>
      )}
    </div>
  );
}
