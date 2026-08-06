import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Archive, 
  MoreVertical, 
  Copy, 
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
  Database,
  Activity,
  GitBranch,
  Users,
  Info,
  Check,
  Search,
  AlertCircle,
  CreditCard,
  History,
  Zap,
  Compass
} from 'lucide-react';
import {
  useGetDataProduct,
  getGetDataProductQueryKey,
  useGetGlossaryFields,
  getGetGlossaryFieldsQueryKey,
  useGetSampleData,
  getGetSampleDataQueryKey,
  useListRuns,
  getListRunsQueryKey,
  useTriggerRun,
  useUpdateDataProductStatus,
  useListConsumers,
  getListConsumersQueryKey,
  ProductRun,
  Consumer
} from '@workspace/api-client-react';
import { PageLoader, ErrorState, LoadingSpinner } from '../components/ui/states';
import SubscriptionsTab from '../components/SubscriptionsTab';
import RunHistoryTab from '../components/RunHistoryTab';
import GuidedTour, { TourStep } from '../components/GuidedTour';

const TOUR_DONE_KEY = 'dataverse-product-tour-done';

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to your data product page',
    body: 'This quick tour walks you through everything on this page — from the product\u2019s health to its run history and subscriptions. Use Next / Back or the arrow keys.',
  },
  {
    target: 'tabs',
    title: 'Navigate with tabs',
    body: 'Each tab covers one aspect of the product: Overview for the description and glossary, Definition & Lineage for where the data comes from, Run History for pipeline executions, Consumers for who uses it, and Subscriptions for access plans.',
  },
  {
    target: 'run-now',
    title: 'Trigger a pipeline run',
    body: 'Run Now starts the data pipeline immediately, outside its normal schedule. If a run fails, the system automatically retries it for you.',
  },
  {
    target: 'health-card',
    title: 'Check the latest run health',
    body: 'This card always shows the outcome of the most recent execution — status, timing, and duration — so you can spot problems at a glance without digging into the history.',
  },
  {
    target: 'run-history',
    tab: 'run-history',
    title: 'Dig into Run History',
    body: 'Every execution is listed here, newest first. The Run Type column flags amber \u26a1 Auto Rerun entries — runs the system retried automatically after a failure. Expand any row for error details, and re-execute failed runs from there.',
  },
  {
    target: 'subscriptions',
    tab: 'subscriptions',
    title: 'Manage subscriptions',
    body: 'Consumers subscribe to this data product through plans listed here. This is where access is requested, approved, and tracked.',
  },
  {
    title: 'You\u2019re all set!',
    body: 'That\u2019s the full journey — check health, review runs, and manage access. You can replay this tour anytime with the "Take a tour" button next to the tabs.',
  },
];
import { formatDateTime, formatDuration } from '../lib/format';

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab && ['overview', 'definition', 'run-history', 'consumers', 'subscriptions'].includes(tab)
      ? tab
      : 'overview';
  });
  const [tourOpen, setTourOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TOUR_DONE_KEY) !== '1';
    } catch {
      return false;
    }
  });
  const closeTour = () => {
    setTourOpen(false);
    try {
      localStorage.setItem(TOUR_DONE_KEY, '1');
    } catch {
      /* ignore */
    }
  };
  const [glossaryOpen, setGlossaryOpen] = useState(true);
  const [sampleDataOpen, setSampleDataOpen] = useState(true);

  // Queries
  const { data: product, isLoading: loadingProduct, error: productError } = useGetDataProduct(id, {
    query: { enabled: !!id, queryKey: getGetDataProductQueryKey(id), refetchInterval: (query) => query.state.data?.latestRun?.status === 'running' ? 2000 : false }
  });

  const { data: glossary } = useGetGlossaryFields(id, {
    query: { enabled: !!id, queryKey: getGetGlossaryFieldsQueryKey(id) }
  });

  const { data: sampleData } = useGetSampleData(id, {
    query: { enabled: !!id, queryKey: getGetSampleDataQueryKey(id) }
  });

  const { data: runs } = useListRuns(id, {
    query: { enabled: !!id, queryKey: getListRunsQueryKey(id) }
  });

  const { data: consumers } = useListConsumers(id, {
    query: { enabled: !!id, queryKey: getListConsumersQueryKey(id) }
  });

  // Mutations
  const triggerRunMutation = useTriggerRun();
  const updateStatusMutation = useUpdateDataProductStatus();

  const handleCopyUrn = () => {
    if (!product?.urn) return;
    navigator.clipboard.writeText(product.urn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunNow = () => {
    triggerRunMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDataProductQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListRunsQueryKey(id) });
      }
    });
  };

  const handleToggleStatus = () => {
    if (!product) return;
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: (updatedData) => {
        queryClient.setQueryData(getGetDataProductQueryKey(id), updatedData);
        // Also invalidate list so home page gets updated status
        queryClient.invalidateQueries({ queryKey: ['/api/data-products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/catalog/summary'] });
      }
    });
  };

  if (loadingProduct) return <PageLoader />;
  if (productError || !product) return <ErrorState error={productError} />;

  const isRunning = product.latestRun?.status === 'running' || triggerRunMutation.isPending;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'definition', label: 'Definition & Lineage', icon: GitBranch },
    { id: 'run-history', label: 'Run History', icon: History },
    { id: 'consumers', label: 'Consumers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/" className="hover:text-slate-900 cursor-pointer">DataVerse</Link>
                <span>/</span>
                <span className="hover:text-slate-900 cursor-pointer">{product.domain}</span>
                <span>/</span>
                <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{product.name}</span>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {product.name}
                </h1>
                {product.status === 'published' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    Draft
                  </span>
                )}
                <span className="text-sm text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md bg-slate-50 shadow-sm font-mono">
                  v{product.version}
                </span>
              </div>

              {/* Condensed Metadata Ribbon */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Domain:</span>
                  <span className="font-medium text-slate-900">{product.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Owner:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm">
                      {product.owner.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900">{product.owner}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Schedule:</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{product.schedule}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-slate-900 font-medium">{formatDateTime(product.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              <button 
                onClick={handleToggleStatus}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? <LoadingSpinner /> : <Archive className="w-4 h-4" />}
                {product.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button 
                data-tour="run-now"
                onClick={handleRunNow}
                disabled={isRunning}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Now
                  </>
                )}
              </button>
              <button className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1600px] mx-auto px-6 mt-4">
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <div data-tour="tabs" className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
            </div>
            <button
              onClick={() => setTourOpen(true)}
              className="ml-auto flex-none inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5" />
              Take a tour
            </button>
          </div>
        </div>
      </header>

      {tourOpen && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} onTabChange={setActiveTab} />}

      {/* Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row items-start gap-6">
        
        {/* Center Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          
          {activeTab === 'overview' && (
            <>
              {/* About Section */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">URN (Universal Resource Name)</div>
                    <div className="text-sm font-mono text-slate-800 break-all bg-white p-2 rounded border border-slate-200">
                      {product.urn}
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyUrn}
                    className="flex-shrink-0 p-2 text-slate-500 hover:bg-white hover:shadow-sm hover:text-indigo-600 rounded-md transition-all border border-transparent hover:border-slate-200 mt-5"
                    title="Copy URN"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </section>

              {/* Glossary Section */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <button 
                  onClick={() => setGlossaryOpen(!glossaryOpen)}
                  className="flex items-center justify-between p-4 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Data Product Glossary</h2>
                    {glossary && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium ml-2 shadow-sm">
                        {glossary.length} columns
                      </span>
                    )}
                  </div>
                  {glossaryOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </button>
                
                {glossaryOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Field Name</th>
                          <th className="px-6 py-3">Mandatory</th>
                          <th className="px-6 py-3">Data Type</th>
                          <th className="px-6 py-3">Source Table</th>
                          <th className="px-6 py-3">Source Column</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {!glossary || glossary.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">No glossary fields defined</td>
                          </tr>
                        ) : (
                          glossary.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-6 py-3 font-medium text-slate-900 flex items-center gap-2">
                                {row.fieldName}
                              </td>
                              <td className="px-6 py-3">
                                {row.mandatory ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <code className="text-xs font-mono bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-indigo-700">
                                  {row.dataType}
                                </code>
                              </td>
                              <td className="px-6 py-3 text-slate-600">{row.sourceTable}</td>
                              <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.sourceColumn}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Sample Data Section */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <button 
                  onClick={() => setSampleDataOpen(!sampleDataOpen)}
                  className="flex items-center justify-between p-4 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Sample Data</h2>
                    {sampleData && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium ml-2 shadow-sm">
                        {sampleData.rows.length} rows
                      </span>
                    )}
                  </div>
                  {sampleDataOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </button>
                
                {sampleDataOpen && (
                  <div className="overflow-x-auto relative">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20"></div>
                    
                    {!sampleData || sampleData.rows.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic">No sample data available</div>
                    ) : (
                      <table className="w-full text-sm text-left whitespace-nowrap font-mono">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            {sampleData.columns.map((col, idx) => (
                              <th 
                                key={col} 
                                className={`px-6 py-3 font-semibold tracking-wider ${idx === 0 ? 'bg-slate-50 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]' : ''}`}
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          {sampleData.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {sampleData.columns.map((col, idx) => (
                                <td 
                                  key={col} 
                                  className={`px-6 py-2.5 ${idx === 0 ? 'font-medium text-slate-900 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50' : ''}`}
                                >
                                  {row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {sampleDataOpen && sampleData && sampleData.rows.length > 0 && (
                   <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">View full dataset in Explorer</button>
                   </div>
                )}
              </section>
            </>
          )}

          {activeTab === 'consumers' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Known Consumers</h2>
              {!consumers || consumers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-lg">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p>No consumers registered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consumers.map(consumer => (
                    <div key={consumer.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{consumer.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-600">{consumer.type}</span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-600">{consumer.channel}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Last accessed: {formatDateTime(consumer.lastAccessAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'run-history' && <div data-tour="run-history"><RunHistoryTab productId={id} /></div>}

          {activeTab === 'subscriptions' && <div data-tour="subscriptions"><SubscriptionsTab productId={id} /></div>}

          {activeTab === 'definition' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="text-center py-16 text-slate-500">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Lineage Graph</h3>
                <p className="max-w-md mx-auto">Visual lineage representation would be rendered here, showing upstream sources and downstream dependencies based on the glossary definition.</p>
                {product.sourceAlignment && (
                  <div className="mt-6 inline-block bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Source Alignment</div>
                    <code className="text-sm font-mono text-indigo-700">{product.sourceAlignment}</code>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Right Rail */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          
          {/* Run Health Card */}
          <div data-tour="health-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Latest Run Health</h3>
              <button onClick={() => setActiveTab('run-history')} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">View history</button>
            </div>
            
            <div className="p-5">
              {!product.latestRun ? (
                <div className="text-slate-500 text-sm text-center py-4 italic">No runs yet</div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      product.latestRun.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      product.latestRun.status === 'failed' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                      'bg-indigo-50 border-indigo-100 text-indigo-600'
                    }`}>
                      {product.latestRun.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                      {product.latestRun.status === 'failed' && <AlertCircle className="w-6 h-6" />}
                      {product.latestRun.status === 'running' && <Activity className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 capitalize">{product.latestRun.status}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]" title={product.latestRun.message || "Pipeline status"}>
                        {product.latestRun.message || (product.latestRun.status === 'running' ? 'Pipeline currently running' : 'Pipeline completed')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Started</span>
                      </div>
                      <span className="text-slate-900 font-medium">{formatDateTime(product.latestRun.startedAt)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Ended</span>
                      </div>
                      <span className="text-slate-900 font-medium">{formatDateTime(product.latestRun.endedAt)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Activity className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <span className="text-slate-900 font-mono font-medium">{formatDuration(product.latestRun.durationSeconds)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Quick Actions / Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('definition')}
                className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                <span className="font-medium">View Source Alignment</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => setActiveTab('consumers')}
                className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                <span className="font-medium">Review Subscriptions</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
}
