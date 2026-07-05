import { useState } from 'react';
import { COMPANIES, INDUSTRIES } from '../data/companies';
import CompanyCard from '../components/company/CompanyCard';
import { useStore } from '../store/useStore';
import { Search, TrendingUp } from 'lucide-react';
import Fuse from 'fuse.js';
import clsx from 'clsx';

const fuse = new Fuse(COMPANIES, {
  keys: ['name', 'ticker', 'industry', 'sector', 'tags', 'shortDescription', 'description'],
  threshold: 0.35,
  minMatchCharLength: 2,
});

const SIZE_OPTIONS = ['All', 'startup', 'smb', 'mid-market', 'large', 'enterprise'];
const TYPE_OPTIONS = ['All', 'public', 'private'];

export default function Dashboard() {
  const { advancedMode } = useStore();
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All');
  const [size, setSize] = useState('All');
  const [type, setType] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const base = query.trim().length >= 2
    ? fuse.search(query).map(r => r.item)
    : COMPANIES;

  const filtered = base.filter(c => {
    if (industry !== 'All' && c.industry !== industry) return false;
    if (size !== 'All' && c.sizeCategory !== size) return false;
    if (type !== 'All' && c.type !== type) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Hero */}
      {!advancedMode && (
        <div className="mb-6 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">Company Research</h1>
          <p className="text-brand-100 text-sm mb-4">
            Explore, save, tag, and compare companies across 10 industries. Start by searching above or browsing below.
          </p>
          <div className="flex gap-3 text-sm">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <span className="font-bold">{COMPANIES.length}</span> companies
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <span className="font-bold">{INDUSTRIES.length}</span> industries
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Inline search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter companies…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Industry */}
        <select
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="All">All Industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        {/* Type */}
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        {advancedMode && (
          <select
            value={size}
            onChange={e => setSize(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sizes' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        )}

        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView('grid')} className={clsx('px-2.5 py-1.5 rounded-lg text-sm transition-colors', view === 'grid' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800')}>Grid</button>
          <button onClick={() => setView('list')} className={clsx('px-2.5 py-1.5 rounded-lg text-sm transition-colors', view === 'list' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800')}>List</button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-slate-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'company' : 'companies'}
          {industry !== 'All' && ` in ${industry}`}
        </span>
      </div>

      {/* Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Search size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No companies match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or industry filter</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => <CompanyCard key={c.id} company={c} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <ListRow key={c.id} company={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListRow({ company: c }: { company: (typeof COMPANIES)[0] }) {
  const { isFavorite, addFavorite, removeFavorite, addToCompare, removeFromCompare, isInCompare } = useStore();
  const fav = isFavorite(c.id);
  const inCompare = isInCompare(c.id);
  return (
    <a href={`/company/${c.id}`} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', c.logoColor)}>
        {c.logoInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
          {c.ticker && <span className="text-xs text-slate-400 font-mono">{c.ticker}</span>}
          <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', c.type === 'public' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{c.type}</span>
        </div>
        <span className="text-xs text-slate-400">{c.industry} · {c.headquarters}</span>
      </div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block min-w-[80px] text-right">
        {c.financials.revenue ? `$${(c.financials.revenue / 1000).toFixed(1)}B` : c.financials.aum ? `$${(c.financials.aum / 1000).toFixed(0)}B AUM` : '—'}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={e => { e.preventDefault(); fav ? removeFavorite(c.id) : addFavorite(c.id); }} className={clsx('w-7 h-7 flex items-center justify-center rounded-lg', fav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500')}>
          <StarIcon size={14} filled={fav} />
        </button>
        <button onClick={e => { e.preventDefault(); inCompare ? removeFromCompare(c.id) : addToCompare(c.id); }} className={clsx('w-7 h-7 flex items-center justify-center rounded-lg', inCompare ? 'text-purple-500' : 'text-slate-300 hover:text-purple-500')}>
          <GitCompareIcon size={14} />
        </button>
      </div>
    </a>
  );
}

function StarIcon({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function GitCompareIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" />
      <polyline points="15 9 18 6 21 9" /><polyline points="9 15 6 18 3 15" />
    </svg>
  );
}
