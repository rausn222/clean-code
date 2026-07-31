/**
 * SubscriptionsPage — fully self-contained React component (TSX).
 *
 * Redesigned "Subscriptions" tab for a data product page.
 * - Clean channel groups (Data Product / Postgres / REST-API)
 * - Subscribed plans show: days remaining, progress bar, expiry date, renewal info
 * - Available plans show a clear pricing/spec grid with a Subscribe action
 *
 * ALL styling is embedded as plain CSS — no Tailwind or external stylesheet.
 * Dependencies: react, lucide-react.
 *
 * Usage: <SubscriptionsPage /> (sample data inlined; replace via props)
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Zap,
  Database,
  Server,
  Globe,
  CalendarDays,
  RefreshCw,
  Gauge,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Embedded stylesheet
// ---------------------------------------------------------------------------

const STYLES = `
.subs, .subs * { box-sizing: border-box; margin: 0; padding: 0; }

.subs {
  background: #f8fafc;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.5;
  padding: 24px;
  min-height: 100vh;
}
.subs button { font-family: inherit; cursor: pointer; background: none; border: none; color: inherit; }
.subs .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

.subs-container { max-width: 1100px; margin: 0 auto; }

/* Page header */
.subs-header { margin-bottom: 24px; }
.subs-title { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
.subs-subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }

