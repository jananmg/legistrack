import { useState, useMemo } from 'react';
import { useStore, getFilteredBills } from '../hooks/useStore';
import type { BillStatus, Chamber, ImpactLevel, Filters } from '../types';

const STATUSES: BillStatus[] = ['Introduced', 'In Committee', 'Passed House', 'Passed Senate', 'Passed Both', 'Signed into Law'];
const CHAMBERS: Chamber[] = ['House', 'Senate'];
const IMPACTS: ImpactLevel[] = ['Critical', 'High', 'Medium', 'Low'];
const SORT_OPTIONS: { value: Filters['sortBy']; label: string }[] = [
  { value: 'lastAction', label: 'Last Action' },
  { value: 'introduced', label: 'Date Introduced' },
  { value: 'impact', label: 'Impact Level' },
  { value: 'title', label: 'Title A–Z' },
];
const IMPACT_COLORS: Record<string, string> = {
  Critical: 'border-red-500/50 text-red-400', High: 'border-amber-500/50 text-amber-400',
  Medium: 'border-sky-500/50 text-sky-400', Low: 'border-slate-500/50 text-slate-400',
};

export function FilterBar() {
  const [expanded, setExpanded] = useState(false);
  const bills = useStore((s) => s.bills);
  const filters = useStore((s) => s.filters);
  const setSearch = useStore((s) => s.setSearch);
  const toggleStatus = useStore((s) => s.toggleStatus);
  const toggleChamber = useStore((s) => s.toggleChamber);
  const toggleImpact = useStore((s) => s.toggleImpact);
  const setSortBy = useStore((s) => s.setSortBy);
  const toggleSortDir = useStore((s) => s.toggleSortDir);
  const resetFilters = useStore((s) => s.resetFilters);

  const count = useMemo(() => getFilteredBills(bills, filters).length, [bills, filters]);

  const hasFilters = filters.search || filters.categories.length || filters.sectors.length ||
    filters.statuses.length || filters.chambers.length || filters.impactLevels.length;

  return (
    <div className="py-4 border-b border-slate-800/40 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bills, tags, sponsors…"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5
                       text-sm font-body text-slate-200 placeholder-slate-500
                       focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
        </div>
        <select
          value={filters.sortBy}
          onChange={(e) => setSortBy(e.target.value as Filters['sortBy'])}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-amber-500/50"
        >
          {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <button onClick={toggleSortDir} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-400 hover:text-slate-200 transition-colors" title={filters.sortDir === 'desc' ? 'Newest first' : 'Oldest first'}>
          {filters.sortDir === 'desc' ? '↓' : '↑'}
        </button>
        <button onClick={() => setExpanded(!expanded)} className={`px-3 py-2.5 rounded-lg border text-sm font-mono transition-all ${expanded ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}>
          Filters {hasFilters ? `(${count})` : ''}
        </button>
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors underline">Clear all</button>
        )}
      </div>
      {expanded && (
        <div className="mt-4 space-y-3 animate-slide-up">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-3">Status</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => toggleStatus(s)} className={`filter-chip px-2.5 py-1 rounded-full border text-xs font-mono transition-all ${filters.statuses.includes(s) ? 'active' : 'border-slate-700/50 text-slate-400'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-3">Chamber</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {CHAMBERS.map((c) => (
                <button key={c} onClick={() => toggleChamber(c)} className={`filter-chip px-2.5 py-1 rounded-full border text-xs font-mono transition-all ${filters.chambers.includes(c) ? 'active' : 'border-slate-700/50 text-slate-400'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-3">Impact</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {IMPACTS.map((imp) => (
                <button key={imp} onClick={() => toggleImpact(imp)} className={`filter-chip px-2.5 py-1 rounded-full border text-xs font-mono transition-all ${filters.impactLevels.includes(imp) ? `active ${IMPACT_COLORS[imp]}` : 'border-slate-700/50 text-slate-400'}`}>{imp}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 font-mono text-xs text-slate-500">
        Showing <span className="text-slate-300">{count}</span> bill{count !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
