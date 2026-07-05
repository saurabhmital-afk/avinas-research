import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Sliders, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { COMPANIES } from '../../data/companies';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

const fuse = new Fuse(COMPANIES, {
  keys: ['name', 'ticker', 'industry', 'sector', 'tags', 'shortDescription'],
  threshold: 0.35,
  minMatchCharLength: 2,
});

export default function Header() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof COMPANIES>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, advancedMode, toggleAdvancedMode } = useStore();

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    const r = fuse.search(query).slice(0, 8).map(r => r.item);
    setResults(r);
    setOpen(r.length > 0);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function select(id: string) {
    setOpen(false);
    setQuery('');
    navigate(`/company/${id}`);
  }

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 px-4 flex-shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-xl" ref={dropRef}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search companies, industries, tickers… (⌘K)"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          {query && (
            <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          )}
        </div>

        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {results.map(c => (
              <button
                key={c.id}
                onClick={() => select(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <span className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', c.logoColor)}>
                  {c.logoInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</span>
                    {c.ticker && <span className="text-xs text-slate-400 font-mono">{c.ticker}</span>}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{c.industry}</span>
                </div>
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0',
                  c.type === 'public'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}>
                  {c.type}
                </span>
              </button>
            ))}
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              Press Enter to search all results
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={toggleAdvancedMode}
          title={advancedMode ? 'Switch to Novice mode' : 'Switch to Advanced mode'}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
            advancedMode
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Sliders size={14} />
          {advancedMode ? 'Advanced' : 'Novice'}
        </button>

        <button
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
