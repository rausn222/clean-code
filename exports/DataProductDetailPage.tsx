/**
 * DataProductDetailPage — fully self-contained React component (TSX).
 *
 * ALL styling (colors, shadows, spacing, tabs, tables, hover states) is
 * embedded in this file as plain CSS — no Tailwind, no external stylesheet,
 * no CDN required. Only dependencies: react and lucide-react (icons).
 *
 * Usage: drop this file into any React project and render
 *   <DataProductDetailPage />
 *
 * Sample data is inlined below; replace it or pass props to use real data.
 */

import React, { useState } from "react";
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
// Embedded stylesheet — every color, shadow and style used by the page
// ---------------------------------------------------------------------------

const STYLES = `
/* ---------- Color palette ----------
   Background page:   #f8fafc  (light slate)
   Card background:   #ffffff
   Borders:           #e2e8f0 / #f1f5f9
   Text primary:      #0f172a
   Text secondary:    #475569
   Text muted:        #94a3b8
   Brand (indigo):    #4f46e5 (buttons), #4338ca (hover), #eef2ff (tint)
   Success (emerald): #059669 text, #ecfdf5 bg, #a7f3d0 border
   Danger (rose):     #e11d48 text, #fff1f2 bg, #fecdd3 border
------------------------------------- */

.dpd, .dpd * { box-sizing: border-box; margin: 0; padding: 0; }

.dpd {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.5;
}

.dpd button { font-family: inherit; cursor: pointer; background: none; border: none; color: inherit; }
.dpd table { border-collapse: collapse; width: 100%; }
.dpd .mono, .dpd code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

/* ---------- Header ---------- */
.dpd-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.dpd-header-inner { max-width: 1600px; margin: 0 auto; padding: 16px 24px 0; }
.dpd-header-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; }

.dpd-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; margin-bottom: 8px; }
.dpd-breadcrumb .crumb-link { cursor: pointer; }
.dpd-breadcrumb .crumb-link:hover { color: #0f172a; }
.dpd-breadcrumb .crumb-current { color: #0f172a; font-weight: 500; }

.dpd-title-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.dpd-title { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #0f172a; }

/* Badges */
.dpd-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.dpd-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.dpd-badge-published { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.dpd-badge-published .dpd-badge-dot { background: #10b981; }
.dpd-badge-draft { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
.dpd-badge-draft .dpd-badge-dot { background: #94a3b8; }
.dpd-version {
  font-size: 14px; color: #64748b; border: 1px solid #e2e8f0;
  padding: 2px 8px; border-radius: 6px; background: #f8fafc;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* Metadata ribbon */
.dpd-meta { display: flex; flex-wrap: wrap; align-items: center; column-gap: 24px; row-gap: 8px; margin-top: 16px; font-size: 14px; color: #475569; }
.dpd-meta-item { display: flex; align-items: center; gap: 8px; }
.dpd-meta-label { color: #94a3b8; }
.dpd-meta-value { font-weight: 500; color: #0f172a; display: inline-flex; align-items: center; gap: 6px; }
.dpd-avatar {
  width: 20px; height: 20px; border-radius: 50%;
  background: #e0e7ff; color: #4338ca;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.dpd-meta-icon { width: 16px; height: 16px; color: #94a3b8; }

/* Action buttons */
.dpd-actions { display: flex; align-items: center; gap: 12px; align-self: flex-start; }
.dpd-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.dpd-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.dpd-btn-secondary { background: #ffffff; border: 1px solid #cbd5e1; color: #334155; }
.dpd-btn-secondary:hover:not(:disabled) { background: #f8fafc; color: #0f172a; }
.dpd-btn-primary { background: #4f46e5; border: 1px solid #4f46e5; color: #ffffff; }
.dpd-btn-primary:hover:not(:disabled) { background: #4338ca; }
.dpd-btn-icon { padding: 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #334155; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.dpd-btn-icon:hover { background: #f8fafc; }
.dpd-btn-tint {
  padding: 6px 12px; background: #eef2ff; color: #4338ca;
  border: 1px solid #c7d2fe; border-radius: 6px;
  font-size: 14px; font-weight: 500; transition: background-color 0.15s ease;
}
.dpd-btn-tint:hover:not(:disabled) { background: #e0e7ff; }
.dpd-btn-tint:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- Tabs ---------- */
.dpd-tabs { max-width: 1600px; margin: 16px auto 0; padding: 0 24px; }
.dpd-tabs-list { display: flex; gap: 4px; border-bottom: 1px solid #e2e8f0; overflow-x: auto; }
.dpd-tab {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  font-size: 14px; font-weight: 500;
  border-bottom: 2px solid transparent;
  color: #64748b;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.dpd-tab:hover { color: #1e293b; border-bottom-color: #cbd5e1; }
.dpd-tab.active { color: #4338ca; border-bottom-color: #4f46e5; }
.dpd-tab svg { width: 16px; height: 16px; }
.dpd-tab.active svg { color: #4f46e5; }

/* ---------- Layout ---------- */
.dpd-main {
  flex: 1; max-width: 1600px; width: 100%; margin: 0 auto;
  padding: 24px; display: flex; align-items: flex-start; gap: 24px;
}
.dpd-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 24px; }
.dpd-rail { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; }
@media (max-width: 1024px) {
  .dpd-main { flex-direction: column; }
  .dpd-rail { width: 100%; }
}

/* ---------- Cards ---------- */
.dpd-card {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.dpd-card-pad { padding: 24px; }
.dpd-section-title { font-size: 18px; font-weight: 600; color: #0f172a; }
.dpd-desc { color: #475569; font-size: 14px; line-height: 1.65; margin: 16px 0 24px; white-space: pre-wrap; }

/* URN box */
.dpd-urn-box {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 16px; background: #f8fafc; border-radius: 8px;
  border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
}
.dpd-urn-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.dpd-urn-value {
  font-size: 14px; color: #1e293b; word-break: break-all;
  background: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.dpd-copy-btn {
  flex-shrink: 0; padding: 8px; margin-top: 20px; border-radius: 6px;
  color: #64748b; border: 1px solid transparent;
  transition: all 0.15s ease;
}
.dpd-copy-btn:hover { background: #ffffff; color: #4f46e5; border-color: #e2e8f0; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }

/* Collapsible section headers */
.dpd-collapse-head {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 16px; text-align: left;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.15s ease;
}
.dpd-collapse-head:hover { background: #f1f5f9; }
.dpd-collapse-title { display: flex; align-items: center; gap: 8px; }
.dpd-collapse-title svg { width: 20px; height: 20px; color: #4f46e5; }
.dpd-chevron { width: 20px; height: 20px; color: #94a3b8; }
.dpd-count-pill {
  padding: 2px 10px; border-radius: 999px; margin-left: 8px;
  background: #ffffff; border: 1px solid #e2e8f0; color: #475569;
  font-size: 12px; font-weight: 500; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}

/* ---------- Tables ---------- */
.dpd-table-wrap { overflow-x: auto; }
.dpd th {
  padding: 12px 24px; text-align: left;
  font-size: 11px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
  background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.dpd td { padding: 12px 24px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
.dpd tbody tr { transition: background-color 0.15s ease; }
.dpd tbody tr:hover { background: rgba(248, 250, 252, 0.8); }
.dpd tbody tr:last-child td { border-bottom: none; }
.dpd td.strong { font-weight: 500; color: #0f172a; }
.dpd td.muted { color: #475569; }
.dpd td.mono-cell { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }

/* Small badges inside tables */
.dpd-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 12px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04); }
.dpd-pill-yes { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; font-weight: 700; }
.dpd-pill-no  { color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; font-weight: 500; }
.dpd-datatype {
  font-size: 12px; padding: 2px 6px; border-radius: 4px;
  background: #eef2ff; border: 1px solid #e0e7ff; color: #4338ca;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* Run status badges */
.dpd-run-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.dpd-run-badge svg { width: 14px; height: 14px; }
.dpd-run-success { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.dpd-run-failed  { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
.dpd-run-running { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }

/* Sample data table */
.dpd-sample-table { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.dpd-sample-table td { color: #475569; padding: 10px 24px; }
.dpd-sample-table td.first { font-weight: 500; color: #0f172a; }
.dpd-sample-footer { background: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; }
.dpd-link-btn { font-size: 14px; font-weight: 500; color: #4f46e5; transition: color 0.15s ease; }
.dpd-link-btn:hover { color: #3730a3; }

/* Empty states */
.dpd-empty {
  text-align: center; padding: 48px 16px; color: #64748b;
  border: 1px dashed #e2e8f0; border-radius: 8px;
}
.dpd-empty svg { width: 32px; height: 32px; color: #cbd5e1; margin: 0 auto 12px; display: block; }

/* Consumers grid */
.dpd-consumers { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 768px) { .dpd-consumers { grid-template-columns: 1fr 1fr; } }
.dpd-consumer {
  display: flex; align-items: flex-start; gap: 16px; padding: 16px;
  border: 1px solid #e2e8f0; border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  transition: border-color 0.15s ease;
}
.dpd-consumer:hover { border-color: #c7d2fe; }
.dpd-consumer-icon {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: #f1f5f9; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.dpd-consumer-icon svg { width: 20px; height: 20px; }
.dpd-consumer-name { font-weight: 600; color: #0f172a; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dpd-consumer-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 8px; }
.dpd-consumer-tag { padding: 2px 8px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 12px; font-weight: 500; color: #475569; }
.dpd-consumer-access { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }
.dpd-consumer-access svg { width: 14px; height: 14px; }

/* Lineage placeholder */
.dpd-lineage { text-align: center; padding: 64px 16px; color: #64748b; }
.dpd-lineage svg { width: 48px; height: 48px; color: #cbd5e1; margin: 0 auto 16px; display: block; }
.dpd-lineage h3 { font-size: 18px; font-weight: 500; color: #0f172a; margin-bottom: 8px; }
.dpd-lineage p { max-width: 420px; margin: 0 auto; font-size: 14px; }
.dpd-alignment { margin-top: 24px; display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: left; }
.dpd-alignment-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
.dpd-alignment code { font-size: 14px; color: #4338ca; }

/* ---------- Right rail ---------- */
.dpd-rail-head {
  padding: 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
  display: flex; align-items: center; justify-content: space-between;
}
.dpd-rail-title { font-weight: 600; color: #0f172a; font-size: 15px; }
.dpd-rail-link { font-size: 12px; font-weight: 500; color: #4f46e5; }
.dpd-rail-link:hover { color: #3730a3; }
.dpd-rail-body { padding: 20px; }

.dpd-health { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.dpd-health-icon {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; border: 1px solid;
}
.dpd-health-icon svg { width: 24px; height: 24px; }
.dpd-health-success { background: #ecfdf5; border-color: #d1fae5; color: #059669; }
.dpd-health-failed  { background: #fff1f2; border-color: #ffe4e6; color: #e11d48; }
.dpd-health-running { background: #eef2ff; border-color: #e0e7ff; color: #4f46e5; }
.dpd-health-status { font-size: 18px; font-weight: 700; color: #0f172a; text-transform: capitalize; }
.dpd-health-msg { font-size: 12px; color: #64748b; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dpd-stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; margin-bottom: 16px; }
.dpd-stat-row:last-child { margin-bottom: 0; }
.dpd-stat-label { display: flex; align-items: center; gap: 8px; color: #64748b; }
.dpd-stat-label svg { width: 16px; height: 16px; }
.dpd-stat-value { color: #0f172a; font-weight: 500; }

.dpd-tags-block { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.dpd-tags-label {
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
  display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
}
.dpd-tags-label svg { width: 14px; height: 14px; }
.dpd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.dpd-tag {
  padding: 4px 10px; background: #f1f5f9; border: 1px solid #e2e8f0;
  color: #334155; font-size: 12px; font-weight: 500; border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}

.dpd-quicklinks { padding: 16px; }
.dpd-quicklinks h3 { font-weight: 600; color: #0f172a; margin-bottom: 12px; font-size: 14px; }
.dpd-quicklink {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 8px; font-size: 14px; color: #475569; border-radius: 6px;
  transition: background-color 0.15s ease, color 0.15s ease;
  font-weight: 500; text-align: left;
}
.dpd-quicklink:hover { color: #0f172a; background: #f8fafc; }
.dpd-quicklink svg { width: 16px; height: 16px; color: #94a3b8; }

/* Utility */
.dpd-icon-sm { width: 16px; height: 16px; }
.dpd-pulse { animation: dpd-pulse 1.5s ease-in-out infinite; }
@keyframes dpd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

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
    <div className="dpd">
      {/* Embedded stylesheet — makes the component fully self-contained */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ---------------- Header ---------------- */}
      <header className="dpd-header">
        <div className="dpd-header-inner">
          <div className="dpd-header-row">
            <div>
              <div className="dpd-breadcrumb">
                <span className="crumb-link">DataVerse</span>
                <span>/</span>
                <span className="crumb-link">{product.domain}</span>
                <span>/</span>
                <span className="crumb-current">{product.name}</span>
              </div>

              <div className="dpd-title-row">
                <h1 className="dpd-title">{product.name}</h1>
                {product.status === "published" ? (
                  <span className="dpd-badge dpd-badge-published">
                    <span className="dpd-badge-dot" />
                    Published
                  </span>
                ) : (
                  <span className="dpd-badge dpd-badge-draft">
                    <span className="dpd-badge-dot" />
                    Draft
                  </span>
                )}
                <span className="dpd-version">v{product.version}</span>
              </div>

              <div className="dpd-meta">
                <div className="dpd-meta-item">
                  <span className="dpd-meta-label">Domain:</span>
                  <span className="dpd-meta-value">{product.domain}</span>
                </div>
                <div className="dpd-meta-item">
                  <span className="dpd-meta-label">Owner:</span>
                  <span className="dpd-meta-value">
                    <span className="dpd-avatar">{product.owner.substring(0, 2).toUpperCase()}</span>
                    {product.owner}
                  </span>
                </div>
                <div className="dpd-meta-item">
                  <span className="dpd-meta-label">Schedule:</span>
                  <span className="dpd-meta-value">
                    <Clock className="dpd-meta-icon" />
                    {product.schedule}
                  </span>
                </div>
                <div className="dpd-meta-item">
                  <span className="dpd-meta-label">Last Updated:</span>
                  <span className="dpd-meta-value">{formatDateTime(product.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="dpd-actions">
              <button className="dpd-btn dpd-btn-secondary" onClick={onToggleStatus}>
                <Archive className="dpd-icon-sm" />
                {product.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button className="dpd-btn dpd-btn-primary" onClick={onRunNow} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Activity className="dpd-icon-sm dpd-pulse" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="dpd-icon-sm" />
                    Run Now
                  </>
                )}
              </button>
              <button className="dpd-btn-icon">
                <MoreVertical className="dpd-icon-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- Tabs ---------------- */}
        <div className="dpd-tabs">
          <div className="dpd-tabs-list">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`dpd-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ---------------- Main ---------------- */}
      <main className="dpd-main">
        <div className="dpd-content">
          {activeTab === "overview" && (
            <>
              {/* About */}
              <section className="dpd-card dpd-card-pad">
                <h2 className="dpd-section-title">About</h2>
                <p className="dpd-desc">{product.description || "No description provided."}</p>

                <div className="dpd-urn-box">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dpd-urn-label">URN (Universal Resource Name)</div>
                    <div className="dpd-urn-value">{product.urn}</div>
                  </div>
                  <button className="dpd-copy-btn" onClick={handleCopyUrn} title="Copy URN">
                    {copied ? <Check className="dpd-icon-sm" style={{ color: "#059669" }} /> : <Copy className="dpd-icon-sm" />}
                  </button>
                </div>
              </section>

              {/* Glossary */}
              <section className="dpd-card">
                <button className="dpd-collapse-head" onClick={() => setGlossaryOpen(!glossaryOpen)}>
                  <span className="dpd-collapse-title">
                    <Database />
                    <span className="dpd-section-title">Data Product Glossary</span>
                    <span className="dpd-count-pill">{glossary.length} columns</span>
                  </span>
                  {glossaryOpen ? <ChevronDown className="dpd-chevron" /> : <ChevronRight className="dpd-chevron" />}
                </button>

                {glossaryOpen && (
                  <div className="dpd-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Mandatory</th>
                          <th>Data Type</th>
                          <th>Source Table</th>
                          <th>Source Column</th>
                        </tr>
                      </thead>
                      <tbody>
                        {glossary.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "32px", fontStyle: "italic", color: "#64748b" }}>
                              No glossary fields defined
                            </td>
                          </tr>
                        ) : (
                          glossary.map((row) => (
                            <tr key={row.id}>
                              <td className="strong">{row.fieldName}</td>
                              <td>
                                {row.mandatory ? (
                                  <span className="dpd-pill dpd-pill-yes">Yes</span>
                                ) : (
                                  <span className="dpd-pill dpd-pill-no">No</span>
                                )}
                              </td>
                              <td>
                                <code className="dpd-datatype">{row.dataType}</code>
                              </td>
                              <td className="muted">{row.sourceTable}</td>
                              <td className="muted mono-cell">{row.sourceColumn}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Sample Data */}
              <section className="dpd-card">
                <button className="dpd-collapse-head" onClick={() => setSampleDataOpen(!sampleDataOpen)}>
                  <span className="dpd-collapse-title">
                    <Search />
                    <span className="dpd-section-title">Sample Data</span>
                    <span className="dpd-count-pill">{sampleData.rows.length} rows</span>
                  </span>
                  {sampleDataOpen ? <ChevronDown className="dpd-chevron" /> : <ChevronRight className="dpd-chevron" />}
                </button>

                {sampleDataOpen && (
                  <div className="dpd-table-wrap">
                    {sampleData.rows.length === 0 ? (
                      <div style={{ padding: "32px", textAlign: "center", fontStyle: "italic", color: "#64748b" }}>
                        No sample data available
                      </div>
                    ) : (
                      <table className="dpd-sample-table">
                        <thead>
                          <tr>
                            {sampleData.columns.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleData.rows.map((row, i) => (
                            <tr key={i}>
                              {sampleData.columns.map((col, idx) => (
                                <td key={col} className={idx === 0 ? "first" : ""}>
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
                  <div className="dpd-sample-footer">
                    <button className="dpd-link-btn">View full dataset in Explorer</button>
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === "operations" && (
            <section className="dpd-card dpd-card-pad">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 className="dpd-section-title">Run History</h2>
                <button className="dpd-btn-tint" onClick={onRunNow} disabled={isRunning}>
                  Trigger Run
                </button>
              </div>

              {runs.length === 0 ? (
                <div className="dpd-empty">
                  <Activity />
                  <p>No runs recorded yet.</p>
                </div>
              ) : (
                <div className="dpd-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Started At</th>
                        <th>Duration</th>
                        <th>Rows Processed</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run) => (
                        <tr key={run.id}>
                          <td>
                            {run.status === "success" && (
                              <span className="dpd-run-badge dpd-run-success">
                                <CheckCircle2 /> Success
                              </span>
                            )}
                            {run.status === "failed" && (
                              <span className="dpd-run-badge dpd-run-failed">
                                <AlertCircle /> Failed
                              </span>
                            )}
                            {run.status === "running" && (
                              <span className="dpd-run-badge dpd-run-running">
                                <Activity className="dpd-pulse" /> Running
                              </span>
                            )}
                          </td>
                          <td className="strong">{formatDateTime(run.startedAt)}</td>
                          <td className="muted mono-cell">{formatDuration(run.durationSeconds)}</td>
                          <td className="muted mono-cell">
                            {run.rowsProcessed != null ? run.rowsProcessed.toLocaleString() : "-"}
                          </td>
                          <td className="muted" style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }} title={run.message || ""}>
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
            <section className="dpd-card dpd-card-pad">
              <h2 className="dpd-section-title" style={{ marginBottom: 24 }}>
                Known Consumers
              </h2>
              {consumers.length === 0 ? (
                <div className="dpd-empty">
                  <Users />
                  <p>No consumers registered.</p>
                </div>
              ) : (
                <div className="dpd-consumers">
                  {consumers.map((consumer) => (
                    <div key={consumer.id} className="dpd-consumer">
                      <div className="dpd-consumer-icon">
                        <Database />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="dpd-consumer-name">{consumer.name}</h3>
                        <div className="dpd-consumer-tags">
                          <span className="dpd-consumer-tag">{consumer.type}</span>
                          <span className="dpd-consumer-tag">{consumer.channel}</span>
                        </div>
                        <div className="dpd-consumer-access">
                          <Clock /> Last accessed: {formatDateTime(consumer.lastAccessAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "definition" && (
            <section className="dpd-card dpd-card-pad">
              <div className="dpd-lineage">
                <GitBranch />
                <h3>Lineage Graph</h3>
                <p>
                  Visual lineage representation would be rendered here, showing upstream sources and downstream
                  dependencies based on the glossary definition.
                </p>
                {product.sourceAlignment && (
                  <div className="dpd-alignment">
                    <div className="dpd-alignment-label">Source Alignment</div>
                    <code>{product.sourceAlignment}</code>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* ---------------- Right rail ---------------- */}
        <aside className="dpd-rail">
          <div className="dpd-card">
            <div className="dpd-rail-head">
              <h3 className="dpd-rail-title">Latest Run Health</h3>
              <button className="dpd-rail-link" onClick={() => setActiveTab("operations")}>
                View history
              </button>
            </div>

            <div className="dpd-rail-body">
              {!product.latestRun ? (
                <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
                  No runs yet
                </div>
              ) : (
                <>
                  <div className="dpd-health">
                    <div
                      className={`dpd-health-icon ${
                        product.latestRun.status === "success"
                          ? "dpd-health-success"
                          : product.latestRun.status === "failed"
                            ? "dpd-health-failed"
                            : "dpd-health-running"
                      }`}
                    >
                      {product.latestRun.status === "success" && <CheckCircle2 />}
                      {product.latestRun.status === "failed" && <AlertCircle />}
                      {product.latestRun.status === "running" && <Activity className="dpd-pulse" />}
                    </div>
                    <div>
                      <div className="dpd-health-status">{product.latestRun.status}</div>
                      <div className="dpd-health-msg" title={product.latestRun.message || "Pipeline status"}>
                        {product.latestRun.message ||
                          (product.latestRun.status === "running" ? "Pipeline currently running" : "Pipeline completed")}
                      </div>
                    </div>
                  </div>

                  <div className="dpd-stat-row">
                    <span className="dpd-stat-label">
                      <Calendar />
                      Started
                    </span>
                    <span className="dpd-stat-value">{formatDateTime(product.latestRun.startedAt)}</span>
                  </div>
                  <div className="dpd-stat-row">
                    <span className="dpd-stat-label">
                      <Clock />
                      Ended
                    </span>
                    <span className="dpd-stat-value">{formatDateTime(product.latestRun.endedAt)}</span>
                  </div>
                  <div className="dpd-stat-row">
                    <span className="dpd-stat-label">
                      <Activity />
                      Duration
                    </span>
                    <span className="dpd-stat-value mono">{formatDuration(product.latestRun.durationSeconds)}</span>
                  </div>
                </>
              )}

              <div className="dpd-tags-block">
                <div className="dpd-tags-label">
                  <Tag />
                  Tags
                </div>
                <div className="dpd-tags">
                  {product.tags.length > 0 ? (
                    product.tags.map((tag) => (
                      <span key={tag} className="dpd-tag">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="dpd-card dpd-quicklinks">
            <h3>Quick Links</h3>
            <button className="dpd-quicklink" onClick={() => setActiveTab("definition")}>
              <span>View Source Alignment</span>
              <ChevronRight />
            </button>
            <button className="dpd-quicklink" onClick={() => setActiveTab("consumers")}>
              <span>Review Subscriptions</span>
              <ChevronRight />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
