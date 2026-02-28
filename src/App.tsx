import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { BillList } from './components/BillList';
import { BillDetail } from './components/BillDetail';
import { LoadingState } from './components/LoadingState';

const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL_MINUTES || 30) * 60 * 1000;

export default function App() {
  const { loadBills, loading, detailOpen } = useStore();

  useEffect(() => {
    loadBills();

    // Auto-refresh on interval
    const interval = setInterval(loadBills, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadBills]);

  return (
    <div className="noise-bg min-h-screen relative">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Header />
        <StatsBar />
        <FilterBar />
        {loading ? <LoadingState /> : <BillList />}
      </div>

      {/* Detail slide-over panel */}
      {detailOpen && <BillDetail />}
    </div>
  );
}
