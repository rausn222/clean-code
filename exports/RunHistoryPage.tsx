/**
 * RunHistoryPage — fully self-contained React component (TSX).
 *
 * Run History tab for a data product detail page. Mirrors the production
 * table (Execution ID, Cost, Start/Finish Date/Time, Run Status, Errors,
 * Quality Rule Check, health dot, expandable rows, Refresh button) and adds
 * RERUN support:
 * - A failed run shows a "Rerun" button in its expanded panel.
 * - A run created by a rerun is visually highlighted: indigo left border +
 *   tinted row background, a "Rerun" badge next to the Execution ID, and a
 *   "Rerun of <original execution id>" reference (clickable — scrolls to and
 *   flashes the original entry).
 * - The original failed run gains a "Re-executed" note pointing forward to
 *   the rerun entry, so the pair is linked in both directions.
 *
 * ALL styling is embedded as plain CSS — no Tailwind or external stylesheet.
 * Dependencies: react, lucide-react.
 *
 * Usage: <RunHistoryPage /> (sample data inlined; replace via props)
 *   <RunHistoryPage runs={runs} onRerun={(run) => api.rerun(run.executionId)} />
 */

import React, { useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  ChevronDown,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  CornerDownRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Embedded stylesheet
// ---------------------------------------------------------------------------

const STYLES = `
.rh, .rh * { box-sizing: border-box; margin: 0; padding: 0; }

.rh {
  background: #f8fafc;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.5;
  min-height: 100vh;
  padding: 24px;
}
.rh button { font-family: inherit; cursor: pointer; background: none; border: none; color: inherit; }

.rh-container { max-width: 1280px; margin: 0 auto; }

/* Card */
.rh-card {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden;
}

/* Card header */
.rh-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.rh-title { display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
.rh-title svg { width: 16px; height: 16px; color: #94a3b8; }
.rh-refresh {
  display: inline-flex; align-items: center; gap: 8px;
  background: #4f46e5; color: #fff; border: 1px solid #4f46e5;
  padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color .15s ease;
}
.rh-refresh:hover { background: #4338ca; }
.rh-refresh svg { width: 14px; height: 14px; }

/* Table */
.rh-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.rh-table th {
  text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; color: #64748b; padding: 12px 16px;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0; white-space: nowrap;
}
.rh-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
.rh-row { border-left: 3px solid transparent; transition: background-color .15s ease; }
.rh-row:hover { background: #f8fafc; }

/* Rerun highlighting */
.rh-row.rerun { border-left-color: #4f46e5; background: #f5f6ff; }
.rh-row.rerun:hover { background: #eef0ff; }
.rh-row.failed { border-left-color: #f43f5e; }

/* Flash when jumping to the original run */
@keyframes rh-flash { 0% { background: #fef3c7; } 100% { background: transparent; } }
.rh-row.flash { animation: rh-flash 1.6s ease-out; }

/* Execution ID cell */
.rh-exec { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: #334155; word-break: break-all; max-width: 260px; }
.rh-exec-line { display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }

/* Badges */
.rh-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 2px 8px; border-radius: 999px; white-space: nowrap;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.rh-badge-rerun { background: #4f46e5; color: #ffffff; }
.rh-badge-rerun svg { width: 10px; height: 10px; }

/* "Rerun of ..." reference under the execution id */
.rh-rerun-of {
  display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;
  font-size: 11px; color: #4f46e5; font-weight: 600;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.rh-rerun-of svg { width: 12px; height: 12px; flex: none; }
.rh-rerun-of button { color: inherit; font: inherit; text-decoration: underline; text-underline-offset: 2px; }
.rh-rerun-of button:hover { color: #4338ca; }

/* Forward link on the original failed run */
.rh-reexecuted { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 11px; color: #64748b; font-family: ui-sans-serif, system-ui, sans-serif; }
.rh-reexecuted svg { width: 12px; height: 12px; }

/* Status pills */
.rh-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.rh-status-normal { background: #ecfdf5; color: #047857; }
.rh-status-failed { background: #fff1f2; color: #be123c; }
.rh-status-running { background: #eff6ff; color: #1d4ed8; }
.rh-status svg { width: 12px; height: 12px; }

.rh-qrc-pass { color: #047857; font-weight: 600; }
.rh-qrc-fail { color: #be123c; font-weight: 600; }
.rh-qrc-na { color: #94a3b8; }

.rh-errors-zero { color: #64748b; }
.rh-errors-some { color: #be123c; font-weight: 700; }

/* Health dot */
.rh-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.rh-dot-ok { background: #10b981; }
.rh-dot-bad { background: #f43f5e; }

/* Expand chevron */
.rh-expand { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; color: #64748b; transition: all .15s ease; }
.rh-expand:hover { background: #e2e8f0; color: #0f172a; }
.rh-expand svg { width: 16px; height: 16px; transition: transform .2s ease; }
.rh-expand.open svg { transform: rotate(180deg); }

/* Expanded detail panel */
.rh-detail td { background: #f8fafc; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
.rh-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px 24px; margin-bottom: 12px; }
.rh-detail-label { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #94a3b8; }
.rh-detail-value { font-size: 13px; color: #334155; margin-top: 2px; }
.rh-detail-error { display: flex; align-items: flex-start; gap: 8px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #9f1239; margin-bottom: 12px; }
.rh-detail-error svg { width: 14px; height: 14px; flex: none; margin-top: 1px; }
.rh-rerun-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ffffff; color: #be123c; border: 1px solid #fda4af;
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  transition: all .15s ease;
}
.rh-rerun-btn:hover { background: #fff1f2; border-color: #fb7185; }
.rh-rerun-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.rh-rerun-btn svg { width: 13px; height: 13px; }
.rh-rerun-done { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }

/* Legend */
.rh-legend { display: flex; flex-wrap: wrap; gap: 16px; padding: 12px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px; color: #64748b; }
.rh-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.rh-legend-swatch { width: 10px; height: 10px; border-radius: 3px; }

@media (max-width: 900px) {
  .rh { padding: 12px; }
  .rh-table th:nth-child(2), .rh-table td:nth-child(2) { display: none; }
}
`;

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

export interface RunEntry {
  executionId: string;
  cost: number; // USD
  startedAt: string; // ISO
  finishedAt: string | null; // null while running
  runStatus: "Normal" | "Failed" | "Running";
  errors: number;
  qualityRuleCheck: "Pass" | "Fail" | "N/A";
  /** Execution ID of the failed run this entry re-executes (marks it a rerun). */
  rerunOf?: string;
  /** Optional error summary shown in the expanded panel for failed runs. */
  errorMessage?: string;
}

const SAMPLE_RUNS: RunEntry[] = [
  {
    executionId: "20250731031525_7b03c8e1-d429-4c60-8a6f-b19ec45cbd06",
    cost: 4.18,
    startedAt: "2025-07-31T08:45:00",
    finishedAt: "2025-07-31T09:01:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
  },
  {
    executionId: "20250730031520_eb2163d1-a252-4ade-a263-06fd70ceb64c",
    cost: 3.764,
    startedAt: "2025-07-30T08:45:00",
    finishedAt: "2025-07-30T09:04:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
  },
  // ---- rerun pair: this entry re-executes the failed run below ----
  {
    executionId: "20250729114512_f81a2c07-5be1-49d3-b6c1-2a90d1e6aa41",
    cost: 4.31,
    startedAt: "2025-07-29T11:45:00",
    finishedAt: "2025-07-29T12:02:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
    rerunOf: "20250729031520_b4c4f18e-15a1-4353-8c9c-949605e82c07",
  },
  {
    executionId: "20250729031520_b4c4f18e-15a1-4353-8c9c-949605e82c07",
    cost: 1.92,
    startedAt: "2025-07-29T08:45:00",
    finishedAt: "2025-07-29T08:52:00",
    runStatus: "Failed",
    errors: 3,
    qualityRuleCheck: "Fail",
    errorMessage: "Step 4/9 (dq_validation) exited with code 1: 3 rows violated rule NOT_NULL(engine_serial_no).",
  },
  {
    executionId: "20250728031520_de45971f-64aa-41ec-a47c-9f61927ed602",
    cost: 4.488,
    startedAt: "2025-07-28T08:45:00",
    finishedAt: "2025-07-28T09:03:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
  },
  {
    executionId: "20250727031520_4aacb69c-4f42-4a2f-9111-e16d68e99b33",
    cost: 3.003,
    startedAt: "2025-07-27T08:45:00",
    finishedAt: "2025-07-27T09:08:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
  },
  {
    executionId: "20250726031528_e2368487-9ba2-4d0e-bddb-aa3238cecd4a",
    cost: 4.118,
    startedAt: "2025-07-26T08:45:00",
    finishedAt: "2025-07-26T09:01:00",
    runStatus: "Normal",
    errors: 0,
    qualityRuleCheck: "Pass",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy}, ${hh}:${mi}`;
}

function durationLabel(start: string, finish: string | null): string {
  if (!finish) return "In progress";
  const mins = Math.round((new Date(finish).getTime() - new Date(start).getTime()) / 60000);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function shortId(executionId: string): string {
  // "20250729031520_b4c4f18e-..." -> "20250729031520_b4c4f18e…"
  const cut = executionId.indexOf("-");
  return cut > 0 ? `${executionId.slice(0, cut)}\u2026` : executionId;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface RunHistoryPageProps {
  runs?: RunEntry[];
  /** Called when the user clicks Refresh. */
  onRefresh?: () => void;
  /** Called when the user reruns a failed run — wire to your API. */
  onRerun?: (run: RunEntry) => void;
}

export default function RunHistoryPage({
  runs = SAMPLE_RUNS,
  onRefresh,
  onRerun,
}: RunHistoryPageProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [flashId, setFlashId] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // executionId -> the rerun entry that re-executed it (forward link)
  const rerunBy = useMemo(() => {
    const map = new Map<string, RunEntry>();
    for (const r of runs) if (r.rerunOf) map.set(r.rerunOf, r);
    return map;
  }, [runs]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const jumpTo = (executionId: string) => {
    const row = rowRefs.current.get(executionId);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(null);
      // restart the flash animation even if the same row is targeted twice
      requestAnimationFrame(() => setFlashId(executionId));
    }
  };

  return (
    <div className="rh">
      <style>{STYLES}</style>
      <div className="rh-container">
        <div className="rh-card">
          <div className="rh-head">
            <h2 className="rh-title">
              Run History
              <HelpCircle />
            </h2>
            <button className="rh-refresh" onClick={onRefresh}>
              <RefreshCw />
              Refresh
            </button>
          </div>

          <table className="rh-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Cost</th>
                <th>Start Date/Time</th>
                <th>Finish Date/Time</th>
                <th>Run Status</th>
                <th>Errors</th>
                <th>Quality Rule Check</th>
                <th aria-label="Health" />
                <th aria-label="Expand" />
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const isRerun = Boolean(run.rerunOf);
                const isFailed = run.runStatus === "Failed";
                const isOpen = expanded.has(run.executionId);
                const reExecutedBy = rerunBy.get(run.executionId);
                const rowClass = [
                  "rh-row",
                  isRerun ? "rerun" : "",
                  isFailed ? "failed" : "",
                  flashId === run.executionId ? "flash" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <React.Fragment key={run.executionId}>
                    <tr
                      className={rowClass}
                      ref={(el) => {
                        if (el) rowRefs.current.set(run.executionId, el);
                        else rowRefs.current.delete(run.executionId);
                      }}
                    >
                      <td className="rh-exec">
                        <div className="rh-exec-line">
                          <span>{run.executionId}</span>
                          {isRerun && (
                            <span className="rh-badge rh-badge-rerun">
                              <RotateCcw />
                              Rerun
                            </span>
                          )}
                        </div>
                        {isRerun && run.rerunOf && (
                          <div className="rh-rerun-of">
                            <CornerDownRight />
                            Rerun of{" "}
                            <button onClick={() => jumpTo(run.rerunOf!)} title={run.rerunOf}>
                              {shortId(run.rerunOf)}
                            </button>
                          </div>
                        )}
                        {reExecutedBy && (
                          <div className="rh-reexecuted">
                            <RotateCcw />
                            Re-executed as{" "}
                            <button
                              onClick={() => jumpTo(reExecutedBy.executionId)}
                              title={reExecutedBy.executionId}
                              style={{ textDecoration: "underline", textUnderlineOffset: 2 }}
                            >
                              {shortId(reExecutedBy.executionId)}
                            </button>
                          </div>
                        )}
                      </td>
                      <td>${run.cost.toFixed(3).replace(/\.?0+$/, "")}</td>
                      <td>{formatDateTime(run.startedAt)}</td>
                      <td>{formatDateTime(run.finishedAt)}</td>
                      <td>
                        {run.runStatus === "Normal" && <span className="rh-status rh-status-normal">Normal</span>}
                        {run.runStatus === "Failed" && (
                          <span className="rh-status rh-status-failed">
                            <AlertTriangle />
                            Failed
                          </span>
                        )}
                        {run.runStatus === "Running" && <span className="rh-status rh-status-running">Running</span>}
                      </td>
                      <td className={run.errors > 0 ? "rh-errors-some" : "rh-errors-zero"}>{run.errors}</td>
                      <td>
                        {run.qualityRuleCheck === "Pass" && <span className="rh-qrc-pass">Pass</span>}
                        {run.qualityRuleCheck === "Fail" && <span className="rh-qrc-fail">Fail</span>}
                        {run.qualityRuleCheck === "N/A" && <span className="rh-qrc-na">N/A</span>}
                      </td>
                      <td>
                        <span className={`rh-dot ${isFailed ? "rh-dot-bad" : "rh-dot-ok"}`} />
                      </td>
                      <td>
                        <button
                          className={`rh-expand${isOpen ? " open" : ""}`}
                          onClick={() => toggle(run.executionId)}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? "Collapse run details" : "Expand run details"}
                        >
                          <ChevronDown />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="rh-detail">
                        <td colSpan={9}>
                          <div className="rh-detail-grid">
                            <div>
                              <div className="rh-detail-label">Duration</div>
                              <div className="rh-detail-value">{durationLabel(run.startedAt, run.finishedAt)}</div>
                            </div>
                            <div>
                              <div className="rh-detail-label">Cost</div>
                              <div className="rh-detail-value">${run.cost.toFixed(3)}</div>
                            </div>
                            <div>
                              <div className="rh-detail-label">Errors</div>
                              <div className="rh-detail-value">{run.errors}</div>
                            </div>
                            <div>
                              <div className="rh-detail-label">Quality Rule Check</div>
                              <div className="rh-detail-value">{run.qualityRuleCheck}</div>
                            </div>
                            {isRerun && run.rerunOf && (
                              <div>
                                <div className="rh-detail-label">Rerun of</div>
                                <div className="rh-detail-value" style={{ wordBreak: "break-all" }}>{run.rerunOf}</div>
                              </div>
                            )}
                          </div>

                          {isFailed && run.errorMessage && (
                            <div className="rh-detail-error">
                              <AlertTriangle />
                              {run.errorMessage}
                            </div>
                          )}

                          {isFailed &&
                            (reExecutedBy ? (
                              <span className="rh-rerun-done">
                                <RotateCcw />
                                Already re-executed — see the highlighted rerun entry above.
                              </span>
                            ) : (
                              <button className="rh-rerun-btn" onClick={() => onRerun?.(run)}>
                                <RotateCcw />
                                Rerun this execution
                              </button>
                            ))}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="rh-legend">
            <span className="rh-legend-item">
              <span className="rh-legend-swatch" style={{ background: "#4f46e5" }} />
              Rerun entry (created by re-executing a failed run)
            </span>
            <span className="rh-legend-item">
              <span className="rh-legend-swatch" style={{ background: "#f43f5e" }} />
              Failed run
            </span>
            <span className="rh-legend-item">
              <span className="rh-dot rh-dot-ok" />
              Healthy execution
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
