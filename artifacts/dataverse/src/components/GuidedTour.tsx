import { useEffect, useLayoutEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Compass } from 'lucide-react';

export interface TourStep {
  /** Matches an element with data-tour="<target>". Omit for a centered welcome step. */
  target?: string;
  title: string;
  body: string;
  /** Tab to activate before showing this step */
  tab?: string;
}

interface Props {
  steps: TourStep[];
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

const PADDING = 8;

export default function GuidedTour({ steps, onClose, onTabChange }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[index]!;

  // Activate the tab for this step, then measure the target
  useLayoutEffect(() => {
    if (step.tab && onTabChange) onTabChange(step.tab);
    let raf = 0;
    let tries = 0;
    const measure = () => {
      if (!step.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setRect(el.getBoundingClientRect());
      } else if (tries++ < 20) {
        raf = requestAnimationFrame(measure);
      } else {
        setRect(null);
      }
    };
    measure();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Track scroll/resize so the highlight follows its target
  useEffect(() => {
    if (!step.target) return;
    const update = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const interval = setInterval(update, 300); // smooth-scroll settling
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, [step.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < steps.length - 1) setIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, steps.length, onClose]);

  const isLast = index === steps.length - 1;

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const below = rect.bottom + PADDING + 190 < window.innerHeight;
    tooltipStyle.top = below ? rect.bottom + PADDING + 4 : undefined;
    tooltipStyle.bottom = below ? undefined : window.innerHeight - rect.top + PADDING + 4;
    tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 400));
  } else {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {/* Dim everything; punch a hole around the target via box-shadow */}
      {rect ? (
        <div
          className="absolute rounded-lg ring-2 ring-indigo-400 transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/55" />
      )}
      {/* Click-catcher so clicks don't hit the page while touring */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="fixed w-[368px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-slate-200 p-5"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex-none inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Exit tour" className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{step.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${i === index ? 'w-4 h-1.5 bg-indigo-600' : 'w-1.5 h-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setIndex(index + 1))}
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
            >
              {isLast ? 'Finish' : 'Next'} {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}
