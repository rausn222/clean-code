/**
 * DataProductDetailPage — single-file React + Tailwind CSS component (TSX).
 *
 * Dependencies: react, lucide-react (icons), Tailwind CSS configured in the host app.
 * Drop this file into any React project and render <DataProductDetailPage />.
 *
 * All data is self-contained below in SAMPLE_PRODUCT / SAMPLE_* constants —
 * replace them with your API data, or pass a product via props.
 */

import React, { useEffect, useState } from "react";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Styling bootstrap
// ---------------------------------------------------------------------------
// If your project does NOT have Tailwind CSS configured, this hook loads the
// Tailwind Play CDN at runtime so every className in this file works
// out of the box. If your project already has Tailwind, it does nothing
// (it detects existing Tailwind styles and skips the CDN).
//
// NOTE: The Play CDN is fine for demos/prototypes. For production, install
// Tailwind properly (https://tailwindcss.com/docs/installation) and this
// hook will automatically be a no-op.

const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  .dp-page {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .dp-page button { font-family: inherit; cursor: pointer; background: none; border: none; padding: 0; }
  .dp-page table { border-collapse: collapse; }
  .dp-page code, .dp-page .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
`;

function useTailwind() {
  useEffect(() => {
    // Inject base reset + font styles once.
    if (!document.getElementById("dp-base-css")) {
      const style = document.createElement("style");
      style.id = "dp-base-css";
      style.textContent = BASE_CSS;
      document.head.appendChild(style);
    }

    // Detect whether Tailwind is already available by testing a utility class.
    const probe = document.createElement("div");
    probe.className = "hidden";
    probe.style.position = "absolute";
    document.body.appendChild(probe);
    const hasTailwind = getComputedStyle(probe).display === "none";
    document.body.removeChild(probe);

    if (!hasTailwind && !document.getElementById("dp-tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "dp-tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductRun {
  id: number;
  status: "running" | "success" | "failed";
  message?: string | null;
  startedAt: string; // ISO
  endedAt?: string | null;
  durationSeconds?: number | null;
  rowsProcessed?: number | null;
}

export interface DataProduct {
  id: number;
  name: string;
  urn: string;
  description: string;
  domain: string;
  owner: string;
  status: "published" | "draft";
  version: string;
  schedule: string;
  sourceAlignment?: string | null;
  tags: string[];
  latestRun?: ProductRun | null;
  updatedAt: string;
}

export interface GlossaryField {
  id: number;
  fieldName: string;
  mandatory: boolean;
  dataType: string;
  sourceTable: string;
  sourceColumn: string;
}

export interface SampleData {
  columns: string[];
  rows: Record<string, string>[];
}

export interface Consumer {
  id: number;
  name: string;
  type: string;
  channel: string;
  lastAccessAt: string;
}

// ---------------------------------------------------------------------------
// Sample data (replace with your API data)
// ---------------------------------------------------------------------------

const SAMPLE_LATEST_RUN: ProductRun = {
  id: 1,
  status: "success",
  message: "Pipeline completed successfully",
  startedAt: "2026-07-14T12:17:00Z",
  endedAt: "2026-07-14T12:20:00Z",
  durationSeconds: 192,
  rowsProcessed: 48213,
};

const SAMPLE_PRODUCT: DataProduct = {
  id: 1,
  name: "read_pq_test_dp_test_priva7",
  urn: "urn:li:dataProduct:engineering:read_pq_test_dp_test_priva7",
  description:
    "This data product contains consolidated vehicle master data from various engineering sources. It provides a unified view of vehicle models, specifications, and configurations used across downstream analytical applications and reporting systems.",
  domain: "Engineering",
  owner: "A. Sharma",
  status: "published",
  version: "1.0.5",
  schedule: "Daily at 02:00 UTC",
  sourceAlignment: "Aligned",
  tags: ["PII Data", "Core Master", "Daily Sync"],
  latestRun: SAMPLE_LATEST_RUN,
  updatedAt: "2026-07-14T12:20:00Z",
};

const SAMPLE_GLOSSARY: GlossaryField[] = [
  { id: 1, fieldName: "vehm_model_code", mandatory: true, dataType: "VARCHAR(20)", sourceTable: "src_vehicle_master", sourceColumn: "model_cd" },
  { id: 2, fieldName: "vehm_model_desc", mandatory: false, dataType: "VARCHAR(100)", sourceTable: "src_vehicle_master", sourceColumn: "model_desc" },
  { id: 3, fieldName: "vehm_color_code", mandatory: false, dataType: "VARCHAR(10)", sourceTable: "src_vehicle_master", sourceColumn: "color_cd" },
  { id: 4, fieldName: "vehm_engine_no", mandatory: true, dataType: "VARCHAR(50)", sourceTable: "src_vehicle_master", sourceColumn: "engine_no" },
  { id: 5, fieldName: "vehm_fuel_type", mandatory: true, dataType: "VARCHAR(20)", sourceTable: "src_vehicle_master", sourceColumn: "fuel_type" },
];

const SAMPLE_DATA: SampleData = {
  columns: ["vehm_model_code", "vehm_model_desc", "vehm_color_code", "vehm_engine_no", "vehm_fuel_type"],
  rows: [
    { vehm_model_code: "GLHHS446", vehm_model_desc: "GYPSY 1300 CC HT", vehm_color_code: "BLK", vehm_engine_no: "ENG123456", vehm_fuel_type: "Petrol" },
    { vehm_model_code: "GLHWS446", vehm_model_desc: "GYPSY 1300 CC ST", vehm_color_code: "WHT", vehm_engine_no: "ENG123998", vehm_fuel_type: "Petrol" },
    { vehm_model_code: "GREHS457", vehm_model_desc: "GYP 1.3L KING HT", vehm_color_code: "SLV", vehm_engine_no: "ENG127765", vehm_fuel_type: "Petrol" },
    { vehm_model_code: "BLZVX520", vehm_model_desc: "BALENO 1.2L ZETA", vehm_color_code: "BLU", vehm_engine_no: "ENG201883", vehm_fuel_type: "Petrol" },
    { vehm_model_code: "SWDLX318", vehm_model_desc: "SWIFT 1.2L DLX", vehm_color_code: "RED", vehm_engine_no: "ENG305114", vehm_fuel_type: "Petrol" },
    { vehm_model_code: "ERTZA615", vehm_model_desc: "ERTIGA 1.5L ZXI", vehm_color_code: "GRY", vehm_engine_no: "ENG412773", vehm_fuel_type: "Hybrid" },
    { vehm_model_code: "BRZVD290", vehm_model_desc: "BREZZA 1.5L VDI", vehm_color_code: "WHT", vehm_engine_no: "ENG518220", vehm_fuel_type: "Diesel" },
    { vehm_model_code: "CELX0110", vehm_model_desc: "CELERIO 1.0L LXI", vehm_color_code: "SLV", vehm_engine_no: "ENG611044", vehm_fuel_type: "CNG" },
  ],
};

const SAMPLE_RUNS: ProductRun[] = [
  SAMPLE_LATEST_RUN,
  { id: 2, status: "success", message: "Pipeline completed successfully", startedAt: "2026-07-13T12:17:00Z", endedAt: "2026-07-13T12:20:12Z", durationSeconds: 195, rowsProcessed: 48102 },
  { id: 3, status: "failed", message: "Source table src_vehicle_master unavailable", startedAt: "2026-07-12T12:17:00Z", endedAt: "2026-07-12T12:18:05Z", durationSeconds: 65, rowsProcessed: 0 },
  { id: 4, status: "success", message: "Pipeline completed successfully", startedAt: "2026-07-11T12:17:00Z", endedAt: "2026-07-11T12:20:30Z", durationSeconds: 210, rowsProcessed: 47990 },
];

const SAMPLE_CONSUMERS: Consumer[] = [
  { id: 1, name: "Vehicle Analytics Dashboard", type: "Application", channel: "REST API", lastAccessAt: "2026-07-15T11:32:00Z" },
  { id: 2, name: "Quality Reporting Suite", type: "BI Tool", channel: "Snowflake Share", lastAccessAt: "2026-07-15T07:15:00Z" },
  { id: 3, name: "Dealer Data Mart", type: "Data Pipeline", channel: "Batch Export", lastAccessAt: "2026-07-14T22:40:00Z" },
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds?: number | null): string {
  if (seconds == null) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type TabId = "overview" | "definition" | "operations" | "consumers";

export interface DataProductDetailPageProps {
  product?: DataProduct;
  glossary?: GlossaryField[];
  sampleData?: SampleData;
  runs?: ProductRun[];
  consumers?: Consumer[];
  onRunNow?: () => void;
  onToggleStatus?: () => void;
}

export default function DataProductDetailPage({
  product = SAMPLE_PRODUCT,
  glossary = SAMPLE_GLOSSARY,
  sampleData = SAMPLE_DATA,
  runs = SAMPLE_RUNS,
  consumers = SAMPLE_CONSUMERS,
  onRunNow,
  onToggleStatus,
}: DataProductDetailPageProps) {
  useTailwind();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [glossaryOpen, setGlossaryOpen] = useState(true);
  const [sampleDataOpen, setSampleDataOpen] = useState(true);

  const handleCopyUrn = () => {
    navigator.clipboard.writeText(product.urn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRunning = product.latestRun?.status === "running";

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "definition", label: "Definition & Lineage", icon: GitBranch },
    { id: "operations", label: "Runs & Health", icon: Activity },
    { id: "consumers", label: "Consumers", icon: Users },
  ];

  return (
    <div className="dp-page min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span className="hover:text-slate-900 cursor-pointer">DataVerse</span>
                <span>/</span>
                <span className="hover:text-slate-900 cursor-pointer">{product.domain}</span>
                <span>/</span>
                <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{product.name}</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
                {product.status === "published" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Draft
                  </span>
                )}
                <span className="text-sm text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md bg-slate-50 shadow-sm font-mono">
                  v{product.version}
                </span>
              </div>

              {/* Metadata ribbon */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Domain:</span>
                  <span className="font-medium text-slate-900">{product.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Owner:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm">
                      {product.owner.substring(0, 2).toUpperCase()}
                    </span>
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

            {/* Actions */}
            <div className="flex items-center gap-3 self-start">
              <button
                onClick={onToggleStatus}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <Archive className="w-4 h-4" />
                {product.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={onRunNow}
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

        {/* Tabs */}
        <div className="max-w-[1600px] mx-auto px-6 mt-4">
          <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex flex-col lg:flex-row items-start gap-6">
        {/* Center content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {activeTab === "overview" && (
            <>
              {/* About */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                      URN (Universal Resource Name)
                    </div>
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

              {/* Glossary */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <button
                  onClick={() => setGlossaryOpen(!glossaryOpen)}
                  className="flex items-center justify-between p-4 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Data Product Glossary</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium ml-2 shadow-sm">
                      {glossary.length} columns
                    </span>
                  </div>
                  {glossaryOpen ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
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
                        {glossary.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                              No glossary fields defined
                            </td>
                          </tr>
                        ) : (
                          glossary.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-6 py-3 font-medium text-slate-900">{row.fieldName}</td>
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

              {/* Sample Data */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <button
                  onClick={() => setSampleDataOpen(!sampleDataOpen)}
                  className="flex items-center justify-between p-4 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Sample Data</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium ml-2 shadow-sm">
                      {sampleData.rows.length} rows
                    </span>
                  </div>
                  {sampleDataOpen ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {sampleDataOpen && (
                  <div className="overflow-x-auto relative">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20" />
                    {sampleData.rows.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic">No sample data available</div>
                    ) : (
                      <table className="w-full text-sm text-left whitespace-nowrap font-mono">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            {sampleData.columns.map((col, idx) => (
                              <th
                                key={col}
                                className={`px-6 py-3 font-semibold tracking-wider ${
                                  idx === 0 ? "bg-slate-50 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]" : ""
                                }`}
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
                                  className={`px-6 py-2.5 ${
                                    idx === 0
                                      ? "font-medium text-slate-900 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]"
                                      : ""
                                  }`}
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
                {sampleDataOpen && sampleData.rows.length > 0 && (
                  <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      View full dataset in Explorer
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === "operations" && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Run History</h2>
                <button
                  onClick={onRunNow}
                  disabled={isRunning}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 disabled:opacity-50"
                >
                  Trigger Run
                </button>
              </div>

              {runs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-lg">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p>No runs recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">Started At</th>
                        <th className="px-6 py-3 font-semibold">Duration</th>
                        <th className="px-6 py-3 font-semibold">Rows Processed</th>
                        <th className="px-6 py-3 font-semibold">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {runs.map((run) => (
                        <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3">
                            {run.status === "success" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Success
                              </span>
                            )}
                            {run.status === "failed" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                            {run.status === "running" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Activity className="w-3.5 h-3.5 animate-pulse" /> Running
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-slate-900 font-medium">{formatDateTime(run.startedAt)}</td>
                          <td className="px-6 py-3 text-slate-600 font-mono">{formatDuration(run.durationSeconds)}</td>
                          <td className="px-6 py-3 text-slate-600 font-mono">
                            {run.rowsProcessed != null ? run.rowsProcessed.toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-3 text-slate-500 text-xs truncate max-w-[200px]" title={run.message || ""}>
                            {run.message || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "consumers" && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Known Consumers</h2>
              {consumers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-lg">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p>No consumers registered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consumers.map((consumer) => (
                    <div
                      key={consumer.id}
                      className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{consumer.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-600">
                            {consumer.type}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-600">
                            {consumer.channel}
                          </span>
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

          {activeTab === "definition" && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="text-center py-16 text-slate-500">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Lineage Graph</h3>
                <p className="max-w-md mx-auto">
                  Visual lineage representation would be rendered here, showing upstream sources and downstream
                  dependencies based on the glossary definition.
                </p>
                {product.sourceAlignment && (
                  <div className="mt-6 inline-block bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Source Alignment
                    </div>
                    <code className="text-sm font-mono text-indigo-700">{product.sourceAlignment}</code>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          {/* Run health */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Latest Run Health</h3>
              <button
                onClick={() => setActiveTab("operations")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View history
              </button>
            </div>

            <div className="p-5">
              {!product.latestRun ? (
                <div className="text-slate-500 text-sm text-center py-4 italic">No runs yet</div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        product.latestRun.status === "success"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : product.latestRun.status === "failed"
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : "bg-indigo-50 border-indigo-100 text-indigo-600"
                      }`}
                    >
                      {product.latestRun.status === "success" && <CheckCircle2 className="w-6 h-6" />}
                      {product.latestRun.status === "failed" && <AlertCircle className="w-6 h-6" />}
                      {product.latestRun.status === "running" && <Activity className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 capitalize">{product.latestRun.status}</div>
                      <div
                        className="text-xs text-slate-500 truncate max-w-[180px]"
                        title={product.latestRun.message || "Pipeline status"}
                      >
                        {product.latestRun.message ||
                          (product.latestRun.status === "running" ? "Pipeline currently running" : "Pipeline completed")}
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
                      <span className="text-slate-900 font-mono font-medium">
                        {formatDuration(product.latestRun.durationSeconds)}
                      </span>
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
                  {product.tags.length > 0 ? (
                    product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm"
                      >
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

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("definition")}
                className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                <span className="font-medium">View Source Alignment</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setActiveTab("consumers")}
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
