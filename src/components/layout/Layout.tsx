import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CompareBar from '../company/CompareBar';
import { useStore } from '../../store/useStore';

export default function Layout() {
  const { compareList } = useStore();

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {compareList.length > 0 && <CompareBar />}
      </div>
    </div>
  );
}
