import React, { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  RotateCcw,
  Zap,
  ChevronDown,
  AlertTriangle,
  CornerDownRight,
  HelpCircle,
} from 'lucide-react';
import {
  useListRuns,
  getListRunsQueryKey,
  useRerunRun,
  ProductRun,
} from '@workspace/api-client-react';
import { LoadingSpinner } from './ui/states';
import { formatDateTime } from '../lib/format';

function shortId(executionId: string): string {
  const cut = executionId.indexOf('-');
  return cut > 0 ? `${executionId.slice(0, cut)}\u2026` : executionId;
}

function formatCost(cost: string | null | undefined): string {
  if (!cost) return '—';
  const n = Number(cost);
  return Number.isFinite(n) ? `$${n.toFixed(3).replace(/\.?0+$/, '')}` : cost;
}

export default function RunHistoryTab({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [flashId, setFlashId] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const { data: runs, isLoading, isFetching, refetch } = useListRuns(productId, {
    query: {
      enabled: !!productId,
      queryKey: getListRunsQueryKey(productId),
      refetchInterval: (query) =>
        query.state.data?.some((r) => r.status === 'running') ? 2000 : false,
    },
  });

  const rerunMutation = useRerunRun();

  // runId -> the rerun entry that re-executed it (forward link)
  const rerunBy = useMemo(() => {
    const map = new Map<number, ProductRun>();
    for (const r of runs ?? []) if (r.rerunOfId != null) map.set(r.rerunOfId, r);
    return map;
  }, [runs]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const jumpTo = (runId: number) => {
    const row = rowRefs.current.get(runId);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashId(null);
      requestAnimationFrame(() => setFlashId(runId));
    }
  };

  const handleRerun = (run: ProductRun) => {
    rerunMutation.mutate(
      { id: productId, runId: run.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRunsQueryKey(productId) });
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <style>{`@keyframes rh-flash { 0% { background-color: #fef3c7; } 100% { background-color: transparent; } }`}</style>
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          Run History
          <HelpCircle className="w-4 h-4 text-slate-400" />
        </h2>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {!runs || runs.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-sm">No runs recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Execution ID', 'Cost', 'Start Date/Time', 'Finish Date/Time', 'Run Status', 'Errors', 'Quality Rule Check', '', ''].map((h, i) => (
                  <th key={i} className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const isRerun = run.rerunOfId != null;
                const isAuto = isRerun && run.rerunTrigger === 'auto';
                const isFailed = run.status === 'failed';
                const isRunning = run.status === 'running';
                const isOpen = expanded.has(run.id);
                const reExecutedBy = rerunBy.get(run.id);
                const rowBg = isAuto
                  ? 'bg-amber-50 hover:bg-amber-100/70 border-l-amber-500'
                  : isRerun
                    ? 'bg-indigo-50/60 hover:bg-indigo-50 border-l-indigo-600'
                    : isFailed
                      ? 'hover:bg-slate-50 border-l-rose-500'
                      : 'hover:bg-slate-50 border-l-transparent';
                return (
                  <React.Fragment key={run.id}>
                    <tr
                      className={`border-b border-slate-100 border-l-[3px] transition-colors ${rowBg}`}
                      style={flashId === run.id ? { animation: 'rh-flash 1.6s ease-out' } : undefined}
                      ref={(el) => {
                        if (el) rowRefs.current.set(run.id, el);
                        else rowRefs.current.delete(run.id);
                      }}
                    >
                      <td className="px-4 py-3.5 align-top max-w-[280px]">
                        <div className="flex flex-wrap items-start gap-2 font-mono text-xs text-slate-700 break-all">
                          <span>{run.executionId ?? `run-${run.id}`}</span>
                          {isRerun &&
                            (isAuto ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500 text-white font-sans"
                                title="System automatically re-executed this run after the failure"
                              >
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                Auto Rerun
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-600 text-white font-sans">
                                <RotateCcw className="w-2.5 h-2.5" />
                                Rerun
                              </span>
                            ))}
                        </div>
                        {isRerun && run.rerunOfId != null && (
                          <div className={`flex items-center gap-1 mt-1 text-[11px] font-semibold font-sans ${isAuto ? 'text-amber-700' : 'text-indigo-600'}`}>
                            <CornerDownRight className="w-3 h-3 flex-none" />
                            {isAuto ? 'Auto-triggered after failed run' : 'Rerun of'}{' '}
                            <button
                              onClick={() => jumpTo(run.rerunOfId!)}
                              title={run.rerunOfExecutionId ?? undefined}
                              className="underline underline-offset-2 hover:opacity-75"
                            >
                              {run.rerunOfExecutionId ? shortId(run.rerunOfExecutionId) : `#${run.rerunOfId}`}
                            </button>
                          </div>
                        )}
                        {reExecutedBy && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-sans">
                            {reExecutedBy.rerunTrigger === 'auto' ? <Zap className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                            {reExecutedBy.rerunTrigger === 'auto' ? 'Auto re-executed as' : 'Re-executed as'}{' '}
                            <button
                              onClick={() => jumpTo(reExecutedBy.id)}
                              title={reExecutedBy.executionId ?? undefined}
                              className="underline underline-offset-2 hover:text-slate-700"
                            >
                              {reExecutedBy.executionId ? shortId(reExecutedBy.executionId) : `#${reExecutedBy.id}`}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">{formatCost(run.cost)}</td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">{formatDateTime(run.startedAt)}</td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">{run.endedAt ? formatDateTime(run.endedAt) : '—'}</td>
                      <td className="px-4 py-3.5 align-top">
                        {run.status === 'success' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Normal</span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                        {isRunning && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Running
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 align-top ${run.errors > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>{run.errors}</td>
                      <td className="px-4 py-3.5 align-top">
                        {run.qualityCheck === 'Pass' && <span className="text-emerald-700 font-semibold">Pass</span>}
                        {run.qualityCheck === 'Fail' && <span className="text-rose-700 font-semibold">Fail</span>}
                        {(run.qualityCheck === 'N/A' || !run.qualityCheck) && <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className={`inline-block w-2 h-2 rounded-full ${isFailed ? 'bg-rose-500' : isRunning ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <button
                          onClick={() => toggle(run.id)}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Collapse run details' : 'Expand run details'}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-slate-200">
                        <td colSpan={9} className="bg-slate-50 px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-3">
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Duration</div>
                              <div className="text-[13px] text-slate-700 mt-0.5">
                                {run.durationSeconds != null ? `${Math.floor(run.durationSeconds / 60)}m ${run.durationSeconds % 60}s` : isRunning ? 'In progress' : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rows Processed</div>
                              <div className="text-[13px] text-slate-700 mt-0.5">{run.rowsProcessed?.toLocaleString() ?? '—'}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Errors</div>
                              <div className="text-[13px] text-slate-700 mt-0.5">{run.errors}</div>
                            </div>
                            {isRerun && (
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rerun Trigger</div>
                                <div className="text-[13px] text-slate-700 mt-0.5">
                                  {isAuto ? 'Automatic — system retried after failure' : 'Manual — user-initiated'}
                                </div>
                              </div>
                            )}
                          </div>
                          {isFailed && run.message && (
                            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5 text-xs text-rose-800 mb-3">
                              <AlertTriangle className="w-3.5 h-3.5 flex-none mt-0.5" />
                              {run.message}
                            </div>
                          )}
                          {!isFailed && run.message && (
                            <div className="text-xs text-slate-500 mb-3">{run.message}</div>
                          )}
                          {isFailed &&
                            (reExecutedBy ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <RotateCcw className="w-3 h-3" />
                                Already re-executed — see the highlighted rerun entry above.
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRerun(run)}
                                disabled={rerunMutation.isPending}
                                className="inline-flex items-center gap-1.5 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 disabled:opacity-50 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                              >
                                <RotateCcw className={`w-3 h-3 ${rerunMutation.isPending ? 'animate-spin' : ''}`} />
                                {rerunMutation.isPending ? 'Starting rerun…' : 'Rerun this execution'}
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
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-6 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-indigo-600" />Manual rerun (user re-executed a failed run)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-amber-500" />Auto rerun (system retried automatically after failure)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-rose-500" />Failed run</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Healthy execution</span>
      </div>
    </div>
  );
}
