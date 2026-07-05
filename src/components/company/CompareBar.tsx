import { useNavigate } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getCompanyById } from '../../data/companies';
import clsx from 'clsx';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useStore();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg z-40 px-4 py-2.5 flex items-center gap-3">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">Compare:</span>
      <div className="flex items-center gap-2 flex-1">
        {compareList.map(id => {
          const c = getCompanyById(id);
          if (!c) return null;
          return (
            <div key={id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
              <div className={clsx('w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold', c.logoColor)}>
                {c.logoInitials[0]}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{c.name}</span>
              <button onClick={() => removeFromCompare(id)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={12} />
              </button>
            </div>
          );
        })}
        {compareList.length < 4 && (
          <div className="text-xs text-slate-400 px-2">
            Add up to {4 - compareList.length} more
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={clearCompare} className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          Clear
        </button>
        <button
          onClick={() => navigate('/compare')}
          disabled={compareList.length < 2}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <GitCompare size={13} />
          Compare {compareList.length} companies
        </button>
      </div>
    </div>
  );
}