/* Channel group */
.subs-group { margin-bottom: 32px; }
.subs-group-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.subs-group-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #eef2ff; color: #4f46e5;
  display: flex; align-items: center; justify-content: center;
}
.subs-group-icon svg { width: 18px; height: 18px; }
.subs-group-title { font-size: 16px; font-weight: 600; }
.subs-group-count { font-size: 12px; color: #64748b; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 999px; }

/* Card grid */
.subs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

/* Plan card */
.subs-card {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  padding: 20px; display: flex; flex-direction: column; gap: 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.subs-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 12px rgba(79,70,229,0.08); }
.subs-card.subscribed { border-color: #a7f3d0; background: linear-gradient(180deg, #f0fdf9 0%, #ffffff 45%); }
.subs-card.expiring { border-color: #fcd34d; background: linear-gradient(180deg, #fffbeb 0%, #ffffff 45%); }

.subs-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.subs-plan-name { font-size: 17px; font-weight: 600; }
.subs-plan-price { font-size: 13px; color: #64748b; margin-top: 2px; }
.subs-plan-price b { color: #0f172a; font-size: 15px; }

/* Status badges */
.subs-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.subs-badge svg { width: 13px; height: 13px; }
.subs-badge-active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.subs-badge-expiring { background: #fffbeb; color: #b45309; border: 1px solid #fcd34d; }

/* Days-remaining block (subscribed cards) */
.subs-remaining { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
.subs-remaining-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.subs-days-left { font-size: 24px; font-weight: 700; color: #047857; line-height: 1; }
.subs-days-left.warn { color: #b45309; }
.subs-days-label { font-size: 12px; color: #64748b; font-weight: 500; }
.subs-expiry { font-size: 12px; color: #64748b; text-align: right; }
.subs-expiry b { color: #334155; }

.subs-progress { height: 6px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
.subs-progress-fill { height: 100%; border-radius: 999px; background: #10b981; transition: width 0.3s ease; }
.subs-progress-fill.warn { background: #f59e0b; }

.subs-renews { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-top: 10px; }
.subs-renews svg { width: 13px; height: 13px; }

/* Spec list */
.subs-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
.subs-spec { display: flex; align-items: flex-start; gap: 8px; }
.subs-spec svg { width: 15px; height: 15px; color: #94a3b8; margin-top: 2px; flex-shrink: 0; }
.subs-spec-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.subs-spec-value { font-size: 13px; color: #1e293b; font-weight: 500; }

/* Actions */
.subs-cta {
  width: 100%; padding: 10px 16px; border-radius: 8px;
  font-size: 14px; font-weight: 600; text-align: center;
  transition: background-color 0.15s ease;
}
.subs-cta-primary { background: #4f46e5; color: #ffffff; border: 1px solid #4f46e5; }
.subs-cta-primary:hover { background: #4338ca; }
.subs-cta-ghost { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
.subs-cta-ghost:hover { background: #f8fafc; }
.subs-cta-row { display: flex; gap: 10px; }
.subs-cta-row .subs-cta { flex: 1; }

/* Empty hint */
.subs-note { font-size: 13px; color: #64748b; padding: 12px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; }
`;

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

export interface SubscriptionPlan {
  id: number;
  name: string;
  channel: "Data Product" | "Postgres" | "REST-API";
  price?: string; // e.g. "₹10 / month" or "Free"
  validityMonths: number;
  type: "Recurring Subscription" | "One-time Subscription";
  frequency?: string; // e.g. "Daily"
  callLimit: number;
  subscribed: boolean;
  subscribedAt?: string; // ISO date, required when subscribed
  autoRenew?: boolean;
}

const SAMPLE_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Test Plan 1",
    channel: "Data Product",
    price: "Free",
    validityMonths: 12,
    type: "Recurring Subscription",
    frequency: "Daily",
    callLimit: 100000,
    subscribed: true,
    subscribedAt: "2025-10-15T00:00:00Z",
    autoRenew: true,
  },
  {
    id: 2,
    name: "Test Postgres",
    channel: "Postgres",
    price: "₹10 / month",
    validityMonths: 12,
    type: "One-time Subscription",
    callLimit: 10000,
    subscribed: false,
  },
  {
    id: 3,
    name: "Demo",
    channel: "Postgres",
    price: "₹1",
    validityMonths: 1,
    type: "One-time Subscription",
    callLimit: 1,
    subscribed: false,
  },
  {
    id: 4,
    name: "Test Plan 1",
    channel: "REST-API",
    price: "Free",
    validityMonths: 12,
    type: "Recurring Subscription",
    frequency: "Daily",
    callLimit: 100000,
    subscribed: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const CHANNEL_ICONS: Record<SubscriptionPlan["channel"], React.ElementType> = {
  "Data Product": Database,
  Postgres: Server,
  "REST-API": Globe,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface SubscriptionsPageProps {
  plans?: SubscriptionPlan[];
  onSubscribe?: (plan: SubscriptionPlan) => void;
  onManage?: (plan: SubscriptionPlan) => void;
  /** Override "today" for testing; defaults to current date. */
  now?: Date;
}

export default function SubscriptionsPage({
  plans = SAMPLE_PLANS,
  onSubscribe,
  onManage,
  now = new Date(),
}: SubscriptionsPageProps) {
  const [localSubscribed, setLocalSubscribed] = useState<Record<number, boolean>>({});

  const channels: SubscriptionPlan["channel"][] = ["Data Product", "Postgres", "REST-API"];

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setLocalSubscribed((s) => ({ ...s, [plan.id]: true }));
    onSubscribe?.(plan);
  };

  const renderCard = (plan: SubscriptionPlan) => {
    const isSubscribed = plan.subscribed || localSubscribed[plan.id];

    // Days remaining calculation
    let daysLeft = 0;
    let totalDays = 0;
    let expiry: Date | null = null;
    if (isSubscribed) {
      const start = plan.subscribedAt ? new Date(plan.subscribedAt) : now;
      expiry = addMonths(start, plan.validityMonths);
      totalDays = daysBetween(start, expiry);
      daysLeft = Math.max(0, daysBetween(now, expiry));
    }
    const pctLeft = totalDays > 0 ? Math.min(100, Math.round((daysLeft / totalDays) * 100)) : 0;
    const expiringSoon = isSubscribed && daysLeft <= 30;

    return (
      <div key={plan.id} className={`subs-card${isSubscribed ? (expiringSoon ? " expiring" : " subscribed") : ""}`}>
        <div className="subs-card-top">
          <div>
            <div className="subs-plan-name">{plan.name}</div>
            <div className="subs-plan-price">
              <b>{plan.price ?? "Free"}</b>
            </div>
          </div>
          {isSubscribed &&
            (expiringSoon ? (
              <span className="subs-badge subs-badge-expiring">
                <AlertTriangle /> Expiring soon
              </span>
            ) : (
              <span className="subs-badge subs-badge-active">
                <BadgeCheck /> Subscribed
              </span>
            ))}
        </div>

        {/* Days remaining — only for subscribed plans */}
        {isSubscribed && expiry && (
          <div className="subs-remaining">
            <div className="subs-remaining-row">
              <div>
                <div className={`subs-days-left${expiringSoon ? " warn" : ""}`}>{daysLeft} days</div>
                <div className="subs-days-label">remaining of {totalDays}-day term</div>
              </div>
              <div className="subs-expiry">
                Expires on
                <br />
                <b>{formatDate(expiry)}</b>
              </div>
            </div>
            <div className="subs-progress">
              <div className={`subs-progress-fill${expiringSoon ? " warn" : ""}`} style={{ width: `${pctLeft}%` }} />
            </div>
            <div className="subs-renews">
              <RefreshCw />
              {plan.type === "Recurring Subscription"
                ? plan.autoRenew
                  ? `Auto-renews on ${formatDate(expiry)}`
                  : "Auto-renewal is off"
                : "One-time subscription — will not renew"}
            </div>
          </div>
        )}

        {/* Spec grid */}
        <div className="subs-specs">
          <div className="subs-spec">
            <CalendarDays />
            <div>
              <div className="subs-spec-label">Validity</div>
              <div className="subs-spec-value">
                {plan.validityMonths} {plan.validityMonths === 1 ? "month" : "months"}
              </div>
            </div>
          </div>
          <div className="subs-spec">
            <RefreshCw />
            <div>
              <div className="subs-spec-label">Type</div>
              <div className="subs-spec-value">{plan.type.replace(" Subscription", "")}</div>
            </div>
          </div>
          {plan.frequency && (
            <div className="subs-spec">
              <Clock />
              <div>
                <div className="subs-spec-label">Frequency</div>
                <div className="subs-spec-value">{plan.frequency}</div>
              </div>
            </div>
          )}
          <div className="subs-spec">
            <Gauge />
            <div>
              <div className="subs-spec-label">Call limit</div>
              <div className="subs-spec-value mono">{plan.callLimit.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isSubscribed ? (
          <div className="subs-cta-row">
            <button className="subs-cta subs-cta-ghost" onClick={() => onManage?.(plan)}>
              Manage
            </button>
            {expiringSoon && (
              <button className="subs-cta subs-cta-primary" onClick={() => handleSubscribe(plan)}>
                Renew now
              </button>
            )}
          </div>
        ) : (
          <button className="subs-cta subs-cta-primary" onClick={() => handleSubscribe(plan)}>
            <Zap style={{ width: 14, height: 14, verticalAlign: "-2px", marginRight: 6 }} />
            Subscribe
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="subs">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="subs-container">
        <div className="subs-header">
          <h1 className="subs-title">Subscriptions</h1>
          <p className="subs-subtitle">
            To get access, subscribe to a plan from any channel. Active subscriptions show remaining validity below.
          </p>
        </div>

        {channels.map((channel) => {
          const channelPlans = plans.filter((p) => p.channel === channel);
          if (channelPlans.length === 0) return null;
          const Icon = CHANNEL_ICONS[channel];
          return (
            <section key={channel} className="subs-group">
              <div className="subs-group-head">
                <span className="subs-group-icon">
                  <Icon />
                </span>
                <h2 className="subs-group-title">{channel}</h2>
                <span className="subs-group-count">
                  {channelPlans.length} {channelPlans.length === 1 ? "plan" : "plans"}
                </span>
              </div>
              <div className="subs-grid">{channelPlans.map(renderCard)}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
