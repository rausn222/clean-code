import { useState } from "react";
import { Minus, Plus, RotateCcw, User } from "lucide-react";

const NAVY = "#3F51B5";

const NAV_ITEMS = ["HOME", "ORGANIZATION", "MONITORING", "USER MANAGEMENT", "COSTING", "PORTFOLIO", "PLATFORM", "DEVELOPER WORKBENCH"];

export function RetryConfiguration() {
  const [editing, setEditing] = useState(true);
  const [retries, setRetries] = useState(2);
  const [delay, setDelay] = useState(5);
  const [unit, setUnit] = useState("Minutes");

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans flex flex-col">
      {/* ── Top nav (matches MSIL Dataverse) ── */}
      <header className="flex items-stretch" style={{ backgroundColor: NAVY, minHeight: 48 }}>
        {/* Logo block */}
        <div className="flex items-center gap-2 px-3 border-r border-white/20">
          <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="2" fill="#fff"/>
            <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="11" fontWeight="700" fill={NAVY} fontFamily="sans-serif">MS</text>
          </svg>
          <div className="leading-none">
            <div className="text-[10px] font-extrabold text-white tracking-wide">MARUTI SUZUKI</div>
            <div className="text-[9px] text-white/60 tracking-wider">Powered by DEP</div>
          </div>
          <div className="ml-1 text-[11px] font-bold text-white tracking-widest border-l border-white/30 pl-3 leading-none py-1">
            MSIL DATAVERSE
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center flex-1 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={`h-full px-3 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
                item === "ORGANIZATION"
                  ? "text-white border-b-2 border-white bg-white/10"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2 px-4 border-l border-white/20">
          <div className="text-right leading-none">
            <div className="text-[11px] font-semibold text-white">Chandan Das</div>
            <div className="text-[10px] text-white/60">Admin</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>
      {/* ── Page content ── */}
      <div className="flex-1 px-8 pt-6 pb-8">

        {/* Back */}
        <button className="text-[12px] text-blue-600 mb-4">← Back</button>

        {/* Org name + meta */}
        <h1 className="text-[28px] font-bold text-gray-900 leading-none mb-1">MSIL</h1>
        <div className="text-[12px] text-gray-500 mb-5">
          Created On: &nbsp; 31/10/23, 18:52
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {["Environment", "Domains", "Projects", "Persona Access", "User", "Advance Configurations"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-[13px] font-semibold rounded-t transition-colors ${
                tab === "Advance Configurations"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              style={tab === "Advance Configurations" ? { backgroundColor: NAVY } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Retry Configuration card ── */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[15px] font-bold text-gray-900">DP Rerun Configuration</h2>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1 text-[11px] font-bold tracking-wide rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1 text-[11px] font-bold tracking-wide rounded text-white hover:opacity-90"
                  style={{ backgroundColor: NAVY }}
                >
                  SAVE
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-1 text-[11px] font-bold tracking-wide rounded text-white hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                EDIT
              </button>
            )}
          </div>

          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {/* No. of retries */}
            <div className="border border-gray-200 rounded-md px-4 py-3.5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: "#E8EAF6", color: NAVY }}>
                  <RotateCcw className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">No. of Retries</div>
                  <div className="text-[11px] text-gray-400">How many times a failed run is retried automatically</div>
                </div>
              </div>
              {editing ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRetries(Math.max(0, retries - 1))}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-[15px] font-bold text-gray-900 border border-gray-200 rounded py-1">{retries}</span>
                  <button
                    onClick={() => setRetries(Math.min(10, retries + 1))}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-gray-400">(0–10)</span>
                </div>
              ) : (
                <div className="text-[15px] font-bold text-gray-900">{retries} retries</div>
              )}
            </div>

            {/* Delay between retries */}
            <div className="border border-gray-200 rounded-md px-4 py-3.5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: "#E8EAF6", color: NAVY }}>
                  <RotateCcw className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-gray-800">Delay Between Retries</div>
                  <div className="text-[11px] text-gray-400">Waiting time before the next retry attempt</div>
                </div>
              </div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    className="w-20 text-[14px] font-bold text-gray-900 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1"
                    style={{ "--tw-ring-color": NAVY } as React.CSSProperties}
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-[13px] text-gray-700 border border-gray-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option>Seconds</option>
                    <option>Minutes</option>
                    <option>Hours</option>
                  </select>
                </div>
              ) : (
                <div className="text-[15px] font-bold text-gray-900">{delay} {unit}</div>
              )}
            </div>
          </div>

          <div className="px-6 pb-4 -mt-1">
            <p className="text-[11px] text-gray-400">
              Applies to all scheduled pipeline runs of this organization. Manual reruns are not counted against the retry limit.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
