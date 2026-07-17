import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';

export default function Focused() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [glossaryOpen, setGlossaryOpen] = useState(true);
  const [sampleDataOpen, setSampleDataOpen] = useState(true);

  const handleCopyUrn = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'definition', label: 'Definition & Lineage', icon: GitBranch },
    { id: 'operations', label: 'Runs & Health', icon: Activity },
    { id: 'consumers', label: 'Consumers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span className="hover:text-slate-900 cursor-pointer">DataVerse</span>
                <span>/</span>
                <span className="hover:text-slate-900 cursor-pointer">Engineering</span>
                <span>/</span>
                <span className="text-slate-900 font-medium">read_pq_test_dp_test_priva7</span>
              </div>
              
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  read_pq_test_dp_test_priva7
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Published
                </span>
                <span className="text-sm text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md bg-slate-50">
                  v1.0.5
                </span>
              </div>

              {/* Condensed Metadata Ribbon */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Domain:</span>
                  <span className="font-medium text-slate-900">Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Owner:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                      AS
                    </div>
                    <span className="font-medium text-slate-900">A. Sharma</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Schedule:</span>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Daily at 02:00 UTC</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-slate-900">14 Jul 2026, 12:20</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                <Archive className="w-4 h-4" />
                Unpublish
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                <Play className="w-4 h-4" />
                Run Now
              </button>
              <button className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1600px] mx-auto px-6 mt-4">
          <div className="flex gap-1 border-b border-slate-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 flex items-start gap-6">
        
        {/* Center Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* About Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              This data product contains consolidated vehicle master data from various engineering sources. 
              It provides a unified view of vehicle models, specifications, and configurations used across 
              downstream analytical applications and reporting systems.
            </p>
            
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-500 mb-1">URN (Universal Resource Name)</div>
                <div className="text-sm font-mono text-slate-800 break-all">
                  urn:li:dataProduct:engineering:read_pq_test_dp_test_priva7
                </div>
              </div>
              <button 
                onClick={handleCopyUrn}
                className="flex-shrink-0 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
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
              className="flex items-center justify-between p-4 w-full bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Data Product Glossary</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium ml-2">4 columns</span>
              </div>
              {glossaryOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            
            {glossaryOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Field Name</th>
                      <th className="px-6 py-3 font-medium">Mandatory</th>
                      <th className="px-6 py-3 font-medium">Data Type</th>
                      <th className="px-6 py-3 font-medium">Source Table</th>
                      <th className="px-6 py-3 font-medium">Source Column</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {[
                      { field: 'vehm_model_code', req: true, type: 'VARCHAR(20)', table: 'src_vehicle_master', col: 'model_cd' },
                      { field: 'vehm_model_desc', req: false, type: 'VARCHAR(100)', table: 'src_vehicle_master', col: 'model_desc' },
                      { field: 'vehm_color_code', req: false, type: 'VARCHAR(10)', table: 'src_vehicle_master', col: 'color_cd' },
                      { field: 'vehm_engine_no', req: true, type: 'VARCHAR(50)', table: 'src_vehicle_master', col: 'engine_no' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">{row.field}</td>
                        <td className="px-6 py-3">
                          {row.req ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-pink-600">{row.type}</code></td>
                        <td className="px-6 py-3 text-slate-600">{row.table}</td>
                        <td className="px-6 py-3 text-slate-600">{row.col}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Sample Data Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <button 
              onClick={() => setSampleDataOpen(!sampleDataOpen)}
              className="flex items-center justify-between p-4 w-full bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Sample Data</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium ml-2">10 rows</span>
              </div>
              {sampleDataOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            
            {sampleDataOpen && (
              <div className="overflow-x-auto relative">
                {/* Horizontal scroll fade hint */}
                <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                
                <table className="w-full text-sm text-left whitespace-nowrap font-mono">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium bg-slate-50 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">vehm_model_code</th>
                      <th className="px-6 py-3 font-medium">vehm_model_desc</th>
                      <th className="px-6 py-3 font-medium">vehm_color_code</th>
                      <th className="px-6 py-3 font-medium">vehm_engine_no</th>
                      <th className="px-6 py-3 font-medium text-slate-400">...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {[
                      ['GLHHS446', 'GYPSY 1300 CC HT', 'BLK', 'ENG123456'],
                      ['GYP13L', 'GYP 1.3L', 'WHT', 'ENG987654'],
                      ['ALTO800LXI', 'ALTO 800 LXI', 'SLV', 'ENG456123'],
                      ['SWFTVDI', 'SWIFT VDI', 'RED', 'ENG789456'],
                      ['BLNZETA', 'BALENO ZETA', 'BLU', 'ENG321654'],
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-2.5 font-medium text-slate-900 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0] group-hover:bg-slate-50">{row[0]}</td>
                        <td className="px-6 py-2.5">{row[1]}</td>
                        <td className="px-6 py-2.5">{row[2]}</td>
                        <td className="px-6 py-2.5">{row[3]}</td>
                        <td className="px-6 py-2.5 text-slate-300">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {sampleDataOpen && (
               <div className="bg-slate-50 p-3 text-center border-t border-slate-200">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View full dataset</button>
               </div>
            )}
          </section>

        </div>

        {/* Right Rail */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
          
          {/* Run Health Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Latest Run Health</h3>
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View history</a>
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">Normal</div>
                  <div className="text-xs text-slate-500">Pipeline completed successfully</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Started</span>
                  </div>
                  <span className="text-slate-900 font-medium">14/07/26 12:17</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Ended</span>
                  </div>
                  <span className="text-slate-900 font-medium">14/07/26 12:20</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Activity className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <span className="text-slate-900 font-medium">3m 12s</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">PII Data</span>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">Core Master</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">Daily Sync</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Quick Actions / Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                <span>View Source Alignment</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                <span>Review Subscriptions</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
}
