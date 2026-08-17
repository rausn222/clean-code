import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ShoppingCart,
  BarChart3,
  Star,
  CheckCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

/* ──────────────────────── DATA ──────────────────────── */

const OPTIONS = [
  {
    id: 1,
    label: 'Option 1',
    badge: 'Recommended',
    isRecommended: true,
    route: 'UTR → U535',
    businessWaste: { utr: '₹2,852', u535: '₹2,689', saving: '↓ ₹2,689' },
    totalProcurementCost: '₹10,80,000',
    fgProducible: { utr: 56311, u535: 70214 },
    prodPlanQty: { utr: '58,900 EA', u535: '2,35,294 EA' },
    stopDate: { utr: '15 Jun 2026', u535: '22 Jun 2026' },
    planChangeRequired: { utr: true, u535: true },
    iut: {
      materialCode: 'RM 10045872',
      from: 'UTR',
      to: 'U535',
      qty: '12,589 EA',
      leadTime: '3 days',
      initiation: '22 May 2026',
      lane: 'Available',
      costPerTrip: '₹300',
    },
    procurement: [
      {
        plant: 'U535',
        materialCode: 'PM 64330490',
        supplier: 'Reliance Ind.',
        orderQty: '15,000 units',
        moq: '5,000 units',
        pricePerUnit: '₹42',
        total: '₹6,30,000',
        belowMoq: false,
      },
      {
        plant: 'UTR',
        materialCode: 'RM 10045872',
        supplier: 'BASF India',
        orderQty: '10,000 units',
        moq: '4,000 units',
        pricePerUnit: '₹45',
        total: '₹4,50,000',
        belowMoq: false,
      },
    ],
    score: 'excellent',
  },
  {
    id: 2,
    label: 'Option 2',
    badge: 'Alternate',
    isRecommended: false,
    route: 'U535 → UTR',
    businessWaste: { utr: '₹3,104', u535: '₹2,437', saving: '↓ ₹2,437' },
    totalProcurementCost: '₹10,70,000',
    fgProducible: { utr: 81489, u535: 237705 },
    prodPlanQty: { utr: '58,900 EA', u535: '2,35,294 EA' },
    stopDate: { utr: '18 Jun 2026', u535: '22 Jun 2026' },
    planChangeRequired: { utr: true, u535: true },
    iut: {
      materialCode: 'PM 20018734',
      from: 'U535',
      to: 'UTR',
      qty: '12,589 EA',
      leadTime: '2 days',
      initiation: '27 May 2026',
      lane: 'Available',
      costPerTrip: '₹300',
    },
    procurement: [
      {
        plant: 'U535',
        materialCode: 'PM 64330490',
        supplier: 'Tata Chemicals',
        orderQty: '15,000 units',
        moq: '3,000 units',
        pricePerUnit: '₹38',
        total: '₹5,70,000',
        belowMoq: false,
      },
      {
        plant: 'UTR',
        materialCode: 'RM 10045872',
        supplier: 'Evonik India',
        orderQty: '10,000 units',
        moq: '2,000 units',
        pricePerUnit: '₹50',
        total: '₹5,00,000',
        belowMoq: false,
      },
    ],
    score: 'moderate',
  },
  {
    id: 3,
    label: 'Option 3',
    badge: 'Alternate',
    isRecommended: false,
    route: 'UTR → U535',
    businessWaste: { utr: '₹3,890', u535: '₹1,651', saving: '↓ ₹1,651' },
    totalProcurementCost: '₹10,70,000',
    fgProducible: { utr: 60700, u535: 258494 },
    prodPlanQty: { utr: '58,900 EA', u535: '2,35,294 EA' },
    stopDate: { utr: '18 Jun 2026', u535: '22 Jun 2026' },
    planChangeRequired: { utr: true, u535: true },
    iut: {
      materialCode: 'PM 30098721',
      from: 'UTR',
      to: 'U535',
      qty: '8,200 EA',
      leadTime: '4 days',
      initiation: '18 May 2026',
      lane: 'Not set',
      costPerTrip: '₹450',
    },
    procurement: [
      {
        plant: 'U535',
        materialCode: 'PM 64330490',
        supplier: 'Tata Chemicals',
        orderQty: '15,000 units',
        moq: '3,000 units',
        pricePerUnit: '₹38',
        total: '₹5,70,000',
        belowMoq: false,
      },
      {
        plant: 'UTR',
        materialCode: 'RM 10045872',
        supplier: 'Evonik India',
        orderQty: '10,000 units',
        moq: '2,000 units',
        pricePerUnit: '₹50',
        total: '₹5,00,000',
        belowMoq: false,
      },
    ],
    score: 'poor',
  },
];

