import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCatalogSummary, 
  useListDataProducts, 
  getGetCatalogSummaryQueryKey,
  getListDataProductsQueryKey,
  useListFavourites,
  getListFavouritesQueryKey,
  useAddFavourite,
  useRemoveFavourite,
  useSyncFavourites,
  type FavouritesList
} from "@workspace/api-client-react";
import { 
  Database, 
  Search, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ChevronRight,
  Star
} from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { PageLoader, ErrorState } from "../components/ui/states";
import { formatDateTime } from "../lib/format";

// Legacy per-browser favourites (migrated to the server on first load)
const FAV_KEY = "dataverse-favourites";

function loadLegacyFavouriteIds(): number[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as string[])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  const queryClient = useQueryClient();
  const favouritesQueryKey = getListFavouritesQueryKey();
  const { isAuthenticated, isLoading: loadingAuth, login } = useAuth();

  // Per-user server-side favourites (only fetched when signed in)
  const { data: favouritesData, isLoading: loadingFavourites } = useListFavourites({
    query: { queryKey: favouritesQueryKey, enabled: isAuthenticated }
  });
  const favourites = useMemo(
    () => new Set((favouritesData?.productIds ?? []).map(String)),
    [favouritesData],
  );

  const setFavouritesCache = (result: FavouritesList) => {
    queryClient.setQueryData(favouritesQueryKey, result);
  };
  const addFavourite = useAddFavourite({
    mutation: { onSuccess: setFavouritesCache }
  });
  const removeFavourite = useRemoveFavourite({
    mutation: { onSuccess: setFavouritesCache }
  });
  const syncFavourites = useSyncFavourites({
    mutation: {
      onSuccess: (result) => {
        setFavouritesCache(result);
        try {
          localStorage.removeItem(FAV_KEY);
        } catch {
          /* ignore */
        }
      }
    }
  });

  // One-time migration of legacy localStorage favourites to the signed-in user
  const migratedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || migratedRef.current) return;
    migratedRef.current = true;
    const legacy = loadLegacyFavouriteIds();
    if (legacy.length > 0) {
      syncFavourites.mutate({ data: { productIds: legacy } });
    }
  }, [isAuthenticated]);

  const toggleFavourite = (id: string) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    const productId = Number(id);
    const isFaved = favourites.has(id);
    // Optimistic update so the star responds instantly
    const current = favouritesData?.productIds ?? [];
    setFavouritesCache({
      productIds: isFaved
        ? current.filter((pid) => pid !== productId)
        : [...current, productId],
    });
    const rollback = () => {
      queryClient.invalidateQueries({ queryKey: favouritesQueryKey });
    };
    if (isFaved) {
      removeFavourite.mutate({ productId }, { onError: rollback });
    } else {
      addFavourite.mutate({ productId }, { onError: rollback });
    }
  };

  const { data: summary, isLoading: loadingSummary } = useGetCatalogSummary({
    query: { queryKey: getGetCatalogSummaryQueryKey() }
  });

  const { data: products, isLoading: loadingProducts, error, refetch } = useListDataProducts(
    { 
      search: search || undefined, 
      domain: domainFilter || undefined, 
      status: statusFilter || undefined 
    },
    { query: { queryKey: getListDataProductsQueryKey({ search: search || undefined, domain: domainFilter || undefined, status: statusFilter || undefined }) } }
  );

  const favouriteCount = useMemo(
    () => (products ?? []).filter((p) => favourites.has(String(p.id))).length,
    [products, favourites],
  );

  const visibleProducts = useMemo(() => {
    let list = products ?? [];
    if (favouritesOnly) list = list.filter((p) => favourites.has(String(p.id)));
    // Favourites float to the top within any view
    return [...list].sort(
      (a, b) => Number(favourites.has(String(b.id))) - Number(favourites.has(String(a.id))),
    );
  }, [products, favouritesOnly, favourites]);

  if (loadingSummary || loadingProducts || loadingAuth || (isAuthenticated && loadingFavourites)) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-6 gap-8">
      
      {/* Overview Stats */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Data Catalog</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            + New Product
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Products" value={summary?.totalProducts} icon={Database} />
          <StatCard title="Published" value={summary?.publishedCount} icon={CheckCircle2} iconColor="text-emerald-500" />
          <StatCard title="Drafts" value={summary?.draftCount} icon={FileText} iconColor="text-slate-400" />
          <StatCard title="Healthy Runs" value={summary?.healthyCount} icon={Activity} iconColor="text-indigo-500" />
          <StatCard title="Failed Runs" value={summary?.failedCount} icon={AlertCircle} iconColor="text-rose-500" />
        </div>
      </section>

      {/* Catalog List */}
      <section className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, URN, or description..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setFavouritesOnly((v) => !v)}
              aria-pressed={favouritesOnly}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium border transition-all shadow-sm ${
                favouritesOnly
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white border-slate-300 text-slate-700 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <Star className={`w-4 h-4 ${favouritesOnly ? "text-white fill-white" : "text-amber-500"}`} />
              Favourites
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                favouritesOnly ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {favouriteCount}
              </span>
            </button>
            <select 
              className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="">All Domains</option>
              {summary?.domains?.map(d => (
                <option key={d.domain} value={d.domain}>{d.domain} ({d.count})</option>
              ))}
            </select>
            <select 
              className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3.5 font-medium w-12"><span className="sr-only">Favourite</span></th>
                <th className="px-6 py-3.5 font-medium">Data Product</th>
                <th className="px-6 py-3.5 font-medium">Domain</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium">Latest Run</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {favouritesOnly ? (
                      <>
                        <Star className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        {isAuthenticated ? (
                          <>
                            <p className="font-medium text-slate-900 mb-1">No favourites yet</p>
                            <p className="text-sm">Click the star on any product to pin it here for quick access.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-900 mb-1">Sign in to use favourites</p>
                            <p className="text-sm mb-4">Your favourites are saved to your account and follow you across devices.</p>
                            <button
                              onClick={login}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Log in
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Database className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="font-medium text-slate-900 mb-1">No products found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                visibleProducts.map(product => {
                  const faved = favourites.has(String(product.id));
                  return (
                  <tr
                    key={product.id}
                    className={`transition-colors group ${
                      faved
                        ? "bg-amber-50/40 hover:bg-amber-50/70 shadow-[inset_2px_0_0_0_#fcd34d]"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleFavourite(String(product.id))}
                        title={faved ? "Remove from favourites" : "Add to favourites"}
                        aria-label={faved ? "Remove from favourites" : "Add to favourites"}
                        aria-pressed={faved}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-md border border-transparent transition-all ${
                          faved
                            ? "text-amber-500"
                            : "text-slate-300 hover:text-amber-500 hover:bg-amber-50 hover:border-amber-200"
                        }`}
                      >
                        <Star className={`w-[18px] h-[18px] ${faved ? "fill-amber-500" : ""}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/products/${product.id}`} className="block">
                        <div className="font-medium text-indigo-700 group-hover:text-indigo-800 transition-colors mb-0.5 flex items-center gap-2">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-sm">
                          {product.description || product.urn}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {product.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.latestRun ? (
                        <div className="flex items-center gap-2">
                          {product.latestRun.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {product.latestRun.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                          {product.latestRun.status === 'running' && <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />}
                          <span className="text-slate-600">{formatDateTime(product.latestRun.startedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No runs yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/products/${product.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconColor = "text-indigo-600" }: { title: string, value?: number, icon: any, iconColor?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value ?? "-"}</div>
        <div className="text-sm font-medium text-slate-500 mt-0.5">{title}</div>
      </div>
    </div>
  );
}
