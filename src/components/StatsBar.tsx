import { useMemo } from 'react';
import { useStore, getStats } from '../hooks/useStore';

const CATEGORY_COLORS: Record<string, string> = {
  Telecom: 'from-sky-500/20 to-sky-600/5 border-sky-500/30',
  Energy: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  Water: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
  Transportation: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
  Infrastructure: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
};
const CATEGORY_TEXT: Record<string, string> = {
  Telecom: 'text-sky-400', Energy: 'text-amber-400', Water: 'text-cyan-400',
  Transportation: 'text-violet-400', Infrastructure: 'text-emerald-400',
};
const CATEGORY_ICONS: Record<string, string> = {
  Telecom: '📡', Energy: '⚡', Water: '💧', Transportation: '🛤', Infrastructure: '🏗',
};

export function StatsBar() {
  const bills = useStore((s) => s.bills);
  const toggleCategory = useStore((s) => s.toggleCategory);
  const activeCategories = useStore((s) => s.filters.categories);

  const stats = useMemo(() => getStats(bills), [bills]);

  if (stats.total === 0) return null;

  const categories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Tracking</span>
        <span className="font-display text-xl text-slate-100">{stats.total}</span>
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">bills across</span>
        <span className="font-display text-xl text-slate-100">{categories.length}</span>
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">sectors</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map(([cat, count], i) => {
          const isActive = activeCategories.length === 0 || activeCategories.includes(cat as any);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat as any)}
              className={`
                relative overflow-hidden rounded-lg border px-4 py-3 text-left
                bg-gradient-to-br ${CATEGORY_COLORS[cat] || 'from-slate-500/20 to-slate-600/5 border-slate-500/30'}
                transition-all duration-200
                ${isActive ? 'opacity-100' : 'opacity-40'}
                hover:opacity-100
                animate-slide-up
              `}
              style={{ opacity: 0, animationDelay: `${(i + 1) * 50}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{CATEGORY_ICONS[cat] || '📋'}</span>
                <span className={`font-display text-2xl ${CATEGORY_TEXT[cat] || 'text-slate-300'}`}>{count}</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