/* ──────────────────────── SMALL HELPERS ──────────────────────── */

function PlantBadge({ plant }: { plant: string }) {
  const styles: Record<string, string> = {
    UTR: 'bg-blue-600 text-white',
    U535: 'bg-indigo-600 text-white',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${styles[plant] ?? 'bg-slate-600 text-white'}`}
    >
      {plant}
    </span>
  );
}

function ScoreDot({ score }: { score: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    excellent: { cls: 'bg-emerald-500', label: '≥40% Excellent' },
    moderate:  { cls: 'bg-amber-400',   label: '20–39% Moderate' },
    poor:      { cls: 'bg-red-500',      label: '<20% Poor' },
  };
  const { cls, label } = map[score] ?? map.moderate;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
      <span className={`w-2 h-2 rounded-full flex-none ${cls}`} />
      {label}
    </span>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${accent}`}>
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
    </div>
  );
}

/* ──────────────────────── OPTION SELECTOR STRIP ──────────────────────── */

function OptionPill({
  opt,
  isSelected,
  onClick,
}: {
  opt: (typeof OPTIONS)[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const scoreColor =
    opt.score === 'excellent'
      ? 'bg-emerald-500'
      : opt.score === 'moderate'
      ? 'bg-amber-400'
      : 'bg-red-500';

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-0 text-left rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
        isSelected
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full flex-none ${scoreColor}`} />
        <span className="font-bold text-sm truncate">{opt.label}</span>
        {opt.isRecommended && (
          <span
            className={`hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-none ${
              isSelected ? 'bg-amber-300 text-amber-900' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Star className="w-2 h-2 fill-current" /> REC
          </span>
        )}
      </div>
      <div
        className={`text-[11px] mt-0.5 font-medium truncate ${
          isSelected ? 'text-indigo-200' : 'text-slate-400'
        }`}
      >
        {opt.route}
      </div>
      {isSelected && (
        <CheckCheck className="absolute top-2 right-2 w-4 h-4 text-indigo-300" />
      )}
    </button>
  );
}

/* ──────────────────────── DETAIL PANEL (all-in-one) ──────────────────────── */

