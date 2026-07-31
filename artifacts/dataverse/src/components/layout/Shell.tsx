import React from "react";
import { Link } from "wouter";
import { Database, Search, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

function UserMenu() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={login}
        className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <LogIn className="w-4 h-4" />
        Log in
      </button>
    );
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
        />
      ) : (
        <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center text-sm font-medium text-indigo-700">
          {initials}
        </div>
      )}
      <div className="hidden sm:block text-sm font-medium text-slate-700 max-w-[140px] truncate">
        {user.firstName || user.email || "Account"}
      </div>
      <button
        onClick={logout}
        title="Log out"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">DataVerse</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Catalog
              </Link>
              <a 
                href="#" 
                className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors cursor-not-allowed"
              >
                Lineage
              </a>
              <a 
                href="#" 
                className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors cursor-not-allowed"
              >
                Governance
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search resources..."
                className="w-64 h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
