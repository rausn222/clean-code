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
  ChevronDown,
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

type TabId = 'overview' | 'iut' | 'procurement';

/* ──────────────────────── HELPERS ──────────────────────── */

function ScorePill({ score }: { score: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    excellent: { label: '≥40% Savings', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    moderate: { label: '20–39% Savings', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    poor: { label: '<20% Savings', cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const s = map[score] ?? map.moderate;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score === 'excellent' ? 'bg-emerald-500' : score === 'moderate' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {s.label}
    </span>
  );
}

function PlantBadge({ plant }: { plant: string }) {
  const styles: Record<string, string> = {
    UTR: 'bg-blue-600 text-white',
    U535: 'bg-indigo-600 text-white',
    U886: 'bg-violet-600 text-white',
    G635: 'bg-purple-600 text-white',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${styles[plant] ?? 'bg-slate-600 text-white'}`}>
      {plant}
    </span>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

/* ──────────────────────── OPTION SELECTOR CARD ──────────────────────── */

function OptionCard({
  opt,
  isSelected,
  onClick,
}: {
  opt: typeof OPTIONS[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left w-full rounded-2xl border-2 p-5 transition-all duration-200 group ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold ${isSelected ? 'text-indigo-800' : 'text-slate-900'}`}>
              {opt.label}
            </span>
            {opt.isRecommended && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                <Star className="w-2.5 h-2.5 fill-current" /> Recommended
              </span>
            )}
            {!opt.isRecommended && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {opt.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-medium">
            <PlantBadge plant={opt.iut.from} />
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <PlantBadge plant={opt.iut.to} />
            <span className="ml-1">{opt.route}</span>
          </div>
        </div>
        {isSelected && (
          <CheckCheck className="w-5 h-5 text-indigo-600 flex-none" />
        )}
      </div>

      {/* 3 key metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/70 rounded-xl p-3 border border-slate-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Procurement Cost</div>
          <div className="text-base font-bold text-slate-900">{opt.totalProcurementCost}</div>
        </div>
        <div className="bg-white/70 rounded-xl p-3 border border-slate-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">FG Producible</div>
          <div className="text-base font-bold text-slate-900">{(opt.fgProducible.utr + opt.fgProducible.u535).toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">combined</div>
        </div>
        <div className="bg-white/70 rounded-xl p-3 border border-slate-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Business Waste</div>
          <div className="text-base font-bold text-slate-900">{opt.businessWaste.utr}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{opt.businessWaste.saving}</div>
        </div>
      </div>

      {/* score pill */}
      <div className="mt-3 flex items-center justify-between">
        <ScorePill score={opt.score} />
        {!isSelected && (
          <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>
            Click to select →
          </span>
        )}
      </div>
    </button>
  );
}

/* ──────────────────────── OVERVIEW TAB ──────────────────────── */

function OverviewTab({ opt }: { opt: typeof OPTIONS[number] }) {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="FG Producible · UTR" value={opt.fgProducible.utr.toLocaleString('en-IN')} sub="units" />
        <KpiCard label="FG Producible · U535" value={opt.fgProducible.u535.toLocaleString('en-IN')} sub="units" />
        <KpiCard label="Business Waste · UTR" value={opt.businessWaste.utr} sub="vs no-action baseline" />
        <KpiCard label="Business Waste · U535" value={opt.businessWaste.u535} sub={opt.businessWaste.saving} />
      </div>

      {/* Plant detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['utr', 'u535'] as const).map((plant) => {
          const label = plant === 'utr' ? 'UTR' : 'U535';
          const fg = opt.fgProducible[plant];
          const qty = opt.prodPlanQty[plant];
          const stop = opt.stopDate[plant];
          const pcr = opt.planChangeRequired[plant];
          return (
            <div key={plant} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <PlantBadge plant={label} />
                <span className="text-sm font-bold text-slate-700">{label} Plant</span>
              </div>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Production Plan Qty</div>
                  <div className="text-sm font-semibold text-slate-800">{qty}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Final FG Producible</div>
                  <div className="text-sm font-bold text-indigo-700">{fg.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Production Stop Date</div>
                  <div className="text-sm font-semibold text-slate-800">{stop}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Plan Change Required</div>
                  {pcr ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> No
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── IUT TAB ──────────────────────── */

function IutTab({ opt }: { opt: typeof OPTIONS[number] }) {
  const { iut } = opt;
  const isAvailable = iut.lane === 'Available';

  return (
    <div className="flex flex-col gap-5">
      {/* Visual flow */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* FROM */}
          <div className="text-center">
            <PlantBadge plant={iut.from} />
            <div className="text-xs text-slate-500 mt-1 font-medium">Origin</div>
          </div>

          {/* Arrow + details */}
          <div className="flex-1 mx-6">
            <div className="relative flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-indigo-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-7">
                <div className="bg-white border border-indigo-200 rounded-full px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm whitespace-nowrap">
                  {iut.qty}
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-indigo-500 flex-none" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lead Time</div>
                <div className="text-sm font-bold text-slate-800">{iut.leadTime}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Initiation</div>
                <div className="text-sm font-bold text-slate-800">{iut.initiation}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cost / Trip</div>
                <div className="text-sm font-bold text-slate-800">{iut.costPerTrip}</div>
              </div>
            </div>
          </div>

          {/* TO */}
          <div className="text-center">
            <PlantBadge plant={iut.to} />
            <div className="text-xs text-slate-500 mt-1 font-medium">Destination</div>
          </div>
        </div>
      </div>

      {/* Spec cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Material Code</div>
          <div className="text-sm font-bold text-indigo-700">{iut.materialCode}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Transfer Qty</div>
          <div className="text-sm font-bold text-slate-900">{iut.qty}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">IUT Lead Time</div>
          <div className="text-sm font-bold text-slate-900">{iut.leadTime}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Initiation Date</div>
          <div className="text-sm font-bold text-slate-900">{iut.initiation}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Lane Availability</div>
          <div className={`flex items-center gap-1.5 text-sm font-bold ${isAvailable ? 'text-emerald-600' : 'text-amber-500'}`}>
            {isAvailable ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {iut.lane}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Cost / Trip</div>
          <div className="text-sm font-bold text-slate-900">{iut.costPerTrip}</div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── PROCUREMENT TAB ──────────────────────── */

function ProcurementTab({ opt }: { opt: typeof OPTIONS[number] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-slate-500 flex items-center gap-1.5">
        <ShoppingCart className="w-4 h-4" />
        <span>{opt.procurement.length} procurement orders across plants</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {opt.procurement.map((po, i) => (
          <div
            key={i}
            className={`bg-white border rounded-2xl overflow-hidden ${po.belowMoq ? 'border-red-200' : 'border-slate-200'}`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PlantBadge plant={po.plant} />
                <span className="text-xs font-bold text-slate-600">{po.materialCode}</span>
              </div>
              {po.belowMoq && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                  Below MOQ
                </span>
              )}
            </div>

            {/* Supplier strip */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{po.supplier}</span>
            </div>

            {/* Metrics grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Order Qty</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{po.orderQty}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">MOQ</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{po.moq}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price / Unit</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{po.pricePerUnit}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Order Price</div>
                <div className="text-base font-bold text-indigo-700 mt-0.5">{po.total}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer total */}
      <div className="flex items-center justify-between bg-indigo-600 text-white rounded-xl px-5 py-3">
        <span className="text-sm font-semibold">Total Procurement Cost</span>
        <span className="text-lg font-bold">{opt.totalProcurementCost}</span>
      </div>
    </div>
  );
}

/* ──────────────────────── MAIN PAGE ──────────────────────── */

export default function PlanComparisonPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const selected = OPTIONS.find((o) => o.id === selectedId)!;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'iut', label: 'IUT Transfer', icon: Truck },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
  ];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-12 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">IUT + Procurement</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Plan Comparison · Select an option to see full detail
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> ≥40% Excellent
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-2" /> 20–39% Moderate
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block ml-2" /> &lt;20% Poor
        </div>
      </div>

      {/* Option selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            opt={opt}
            isSelected={opt.id === selectedId}
            onClick={() => {
              setSelectedId(opt.id);
              setActiveTab('overview');
            }}
          />
        ))}
      </div>

      {/* Detail panel */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Detail header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">{selected.label}</span>
                {selected.isRecommended && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">
                    <Star className="w-2.5 h-2.5 fill-current" /> Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-indigo-200 text-xs">
                <PlantBadge plant={selected.iut.from} />
                <ArrowRight className="w-3 h-3" />
                <PlantBadge plant={selected.iut.to} />
                <span>{selected.route}</span>
              </div>
            </div>
          </div>
          <ScorePill score={selected.score} />
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'overview' && <OverviewTab opt={selected} />}
          {activeTab === 'iut' && <IutTab opt={selected} />}
          {activeTab === 'procurement' && <ProcurementTab opt={selected} />}
        </div>
      </div>

      {/* Legend footer */}
      <div className="text-[11px] text-slate-400 text-center">
        ↓ Savings vs No Action baseline · Reduction %:{' '}
        <span className="text-emerald-600 font-semibold">≥40% Excellent</span> ·{' '}
        <span className="text-amber-500 font-semibold">20–39% Moderate</span> ·{' '}
        <span className="text-red-500 font-semibold">&lt;20% Poor</span>
      </div>
    </div>
  );
}
