import React, { useState } from 'react';
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
  Copy,
  Check,
  BookOpen,
  X,
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

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        <code className="min-w-0 truncate text-xs bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-700">
          {value}
        </code>
        <button
          aria-label={`Copy ${label}`}
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex-none p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

/** Connection details + consumption steps per channel (demo values). */
function channelConsumption(channel: string, productName: string, productUrn: string) {
  switch (channel) {
    case 'Postgres':
      return {
        blurb: 'Postgres connection can be used with BI tools (e.g. Power BI) and database tools (e.g. DBeaver).',
        fields: [
          { label: 'Host', value: 'msil-dataverse.postgres.marutisuzuki.in' },
          { label: 'Port', value: '5432' },
          { label: 'Username', value: 'your.name@maruti.co.in' },
          { label: 'Table Name', value: `msil_dataverse.${productName}` },
        ],
        steps: [
          'Use a Postgres client such as Power BI, DBeaver or equivalent. Select Database as "Postgres".',
          'Your personal access token can be found in Settings > Access Token.',
          'Establish a connection using the parameters above (host, port, username and access token).',
          "Close the connection when you're finished.",
        ],
      };
    case 'REST-API':
      return {
        blurb: 'The REST API is best for applications that need the data on demand.',
        fields: [
          { label: 'Base URL', value: `https://api.dataverse.marutisuzuki.in/v1/products/${productName}` },
          { label: 'Auth Header', value: 'Authorization: Bearer <access-token>' },
        ],
        steps: [
          'Generate an access token from Settings > Access Token.',
          'Call the base URL above with the Authorization header set.',
          'Use ?limit and ?offset query parameters to page through records.',
          'Stay within your plan\u2019s call limit — usage is visible on this page.',
        ],
      };
    default: // Data Product
      return {
        blurb: 'Data Product as a channel is used when it needs to be consumed in another data product.',
        fields: [{ label: 'URN', value: productUrn }],
        steps: [
          'Open Developer Workbench and create (or edit) your data product pipeline.',
          'Add this URN as an input source of your pipeline.',
          'The platform resolves access through your active subscription automatically.',
        ],
      };
  }
}

function HowToConsume({
  channel,
  productName,
  productUrn,
}: {
  channel: string;
  productName: string;
  productUrn: string;
}) {
  const [open, setOpen] = useState(false);
  const info = channelConsumption(channel, productName, productUrn);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
      >
        <BookOpen className="w-3.5 h-3.5" />
        How to consume
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`How to consume via ${channel}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  How to consume via {channel}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{info.blurb}</p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex-none p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {info.fields.map((f) => (
                  <CopyField key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-1.5">
                  Connectivity steps
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-600">
                  {info.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

export default function SubscriptionsTab({
  productId,
  productName,
  productUrn,
}: {
  productId: number;
  productName: string;
  productUrn: string;
}) {
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
          To get access, subscribe to a plan from any channel. Active subscriptions show remaining validity below, and
          each channel explains how to consume the data once you're subscribed.
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
                <HowToConsume channel={channel} productName={productName} productUrn={productUrn} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
