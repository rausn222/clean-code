import { useMemo, useState } from 'react';
import {
  ArrowRight, CheckCircle2, AlertTriangle, Truck, ShoppingCart,
  BarChart3, Star, CheckCheck, Wifi, WifiOff, Layers, Trophy,
  SlidersHorizontal, LayoutGrid,
} from 'lucide-react';

/* ───────────────────────────── DATA ───────────────────────────── */

type MatStatus = 'ok' | 'attention';

const OPTIONS = [
  {
    id: 1,
    label: 'Option 1',
    isRecommended: true,
    route: 'UTR → U535',
    score: 'excellent' as const,
    overview: {
      fgUTR: 56311, fgU535: 70214,
      wasteUTR: 2852, wasteU535: 2689,
      wasteUTRSaving: '₹2,689',
      prodPlanUTR: '58,900 EA', prodPlanU535: '2,35,294 EA',
      stopUTR: '15 Jun 2026', stopU535: '22 Jun 2026',
      planChangeUTR: true, planChangeU535: true,
    },
    iut: {
      from: 'UTR', to: 'U535',
      lane: 'Available' as 'Available' | 'Not set',
      materials: [
        { code: 'RM 10045872', name: 'PP Granules',       qty: '12,589 EA', qtyNum: 12589, leadTime: '3 days', leadDays: 3, initiation: '22 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
        { code: 'RM 10046110', name: 'ABS Resin',         qty: '6,400 EA',  qtyNum: 6400,  leadTime: '3 days', leadDays: 3, initiation: '24 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
        { code: 'PM 64330512', name: 'Sealant Compound',  qty: '2,150 EA',  qtyNum: 2150,  leadTime: '6 days', leadDays: 6, initiation: '19 May 2026', costPerTrip: '₹420', costNum: 420, status: 'attention' as MatStatus, note: 'Lead time exceeds 5-day SLA' },
        { code: 'RM 10047001', name: 'Paint Additive',    qty: '3,900 EA',  qtyNum: 3900,  leadTime: '2 days', leadDays: 2, initiation: '25 May 2026', costPerTrip: '₹280', costNum: 280, status: 'ok' as MatStatus },
        { code: 'PM 64330488', name: 'Adhesive Film',     qty: '1,800 EA',  qtyNum: 1800,  leadTime: '3 days', leadDays: 3, initiation: '23 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
      ],
    },
    procurement: {
      orders: [
        { plant: 'U535', supplier: 'Reliance Ind.', materialCode: 'PM 64330490', name: 'Sealant Compound', orderQty: '15,000 units', orderQtyNum: 15000, moq: '5,000 units', priceUnit: 42, total: 630000, status: 'ok' as MatStatus },
        { plant: 'U535', supplier: 'Asian Paints',  materialCode: 'RM 10047001', name: 'Paint Additive',   orderQty: '4,000 units',  orderQtyNum: 4000,  moq: '2,000 units', priceUnit: 61, total: 244000, status: 'ok' as MatStatus },
        { plant: 'UTR',  supplier: 'BASF India',    materialCode: 'RM 10045872', name: 'PP Granules',      orderQty: '10,000 units', orderQtyNum: 10000, moq: '4,000 units', priceUnit: 45, total: 450000, status: 'ok' as MatStatus },
        { plant: 'UTR',  supplier: 'Pidilite Ind.', materialCode: 'PM 64330488', name: 'Adhesive Film',    orderQty: '5,000 units',  orderQtyNum: 5000,  moq: '5,000 units', priceUnit: 31, total: 155000, status: 'attention' as MatStatus, note: 'MOQ forces over-order: need 1,800, must buy 5,000' },
      ],
    },
    totalCost: 1080000,
  },
  {
    id: 2,
    label: 'Option 2',
    isRecommended: false,
    route: 'U535 → UTR',
    score: 'moderate' as const,
    overview: {
      fgUTR: 81489, fgU535: 237705,
      wasteUTR: 3104, wasteU535: 2437,
      wasteUTRSaving: '₹2,437',
      prodPlanUTR: '58,900 EA', prodPlanU535: '2,35,294 EA',
      stopUTR: '18 Jun 2026', stopU535: '22 Jun 2026',
      planChangeUTR: true, planChangeU535: true,
    },
    iut: {
      from: 'U535', to: 'UTR',
      lane: 'Available' as 'Available' | 'Not set',
      materials: [
        { code: 'PM 20018734', name: 'Steel Sheet Coil',  qty: '12,589 EA', qtyNum: 12589, leadTime: '2 days', leadDays: 2, initiation: '27 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
        { code: 'PM 20018902', name: 'Fastener Kit',      qty: '8,750 EA',  qtyNum: 8750,  leadTime: '2 days', leadDays: 2, initiation: '28 May 2026', costPerTrip: '₹260', costNum: 260, status: 'ok' as MatStatus },
        { code: 'RM 10046995', name: 'Rubber Gasket',     qty: '5,200 EA',  qtyNum: 5200,  leadTime: '3 days', leadDays: 3, initiation: '26 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
        { code: 'PM 20019110', name: 'Wiring Harness',    qty: '2,400 EA',  qtyNum: 2400,  leadTime: '4 days', leadDays: 4, initiation: '24 May 2026', costPerTrip: '₹340', costNum: 340, status: 'ok' as MatStatus },
      ],
    },
    procurement: {
      orders: [
        { plant: 'U535', supplier: 'Tata Chemicals', materialCode: 'PM 64330490', name: 'Steel Sheet Coil', orderQty: '15,000 units', orderQtyNum: 15000, moq: '3,000 units', priceUnit: 38, total: 570000, status: 'ok' as MatStatus },
        { plant: 'UTR',  supplier: 'Evonik India',   materialCode: 'RM 10045872', name: 'Rubber Gasket',    orderQty: '10,000 units', orderQtyNum: 10000, moq: '2,000 units', priceUnit: 50, total: 500000, status: 'ok' as MatStatus },
        { plant: 'UTR',  supplier: 'Sundram Fast.',  materialCode: 'PM 20018902', name: 'Fastener Kit',     orderQty: '6,000 units',  orderQtyNum: 6000,  moq: '3,000 units', priceUnit: 22, total: 132000, status: 'ok' as MatStatus },
      ],
    },
    totalCost: 1070000,
  },
  {
    id: 3,
    label: 'Option 3',
    isRecommended: false,
    route: 'UTR → U535',
    score: 'poor' as const,
    overview: {
      fgUTR: 60700, fgU535: 258494,
      wasteUTR: 3890, wasteU535: 1651,
      wasteUTRSaving: '₹1,651',
      prodPlanUTR: '58,900 EA', prodPlanU535: '2,35,294 EA',
      stopUTR: '18 Jun 2026', stopU535: '22 Jun 2026',
      planChangeUTR: true, planChangeU535: true,
    },
    iut: {
      from: 'UTR', to: 'U535',
      lane: 'Not set' as 'Available' | 'Not set',
      materials: [
        { code: 'PM 30098721', name: 'Glass Panel',       qty: '8,200 EA',  qtyNum: 8200,  leadTime: '4 days', leadDays: 4, initiation: '18 May 2026', costPerTrip: '₹450', costNum: 450, status: 'attention' as MatStatus, note: 'Cost/trip 50% above route average' },
        { code: 'RM 10047230', name: 'Foam Padding',      qty: '4,600 EA',  qtyNum: 4600,  leadTime: '7 days', leadDays: 7, initiation: '15 May 2026', costPerTrip: '₹380', costNum: 380, status: 'attention' as MatStatus, note: 'Qty short of plan by 1,400 EA' },
        { code: 'PM 30099004', name: 'Trim Clip Set',     qty: '3,100 EA',  qtyNum: 3100,  leadTime: '3 days', leadDays: 3, initiation: '20 May 2026', costPerTrip: '₹300', costNum: 300, status: 'ok' as MatStatus },
        { code: 'RM 10047555', name: 'Lubricant Drum',    qty: '1,250 EA',  qtyNum: 1250,  leadTime: '2 days', leadDays: 2, initiation: '21 May 2026', costPerTrip: '₹290', costNum: 290, status: 'ok' as MatStatus },
      ],
    },
    procurement: {
      orders: [
        { plant: 'U535', supplier: 'Tata Chemicals', materialCode: 'PM 64330490', name: 'Glass Panel',     orderQty: '15,000 units', orderQtyNum: 15000, moq: '3,000 units', priceUnit: 38, total: 570000, status: 'ok' as MatStatus },
        { plant: 'U535', supplier: 'Saint-Gobain',   materialCode: 'RM 10047230', name: 'Foam Padding',    orderQty: '3,000 units',  orderQtyNum: 3000,  moq: '3,000 units', priceUnit: 55, total: 165000, status: 'attention' as MatStatus, note: 'Single-source supplier · price 20% above benchmark' },
        { plant: 'UTR',  supplier: 'Evonik India',   materialCode: 'RM 10045872', name: 'Trim Clip Set',   orderQty: '10,000 units', orderQtyNum: 10000, moq: '2,000 units', priceUnit: 50, total: 500000, status: 'ok' as MatStatus },
        { plant: 'UTR',  supplier: 'Castrol India',  materialCode: 'RM 10047555', name: 'Lubricant Drum',  orderQty: '1,500 units',  orderQtyNum: 1500,  moq: '1,000 units', priceUnit: 88, total: 132000, status: 'ok' as MatStatus },
      ],
    },
    totalCost: 1070000,
  },
];

type Option = typeof OPTIONS[number];
type ScoreKey = 'excellent' | 'moderate' | 'poor';

interface Material {
  code: string; name: string;
  qty: string; qtyNum: number;
  leadTime: string; leadDays: number;
  initiation: string;
  costPerTrip: string; costNum: number;
  status: MatStatus; note?: string;
}

/* Aggregates across an option's IUT materials */
function iutAgg(iut: Option['iut']) {
  const mats = iut.materials as Material[];
  return {
    count: mats.length,
    attention: mats.filter((m) => m.status === 'attention').length,
    totalQty: mats.reduce((s, m) => s + m.qtyNum, 0),
    maxLead: Math.max(...mats.map((m) => m.leadDays)),
    totalTripCost: mats.reduce((s, m) => s + m.costNum, 0),
  };
}

/* Attention-first ordering for the material strip */
function sortedMaterials(mats: Material[]) {
  return [...mats].sort((a, b) =>
    a.status === b.status ? 0 : a.status === 'attention' ? -1 : 1,
  );
}

interface PurchaseOrder {
  plant: string; supplier: string;
  materialCode: string; name: string;
  orderQty: string; orderQtyNum: number;
  moq: string; priceUnit: number; total: number;
  status: MatStatus; note?: string;
}

/* Aggregates across an option's purchase orders */
function poAgg(po: Option['procurement']) {
  const orders = po.orders as PurchaseOrder[];
  return {
    count: orders.length,
    attention: orders.filter((o) => o.status === 'attention').length,
    totalUnits: orders.reduce((s, o) => s + o.orderQtyNum, 0),
    totalValue: orders.reduce((s, o) => s + o.total, 0),
    suppliers: new Set(orders.map((o) => o.supplier)).size,
  };
}

function sortedOrders(orders: PurchaseOrder[]) {
  return [...orders].sort((a, b) =>
    a.status === b.status ? 0 : a.status === 'attention' ? -1 : 1,
  );
}

/* ───────────────────────────── ATOMS ───────────────────────────── */

const SCORE_META: Record<ScoreKey, { dot: string; pill: string; label: string }> = {
  excellent: { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '≥40% Savings' },
  moderate:  { dot: 'bg-amber-400',   pill: 'bg-amber-50  text-amber-700  border-amber-200',  label: '20–39% Savings' },
  poor:      { dot: 'bg-red-500',     pill: 'bg-red-50    text-red-600    border-red-200',    label: '<20% Savings' },
};

function PlantBadge({ plant, sm }: { plant: string; sm?: boolean }) {
  const s: Record<string, string> = { UTR: 'bg-blue-600', U535: 'bg-indigo-600' };
  return (
    <span className={`inline-flex items-center rounded font-bold tracking-wide text-white ${sm ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} ${s[plant] ?? 'bg-slate-600'}`}>
      {plant}
    </span>
  );
}

function ScorePill({ score }: { score: ScoreKey }) {
  const m = SCORE_META[score];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

/* ───────────────────── OPTION SELECTOR CARDS ───────────────────── */

function OptionCard({
  opt, isSelected, isCompared, mode, onSelect, onToggleCompare,
}: {
  opt: Option; isSelected: boolean; isCompared: boolean;
  mode: 'focus' | 'compare';
  onSelect: () => void; onToggleCompare: () => void;
}) {
  const m = SCORE_META[opt.score];

  if (mode === 'focus') {
    return (
      <button
        onClick={onSelect}
        className={`relative flex-1 text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 group ${
          isSelected
            ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md text-slate-800'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">{opt.label}</span>
              {opt.isRecommended && (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-none ${isSelected ? 'bg-amber-300 text-amber-900' : 'bg-amber-100 text-amber-700'}`}>
                  <Star className="w-2 h-2 fill-current" /> REC
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-[11px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
              <PlantBadge plant={opt.iut.from} sm />
              <ArrowRight className="w-2.5 h-2.5" />
              <PlantBadge plant={opt.iut.to} sm />
              <span className="ml-0.5">{opt.route}</span>
            </div>
          </div>
          {isSelected && <CheckCheck className="w-4 h-4 text-indigo-300 flex-none mt-0.5" />}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: 'Total Cost', v: fmt(opt.totalCost) },
            { l: 'FG · UTR', v: opt.overview.fgUTR.toLocaleString('en-IN') },
            { l: 'FG · U535', v: opt.overview.fgU535.toLocaleString('en-IN') },
          ].map((k) => (
            <div key={k.l} className={`rounded-lg px-2.5 py-2 text-center ${isSelected ? 'bg-white/10' : 'bg-slate-50 border border-slate-100'}`}>
              <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>{k.l}</div>
              <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{k.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ScorePill score={opt.score} />
        </div>
      </button>
    );
  }

  // Compare mode card
  return (
    <button
      onClick={onToggleCompare}
      className={`relative flex-1 text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 ${
        isCompared
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isCompared ? 'text-indigo-900' : 'text-slate-500'}`}>{opt.label}</span>
            {opt.isRecommended && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-none">
                <Star className="w-2 h-2 fill-current" /> REC
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${isCompared ? 'text-slate-500' : 'text-slate-400'}`}>
            <PlantBadge plant={opt.iut.from} sm /><ArrowRight className="w-2.5 h-2.5" /><PlantBadge plant={opt.iut.to} sm />
            <span className="ml-0.5">{opt.route}</span>
          </div>
        </div>
        <div className={`mt-0.5 w-5 h-5 rounded-md flex-none border-2 flex items-center justify-center transition-colors ${isCompared ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
          {isCompared && <CheckCheck className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className="mt-2.5">
        <ScorePill score={opt.score} />
      </div>
    </button>
  );
}

/* ─────────────────────────── FOCUS DETAIL ─────────────────────────── */

function SectionDivider({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

function FocusDetail({ opt }: { opt: Option }) {
  const { overview: ov, iut, procurement: po } = opt;

  return (
    <div className="flex flex-col gap-4">

      {/* OVERVIEW */}
      <SectionDivider icon={BarChart3} label="Overview" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'FG Producible · UTR',   value: ov.fgUTR.toLocaleString('en-IN'),  sub: 'units' },
          { label: 'FG Producible · U535',  value: ov.fgU535.toLocaleString('en-IN'), sub: 'units' },
          { label: 'Business Waste · UTR',  value: fmt(ov.wasteUTR), sub: 'vs no-action' },
          { label: 'Business Waste · U535', value: fmt(ov.wasteU535), sub: `↓ ${ov.wasteUTRSaving}` },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{k.label}</div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{k.value}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['utr','u535'] as const).map((key) => {
          const label = key === 'utr' ? 'UTR' : 'U535';
          const pcr = key === 'utr' ? ov.planChangeUTR : ov.planChangeU535;
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <PlantBadge plant={label} /><span className="text-sm font-bold text-slate-700">{label} Plant</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4">
                {[
                  { l: 'Prod Plan Qty', v: key === 'utr' ? ov.prodPlanUTR : ov.prodPlanU535 },
                  { l: 'Final FG Producible', v: (key === 'utr' ? ov.fgUTR : ov.fgU535).toLocaleString('en-IN'), accent: true },
                  { l: 'Stop Date', v: key === 'utr' ? ov.stopUTR : ov.stopU535 },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{m.l}</div>
                    <div className={`text-sm font-bold mt-0.5 ${m.accent ? 'text-indigo-700' : 'text-slate-800'}`}>{m.v}</div>
                  </div>
                ))}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan Change</div>
                  {pcr
                    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-0.5"><AlertTriangle className="w-3.5 h-3.5" />Required</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" />Not needed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* IUT */}
      <SectionDivider icon={Truck} label="IUT Transfer" />
      <IutSection key={`iut-${opt.id}`} iut={iut} />

      {/* PROCUREMENT */}
      <SectionDivider icon={ShoppingCart} label="Procurement" />
      <ProcurementSection key={`po-${opt.id}`} po={po} />
      <div className="flex items-center justify-between bg-indigo-600 text-white rounded-xl px-5 py-3.5 shadow-md">
        <span className="text-sm font-semibold">Total Procurement Cost</span>
        <span className="text-lg font-bold">{fmt(opt.totalCost)}</span>
      </div>
    </div>
  );
}

/* ─────────────────── IUT SECTION (multi-material) ─────────────────── */

function MaterialChip({ mat, isSelected, onSelect }: { mat: Material; isSelected: boolean; onSelect: () => void }) {
  const attention = mat.status === 'attention';
  return (
    <button
      onClick={onSelect}
      className={`flex-none text-left rounded-xl border-2 px-3 py-2 transition-all min-w-[150px] ${
        isSelected
          ? 'border-indigo-600 bg-white shadow-md'
          : 'border-transparent bg-white/70 hover:bg-white hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-none ${attention ? 'bg-amber-400' : 'bg-emerald-500'}`} />
        <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>{mat.code}</span>
      </div>
      <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{mat.name}</div>
      <div className="text-[10px] text-slate-500">{mat.qty}</div>
    </button>
  );
}

function IutSection({ iut }: { iut: Option['iut'] }) {
  const agg = useMemo(() => iutAgg(iut), [iut]);
  const mats = useMemo(() => sortedMaterials(iut.materials as Material[]), [iut]);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [selectedCode, setSelectedCode] = useState(mats[0]!.code);

  const visible = attentionOnly ? mats.filter((m) => m.status === 'attention') : mats;
  const toggleAttentionOnly = () => {
    const next = !attentionOnly;
    setAttentionOnly(next);
    // Keep detail panel in sync with the filtered strip
    if (next) {
      const current = mats.find((m) => m.code === selectedCode);
      if (!current || current.status !== 'attention') {
        const firstAttention = mats.find((m) => m.status === 'attention');
        if (firstAttention) setSelectedCode(firstAttention.code);
      }
    }
  };
  const mat = visible.find((m) => m.code === selectedCode) ?? visible[0] ?? mats[0]!;
  const laneOk = iut.lane === 'Available';

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-2xl border border-indigo-100 p-5 flex flex-col gap-4">

      {/* Aggregate roll-up — the at-a-glance line */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
          <span className="inline-flex items-center gap-1"><PlantBadge plant={iut.from} sm /><ArrowRight className="w-3 h-3 text-indigo-400" /><PlantBadge plant={iut.to} sm /></span>
          <span className="font-bold text-slate-800">{agg.count} materials</span>
          <span className="text-slate-300">·</span>
          <span><b className="text-slate-800">{agg.totalQty.toLocaleString('en-IN')} EA</b> total</span>
          <span className="text-slate-300">·</span>
          <span><b className="text-slate-800">{fmt(agg.totalTripCost)}</b> transport</span>
          <span className="text-slate-300">·</span>
          <span className={`inline-flex items-center gap-1 font-bold ${laneOk ? 'text-emerald-600' : 'text-amber-500'}`}>
            {laneOk ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}Lane {iut.lane}
          </span>
        </div>
        {agg.attention > 0 && (
          <button
            onClick={toggleAttentionOnly}
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
              attentionOnly
                ? 'bg-amber-400 border-amber-400 text-amber-950'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />{agg.attention} need attention
          </button>
        )}
      </div>

      {/* Material selector strip (attention-first) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {visible.map((m) => (
          <MaterialChip key={m.code} mat={m} isSelected={m.code === mat.code} onSelect={() => setSelectedCode(m.code)} />
        ))}
      </div>

      {/* Focused material detail — one at a time */}
      <div className="bg-white/60 rounded-xl border border-indigo-100 p-4">
        {mat.status === 'attention' && mat.note && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 flex-none" />{mat.note}
          </div>
        )}
        <div className="flex items-center justify-center gap-0 mb-4">
          <div className="text-center w-20">
            <PlantBadge plant={iut.from} /><div className="text-[10px] text-slate-400 mt-1 font-semibold">FROM</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5 px-4">
            <span className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-full px-3 py-0.5 shadow-sm">{mat.name} · {mat.qty}</span>
            <div className="w-full flex items-center"><div className="flex-1 border-t-2 border-dashed border-indigo-300" /><ArrowRight className="w-5 h-5 text-indigo-500 flex-none" /></div>
            <span className="text-[10px] text-slate-500 font-medium">{mat.leadTime} · {mat.initiation} · {mat.costPerTrip}/trip</span>
          </div>
          <div className="text-center w-20">
            <PlantBadge plant={iut.to} /><div className="text-[10px] text-slate-400 mt-1 font-semibold">TO</div>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'Material Code', value: mat.code },
            { label: 'Transfer Qty',  value: mat.qty },
            { label: 'Lead Time',     value: mat.leadTime },
            { label: 'Initiation',    value: mat.initiation },
            {
              label: 'Lane',
              el: <span className={`flex items-center gap-1 text-xs font-bold ${laneOk ? 'text-emerald-600' : 'text-amber-500'}`}>
                {laneOk ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}{iut.lane}
              </span>,
            },
            { label: 'Cost / Trip', value: mat.costPerTrip },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-indigo-100 px-3 py-2.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</div>
              {'el' in s && s.el ? s.el : <div className="text-xs font-bold text-slate-800">{s.value}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabular view — all materials at once (trial) */}
      <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          All Materials — Tabular View
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="text-left px-4 py-2">Material</th>
                <th className="text-right px-3 py-2">Transfer Qty</th>
                <th className="text-right px-3 py-2">Lead Time</th>
                <th className="text-left px-3 py-2">Initiation</th>
                <th className="text-right px-4 py-2">Cost / Trip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mats.map((m) => (
                <tr
                  key={m.code}
                  onClick={() => setSelectedCode(m.code)}
                  className={`cursor-pointer transition-colors ${
                    m.code === mat.code ? 'bg-indigo-50/70' : m.status === 'attention' ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-none ${m.status === 'attention' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{m.name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{m.code}</div>
                      </div>
                    </div>
                    {m.status === 'attention' && m.note && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 mt-1">
                        <AlertTriangle className="w-3 h-3 flex-none" />{m.note}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-800 text-right whitespace-nowrap">{m.qty}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 text-right whitespace-nowrap">{m.leadTime}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{m.initiation}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 text-right whitespace-nowrap">{m.costPerTrip}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wider">Total · {agg.count} materials</td>
                <td className="px-3 py-3 text-xs font-bold text-slate-800 text-right whitespace-nowrap">{agg.totalQty.toLocaleString('en-IN')} EA</td>
                <td className="px-3 py-3 text-xs text-slate-600 text-right whitespace-nowrap">max {agg.maxLead} days</td>
                <td />
                <td className="px-4 py-3 text-xs font-bold text-indigo-700 text-right whitespace-nowrap">{fmt(agg.totalTripCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────── PROCUREMENT SECTION (single estimation view) ────────────── */

function ProcurementSection({ po }: { po: Option['procurement'] }) {
  const agg = useMemo(() => poAgg(po), [po]);
  const orders = useMemo(() => sortedOrders(po.orders as PurchaseOrder[]), [po]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Estimation roll-up across all raw materials */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
          <span className="font-bold text-slate-800">{agg.count} purchase orders</span>
          <span className="text-slate-300">·</span>
          <span><b className="text-slate-800">{agg.suppliers} suppliers</b></span>
          <span className="text-slate-300">·</span>
          <span><b className="text-slate-800">{agg.totalUnits.toLocaleString('en-IN')} units</b></span>
        </div>
        {agg.attention > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
            <AlertTriangle className="w-3 h-3" />{agg.attention} need attention
          </span>
        )}
      </div>

      {/* All raw materials in one table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="text-left px-4 py-2">Material</th>
              <th className="text-left px-3 py-2">Plant</th>
              <th className="text-left px-3 py-2">Supplier</th>
              <th className="text-right px-3 py-2">Order Qty</th>
              <th className="text-right px-3 py-2">MOQ</th>
              <th className="text-right px-3 py-2">Price/Unit</th>
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.materialCode} className={o.status === 'attention' ? 'bg-amber-50/60' : ''}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-none ${o.status === 'attention' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{o.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{o.materialCode}</div>
                    </div>
                  </div>
                  {o.status === 'attention' && o.note && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 mt-1">
                      <AlertTriangle className="w-3 h-3 flex-none" />{o.note}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5"><PlantBadge plant={o.plant} sm /></td>
                <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap">{o.supplier}</td>
                <td className="px-3 py-2.5 text-xs font-bold text-slate-800 text-right whitespace-nowrap">{o.orderQty}</td>
                <td className="px-3 py-2.5 text-xs text-slate-600 text-right whitespace-nowrap">{o.moq}</td>
                <td className="px-3 py-2.5 text-xs text-slate-600 text-right whitespace-nowrap">₹{o.priceUnit}</td>
                <td className="px-4 py-2.5 text-xs font-bold text-indigo-700 text-right whitespace-nowrap">{fmt(o.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated Total</td>
              <td className="px-3 py-3 text-xs font-bold text-slate-800 text-right whitespace-nowrap">{agg.totalUnits.toLocaleString('en-IN')} units</td>
              <td colSpan={2} />
              <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right whitespace-nowrap">{fmt(agg.totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────── COMPARE GRID ─────────────────────── */

type CellResult = 'best' | 'worst' | 'mid' | 'neutral';

function diffResult(values: (number | null)[], idx: number, higherBetter: boolean): CellResult {
  const valid = values.filter((v) => v !== null) as number[];
  if (valid.length < 2) return 'neutral';
  const v = values[idx];
  if (v === null) return 'neutral';
  const best  = higherBetter ? Math.max(...valid) : Math.min(...valid);
  const worst = higherBetter ? Math.min(...valid) : Math.max(...valid);
  if (valid.every((x) => x === valid[0])) return 'neutral';
  if (v === best)  return 'best';
  if (v === worst) return 'worst';
  return 'mid';
}

const CELL_STYLE: Record<CellResult, string> = {
  best:    'bg-emerald-50 text-emerald-800',
  worst:   'bg-red-50    text-red-700',
  mid:     'bg-slate-50  text-slate-700',
  neutral: 'text-slate-700',
};
const CELL_BADGE: Partial<Record<CellResult, string>> = {
  best:  'bg-emerald-100 text-emerald-700',
  worst: 'bg-red-100    text-red-600',
};

function DiffCell({ value, display, result }: { value: number | null; display: string; result: CellResult }) {
  const badge = CELL_BADGE[result];
  return (
    <td className={`px-4 py-3 text-center align-middle ${CELL_STYLE[result]}`}>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-bold">{display}</span>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge}`}>
            {result === 'best' ? '✓ Best' : '↓ High'}
          </span>
        )}
      </div>
    </td>
  );
}

function TextCell({ value }: { value: React.ReactNode }) {
  return <td className="px-4 py-3 text-center align-middle text-sm text-slate-700">{value}</td>;
}

function RowLabel({ label }: { label: string }) {
  return (
    <td className="pl-4 pr-3 py-3 text-left align-middle sticky left-0 bg-white border-r border-slate-100 z-10 min-w-[160px]">
      <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{label}</span>
    </td>
  );
}

function SectionRow({ label, icon: Icon, cols }: { label: string; icon: React.ElementType; cols: number }) {
  return (
    <tr className="bg-slate-800">
      <td colSpan={cols + 1} className="px-4 py-2.5 sticky left-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          <Icon className="w-3.5 h-3.5" />{label}
        </div>
      </td>
    </tr>
  );
}

function CompareGrid({ opts }: { opts: Option[] }) {
  const n = opts.length;
  const [showMats, setShowMats] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // helper: get diff across compared options
  const numDiff = (vals: (number | null)[], hb: boolean) =>
    vals.map((_, i) => diffResult(vals, i, hb));

  // Numeric arrays
  const fgUTRs   = opts.map((o) => o.overview.fgUTR);
  const fgU535s  = opts.map((o) => o.overview.fgU535);
  const wUTRs    = opts.map((o) => o.overview.wasteUTR);
  const wU535s   = opts.map((o) => o.overview.wasteU535);
  const aggs     = opts.map((o) => iutAgg(o.iut));
  const leadDays = aggs.map((a) => a.maxLead);
  const costTrip = aggs.map((a) => a.totalTripCost);
  const qtyNums  = aggs.map((a) => a.totalQty);
  const poAggs   = opts.map((o) => poAgg(o.procurement));
  const poUnits  = poAggs.map((a) => a.totalUnits);
  const poValues = poAggs.map((a) => a.totalValue);
  const totals   = opts.map((o) => o.totalCost);

  const fgUTRd  = numDiff(fgUTRs,  true);
  const fgU535d = numDiff(fgU535s, true);
  const wUTRd   = numDiff(wUTRs,   false);
  const wU535d  = numDiff(wU535s,  false);
  const leadD   = numDiff(leadDays, false);
  const costTD  = numDiff(costTrip, false);
  const qtyD    = numDiff(qtyNums,  true);
  const poUnitsD = numDiff(poUnits, true);
  const poValueD = numDiff(poValues, false);
  const totalD  = numDiff(totals,   false);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-900">
            <th className="pl-4 pr-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-700 min-w-[160px]">
              Detail
            </th>
            {opts.map((o) => (
              <th key={o.id} className="px-4 py-4 text-center min-w-[180px]">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{o.label}</span>
                    {o.isRecommended && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900 flex-none">
                        <Star className="w-2 h-2 fill-current" />REC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <PlantBadge plant={o.iut.from} sm /><ArrowRight className="w-2.5 h-2.5 text-slate-500" /><PlantBadge plant={o.iut.to} sm />
                  </div>
                  <ScorePill score={o.score} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">

          {/* ── OVERVIEW ── */}
          <SectionRow icon={BarChart3} label="Overview" cols={n} />
          <tr><RowLabel label="FG Producible · UTR" />{fgUTRs.map((v, i) => <DiffCell key={i} value={v} display={v.toLocaleString('en-IN')} result={fgUTRd[i]} />)}</tr>
          <tr><RowLabel label="FG Producible · U535"/>{fgU535s.map((v,i)=><DiffCell key={i} value={v} display={v.toLocaleString('en-IN')} result={fgU535d[i]}/>)}</tr>
          <tr><RowLabel label="Business Waste · UTR"/>{wUTRs.map((v,i)=><DiffCell key={i} value={v} display={fmt(v)} result={wUTRd[i]}/>)}</tr>
          <tr><RowLabel label="Business Waste · U535"/>{wU535s.map((v,i)=><DiffCell key={i} value={v} display={fmt(v)} result={wU535d[i]}/>)}</tr>
          <tr><RowLabel label="Stop Date · UTR"/>{opts.map((o,i)=><TextCell key={i} value={o.overview.stopUTR}/>)}</tr>
          <tr><RowLabel label="Stop Date · U535"/>{opts.map((o,i)=><TextCell key={i} value={o.overview.stopU535}/>)}</tr>
          <tr><RowLabel label="Plan Change · UTR"/>{opts.map((o,i)=><TextCell key={i} value={
            o.overview.planChangeUTR
              ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><AlertTriangle className="w-3 h-3"/>Yes</span>
              : <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3 h-3"/>No</span>
          }/>)}</tr>

          {/* ── IUT ── */}
          <SectionRow icon={Truck} label="IUT Transfer" cols={n} />
          <tr><RowLabel label="Transfer Route"/>{opts.map((o,i)=><TextCell key={i} value={
            <span className="inline-flex items-center gap-1"><PlantBadge plant={o.iut.from} sm/><ArrowRight className="w-3 h-3 text-slate-400"/><PlantBadge plant={o.iut.to} sm/></span>
          }/>)}</tr>
          <tr><RowLabel label="Materials"/>{aggs.map((a,i)=><TextCell key={i} value={
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
              {a.count}
              {a.attention > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-2.5 h-2.5"/>{a.attention}
                </span>
              )}
            </span>
          }/>)}</tr>
          <tr><RowLabel label="Total Transfer Qty"/>{qtyNums.map((v,i)=><DiffCell key={i} value={v} display={`${v.toLocaleString('en-IN')} EA`} result={qtyD[i]}/>)}</tr>
          <tr><RowLabel label="Longest Lead Time"/>{leadDays.map((v,i)=><DiffCell key={i} value={v} display={`${v} days`} result={leadD[i]}/>)}</tr>
          <tr><RowLabel label="Lane Availability"/>{opts.map((o,i)=><TextCell key={i} value={
            o.iut.lane === 'Available'
              ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><Wifi className="w-3.5 h-3.5"/>Available</span>
              : <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500"><WifiOff className="w-3.5 h-3.5"/>Not set</span>
          }/>)}</tr>
          <tr><RowLabel label="Transport Cost"/>{costTrip.map((v,i)=><DiffCell key={i} value={v} display={fmt(v)} result={costTD[i]}/>)}</tr>
          <tr>
            <td className="pl-4 pr-3 py-2 text-left sticky left-0 bg-white border-r border-slate-100 z-10">
              <button onClick={() => setShowMats((v) => !v)} className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap">
                <Layers className="w-3 h-3"/>{showMats ? 'Hide materials' : 'By material'}
              </button>
            </td>
            {opts.map((o) => <td key={o.id} className="bg-white" />)}
          </tr>
          {showMats && (
            <tr className="align-top">
              <RowLabel label="Material Breakdown" />
              {opts.map((o) => (
                <td key={o.id} className="px-3 py-3 align-top">
                  <div className="flex flex-col gap-1.5">
                    {sortedMaterials(o.iut.materials as Material[]).map((m) => (
                      <div key={m.code} className={`rounded-lg border px-2.5 py-1.5 text-left ${m.status === 'attention' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-none ${m.status === 'attention' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          <span className="font-mono text-[10px] font-bold text-slate-600">{m.code}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.qty} · {m.leadTime} · {m.costPerTrip}/trip</div>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          )}

          {/* ── PROCUREMENT ── */}
          <SectionRow icon={ShoppingCart} label="Procurement" cols={n} />
          <tr><RowLabel label="Purchase Orders"/>{poAggs.map((a,i)=><TextCell key={i} value={
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
              {a.count}
              {a.attention > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-2.5 h-2.5"/>{a.attention}
                </span>
              )}
            </span>
          }/>)}</tr>
          <tr><RowLabel label="Suppliers"/>{poAggs.map((a,i)=><TextCell key={i} value={a.suppliers}/>)}</tr>
          <tr><RowLabel label="Total Order Qty"/>{poUnits.map((v,i)=><DiffCell key={i} value={v} display={`${v.toLocaleString('en-IN')} units`} result={poUnitsD[i]}/>)}</tr>
          <tr><RowLabel label="Total Order Value"/>{poValues.map((v,i)=><DiffCell key={i} value={v} display={fmt(v)} result={poValueD[i]}/>)}</tr>
          <tr>
            <td className="pl-4 pr-3 py-2 text-left sticky left-0 bg-white border-r border-slate-100 z-10">
              <button onClick={() => setShowOrders((v) => !v)} className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap">
                <Layers className="w-3 h-3"/>{showOrders ? 'Hide orders' : 'By order'}
              </button>
            </td>
            {opts.map((o) => <td key={o.id} className="bg-white" />)}
          </tr>
          {showOrders && (
            <tr className="align-top">
              <RowLabel label="Order Breakdown" />
              {opts.map((o) => (
                <td key={o.id} className="px-3 py-3 align-top">
                  <div className="flex flex-col gap-1.5">
                    {sortedOrders(o.procurement.orders as PurchaseOrder[]).map((p) => (
                      <div key={p.materialCode} className={`rounded-lg border px-2.5 py-1.5 text-left ${p.status === 'attention' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-none ${p.status === 'attention' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                          <PlantBadge plant={p.plant} sm />
                          <span className="font-mono text-[10px] font-bold text-slate-600">{p.materialCode}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800">{p.name} · {p.supplier}</div>
                        <div className="text-[10px] text-slate-500">{p.orderQty} · ₹{p.priceUnit}/unit · {fmt(p.total)}</div>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          )}

          {/* ── TOTAL ── */}
          <tr className="bg-slate-50 border-t-2 border-slate-300">
            <td className="pl-4 pr-3 py-4 sticky left-0 bg-slate-50 border-r border-slate-200 z-10">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Total Procurement Cost</span>
              </div>
            </td>
            {totals.map((v, i) => (
              <DiffCell key={i} value={v} display={fmt(v)} result={totalD[i]} />
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function PlanComparisonPage() {
  const [mode, setMode]       = useState<'focus' | 'compare'>('focus');
  const [selectedId, setSelectedId]   = useState(1);
  const [comparedIds, setComparedIds] = useState<number[]>([1, 2, 3]);

  const selected   = OPTIONS.find((o) => o.id === selectedId)!;
  const comparedOpts = OPTIONS.filter((o) => comparedIds.includes(o.id));

  const toggleCompared = (id: number) => {
    setComparedIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev   // keep min 1
        : [...prev, id],
    );
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 pb-16 flex flex-col gap-5">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">IUT + Procurement</h1>
          <p className="text-sm text-slate-500 mt-0.5">Plan Comparison · IUT + Break MOQ</p>
        </div>
        {/* Mode toggle */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
          {[
            { id: 'focus' as const,   label: 'Focus View',   Icon: LayoutGrid },
            { id: 'compare' as const, label: 'Compare',      Icon: SlidersHorizontal },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OPTION CARDS ── */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          {mode === 'focus' ? 'Select an option to view its details' : 'Select options to compare — tick the ones you want'}
        </div>
        <div className="flex gap-3">
          {OPTIONS.map((opt) => (
            <OptionCard
              key={opt.id}
              opt={opt}
              isSelected={opt.id === selectedId}
              isCompared={comparedIds.includes(opt.id)}
              mode={mode}
              onSelect={() => setSelectedId(opt.id)}
              onToggleCompare={() => toggleCompared(opt.id)}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {mode === 'focus' ? (
        <>
          {/* Selected header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base">{selected.label}</span>
                  {selected.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">
                      <Star className="w-2.5 h-2.5 fill-current" />Recommended
                    </span>
                  )}
                  <ScorePill score={selected.score} />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs">
                  <PlantBadge plant={selected.iut.from} sm /><ArrowRight className="w-3 h-3" /><PlantBadge plant={selected.iut.to} sm />
                  <span>{selected.route}</span>
                  <span className="mx-1 text-slate-600">·</span>
                  <span>Total</span>
                  <span className="text-white font-bold">{fmt(selected.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>
          <FocusDetail opt={selected} />
        </>
      ) : (
        <>
          {comparedOpts.length < 2 ? (
            <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-10 text-center">
              Select at least 2 options above to compare them side by side.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  Comparing <b className="text-slate-800">{comparedOpts.map((o) => o.label).join(' vs ')}</b>
                  &nbsp;·&nbsp;
                  <span className="text-emerald-600 font-semibold">Green = best value</span>
                  &nbsp;·&nbsp;
                  <span className="text-red-500 font-semibold">Red = high cost / worse</span>
                </span>
              </div>
              <CompareGrid opts={comparedOpts} />
            </>
          )}
        </>
      )}

      {/* Legend */}
      <div className="text-[11px] text-slate-400 text-center">
        ↓ Savings vs No Action baseline &nbsp;·&nbsp;
        <span className="text-emerald-600 font-semibold">≥40% Excellent</span> &nbsp;·&nbsp;
        <span className="text-amber-500 font-semibold">20–39% Moderate</span> &nbsp;·&nbsp;
        <span className="text-red-500 font-semibold">&lt;20% Poor</span>
      </div>
    </div>
  );
}
