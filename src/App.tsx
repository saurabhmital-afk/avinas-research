import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import Favorites from './pages/Favorites';
import Collections from './pages/Collections';
import Tags from './pages/Tags';
import Compare from './pages/Compare';
import RecentlyViewed from './pages/RecentlyViewed';
import Screener from './pages/Screener';
import Settings from './pages/Settings';
import Research from './pages/Research';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/recent" element={<RecentlyViewed />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/research" element={<Research />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
