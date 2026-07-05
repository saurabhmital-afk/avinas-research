import { Link } from 'react-router-dom';
import { X, GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getCompanyById } from '../data/companies';
import { COMPANIES } from '../data/companies';
import clsx from 'clsx';

function fmt(n?: number) {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}T`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n}M`;
}

function pct(n?: number) {
  if (n === undefined || n === null) return '—';
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

const ROWS: { label: string; key: string; format?: (c: ReturnType<typeof getCompanyById>) => string }[] = [
  { label: 'Type', key: 'type', format: c => c?.type === 'public' ? 'Public' : 'Private' },
  { label: 'Industry', key: 'industry', format: c => c?.industry ?? '—' },
  { label: 'Founded', key: 'founded', format: c => String(c?.founded ?? '—') },
  { label: 'Employees', key: 'employees', format: c => c?.employees ? c.employees >= 1000 ? `${(c.employees / 1000).toFixed(0)}K` : String(c.employees) : '—' },
  { label: 'HQ', key: 'headquarters', format: c => c?.headquarters ?? '—' },
  { label: 'Revenue', key: 'financials.revenue', format: c => fmt(c?.financials.revenue || c?.financials.aum) },
  { label: 'Revenue Growth', key: 'financials.revenueGrowth', format: c => pct(c?.financials.revenueGrowth) },
  { label: 'Net Income', key: 'financials.netIncome', format: c => fmt(c?.financials.netIncome) },
  { label: 'Gross Margin', key: 'financials.grossMargin', format: c => pct(c?.financials.grossMargin) },
  { label: 'Market Cap', key: 'financials.marketCap', format: c => fmt(c?.financials.marketCap) },
  { label: 'CEO', key: 'ceo', format: c => c?.ceo ?? '—' },
  { label: 'Business Model', key: 'businessModel', format: c => c?.businessModel ?? '—' },
];

export default function Compare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useStore();
  const companies = compareList.map(id => getCompanyById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCompanyById>>[];

  if (compareList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6">
        <GitCompare size={40} className="mb-3 opacity-40" />
        <p className="font-medium text-lg">No companies to compare</p>
        <p className="text-sm mt-1 text-center">Browse companies and click the Compare button to add up to 4 companies here.</p>
        <Link to="/" className="mt-4 text-brand-600 text-sm hover:underline">Browse companies →</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Compare Companies</h1>
        <button onClick={clearCompare} className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Clear all</button>
      </div>

      {/* Add slot */}
      {compareList.length < 4 && (
        <div className="mb-4">
          <AddCompanySelect current={compareList} onAdd={addToCompare} />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid border-b border-slate-200 dark:border-slate-800" style={{ gridTemplateColumns: `180px repeat(${companies.length}, 1fr)` }}>
          <div className="px-4 py-4 border-r border-slate-100 dark:border-slate-800" />
          {companies.map(c => (
            <div key={c.id} className="px-4 py-4 border-r last:border-r-0 border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/company/${c.id}`} className="font-semibold text-sm text-slate-900 dark:text-white hover:text-brand-600 block">{c.name}</Link>
                  {c.ticker && <span className="text-xs font-mono text-slate-400">{c.ticker}</span>}
                </div>
                <button onClick={() => removeFromCompare(c.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mt-2', c.logoColor)}>
                {c.logoInitials}
              </div>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {ROWS.map((row, i) => (
          <div key={row.key} className={clsx('grid border-b last:border-b-0 border-slate-100 dark:border-slate-800', i % 2 === 1 && 'bg-slate-50/50 dark:bg-slate-800/20')}
            style={{ gridTemplateColumns: `180px repeat(${companies.length}, 1fr)` }}>
            <div className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 flex items-center">
              {row.label}
            </div>
            {companies.map(c => {
              const val = row.format ? row.format(c) : '—';
              const isGrowth = row.key === 'financials.revenueGrowth';
              const num = isGrowth ? c.financials.revenueGrowth : undefined;
              return (
                <div key={c.id} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 border-r last:border-r-0 border-slate-100 dark:border-slate-800 flex items-center gap-1">
                  {isGrowth && num !== undefined && (
                    num > 0 ? <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" /> : <TrendingDown size={12} className="text-red-400 flex-shrink-0" />
                  )}
                  <span className={clsx(
                    isGrowth && num !== undefined && (num > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500 font-medium'),
                    row.key === 'businessModel' && 'text-xs leading-relaxed'
                  )}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddCompanySelect({ current, onAdd }: { current: string[]; onAdd: (id: string) => void }) {
  const available = COMPANIES.filter(c => !current.includes(c.id));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 flex-shrink-0">Add company:</span>
      <select
        onChange={e => { if (e.target.value) onAdd(e.target.value); e.target.value = ''; }}
        defaultValue=""
        className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">Select a company…</option>
        {available.map(c => <option key={c.id} value={c.id}>{c.name} {c.ticker ? `(${c.ticker})` : ''}</option>)}
      </select>
    </div>
  );
}
