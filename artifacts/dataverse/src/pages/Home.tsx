import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search,
  Sparkles,
  ChevronRight,
  Database,
  Landmark,
  Factory,
  Globe2,
  Boxes,
  Megaphone,
  Wrench,
  Truck,
  Users,
  ShieldCheck,
  Cpu,
  MonitorSmartphone,
  Briefcase,
  ClipboardList,
  FolderPlus,
  Scale,
  Headphones,
  BadgeCheck,
  User,
  Menu,
  X,
} from 'lucide-react';
import {
  useListDataProducts,
  getListDataProductsQueryKey,
} from '@workspace/api-client-react';
import GuidedTour, { TourStep } from '../components/GuidedTour';

const HOME_TOUR_KEY = 'dataverse-home-tour-done';

/* ------------------------------------------------------------------ */
/* Fuzzy search                                                        */
/* ------------------------------------------------------------------ */

// Simple fuzzy score: exact substring beats subsequence; earlier match beats later.
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx; // substring match, weighted by position
  // subsequence match
  let ti = 0;
  let matched = 0;
  let firstHit = -1;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) continue;
    if (firstHit === -1) firstHit = found;
    matched++;
    ti = found + 1;
  }
  if (matched < Math.ceil(q.length * 0.7)) return 0;
  return matched * 10 - (firstHit >= 0 ? firstHit : 0);
}

function HeroSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const { data: products } = useListDataProducts(
    {},
    { query: { queryKey: getListDataProductsQueryKey({}) } },
  );

  const active = query.trim().length >= 3;
  const suggestions = useMemo(() => {
    if (!active || !products) return [];
    return products
      .map((p) => {
        const score = Math.max(
          fuzzyScore(query, p.name),
          fuzzyScore(query, p.description ?? '') * 0.6,
          fuzzyScore(query, p.domain) * 0.8,
          fuzzyScore(query, p.urn) * 0.5,
        );
        return { product: p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [active, query, products]);

  // Reopen and reset the highlight whenever the query itself changes
  useEffect(() => {
    setOpen(active);
    setHighlight(0);
  }, [query, active]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (id: number) => {
    setOpen(false);
    navigate(`/products/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(suggestions[highlight].product.id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="flex items-center bg-white rounded-full shadow-lg pl-4 pr-1.5 py-1.5">
        <Search className="w-4 h-4 text-slate-400 flex-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(active)}
          onKeyDown={onKeyDown}
          placeholder="Search by keywords such as Dealer, Customer, and more..."
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder:text-slate-400 px-3 py-1.5"
          aria-label="Search data products"
          aria-expanded={open}
          role="combobox"
          aria-autocomplete="list"
          aria-controls="hero-search-listbox"
          aria-activedescendant={
            open && suggestions.length > 0 ? `hero-suggestion-${suggestions[highlight]?.product.id}` : undefined
          }
        />
        <button className="flex-none inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          AI Mode
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40 text-left">
          <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suggested data products
          </div>
          <ul role="listbox" id="hero-search-listbox">
            {suggestions.map((s, i) => (
              <li
                key={s.product.id}
                id={`hero-suggestion-${s.product.id}`}
                role="option"
                aria-selected={i === highlight}
              >
                <button
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => go(s.product.id)}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === highlight ? 'bg-indigo-50' : ''
                  }`}
                >
                  <span className="flex-none w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5">
                    <Database className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">
                      {s.product.name}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {s.product.domain} · {s.product.description || s.product.urn}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open && active && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 px-4 py-3 z-40 text-left text-sm text-slate-500">
          No matching data products found.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

const NAV_ITEMS: { label: string; to?: string; slug: string }[] = [
  { label: 'HOME', to: '/', slug: 'nav-home' },
  { label: 'APPLICATIONS', slug: 'nav-applications' },
  { label: 'MARKETPLACE', slug: 'nav-marketplace' },
  { label: 'MY PRODUCTS', to: '/my-products', slug: 'nav-my-products' },
  { label: 'CONNECTIONS & DATA SETS', slug: 'nav-connections' },
  { label: 'DATA CATALOG', slug: 'nav-data-catalog' },
  { label: 'DEVELOPER WORKBENCH', slug: 'nav-workbench' },
  { label: 'ADMIN', slug: 'nav-admin' },
];

const HOME_TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to MSIL DataVerse',
    body: 'This quick tour walks you through the navigation bar so you know where everything lives. Use Next / Back or the arrow keys.',
  },
  {
    target: 'nav-home',
    title: 'Home',
    body: 'Brings you back to this landing page anytime — with search, featured products, domains, and getting-started guides.',
  },
  {
    target: 'nav-applications',
    title: 'Applications',
    body: 'Browse analytical applications and dashboards built on top of DataVerse data products. (Coming soon in this demo.)',
  },
  {
    target: 'nav-marketplace',
    title: 'Marketplace',
    body: 'Discover and request published data products from across the organisation — like an internal app store for data. (Coming soon.)',
  },
  {
    target: 'nav-my-products',
    title: 'My Products',
    body: 'Your personal catalog: every data product you own or subscribe to, with health, runs, favourites, and subscriptions. This one is fully live — click it after the tour!',
  },
  {
    target: 'nav-connections',
    title: 'Connections & Data Sets',
    body: 'Manage source system connections and the raw data sets that feed your data products. (Coming soon.)',
  },
  {
    target: 'nav-data-catalog',
    title: 'Data Catalog',
    body: 'The organisation-wide catalog of governed data assets, with lineage, definitions, and ownership. (Coming soon.)',
  },
  {
    target: 'nav-workbench',
    title: 'Developer Workbench',
    body: 'Tools for developers to build, test, and publish new data products and pipelines. (Coming soon.)',
  },
  {
    target: 'nav-admin',
    title: 'Admin',
    body: 'Administer domains, owners, personas, and platform settings. (Coming soon.)',
  },
  {
    target: 'nav-user',
    title: 'Your profile',
    body: "You're signed in as Chandan Das (Admin). That's the end of the tour — start exploring, or replay it anytime with the “Take a tour” button.",
  },
];

function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-[#0b1230]/95 border-b border-white/10">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-none">
          <span className="text-white font-black italic tracking-tight text-sm leading-none">
            <span className="block">MARUTI SUZUKI</span>
            <span className="block text-[8px] font-medium not-italic tracking-widest text-slate-300">
              Powered by DE
            </span>
          </span>
          <span className="hidden sm:block h-6 w-px bg-white/20" />
          <span className="hidden sm:block text-[10px] font-semibold tracking-[0.2em] text-slate-200">
            MSIL DATAVERSE
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                href={item.to}
                data-tour={item.slug}
                className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-white hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                title="Coming soon"
                data-tour={item.slug}
                onClick={(e) => e.preventDefault()}
                className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-default"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 text-white flex-none" data-tour="nav-user">
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-xs font-semibold">Chandan Das</div>
            <div className="text-[10px] text-slate-300">Admin</div>
          </div>
          <span className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
            <User className="w-4 h-4" />
          </span>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md border border-white/30 hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="lg:hidden bg-[#0b1230] border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                href={item.to}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2 text-xs font-semibold tracking-wide text-white hover:text-amber-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="px-2 py-2 text-xs font-semibold tracking-wide text-slate-400"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

function GlobeBackdrop() {
  // Deterministic pseudo-random star field
  const stars = useMemo(() => {
    const pts: { x: number; y: number; r: number; o: number }[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 220; i++) {
      pts.push({ x: rand() * 100, y: rand() * 100, r: rand() * 1.4 + 0.3, o: rand() * 0.5 + 0.1 });
    }
    return pts;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a102c] via-[#0d1638] to-[#0a1030]" />
      {/* glowing globe */}
      <div className="absolute -right-[15%] top-[20%] w-[70vw] h-[70vw] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, rgba(59,91,219,0.35) 0%, rgba(30,49,130,0.25) 35%, rgba(10,16,44,0) 70%)',
        }}
      />
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#8ea2ff" opacity={s.o} />
        ))}
        <path d="M -100 720 Q 700 300 1800 560" stroke="rgba(99,131,255,0.15)" strokeWidth="1.5" fill="none" />
        <path d="M -100 820 Q 800 420 1900 700" stroke="rgba(99,131,255,0.10)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 2 — products & applications cards                             */
/* ------------------------------------------------------------------ */

const EFFICIENT_PRODUCTS = [
  {
    name: 'PDI and Failure Count Aggregated',
    tags: ['Published', 'Aggregated', 'Quality Assurance'],
    by: 'Akash Kumar',
    health: 'Warning' as const,
  },
  {
    name: 'Model_Master',
    tags: ['Published', 'Source Aligned', 'International Marketing'],
    by: 'Akash Kumar',
    health: 'Normal' as const,
  },
  {
    name: 'Vendor Master',
    tags: ['Published', 'Source Aligned', 'Quality Assurance'],
    by: 'Akash Kumar',
    health: 'Normal' as const,
  },
];

const LATEST_APPS = [
  { name: 'SQL - llama', tags: ['Digital Enterprise'], by: 'Arnav Bindal', created: '7th Nov \u201925' },
  { name: 'Quality Gate System', tags: ['Production'], by: 'Akash Kumar', created: '26th Sept \u201924' },
  { name: 'Work Order Dashboard', tags: ['Production'], by: 'Akash Kumar \u00b7 Dashboard', created: '21st Aug \u201924' },
];

function ProductCard({
  name,
  tags,
  by,
  health,
  created,
  onClick,
}: {
  name: string;
  tags: string[];
  by: string;
  health?: 'Warning' | 'Normal';
  created?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all p-4 flex flex-col gap-2.5 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-700 transition-colors">
          {name}
        </div>
        <Database className="w-4 h-4 text-indigo-600 flex-none" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
            {t}
          </span>
        ))}
      </div>
      <div className="text-[11px] text-slate-500">By {by}</div>
      <div className="flex items-center justify-between mt-auto pt-1">
        {health ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className={`w-1.5 h-1.5 rounded-full ${health === 'Warning' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            {health}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">Created on {created}</span>
        )}
        <span className="text-[11px] font-semibold text-indigo-600 group-hover:underline">View Details</span>
      </div>
    </button>
  );
}

function CardsSlide({ goCatalog }: { goCatalog: () => void }) {
  return (
    <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-8 flex flex-col gap-10 lg:gap-14">
      <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] gap-4 lg:gap-8 items-start">
        <div className="lg:text-right">
          <h2 className="text-white text-xl font-bold leading-tight">Most Efficient Products</h2>
          <button
            onClick={goCatalog}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-sm px-3 py-1 transition-colors"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EFFICIENT_PRODUCTS.map((p) => (
            <ProductCard key={p.name} {...p} onClick={goCatalog} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] gap-4 lg:gap-8 items-start">
        <div className="lg:text-right">
          <h2 className="text-white text-xl font-bold leading-tight">Latest Applications</h2>
          <button
            onClick={goCatalog}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-sm px-3 py-1 transition-colors"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LATEST_APPS.map((p) => (
            <ProductCard key={p.name} {...p} onClick={goCatalog} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 3 — hexagon domain grid                                       */
/* ------------------------------------------------------------------ */

const DOMAINS: { name: string; count: number; icon: React.ElementType; owner?: boolean }[] = [
  { name: 'Finance', count: 51, icon: Landmark },
  { name: 'Production', count: 83, icon: Factory },
  { name: 'International Marketing', count: 30, icon: Globe2, owner: true },
  { name: 'Parts Accessories and Logistics', count: 15, icon: Boxes },
  { name: 'Marketing and Sales', count: 50, icon: Megaphone },
  { name: 'Engineering', count: 13, icon: Wrench },
  { name: 'Supply Chain', count: 18, icon: Truck },
  { name: 'Human Resource', count: 7, icon: Users },
  { name: 'Safety', count: 4, icon: ShieldCheck },
  { name: 'Digital Enterprise', count: 1, icon: Cpu },
  { name: 'Information Technology', count: 1, icon: MonitorSmartphone },
  { name: 'Corporate Affairs', count: 0, icon: Briefcase },
  { name: 'Product Planning', count: 0, icon: ClipboardList },
  { name: 'New Projects', count: 0, icon: FolderPlus, owner: true },
  { name: 'Legal', count: 0, icon: Scale },
  { name: 'Service', count: 0, icon: Headphones },
  { name: 'Quality Assurance', count: 81, icon: BadgeCheck },
];

function Hexagon({
  name,
  count,
  icon: Icon,
  owner,
  onClick,
}: (typeof DOMAINS)[number] & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center text-center w-[150px] h-[168px] flex-none group focus:outline-none"
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    >
      <span className="absolute inset-0 bg-[#141d47] border border-indigo-400/20 group-hover:bg-[#1b2760] transition-colors"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      />
      <span className="relative flex flex-col items-center gap-1 px-3">
        <Icon className="w-5 h-5 text-indigo-300" />
        <span className="text-xl font-bold text-white leading-none">{count}</span>
        <span className="text-[11px] font-semibold text-slate-200 leading-tight">{name}</span>
        {owner && (
          <span className="text-[8px] font-black tracking-wider bg-amber-400 text-slate-900 rounded-full px-2 py-px">
            OWNER
          </span>
        )}
        <span className="text-[9px] text-slate-400 leading-tight">
          {name === 'Corporate Affairs' ? '1 data products requested' : '0 data products requested'}
        </span>
      </span>
    </button>
  );
}

function DomainsSlide({ goCatalog }: { goCatalog: () => void }) {
  const total = DOMAINS.reduce((s, d) => s + d.count, 0);
  return (
    <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-8 text-center">
      <h2 className="text-white text-2xl font-bold">Explore Data Products by Domain</h2>
      <div className="text-slate-300 text-sm mt-1 mb-8">Total: {total}</div>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-[-20px] max-w-[1100px] mx-auto"
        style={{ rowGap: '8px' }}
      >
        {DOMAINS.map((d) => (
          <Hexagon key={d.name} {...d} onClick={goCatalog} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 4 — getting started                                           */
/* ------------------------------------------------------------------ */

const GETTING_STARTED: { role: string; links: string[] }[] = [
  {
    role: 'Business',
    links: ['Create/Upload Application', 'Create Requested Data Product', 'Subscribe Data Product', 'Approve Publish Requests'],
  },
  { role: 'Developer', links: ['Create a new Data Product'] },
  {
    role: 'Domain Owner',
    links: ['Create a Data Product', 'Create a New Data Connection', 'Create a New Data Set', 'Assign a Developer'],
  },
  { role: 'Admin', links: ['Add/Edit Domain Owner', 'Add/Edit a new Persona'] },
];

function GettingStartedSlide({ goCatalog }: { goCatalog: () => void }) {
  return (
    <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-8">
      <h2 className="text-white text-xl font-bold mb-6">Getting Started</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
        {GETTING_STARTED.map((col) => (
          <div key={col.role}>
            <div className="text-slate-100 text-sm font-bold mb-3">{col.role}</div>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <button
                    onClick={goCatalog}
                    className="inline-flex items-center gap-2 text-[13px] text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-none" />
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="text-white text-xl font-bold mt-12 mb-5">Categories</h2>
      <div className="flex flex-wrap gap-x-24 gap-y-4">
        <button onClick={goCatalog} className="text-[13px] text-slate-300 hover:text-white transition-colors">
          Recommended for You
        </button>
        <button onClick={goCatalog} className="inline-flex items-center gap-2 text-[13px] text-slate-300 hover:text-white transition-colors">
          <span className="text-slate-500">📌</span> Top 10 Assets
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const goCatalog = () => navigate('/my-products');
  const [tourOpen, setTourOpen] = useState(
    () => localStorage.getItem(HOME_TOUR_KEY) !== '1',
  );
  const closeTour = () => {
    localStorage.setItem(HOME_TOUR_KEY, '1');
    setTourOpen(false);
  };

  // Deep-link support: /?slide=2 jumps straight to a section
  useEffect(() => {
    const s = Number(new URLSearchParams(window.location.search).get('slide'));
    const target = sectionRefs.current[s];
    if (Number.isInteger(s) && target && containerRef.current) {
      containerRef.current.scrollTo({ top: target.offsetTop });
    }
  }, []);

  // Track the active slide from measured section offsets (robust to
  // sections taller than the viewport and to window resizes)
  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const pos = el.scrollTop + el.clientHeight / 2;
    let idx = 0;
    sectionRefs.current.forEach((sec, i) => {
      if (sec && sec.offsetTop <= pos) idx = i;
    });
    setActive(idx);
  };

  const scrollTo = (i: number) => {
    const target = sectionRefs.current[i];
    if (target && containerRef.current) {
      containerRef.current.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    }
  };

  const slides = [
    <div key="hero" className="max-w-[1240px] mx-auto w-full px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="text-slate-300 tracking-[0.35em] text-sm font-semibold mb-2">EXPLORE</div>
        <h1 className="text-white text-5xl sm:text-6xl font-extrabold leading-[1.05]">
          THE WORLD OF
          <br />
          DATA
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => scrollTo(3)}
            className="inline-flex items-center gap-2 bg-white text-[#0b1230] hover:bg-indigo-100 text-sm font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Let's Explore
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTourOpen(true)}
            className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 text-sm font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <BadgeCheck className="w-4 h-4" />
            Take a tour
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <p className="text-slate-100 text-lg sm:text-xl leading-relaxed">
          A one stop solution for user's data queries providing high-quality, fit-for-purpose data
          and analytical products
        </p>
        <HeroSearch />
      </div>
    </div>,
    <CardsSlide key="cards" goCatalog={goCatalog} />,
    <DomainsSlide key="domains" goCatalog={goCatalog} />,
    <GettingStartedSlide key="start" goCatalog={goCatalog} />,
  ];

  return (
    <div className="relative h-screen bg-[#0a102c] text-slate-100">
      <GlobeBackdrop />
      <HomeNavbar />

      {/* dot navigation */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to section ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full border border-white/70 transition-all ${
              active === i ? 'bg-white scale-110' : 'bg-transparent hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="relative z-10 h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        {slides.map((slide, i) => (
          <section
            key={i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className="min-h-full snap-start flex items-center justify-center pt-20 pb-10"
          >
            {slide}
          </section>
        ))}
      </div>

      {tourOpen && <GuidedTour steps={HOME_TOUR_STEPS} onClose={closeTour} />}
    </div>
  );
}
