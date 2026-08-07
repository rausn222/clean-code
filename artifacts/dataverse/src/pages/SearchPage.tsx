import { useState } from 'react';
import { Search } from 'lucide-react';
import FuzzySearchBox from '../components/FuzzySearchBox';

/**
 * Dedicated search page, opened from the home hero search placeholder.
 */
export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <div className="mt-8 sm:mt-16 text-center">
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
        autoFocus
        placeholder="Search by keywords such as Dealer, Customer, and more..."
        className="w-full"
        inputClassName="w-full h-12 pl-11 pr-4 bg-white border border-slate-300 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      >
        <Search className="w-4 h-4 absolute left-4 top-6 -translate-y-1/2 text-slate-400 z-10" />
      </FuzzySearchBox>
    </div>
  );
}
