import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Bell, AlertTriangle, CalendarClock } from "lucide-react";
import {
  useListExpiringSubscriptions,
  getListExpiringSubscriptionsQueryKey,
} from "@workspace/api-client-react";
import { formatDate } from "../../lib/format";

export function ExpiryNotifications() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: expiring } = useListExpiringSubscriptions({
    query: {
      queryKey: getListExpiringSubscriptionsQueryKey(),
      refetchInterval: 60_000,
    },
  });

  // Close on click outside / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = expiring ?? [];
  const count = items.length;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Subscription reminders"
        aria-label={
          count > 0
            ? `${count} subscription${count === 1 ? "" : "s"} expiring soon`
            : "Subscription reminders"
        }
        aria-expanded={open}
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
          count > 0
            ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
            : "text-slate-400 border-transparent hover:text-slate-700 hover:bg-slate-100"
        }`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-900">
              Expiring subscriptions
            </span>
            <span className="ml-auto text-xs text-slate-400">next 30 days</span>
          </div>
          {count === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              No subscriptions expiring in the next 30 days.
            </div>
          ) : (
            <ul className="max-h-96 overflow-auto divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.subscriptionId}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate(
                        `/products/${item.dataProductId}?tab=subscriptions`,
                      );
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-amber-50/60 transition-colors flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900 truncate">
                        {item.productName}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {item.planName} ·{" "}
                        {item.daysLeft === 0
                          ? "expires today"
                          : `expires in ${item.daysLeft} day${item.daysLeft === 1 ? "" : "s"}`}{" "}
                        ({formatDate(item.expiresAt)})
                        {item.autoRenew ? " · auto-renews" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
