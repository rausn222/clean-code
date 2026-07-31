import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
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
} from 'lucide-react';
import {
  useListSubscriptionPlans,
  getListSubscriptionPlansQueryKey,
  useSubscribeToPlan,
  SubscriptionPlan,
} from '@workspace/api-client-react';
import { LoadingSpinner } from './ui/states';

const CHANNELS = ['Data Product', 'Postgres', 'REST-API'] as const;

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  'Data Product': Database,
  Postgres: Server,
  'REST-API': Globe,
};

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PlanCard({
  plan,
  onSubscribe,
  isPending,
}: {
  plan: SubscriptionPlan;
  onSubscribe: (planId: number) => void;
  isPending: boolean;
}) {
  const now = new Date();
  const sub = plan.subscription ?? null;

  let daysLeft = 0;
  let totalDays = 0;
  let expiry: Date | null = null;
  if (sub) {
    const start = new Date(sub.subscribedAt);
    expiry = new Date(sub.expiresAt);
    totalDays = daysBetween(start, expiry);
    daysLeft = Math.max(0, daysBetween(now, expiry));
  }
  const pctLeft = totalDays > 0 ? Math.min(100, Math.round((daysLeft / totalDays) * 100)) : 0;
  const expiringSoon = !!sub && daysLeft <= 30;

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4 transition-colors ${
        sub
          ? expiringSoon
            ? 'border-amber-300 bg-gradient-to-b from-amber-50 to-white'
            : 'border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white'
          : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[17px] font-semibold text-slate-900">{plan.name}</div>
          <div className="text-sm text-slate-500 mt-0.5">
            <b className="text-slate-900">{plan.price}</b>
          </div>
        </div>
        {sub &&
          (expiringSoon ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5" /> Expiring soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              <BadgeCheck className="w-3.5 h-3.5" /> Subscribed
            </span>
          ))}
      </div>

      {/* Days remaining — only for subscribed plans */}
      {sub && expiry && (
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className={`text-2xl font-bold leading-none ${expiringSoon ? 'text-amber-700' : 'text-emerald-700'}`}>
                {daysLeft} days
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                remaining of {totalDays}-day term
              </div>
            </div>
            <div className="text-xs text-slate-500 text-right">
              Expires on
              <br />
              <b className="text-slate-700">{formatDate(expiry)}</b>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${expiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${pctLeft}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
            <RefreshCw className="w-3.5 h-3.5" />
            {plan.type === 'Recurring Subscription'
              ? sub.autoRenew
                ? `Auto-renews on ${formatDate(expiry)}`
                : 'Auto-renewal is off'
              : 'One-time subscription — will not renew'}
          </div>
        </div>
      )}

      {/* Spec grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div className="flex items-start gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Validity</div>
            <div className="text-sm text-slate-800 font-medium">
              {plan.validityMonths} {plan.validityMonths === 1 ? 'month' : 'months'}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Type</div>
            <div className="text-sm text-slate-800 font-medium">{plan.type.replace(' Subscription', '')}</div>
          </div>
        </div>
        {plan.frequency && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Frequency</div>
              <div className="text-sm text-slate-800 font-medium">{plan.frequency}</div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Gauge className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Call limit</div>
            <div className="text-sm text-slate-800 font-medium font-mono">{plan.callLimit.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {sub ? (
        expiringSoon && (
          <button
            onClick={() => onSubscribe(plan.id)}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {isPending ? <LoadingSpinner /> : <RefreshCw className="w-3.5 h-3.5" />}
            Renew now
          </button>
        )
      ) : (
        <button
          onClick={() => onSubscribe(plan.id)}
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {isPending ? <LoadingSpinner /> : <Zap className="w-3.5 h-3.5" />}
          Subscribe
        </button>
      )}
    </div>
  );
}

export default function SubscriptionsTab({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const { data: plans, isLoading } = useListSubscriptionPlans(productId, {
    query: { enabled: !!productId, queryKey: getListSubscriptionPlansQueryKey(productId) },
  });
  const subscribeMutation = useSubscribeToPlan();

  const handleSubscribe = (planId: number) => {
    subscribeMutation.mutate(
      { planId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSubscriptionPlansQueryKey(productId) });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Subscriptions</h2>
        <p className="text-sm text-slate-500 mt-1">
          To get access, subscribe to a plan from any channel. Active subscriptions show remaining validity below.
        </p>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="text-sm text-slate-500 px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg">
          No subscription plans are available for this data product yet.
        </div>
      ) : (
        CHANNELS.map((channel) => {
          const channelPlans = plans.filter((p) => p.channel === channel);
          if (channelPlans.length === 0) return null;
          const Icon = CHANNEL_ICONS[channel] ?? Database;
          return (
            <div key={channel}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <h3 className="text-base font-semibold text-slate-900">{channel}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  {channelPlans.length} {channelPlans.length === 1 ? 'plan' : 'plans'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSubscribe={handleSubscribe}
                    isPending={
                      subscribeMutation.isPending &&
                      subscribeMutation.variables?.planId === plan.id
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
