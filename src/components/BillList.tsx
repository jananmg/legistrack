import { useMemo } from 'react';
import { useStore, getFilteredBills } from '../hooks/useStore';
import { BillCard } from './BillCard';

export function BillList() {
  const bills = useStore((s) => s.bills);
  const filters = useStore((s) => s.filters);
  const filtered = useMemo(() => getFilteredBills(bills, filters), [bills, filters]);

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl text-slate-500">No bills match your filters</p>
        <p className="text-sm text-slate-600 mt-2 font-body">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="py-6 grid gap-3">
      {filtered.map((bill, i) => (
        <BillCard key={bill.id} bill={bill} index={i} />
      ))}
    </div>
  );
}
