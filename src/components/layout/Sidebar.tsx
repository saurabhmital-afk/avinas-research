import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Star, FolderOpen, Tag, BarChart2,
  GitCompare, Clock, Settings, ChevronLeft, ChevronRight,
  FlaskConical, Search,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/research', label: 'Research', icon: Search },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/collections', label: 'Collections', icon: FolderOpen },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/recent', label: 'Recently Viewed', icon: Clock },
  { to: '/screener', label: 'Screener', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, compareList } = useStore();

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 z-30 flex-shrink-0',
        sidebarOpen ? 'w-52' : 'w-14'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center gap-2 px-3 h-14 border-b border-slate-200 dark:border-slate-800 flex-shrink-0', !sidebarOpen && 'justify-center')}>
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={15} className="text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-slate-900 dark:text-white text-sm whitespace-nowrap">
            Avina's Research
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 px-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors relative',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
                !sidebarOpen && 'justify-center px-0'
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={17} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
            {label === 'Compare' && compareList.length > 0 && (
              <span className={clsx(
                'ml-auto flex-shrink-0 bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium',
                !sidebarOpen && 'absolute -top-0.5 -right-0.5'
              )}>
                {compareList.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
