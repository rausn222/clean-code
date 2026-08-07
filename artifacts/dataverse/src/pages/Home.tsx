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
import { fuzzyScore } from '../components/FuzzySearchBox';
import marutiLogo from '../assets/maruti-suzuki-logo.png';

const HOME_TOUR_KEY = 'dataverse-home-tour-done';

/* ------------------------------------------------------------------ */
/* Hero search placeholder — opens the dedicated search page           */
/* ------------------------------------------------------------------ */

const AI_SUGGESTIONS = [
  'Which data products contain customer PII?',
  'Show me all Sales domain data products',
  'Which products had failed runs recently?',
  'What data is available for spare parts planning?',
];

function HeroSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useListDataProducts(
    {},
    { query: { queryKey: getListDataProductsQueryKey({}) } },
  );

  const aiActive = aiMode && query.trim().length >= 3;

  // AI "answer": match catalog products against the question, keyword by keyword
  const aiMatches = useMemo(() => {
    if (!aiActive || !products) return [];
    const STOPWORDS = new Set([
      'show', 'me', 'all', 'the', 'a', 'an', 'which', 'what', 'is', 'are', 'do', 'does',
      'i', 'my', 'for', 'of', 'in', 'on', 'to', 'with', 'and', 'or', 'have', 'had',
      'data', 'product', 'products', 'contain', 'contains', 'available', 'recently',
      'any', 'list', 'find', 'get', 'about', 'that', 'this', 'domain',
    ]);
    const keywords = query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    if (keywords.length === 0) return [];
    return products
      .map((p) => {
        // Score each keyword against the product's fields; sum the best hits
        const score = keywords.reduce((acc, kw) => {
          return (
            acc +
            Math.max(
              fuzzyScore(kw, p.name),
              fuzzyScore(kw, p.description ?? '') * 0.6,
              fuzzyScore(kw, p.domain) * 0.8,
              ...(p.tags ?? []).map((t: string) => fuzzyScore(kw, t) * 0.7),
              0,
            )
          );
        }, 0);
        return { product: p, score };
      })
      .filter((s) => s.score > 100) // require at least one solid keyword hit
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [aiActive, query, products]);

  // Close AI mode when clicking outside the search bar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setAiMode(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = () => {
    const q = query.trim();
    if (!q || aiMode) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const toggleAi = () => {
    setAiMode((v) => !v);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div
        className={`flex items-center bg-white rounded-full shadow-lg pl-4 pr-1.5 py-1.5 transition-shadow ${
          aiMode ? 'ring-2 ring-violet-500/60' : ''
        }`}
        data-tour="hero-search"
      >
        {aiMode ? (
          <Sparkles className="w-4 h-4 text-violet-500 flex-none" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 flex-none" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') setAiMode(false);
          }}
          placeholder={
            aiMode
              ? 'Ask AI anything about your data products...'
              : 'Search by keywords such as Dealer, Customer, and more...'
          }
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder:text-slate-400 px-3 py-1.5"
          aria-label={aiMode ? 'Ask AI about data products' : 'Search data products'}
        />
        <button
          data-tour="ai-mode"
          onClick={toggleAi}
          aria-pressed={aiMode}
          className={`flex-none inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
            aiMode
              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              : 'bg-violet-600 hover:bg-violet-700 text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {aiMode ? 'AI Mode: On' : 'AI Mode'}
        </button>
      </div>

      {/* AI suggestions dropdown (AI mode on, nothing typed yet) */}
      {aiMode && !aiActive && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-violet-200 overflow-hidden z-40 text-left">
          <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-violet-500 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Try asking
          </div>
          <ul>
            {AI_SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  onClick={() => {
                    setQuery(s);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 transition-colors"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
            Or type your own question — results appear as you type.
          </div>
        </div>
      )}

      {/* AI result popup (AI mode on + text entered) */}
      {aiActive && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-violet-200 overflow-hidden z-40 text-left">
          <div className="px-4 py-3 bg-violet-50/70 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center flex-none">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-violet-800">DataVerse AI</span>
          </div>
          <div className="px-4 py-3 text-sm text-slate-700">
            {aiMatches.length > 0 ? (
              <>
                <p>
                  Based on your question, I found{' '}
                  <span className="font-semibold">{aiMatches.length}</span> relevant data{' '}
                  {aiMatches.length === 1 ? 'product' : 'products'} in the catalog:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {aiMatches.map(({ product: p }) => (
                    <li key={p.id}>
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-violet-50 transition-colors text-left"
                      >
                        <span className="flex-none w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5">
                          <Database className="w-3.5 h-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900 truncate">
                            {p.name}
                          </span>
                          <span className="block text-xs text-slate-500 truncate">
                            {p.domain} · {p.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                I couldn't find a data product matching that question yet. Try mentioning a
                domain (Sales, Supply Chain…) or a keyword like dealer, customer, or parts.
              </p>
            )}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400">
            AI answers are generated from catalog metadata in this demo.
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* How it works — 3-step guidance for first-time users                 */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const [, navigate] = useLocation();
  const steps = [
    {
      n: 1,
      icon: Search,
      title: 'Discover',
      desc: 'Search or browse data products by domain',
      go: () => navigate('/search'),
    },
    {
      n: 2,
      icon: BadgeCheck,
      title: 'Subscribe',
      desc: 'Pick a product and choose an access plan',
      go: () => navigate('/my-products'),
    },
    {
      n: 3,
      icon: Cpu,
      title: 'Consume',
      desc: 'Use the data via API, Postgres, or exports',
      go: () => navigate('/my-products'),
    },
  ];

  return (
    <div data-tour="how-it-works" className="w-full max-w-xl">
      <div className="text-slate-300/80 text-[11px] font-bold uppercase tracking-[0.25em] mb-3">
        How it works
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.n}
              onClick={s.go}
              className="group text-left bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-none w-6 h-6 rounded-full bg-indigo-500/90 text-white text-[11px] font-bold flex items-center justify-center">
                  {s.n}
                </span>
                <Icon className="w-4 h-4 text-indigo-300" />
                <span className="text-white text-sm font-semibold">{s.title}</span>
              </div>
              <p className="text-slate-300/90 text-xs leading-snug">{s.desc}</p>
            </button>
          );
        })}
      </div>
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
    body: "You're signed in as Chandan Das (Admin).",
  },
  {
    target: 'hero-search',
    title: 'Search the world of data',
    body: 'Type a keyword and press Enter to open the search page with your results. Tip: the search on My Products also gives instant suggestions as you type.',
  },
  {
    target: 'ai-mode',
    title: 'AI Mode',
    body: 'Turn on AI Mode to ask questions in natural language. You get suggested questions to start with, and answers appear right below the search bar as you type.',
  },
  {
    target: 'how-it-works',
    title: 'Your journey in 3 steps',
    body: 'New here? This is the whole platform in a nutshell: discover a data product, subscribe to an access plan, then consume the data. Each card takes you to the right place.',
  },
  {
    target: 'lets-explore',
    title: "Let's Explore",
    body: 'In a hurry? This button takes you straight to the Getting Started section at the bottom of the page.',
  },
  {
    target: 'take-tour',
    title: 'Replay this tour',
    body: "That's the end of the tour — you can replay it anytime with this button. Happy exploring!",
  },
];

function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-[#0b1230]/95 border-b border-white/10">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-none">
          <span className="flex flex-col items-start leading-none">
            <img
              src={marutiLogo}
              alt="Maruti Suzuki"
              className="h-4 w-auto brightness-0 invert"
            />
            <span className="mt-1 text-[8px] font-medium tracking-widest text-slate-300">
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
            data-tour="lets-explore"
            className="inline-flex items-center gap-2 bg-white text-[#0b1230] hover:bg-indigo-100 text-sm font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Let's Explore
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTourOpen(true)}
            data-tour="take-tour"
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
        <HowItWorks />
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
