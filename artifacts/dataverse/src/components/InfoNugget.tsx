import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

const STORAGE_PREFIX = 'dataverse-nugget-dismissed:';

interface Props {
  /** Unique key used to remember dismissal across visits */
  id: string;
  title: string;
  body: string;
}

/**
 * A small dismissible "did you know" style callout explaining what a
 * section/tab contains. Dismissal is remembered in localStorage per id.
 */
export default function InfoNugget({ id, title, body }: Props) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_PREFIX + id) === '1',
  );

  if (dismissed) return null;

  return (
    <div
      role="note"
      className="flex items-start gap-3 bg-indigo-50/70 border border-indigo-200 rounded-xl px-4 py-3"
    >
      <span className="flex-none w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center mt-0.5">
        <Lightbulb className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-indigo-900">{title}</p>
        <p className="text-sm text-indigo-900/70 leading-relaxed">{body}</p>
      </div>
      <button
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(STORAGE_PREFIX + id, '1');
          setDismissed(true);
        }}
        className="flex-none p-1 rounded-md text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
