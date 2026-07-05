import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getCompanyById } from '../data/companies';
import CompanyCard from '../components/company/CompanyCard';

export default function Favorites() {
  const { favorites } = useStore();
  const companies = favorites.map(id => getCompanyById(id)).filter(Boolean);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6">
        <Star size={40} className="mb-3 opacity-40" />
        <p className="font-medium text-lg">No favorites yet</p>
        <p className="text-sm mt-1">Star companies from search results or profile pages.</p>
        <Link to="/" className="mt-4 text-brand-600 text-sm hover:underline">Browse companies →</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Favorites</h1>
        <span className="text-sm text-slate-400">{favorites.length} companies</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map(c => c && <CompanyCard key={c.id} company={c} />)}
      </div>
    </div>
  );
}
