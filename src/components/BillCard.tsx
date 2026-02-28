import type { Bill } from '../types';
import { useStore } from '../hooks/useStore';

const STATUS_STYLES: Record<string, string> = {
  'Introduced': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'In Committee': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Passed House': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Passed Senate': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Passed Both': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Signed into Law': 'bg-green-500/20 text-green-300 border-green-500/40',
  'Vetoed': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Failed': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const IMPACT_STYLES: Record<string, string> = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30 impact-critical',
  High: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Medium: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  Low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const CATEGORY_DOT: Record<string, string> = {
  Telecom: 'bg-sky-400',
  Energy: 'bg-amber-400',
  Water: 'bg-cyan-400',
  Transportation: 'bg-violet-400',
  Infrastructure: 'bg-emerald-400',
};

interface Props {
  bill: Bill;
  index: number;
}

export function BillCard({ bill, index }: Props) {
  const setSelectedBill = useStore((s) => s.setSelectedBill);

  const delay = Math.min(index * 30, 300);

  return (
    <button
      onClick={() => setSelectedBill(bill)}
      className="bill-card w-full text-left bg-slate-900/40 border border-slate-800/50 rounded-xl
                 px-5 py-4 hover:border-slate-700/60 cursor-pointer group animate-slide-up"
      style={{ opacity: 0, animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-4">
        {/* Left: category dot + bill number */}
        <div className="flex-shrink-0 pt-0.5">
          <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[bill.category] || 'bg-slate-500'}`} />
        </div>

        {/* Center: main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs text-slate-500">{bill.billNumber}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono ${STATUS_STYLES[bill.status] || ''}`}>
              {bill.status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono ${IMPACT_STYLES[bill.impactLevel] || ''}`}>
              {bill.impactLevel}
            </span>
          </div>

          <h3 className="font-body font-semibold text-slate-100 text-sm leading-snug mb-1.5 group-hover:text-amber-200/90 transition-colors line-clamp-2">
            {bill.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-2 font-body leading-relaxed">
            {bill.summary}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {bill.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-slate-800/60 text-[10px] font-mono text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: metadata column */}
        <div className="flex-shrink-0 text-right hidden sm:block">
          <div className="font-mono text-xs text-slate-500 mb-1">
            {bill.chamber}
          </div>
          <div className="font-mono text-[10px] text-slate-600">
            {formatDate(bill.lastActionDate)}
          </div>
          {bill.cosponsors > 0 && (
            <div className="font-mono text-[10px] text-slate-600 mt-1">
              {bill.cosponsors} cosponsor{bill.cosponsors !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
