import { Loader2 } from "lucide-react";
import React from "react";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className || ""}`} />;
}

export function PageLoader() {
  return (
    <div className="flex-1 min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <LoadingSpinner className="w-8 h-8 text-indigo-500" />
        <span className="text-sm font-medium">Loading catalog data...</span>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error?: any, onRetry?: () => void }) {
  return (
    <div className="flex-1 min-h-[50vh] flex items-center justify-center p-6">
      <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-6 max-w-md w-full text-center">
        <h3 className="font-semibold text-red-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-red-700 mb-4">
          {error?.message || "Failed to load data. Please try again."}
        </p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
}
