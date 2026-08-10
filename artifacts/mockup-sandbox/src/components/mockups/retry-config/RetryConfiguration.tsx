import { useState } from "react";
import { Minus, Plus, RotateCcw, ChevronDown } from "lucide-react";

const NAVY = "#3F51B5";

export function RetryConfiguration() {
  const [editing, setEditing] = useState(true);
  const [retries, setRetries] = useState(3);
  const [delay, setDelay] = useState(5);
  const [unit, setUnit] = useState("Minutes");

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-8 font-sans">
      <div className="bg-white rounded-md shadow-sm border border-gray-100 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
            Retry Configuration
          </h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        <div className="flex justify-end px-6 mt-3">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 text-[11px] font-bold tracking-wide rounded border border-gray-300 text-gray-600 bg-white"
              >
                CANCEL
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 text-[11px] font-bold tracking-wide rounded text-white"
                style={{ backgroundColor: NAVY }}
              >
                SAVE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-1.5 text-[11px] font-bold tracking-wide rounded text-white"
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
              <span
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: "#E8EAF6", color: NAVY }}
              >
                <RotateCcw className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-gray-800">No. of Retries</div>
                <div className="text-[11px] text-gray-400">
                  How many times a failed run is retried automatically
                </div>
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
                <span className="w-12 text-center text-[15px] font-bold text-gray-900 border border-gray-200 rounded py-1">
                  {retries}
                </span>
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
              <span
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: "#E8EAF6", color: NAVY }}
              >
                <RotateCcw className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-gray-800">Delay Between Retries</div>
                <div className="text-[11px] text-gray-400">
                  Waiting time before the next retry attempt
                </div>
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
              <div className="text-[15px] font-bold text-gray-900">
                {delay} {unit}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 -mt-1">
          <p className="text-[11px] text-gray-400">
            Applies to all scheduled pipeline runs of this organization. Manual reruns are not counted
            against the retry limit.
          </p>
        </div>
      </div>
    </div>
  );
}
