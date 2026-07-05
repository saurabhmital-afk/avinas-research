import { Link } from 'react-router-dom';
import { Star, GitCompare, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import type { Company } from '../../data/types';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

interface Props {
  company: Company;
  showActions?: boolean;
}

function formatRevenue(m?: number): string {
  if (!m) return '—';
  if (m >= 1000000) return `$${(m / 1000000).toFixed(1)}T`;
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m}M`;
}

export default function CompanyCard({ company: c, showActions = true }: Props) {
  const { isFavorite, addFavorite, removeFavorite, isInCompare, addToCompare, removeFromCompare, compareList, addToCollection, removeFromCollection, isInCollection } = useStore();
  const fav = isFavorite(c.id);
  const inCompare = isInCompare(c.id);
  const saved = isInCollection('default', c.id);

  function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    fav ? removeFavorite(c.id) : addFavorite(c.id);
  }

  function toggleCompare(e: React.MouseEvent) {
    e.preventDefault();
    if (inCompare) removeFromCompare(c.id);
    else if (compareList.length < 4) addToCompare(c.id);
  }

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (saved) removeFromCollection('default', c.id);
    else addToCollection('default', c.id);
  }

  return (
    <Link
      to={`/company/${c.id}`}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', c.logoColor)}>
            {c.logoInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</span>
              {c.ticker && <span className="text-xs text-slate-400 font-mono">{c.ticker}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={clsx(
                'text-xs px-1.5 py-0.5 rounded font-medium',
                c.type === 'public'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>
                {c.type}
              </span>
              <span className="text-xs text-slate-400 truncate">{c.industry}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={toggleFav} title={fav ? 'Remove from favorites' : 'Add to favorites'}
              className={clsx('w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                fav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20')}>
              <Star size={14} fill={fav ? 'currentColor' : 'none'} />
            </button>
            <button onClick={toggleSave} title={saved ? 'Remove from saved' : 'Save company'}
              className={clsx('w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                saved ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20')}>
              {saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
            </button>
            <button onClick={toggleCompare} title={inCompare ? 'Remove from compare' : 'Add to compare'}
              className={clsx('w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                inCompare ? 'text-purple-600' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
                !inCompare && compareList.length >= 4 && 'opacity-40 cursor-not-allowed')}>
              <GitCompare size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{c.shortDescription}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Revenue</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatRevenue(c.financials.revenue || c.financials.aum)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Employees</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {c.employees >= 1000 ? `${(c.employees / 1000).toFixed(0)}K` : c.employees}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-0.5">HQ</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.headquarters.split(',')[1]?.trim() || c.headquarters}</div>
        </div>
      </div>
    </Link>
  );
}
