/**
 * MyProductsListingPage — fully self-contained React component (TSX).
 *
 * Redesigned "My Products" listing page with FAVOURITES support:
 * - Star toggle on every product card (top-right corner)
 * - "Favourites" filter chip with live count next to the other status chips
 * - Favourited cards show a subtle amber ring so they stand out while browsing
 * - Favourites persist in localStorage so they survive page reloads
 *
 * ALL styling is embedded as plain CSS — no Tailwind or external stylesheet.
 * Dependencies: react, lucide-react.
 *
 * Usage: <MyProductsListingPage /> (sample data inlined; replace via props)
 */

import React, { useEffect, useMemo, useState } from "react";
import { Search, Star, Layers, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Embedded stylesheet
// ---------------------------------------------------------------------------

const STYLES = `
.mpl, .mpl * { box-sizing: border-box; margin: 0; padding: 0; }

.mpl {
  background: #f8fafc;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.5;
  min-height: 100vh;
  padding: 24px;
}
.mpl button { font-family: inherit; cursor: pointer; background: none; border: none; color: inherit; }

.mpl-container { max-width: 1280px; margin: 0 auto; }

/* Page header */
.mpl-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.mpl-title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
.mpl-subtitle { font-size: 14px; color: #64748b; max-width: 520px; margin-top: 6px; }
.mpl-header-actions { display: flex; gap: 12px; }
.mpl-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: #4f46e5; color: #fff; border: 1px solid #4f46e5;
  padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color .15s ease;
}
.mpl-btn-primary:hover { background: #4338ca; }
.mpl-btn-secondary {
  background: #ffffff; color: #334155; border: 1px solid #cbd5e1;
  padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.mpl-btn-secondary:hover { background: #f8fafc; }

/* Insight stats */
.mpl-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
.mpl-stat {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.mpl-stat-value { font-size: 22px; font-weight: 700; }
.mpl-stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }

/* Toolbar */
.mpl-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; }
.mpl-search {
  flex: 1; min-width: 240px; display: flex; align-items: center; gap: 8px;
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.mpl-search svg { width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0; }
.mpl-search input { border: none; outline: none; font-size: 14px; width: 100%; background: transparent; color: #0f172a; font-family: inherit; }
.mpl-search input::placeholder { color: #94a3b8; }

/* Filter chips */
.mpl-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.mpl-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 500;
  background: #ffffff; border: 1px solid #e2e8f0; color: #475569;
  transition: all .15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.mpl-chip:hover { border-color: #c7d2fe; color: #4338ca; }
.mpl-chip.active { background: #4f46e5; border-color: #4f46e5; color: #ffffff; }
.mpl-chip-count { font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: #f1f5f9; color: #475569; }
.mpl-chip.active .mpl-chip-count { background: rgba(255,255,255,0.22); color: #ffffff; }
.mpl-chip svg { width: 14px; height: 14px; }
/* Favourites chip gets amber accent when active */
.mpl-chip.fav.active { background: #f59e0b; border-color: #f59e0b; }
.mpl-chip.fav svg { color: #f59e0b; }
.mpl-chip.fav.active svg { color: #ffffff; fill: #ffffff; }

.mpl-showing { font-size: 13px; color: #64748b; margin-left: auto; }

/* Product grid */
.mpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

/* Product card */
.mpl-card {
  position: relative;
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 12px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.mpl-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 12px rgba(79,70,229,0.08); }
/* Favourited card: subtle amber ring */
.mpl-card.faved { border-color: #fcd34d; box-shadow: 0 0 0 1px #fcd34d, 0 1px 2px rgba(0,0,0,0.05); }

.mpl-card-top { display: flex; align-items: center; justify-content: space-between; }
.mpl-health { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 999px; }
.mpl-health-dot { width: 6px; height: 6px; border-radius: 50%; }
.mpl-health-normal { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.mpl-health-normal .mpl-health-dot { background: #10b981; }
.mpl-health-issue { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
.mpl-health-issue .mpl-health-dot { background: #f43f5e; }

.mpl-card-icons { display: flex; align-items: center; gap: 6px; }
.mpl-type-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #eef2ff; color: #4f46e5;
  display: flex; align-items: center; justify-content: center;
}
.mpl-type-icon svg { width: 17px; height: 17px; }

/* Favourite star button */
.mpl-fav-btn {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #cbd5e1; transition: all .15s ease;
  border: 1px solid transparent;
}
.mpl-fav-btn:hover { background: #fffbeb; color: #f59e0b; border-color: #fde68a; }
.mpl-fav-btn svg { width: 18px; height: 18px; }
.mpl-fav-btn.on { color: #f59e0b; }
.mpl-fav-btn.on svg { fill: #f59e0b; }

.mpl-card-name { font-size: 16px; font-weight: 600; word-break: break-word; }
.mpl-card-meta { font-size: 12.5px; color: #64748b; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.mpl-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: #cbd5e1; }

.mpl-card-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.mpl-tag { font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 4px; border: 1px solid; }
.mpl-tag-published { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.mpl-tag-draft { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
.mpl-tag-neutral { background: #f8fafc; color: #475569; border-color: #e2e8f0; }
.mpl-tag-source { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }

.mpl-card-foot { margin-top: auto; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
.mpl-view {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 600; color: #4f46e5; transition: color .15s ease;
}
.mpl-view:hover { color: #3730a3; }
.mpl-view svg { width: 15px; height: 15px; }

/* Empty state */
.mpl-empty {
  grid-column: 1 / -1; text-align: center; padding: 64px 16px;
  color: #64748b; border: 1px dashed #e2e8f0; border-radius: 12px; background: #ffffff;
}
.mpl-empty svg { width: 36px; height: 36px; color: #f59e0b; margin: 0 auto 12px; display: block; }
.mpl-empty h3 { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.mpl-empty p { font-size: 14px; }
`;

// ---------------------------------------------------------------------------
// Types & sample data
// ---------------------------------------------------------------------------

export interface ListedProduct {
  id: number;
  name: string;
  domain: string;
  updatedAt: string; // ISO
  health: "normal" | "issue";
  status: "published" | "draft" | "test";
  alignment: "Aggregated" | "Source Aligned";
  subscribed?: boolean;
}

const SAMPLE_PRODUCTS: ListedProduct[] = [
  { id: 1, name: "testADP1", domain: "Engineering", updatedAt: "2026-07-31T13:15:00Z", health: "normal", status: "published", alignment: "Aggregated" },
  { id: 2, name: "testADP2", domain: "Engineering", updatedAt: "2026-07-30T18:12:00Z", health: "normal", status: "published", alignment: "Aggregated" },
  { id: 3, name: "read_pq_test_dp_test_priva6", domain: "Engineering", updatedAt: "2026-07-29T21:15:00Z", health: "normal", status: "published", alignment: "Source Aligned", subscribed: true },
  { id: 4, name: "vehicle_quality_metrics", domain: "Quality", updatedAt: "2026-07-28T10:40:00Z", health: "issue", status: "draft", alignment: "Aggregated" },
  { id: 5, name: "dealer_sales_daily", domain: "Sales", updatedAt: "2026-07-27T08:05:00Z", health: "normal", status: "published", alignment: "Aggregated", subscribed: true },
  { id: 6, name: "parts_supply_forecast", domain: "Supply Chain", updatedAt: "2026-07-25T16:30:00Z", health: "normal", status: "test", alignment: "Source Aligned" },
];

// ---------------------------------------------------------------------------
// Favourites persistence (localStorage)
// ---------------------------------------------------------------------------

const FAV_KEY = "mpl-favourites";

function loadFavourites(): Set<number> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type FilterId = "total" | "published" | "draft" | "test" | "subscribed" | "favourites";

export interface MyProductsListingPageProps {
  products?: ListedProduct[];
  onViewDetails?: (product: ListedProduct) => void;
  onCreateNew?: () => void;
}

export default function MyProductsListingPage({
  products = SAMPLE_PRODUCTS,
  onViewDetails,
  onCreateNew,
}: MyProductsListingPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterId>("total");
  const [favourites, setFavourites] = useState<Set<number>>(loadFavourites);

  // Persist favourites
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favourites]));
    } catch {
      /* storage unavailable — favourites just won't persist */
    }
  }, [favourites]);

  const toggleFavourite = (id: number) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = useMemo(
    () => ({
      total: products.length,
      published: products.filter((p) => p.status === "published").length,
      draft: products.filter((p) => p.status === "draft").length,
      test: products.filter((p) => p.status === "test").length,
      subscribed: products.filter((p) => p.subscribed).length,
      favourites: products.filter((p) => favourites.has(p.id)).length,
    }),
    [products, favourites],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "published" || filter === "draft" || filter === "test") {
      list = list.filter((p) => p.status === filter);
    } else if (filter === "subscribed") {
      list = list.filter((p) => p.subscribed);
    } else if (filter === "favourites") {
      list = list.filter((p) => favourites.has(p.id));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q));
    }
    // Favourites float to the top within any view
    return [...list].sort((a, b) => Number(favourites.has(b.id)) - Number(favourites.has(a.id)));
  }, [products, filter, search, favourites]);

  const chips: { id: FilterId; label: string; fav?: boolean }[] = [
    { id: "total", label: "Total" },
    { id: "published", label: "Published" },
    { id: "draft", label: "Draft" },
    { id: "test", label: "Test" },
    { id: "subscribed", label: "Subscribed" },
    { id: "favourites", label: "Favourites", fav: true },
  ];

  const formatUpdated = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mpl">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="mpl-container">
        {/* Header */}
        <div className="mpl-header">
          <div>
            <h1 className="mpl-title">My Products</h1>
            <p className="mpl-subtitle">
              A centralized repository housing all your data products, with associated details, consumption metrics and
              monitoring available for easy viewing.
            </p>
          </div>
          <div className="mpl-header-actions">
            <button className="mpl-btn-secondary">Test Data Product</button>
            <button className="mpl-btn-primary" onClick={onCreateNew}>
              + Create New Data Product
            </button>
          </div>
        </div>

        {/* Insight stats */}
        <div className="mpl-stats">
          <div className="mpl-stat">
            <div className="mpl-stat-value">39</div>
            <div className="mpl-stat-label">Total Consumers</div>
          </div>
          <div className="mpl-stat">
            <div className="mpl-stat-value">{counts.subscribed}</div>
            <div className="mpl-stat-label">Subscribed Products</div>
          </div>
          <div className="mpl-stat">
            <div className="mpl-stat-value">{counts.total}</div>
            <div className="mpl-stat-label">Created Products</div>
          </div>
          <div className="mpl-stat">
            <div className="mpl-stat-value">{counts.published}</div>
            <div className="mpl-stat-label">Published Products</div>
          </div>
          <div className="mpl-stat">
            <div className="mpl-stat-value" style={{ color: "#f59e0b" }}>
              {counts.favourites}
            </div>
            <div className="mpl-stat-label">Favourites</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mpl-toolbar">
          <div className="mpl-search">
            <Search />
            <input placeholder="Search by name or domain..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="mpl-showing">
            Showing {filtered.length} of {counts.total}
          </span>
        </div>

        {/* Filter chips — Favourites is the amber one */}
        <div className="mpl-chips">
          {chips.map((chip) => (
            <button
              key={chip.id}
              className={`mpl-chip${chip.fav ? " fav" : ""}${filter === chip.id ? " active" : ""}`}
              onClick={() => setFilter(chip.id)}
            >
              {chip.fav && <Star />}
              {chip.label}
              <span className="mpl-chip-count">{counts[chip.id]}</span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mpl-grid">
          {filtered.length === 0 ? (
            <div className="mpl-empty">
              <Star />
              <h3>{filter === "favourites" ? "No favourites yet" : "No products match"}</h3>
              <p>
                {filter === "favourites"
                  ? "Click the star on any product card to pin it here for quick access."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            filtered.map((product) => {
              const faved = favourites.has(product.id);
              return (
                <div key={product.id} className={`mpl-card${faved ? " faved" : ""}`}>
                  <div className="mpl-card-top">
                    <span className={`mpl-health ${product.health === "normal" ? "mpl-health-normal" : "mpl-health-issue"}`}>
                      <span className="mpl-health-dot" />
                      {product.health === "normal" ? "Normal" : "Attention"}
                    </span>
                    <div className="mpl-card-icons">
                      <span className="mpl-type-icon">
                        <Layers />
                      </span>
                      <button
                        className={`mpl-fav-btn${faved ? " on" : ""}`}
                        onClick={() => toggleFavourite(product.id)}
                        title={faved ? "Remove from favourites" : "Add to favourites"}
                        aria-label={faved ? "Remove from favourites" : "Add to favourites"}
                        aria-pressed={faved}
                      >
                        <Star />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mpl-card-name">{product.name}</div>
                    <div className="mpl-card-meta">
                      <span>{product.domain}</span>
                      <span className="dot" />
                      <span>Updated: {formatUpdated(product.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="mpl-card-tags">
                    {product.status === "published" && <span className="mpl-tag mpl-tag-published">Published</span>}
                    {product.status === "draft" && <span className="mpl-tag mpl-tag-draft">Draft</span>}
                    {product.status === "test" && <span className="mpl-tag mpl-tag-neutral">Test</span>}
                    {product.alignment === "Source Aligned" ? (
                      <span className="mpl-tag mpl-tag-source">Source Aligned</span>
                    ) : (
                      <span className="mpl-tag mpl-tag-neutral">Aggregated</span>
                    )}
                    {product.subscribed && <span className="mpl-tag mpl-tag-neutral">Subscribed</span>}
                  </div>

                  <div className="mpl-card-foot">
                    <button className="mpl-view" onClick={() => onViewDetails?.(product)}>
                      View Details
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