function DetailPanel({ opt }: { opt: (typeof OPTIONS)[number] }) {
  const { iut, procurement } = opt;
  const laneOk = iut.lane === 'Available';

  return (
    <div className="flex flex-col gap-0">

      {/* ── OVERVIEW ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionTitle icon={BarChart3} title="Overview" accent="border-slate-200" />

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'FG Producible · UTR',   value: opt.fgProducible.utr.toLocaleString('en-IN'), sub: 'units' },
            { label: 'FG Producible · U535',  value: opt.fgProducible.u535.toLocaleString('en-IN'), sub: 'units' },
            { label: 'Business Waste · UTR',  value: opt.businessWaste.utr, sub: 'vs no-action baseline' },
            { label: 'Business Waste · U535', value: opt.businessWaste.u535, sub: opt.businessWaste.saving },
          ].map((k) => (
            <div key={k.label} className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{k.label}</div>
              <div className="text-xl font-bold text-slate-900 leading-tight">{k.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Per-plant detail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['utr', 'u535'] as const).map((key) => {
            const label = key === 'utr' ? 'UTR' : 'U535';
            const pcr   = opt.planChangeRequired[key];
            return (
              <div key={key} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <PlantBadge plant={label} />
                  <span className="text-sm font-bold text-slate-700">{label} Plant</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Prod Plan Qty</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">{opt.prodPlanQty[key]}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Final FG Producible</div>
                    <div className="text-sm font-bold text-indigo-700 mt-0.5">{opt.fgProducible[key].toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stop Date</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">{opt.stopDate[key]}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan Change</div>
                    {pcr ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Not needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-px h-5 bg-slate-200" />
      </div>

      {/* ── IUT TRANSFER ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionTitle icon={Truck} title="IUT Transfer" accent="border-slate-200" />

        {/* Visual flow strip */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-xl border border-indigo-100 p-5 mb-4">
          <div className="flex items-center justify-center gap-0">
            {/* FROM node */}
            <div className="text-center w-20">
              <PlantBadge plant={iut.from} />
              <div className="text-[10px] text-slate-500 mt-1 font-semibold">FROM</div>
            </div>

            {/* Lane */}
            <div className="flex-1 flex flex-col items-center gap-1.5 px-4">
              <div className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-full px-3 py-0.5 shadow-sm">
                {iut.qty}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 border-t-2 border-dashed border-indigo-300" />
                <ArrowRight className="w-5 h-5 text-indigo-500 flex-none" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-semibold">{iut.leadTime}</span>
                <span>·</span>
                <span className="font-semibold">{iut.initiation}</span>
                <span>·</span>
                <span className="font-semibold">{iut.costPerTrip}/trip</span>
              </div>
            </div>

            {/* TO node */}
            <div className="text-center w-20">
              <PlantBadge plant={iut.to} />
              <div className="text-[10px] text-slate-500 mt-1 font-semibold">TO</div>
            </div>
          </div>
        </div>

        {/* Spec grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Material Code',  value: iut.materialCode },
            { label: 'Transfer Qty',   value: iut.qty },
            { label: 'Lead Time',      value: iut.leadTime },
            { label: 'Initiation',     value: iut.initiation },
            {
              label: 'Lane',
              value: iut.lane,
              el: (
                <span className={`flex items-center gap-1 text-sm font-bold ${laneOk ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {laneOk ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  {iut.lane}
                </span>
              ),
            },
            { label: 'Cost / Trip',    value: iut.costPerTrip },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</div>
              {s.el ?? <div className="text-xs font-bold text-slate-800">{s.value}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-px h-5 bg-slate-200" />
      </div>

      {/* ── PROCUREMENT ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionTitle icon={ShoppingCart} title="Procurement" accent="border-slate-200" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {procurement.map((po, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden ${po.belowMoq ? 'border-red-200' : 'border-slate-200'}`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <PlantBadge plant={po.plant} />
                  <span className="text-xs font-bold text-slate-600 truncate">{po.materialCode}</span>
                </div>
                {po.belowMoq && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 flex-none">
                    Below MOQ
                  </span>
                )}
              </div>

              {/* Supplier */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
                <Truck className="w-3.5 h-3.5 text-slate-400 flex-none" />
                <span className="text-sm font-semibold text-slate-800">{po.supplier}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-0 divide-x divide-slate-100">
                {[
                  { label: 'Order Qty',    value: po.orderQty },
                  { label: 'MOQ',          value: po.moq },
                  { label: 'Price/Unit',   value: po.pricePerUnit },
                  { label: 'Total',        value: po.total, highlight: true },
                ].map((m) => (
                  <div key={m.label} className="px-3 py-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{m.label}</div>
                    <div className={`text-xs font-bold ${m.highlight ? 'text-indigo-700 text-sm' : 'text-slate-800'}`}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="flex items-center justify-between bg-indigo-600 text-white rounded-xl px-5 py-3">
          <span className="text-sm font-semibold">Total Procurement Cost</span>
          <span className="text-lg font-bold">{opt.totalProcurementCost}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── MAIN PAGE ──────────────────────── */

export default function PlanComparisonPage() {
  const [selectedId, setSelectedId] = useState(1);
  const selected = OPTIONS.find((o) => o.id === selectedId)!;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-12 flex flex-col gap-5">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">IUT + Procurement</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Plan Comparison · Select an option below to see its full breakdown
        </p>
      </div>

      {/* Option pills */}
      <div className="flex gap-3">
        {OPTIONS.map((opt) => (
          <OptionPill
            key={opt.id}
            opt={opt}
            isSelected={opt.id === selectedId}
            onClick={() => setSelectedId(opt.id)}
          />
        ))}
      </div>

      {/* Selected option header bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base">{selected.label}</span>
              {selected.isRecommended && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 flex-none">
                  <Star className="w-2.5 h-2.5 fill-current" /> Recommended
                </span>
              )}
              <span className="text-indigo-200 text-sm">{selected.route}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <PlantBadge plant={selected.iut.from} />
              <ArrowRight className="w-3 h-3 text-indigo-300" />
              <PlantBadge plant={selected.iut.to} />
            </div>
          </div>
        </div>
        <ScoreDot score={selected.score} />
      </div>

      {/* All-in-one detail */}
      <DetailPanel opt={selected} />

      {/* Legend */}
      <div className="text-[11px] text-slate-400 text-center">
        ↓ Savings vs No Action baseline · Reduction %:{' '}
        <span className="text-emerald-600 font-semibold">≥40% Excellent</span>{' '}
        <span className="text-amber-500 font-semibold">· 20–39% Moderate</span>{' '}
        <span className="text-red-500 font-semibold">· &lt;20% Poor</span>
      </div>
    </div>
  );
}
