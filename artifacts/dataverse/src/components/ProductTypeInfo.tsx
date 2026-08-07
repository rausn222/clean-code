import { useEffect, useState } from 'react';
import { Globe, Building2, X, Check, Minus } from 'lucide-react';

/**
 * Popup explaining the difference between internal and external data
 * products. Reused on the Catalog page and the Product Detail page via
 * the <ProductTypeInfoButton /> trigger.
 */

const ROWS: {
  label: string;
  internal: { ok: boolean; text: string };
  external: { ok: boolean; text: string };
}[] = [
  {
    label: 'How it is built',
    internal: {
      ok: true,
      text: 'Created with a Workbench pipeline — the data product pipeline is set up along with it.',
    },
    external: {
      ok: false,
      text: 'Data comes from a third-party provider; no pipeline is built on our portal.',
    },
  },
  {
    label: 'Consumption',
    internal: {
      ok: true,
      text: 'Data can be consumed via different channels — API, Postgres, exports.',
    },
    external: {
      ok: false,
      text: 'Consumed as delivered by the provider.',
    },
  },
  {
    label: 'Subscription',
    internal: { ok: true, text: 'Users can subscribe with access plans.' },
    external: { ok: false, text: 'No subscription available.' },
  },
  {
    label: 'Run from portal',
    internal: { ok: true, text: 'Pipeline can be run from our portal.' },
    external: { ok: false, text: 'Cannot be run from our portal.' },
  },
];

export function ProductTypeInfoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Internal vs External data products"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Internal vs External data products
            </h2>
            <p className="text-sm text-slate-500">
              Products tagged{' '}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200 align-middle">
                <Globe className="w-3 h-3" />
                External
              </span>{' '}
              behave differently from the rest of the catalog.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex-none p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-4">
          <div className="grid grid-cols-[minmax(90px,1fr)_2fr_2fr] text-sm">
            <div />
            <div className="flex items-center gap-2 px-3 py-2 font-semibold text-slate-900">
              <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              Internal
            </div>
            <div className="flex items-center gap-2 px-3 py-2 font-semibold text-slate-900">
              <span className="w-6 h-6 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </span>
              External
            </div>
            {ROWS.map((row) => (
              <div key={row.label} className="contents">
                <div className="px-0 py-3 border-t border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500 self-center">
                  {row.label}
                </div>
                <div className="flex items-start gap-2 px-3 py-3 border-t border-slate-100 text-slate-700">
                  <Check className="w-4 h-4 flex-none mt-0.5 text-emerald-500" />
                  <span>{row.internal.text}</span>
                </div>
                <div className="flex items-start gap-2 px-3 py-3 border-t border-slate-100 text-slate-700 bg-violet-50/40 rounded-lg">
                  <Minus className="w-4 h-4 flex-none mt-0.5 text-slate-400" />
                  <span>{row.external.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pill button that opens the popup. Drop it anywhere. */
export default function ProductTypeInfoButton({
  className = '',
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors whitespace-nowrap shadow-sm ${className}`}
      >
        <Globe className="w-3.5 h-3.5" />
        Internal vs External
      </button>
      {open && <ProductTypeInfoModal onClose={() => setOpen(false)} />}
    </>
  );
}
