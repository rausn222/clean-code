/**
 * GuidedTour.tsx — self-contained "Take a tour" component for any React app.
 * No dependencies beyond React (icons are inline SVG, styles are inline CSS).
 *
 * HOW TO USE (3 steps):
 *
 * 1. Tag the elements you want to highlight:
 *      <div data-tour="search">...</div>
 *      <button data-tour="filters">...</button>
 *
 * 2. Define your steps (omit `target` for a centered welcome step):
 *      const TOUR_STEPS: TourStep[] = [
 *        { title: 'Welcome!', body: 'Let us show you around.' },
 *        { target: 'search',  title: 'Search',  body: 'Find anything from here.' },
 *        { target: 'filters', title: 'Filters', body: 'Narrow down the results.' },
 *      ];
 *
 * 3. Render the tour when the user clicks "Take a tour":
 *      const [touring, setTouring] = useState(false);
 *      ...
 *      <button onClick={() => setTouring(true)}>Take a tour</button>
 *      {touring && <GuidedTour steps={TOUR_STEPS} onClose={() => setTouring(false)} />}
 *
 * Optional: if a step lives inside a tab, add `tab: 'tabName'` to the step and
 * pass `onTabChange={(tab) => setActiveTab(tab)}` so the tour switches tabs for you.
 *
 * Keyboard: ← / → to navigate, Esc to exit.
 */

import { useEffect, useLayoutEffect, useState } from 'react';

export interface TourStep {
  /** Matches an element with data-tour="<target>". Omit for a centered welcome step. */
  target?: string;
  title: string;
  body: string;
  /** Tab to activate before showing this step (needs onTabChange). */
  tab?: string;
}

interface Props {
  steps: TourStep[];
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

const PADDING = 8;

/* ── Inline icons (no icon library needed) ── */
const icon = (d: string, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconX = () => icon('M18 6 6 18 M6 6l12 12');
const IconLeft = () => icon('M19 12H5 M12 19l-7-7 7-7', 14);
const IconRight = () => icon('M5 12h14 M12 5l7 7-7 7', 14);
const IconCompass = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

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

  // Keyboard navigation
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

  // Tooltip position: below the target if there is room, otherwise above; centered when no target
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    width: 368,
    maxWidth: 'calc(100vw - 32px)',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid #e2e8f0',
    padding: 20,
    zIndex: 101,
  };
  if (rect) {
    const below = rect.bottom + PADDING + 190 < window.innerHeight;
    if (below) tooltipStyle.top = rect.bottom + PADDING + 4;
    else tooltipStyle.bottom = window.innerHeight - rect.top + PADDING + 4;
    tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 400));
  } else {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} role="dialog" aria-modal="true" aria-label="Guided tour">
      {/* Dim everything; punch a hole around the target via box-shadow */}
      {rect ? (
        <div
          style={{
            position: 'absolute',
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            borderRadius: 8,
            outline: '2px solid #818cf8',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
            transition: 'all 300ms',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)' }} />
      )}
      {/* Click-catcher so clicks don't hit the page while touring */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      <div style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8, background: '#4f46e5', color: '#fff',
            }}>
              <IconCompass />
            </span>
            <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{step.title}</h3>
          </div>
          <button onClick={onClose} aria-label="Exit tour"
                  style={{ ...btnBase, background: 'none', color: '#94a3b8', padding: 0 }}>
            <IconX />
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{step.body}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {steps.map((_, i) => (
              <span key={i} style={{
                borderRadius: 9999, transition: 'all 200ms',
                width: i === index ? 16 : 6, height: 6,
                background: i === index ? '#4f46e5' : '#cbd5e1',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {index > 0 && (
              <button onClick={() => setIndex(index - 1)}
                      style={{ ...btnBase, background: 'none', color: '#475569', padding: '6px 10px' }}>
                <IconLeft /> Back
              </button>
            )}
            <button onClick={() => (isLast ? onClose() : setIndex(index + 1))}
                    style={{ ...btnBase, background: '#4f46e5', color: '#fff', padding: '6px 14px' }}>
              {isLast ? 'Finish' : 'Next'} {!isLast && <IconRight />}
            </button>
          </div>
        </div>

        <button onClick={onClose}
                style={{ ...btnBase, background: 'none', color: '#94a3b8', fontSize: 11, marginTop: 8, padding: 0 }}>
          Skip tour
        </button>
      </div>
    </div>
  );
}
