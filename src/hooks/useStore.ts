import { create } from 'zustand';
import type { Bill, Filters, Category, Sector, BillStatus, Chamber, ImpactLevel } from '../types';
import { DEFAULT_FILTERS } from '../types';
import { fetchAllBills, type FetchResult } from '../services/dataService';

interface Store {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  sources: string[];
  lastUpdated: string | null;
  selectedBill: Bill | null;
  filters: Filters;
  detailOpen: boolean;
  loadBills: () => Promise<void>;
  setSelectedBill: (bill: Bill | null) => void;
  setSearch: (q: string) => void;
  toggleCategory: (c: Category) => void;
  toggleSector: (s: Sector) => void;
  toggleStatus: (s: BillStatus) => void;
  toggleChamber: (c: Chamber) => void;
  toggleImpact: (i: ImpactLevel) => void;
  setSortBy: (s: Filters['sortBy']) => void;
  toggleSortDir: () => void;
  resetFilters: () => void;
  setDetailOpen: (open: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  bills: [],
  loading: false,
  error: null,
  sources: [],
  lastUpdated: null,
  selectedBill: null,
  filters: { ...DEFAULT_FILTERS },
  detailOpen: false,

  loadBills: async () => {
    set({ loading: true, error: null });
    try {
      const result: FetchResult = await fetchAllBills();
      set({
        bills: result.bills,
        sources: result.sources,
        lastUpdated: result.timestamp,
        error: result.errors.length > 0 ? result.errors.join('; ') : null,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setSelectedBill: (bill) => set({ selectedBill: bill, detailOpen: !!bill }),
  setDetailOpen: (open) => set({ detailOpen: open, selectedBill: open ? get().selectedBill : null }),
  setSearch: (q) => set((s) => ({ filters: { ...s.filters, search: q } })),
  toggleCategory: (c) => set((s) => ({
    filters: {
      ...s.filters,
      categories: s.filters.categories.includes(c)
        ? s.filters.categories.filter((x) => x !== c)
        : [...s.filters.categories, c],
    },
  })),
  toggleSector: (sec) => set((s) => ({
    filters: {
      ...s.filters,
      sectors: s.filters.sectors.includes(sec)
        ? s.filters.sectors.filter((x) => x !== sec)
        : [...s.filters.sectors, sec],
    },
  })),
  toggleStatus: (st) => set((s) => ({
    filters: {
      ...s.filters,
      statuses: s.filters.statuses.includes(st)
        ? s.filters.statuses.filter((x) => x !== st)
        : [...s.filters.statuses, st],
    },
  })),
  toggleChamber: (ch) => set((s) => ({
    filters: {
      ...s.filters,
      chambers: s.filters.chambers.includes(ch)
        ? s.filters.chambers.filter((x) => x !== ch)
        : [...s.filters.chambers, ch],
    },
  })),
  toggleImpact: (i) => set((s) => ({
    filters: {
      ...s.filters,
      impactLevels: s.filters.impactLevels.includes(i)
        ? s.filters.impactLevels.filter((x) => x !== i)
        : [...s.filters.impactLevels, i],
    },
  })),
  setSortBy: (sortBy) => set((s) => ({ filters: { ...s.filters, sortBy } })),
  toggleSortDir: () => set((s) => ({
    filters: { ...s.filters, sortDir: s.filters.sortDir === 'asc' ? 'desc' : 'asc' },
  })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
}));

// Derived data helpers — call these in components with useMemo
const impactOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function getFilteredBills(bills: Bill[], filters: Filters): Bill[] {
  let result = [...bills];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.shortTitle.toLowerCase().includes(q) ||
        b.billNumber.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.categories.length > 0)
    result = result.filter((b) => filters.categories.includes(b.category));
  if (filters.sectors.length > 0)
    result = result.filter((b) => b.sectors.some((s) => filters.sectors.includes(s)));
  if (filters.statuses.length > 0)
    result = result.filter((b) => filters.statuses.includes(b.status));
  if (filters.chambers.length > 0)
    result = result.filter((b) => filters.chambers.includes(b.chamber));
  if (filters.impactLevels.length > 0)
    result = result.filter((b) => filters.impactLevels.includes(b.impactLevel));

  const dir = filters.sortDir === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'lastAction':
        return dir * (new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime());
      case 'introduced':
        return dir * (new Date(b.introduced).getTime() - new Date(a.introduced).getTime());
      case 'impact':
        return dir * (impactOrder[a.impactLevel] - impactOrder[b.impactLevel]);
      case 'title':
        return dir * a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  return result;
}

export function getStats(bills: Bill[]) {
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byImpact: Record<string, number> = {};
  for (const b of bills) {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    byImpact[b.impactLevel] = (byImpact[b.impactLevel] || 0) + 1;
  }
  return { total: bills.length, byCategory, byStatus, byImpact };
}
