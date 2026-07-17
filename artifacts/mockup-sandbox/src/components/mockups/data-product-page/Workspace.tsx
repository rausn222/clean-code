import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  FileText,
  GitBranch,
  History,
  LayoutGrid,
  Play,
  Settings,
  Shield,
  Tag,
  Users,
  EyeOff,
  Check,
  Calendar,
  User,
  Hash,
  Box,
  Server
} from "lucide-react";

const Workspace = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const handleCopyUrn = () => {
    navigator.clipboard.writeText("urn:dv:dataproduct:engineering:read_pq_test_dp_test_priva7");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navGroups = [
    {
      group: "General",
      items: [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "definition", label: "Product Definition", icon: Settings },
        { id: "manifest", label: "Product Manifest", icon: FileText },
        { id: "reviews", label: "Reviews", icon: Users },
      ]
    },
    {
      group: "Observability",
      items: [
        { id: "history", label: "Run History", icon: History },
        { id: "profiling", label: "Data Profiling", icon: Activity },
        { id: "pii", label: "PII Run History", icon: Shield },
        { id: "versioning", label: "Version History", icon: Hash },
      ]
    },
    {
      group: "Relationships",
      items: [
        { id: "lineage", label: "Lineage", icon: GitBranch },
        { id: "consumers", label: "Consumers", icon: Users },
        { id: "channels", label: "Consumption Channels", icon: Server },
        { id: "subscriptions", label: "Subscriptions", icon: Box },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-[#0a192f] text-slate-300 flex flex-col border-r border-[#112240] shrink-0 shadow-lg z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#112240]">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded bg-[#0070c0] flex items-center justify-center shadow-inner">
              <Database size={16} className="text-white" />
            </div>
            <span className="font-semibold tracking-wide text-sm">DataVerse</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-[#112240] text-[#64ffda] shadow-sm"
                        : "hover:bg-[#112240]/50 hover:text-white text-slate-400"
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? "text-[#64ffda]" : "text-slate-500"} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[#112240] bg-[#0a192f]">
          <div className="bg-[#112240] rounded-lg p-3 border border-[#233554]">
            <div className="flex items-center gap-2 mb-1.5 text-slate-200">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-sm font-medium">System Normal</span>
            </div>
            <div className="text-[11px] text-slate-400">All services operational</div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-200 bg-white z-10 flex shrink-0 justify-between items-start shadow-sm">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold tracking-wide uppercase">
                  Engineering
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold flex items-center gap-1.5 tracking-wide uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Published
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                read_pq_test_dp_test_priva7
              </h1>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                  <User size={12} />
                </div>
                <span>Rajesh Kumar</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span>v1.0.5</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>Daily at 02:00 IST</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 focus:ring-2 focus:ring-slate-200 focus:outline-none">
                <EyeOff size={16} />
                Unpublish
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-[#0070c0] border border-transparent rounded-md hover:bg-[#005a9e] transition-colors shadow-sm flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
                <Play size={16} className="fill-current" />
                Run Now
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-sm bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 size={14} />
                <span>Latest Run Success</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="text-slate-500 font-mono text-xs">
                14/07/26 12:17 - 12:20
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Top Row: About & Key Metadata */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <h2 className="text-base font-bold text-slate-800">About Product</h2>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3 pr-1 py-1 rounded-md text-xs font-mono text-slate-600 transition-colors hover:border-slate-300">
                  <span className="truncate max-w-[200px]" title="urn:dv:dataproduct:engineering:read_pq_test_dp_test_priva7">
                    urn:dv:dataproduct:engineering...
                  </span>
                  <button 
                    onClick={handleCopyUrn} 
                    className="p-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none transition-all"
                    title="Copy URN"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-slate-600 leading-relaxed text-sm">
                  This data product extracts and processes vehicle model configurations and attributes for the engineering domain. It aggregates parts data, trims, and variant specifications from legacy systems into a unified structured format, ensuring downstream analytics and reporting tools have access to consistent master data.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <Tag size={12} className="text-slate-400" /> vehicle_master
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <Tag size={12} className="text-slate-400" /> engineering
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <Tag size={12} className="text-slate-400" /> tier_1
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <Tag size={12} className="text-slate-400" /> pii_safe
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <h2 className="text-base font-bold text-slate-800">Lifecycle & Alignment</h2>
              </div>
              <div className="p-5 flex-1 space-y-5">
                <div className="flex justify-between items-start group">
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Created
                  </div>
                  <div className="text-sm font-semibold text-slate-900 text-right">
                    12 May 2026<br/>
                    <span className="text-xs text-slate-500 font-normal">System Migration</span>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex justify-between items-start group">
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" /> Last Updated
                  </div>
                  <div className="text-sm font-semibold text-slate-900 text-right">
                    14 Jul 2026<br/>
                    <span className="text-xs text-slate-500 font-normal">Rajesh Kumar</span>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex justify-between items-center group">
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Shield size={14} className="text-slate-400" /> Alignment
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                    Source Validated
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glossary Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <LayoutGrid size={16} className="text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Data Product Glossary</h2>
              </div>
              <button className="text-sm font-semibold text-[#0070c0] hover:text-[#005a9e] transition-colors flex items-center gap-1">
                View full schema <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5 border-b border-slate-200">Field Name</th>
                    <th className="px-6 py-3.5 border-b border-slate-200">Data Type</th>
                    <th className="px-6 py-3.5 border-b border-slate-200 text-center">Mandatory</th>
                    <th className="px-6 py-3.5 border-b border-slate-200">Source Table</th>
                    <th className="px-6 py-3.5 border-b border-slate-200">Source Column</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { field: "vehm_model_code", type: "VARCHAR(20)", mandatory: true, sourceTable: "MST_VEHICLE", sourceCol: "MDL_CD" },
                    { field: "vehm_model_desc", type: "VARCHAR(100)", mandatory: true, sourceTable: "MST_VEHICLE", sourceCol: "MDL_DESC" },
                    { field: "vehm_variant_id", type: "VARCHAR(15)", mandatory: true, sourceTable: "MST_VARIANT", sourceCol: "VAR_ID" },
                    { field: "vehm_engine_cap", type: "NUMERIC(10,2)", mandatory: false, sourceTable: "MST_SPECS", sourceCol: "ENG_CAP_CC" },
                    { field: "vehm_fuel_type", type: "VARCHAR(10)", mandatory: true, sourceTable: "MST_SPECS", sourceCol: "FUEL_TYP" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-3 font-mono text-slate-800 text-xs font-medium">{row.field}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-mono border border-slate-200 group-hover:border-slate-300 transition-colors">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {row.mandatory ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs font-mono">{row.sourceTable}</td>
                      <td className="px-6 py-3 text-slate-500 text-xs font-mono">{row.sourceCol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Database size={16} className="text-blue-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Sample Data</h2>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium ml-2">
                  10 rows
                </span>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar-horizontal">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 text-xs font-mono tracking-tight border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold w-12 text-center text-slate-400 border-r border-slate-200/50">#</th>
                    <th className="px-4 py-3 font-semibold">vehm_model_code</th>
                    <th className="px-4 py-3 font-semibold">vehm_model_desc</th>
                    <th className="px-4 py-3 font-semibold">vehm_variant_id</th>
                    <th className="px-4 py-3 font-semibold text-right">vehm_engine_cap</th>
                    <th className="px-4 py-3 font-semibold">vehm_fuel_type</th>
                    <th className="px-4 py-3 font-semibold">vehm_transmission</th>
                    <th className="px-4 py-3 font-semibold text-center">vehm_color_options</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono text-slate-600">
                  {[
                    { c1: "GLHHS446", c2: "GYPSY 1300 CC HT", c3: "GYP-1.3L-HT", c4: "1298.00", c5: "PETROL", c6: "MANUAL", c7: "3" },
                    { c1: "GLHHS447", c2: "GYPSY 1300 CC ST", c3: "GYP-1.3L-ST", c4: "1298.00", c5: "PETROL", c6: "MANUAL", c7: "3" },
                    { c1: "SWAFT001", c2: "SWIFT VXI", c3: "SWF-1.2L-VX", c4: "1197.00", c5: "PETROL", c6: "MANUAL", c7: "6" },
                    { c1: "SWAFT002", c2: "SWIFT ZXI", c3: "SWF-1.2L-ZX", c4: "1197.00", c5: "PETROL", c6: "AMT", c7: "6" },
                    { c1: "BLNOA005", c2: "BALENO ALPHA", c3: "BLN-1.2L-AL", c4: "1197.00", c5: "PETROL", c6: "MANUAL", c7: "5" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 text-center text-xs border-r border-slate-200/50">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{row.c1}</td>
                      <td className="px-4 py-2.5">{row.c2}</td>
                      <td className="px-4 py-2.5">{row.c3}</td>
                      <td className="px-4 py-2.5 text-right">{row.c4}</td>
                      <td className="px-4 py-2.5">{row.c5}</td>
                      <td className="px-4 py-2.5">{row.c6}</td>
                      <td className="px-4 py-2.5 text-center">{row.c7}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs font-medium text-slate-500">
              Showing 5 of 10 sample rows
            </div>
          </div>
          
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 23, 42, 0.2);
        }
      `}} />
    </div>
  );
};

export default Workspace;
