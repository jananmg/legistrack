import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';

const STATUS_COLORS: Record<string, string> = {
  'Introduced': 'bg-blue-500/20 text-blue-300',
  'In Committee': 'bg-amber-500/20 text-amber-300',
  'Passed House': 'bg-emerald-500/20 text-emerald-300',
  'Passed Senate': 'bg-emerald-500/20 text-emerald-300',
  'Passed Both': 'bg-green-500/20 text-green-300',
  'Signed into Law': 'bg-green-500/25 text-green-200',
  'Vetoed': 'bg-red-500/20 text-red-300',
  'Failed': 'bg-slate-500/20 text-slate-400',
};

const IMPACT_COLORS: Record<string, string> = {
  Critical: 'text-red-400',
  High: 'text-amber-400',
  Medium: 'text-sky-400',
  Low: 'text-slate-400',
};

export function BillDetail() {
  const { selectedBill: bill, setDetailOpen } = useStore();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setDetailOpen]);

  if (!bill) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setDetailOpen(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-slate-925 border-l border-slate-800/60 z-50 overflow-y-auto slide-panel">
        {/* Close button */}
        <button
          onClick={() => setDetailOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center
                     text-slate-400 hover:text-slate-200 transition-colors z-10"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-mono text-xs text-slate-500">{bill.billNumber}</span>
              <span className="text-slate-700">·</span>
              <span className="font-mono text-xs text-slate-500">{bill.chamber}</span>
              <span className="text-slate-700">·</span>
              <span className="font-mono text-xs text-slate-500">{bill.congress} Congress</span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl text-slate-100 leading-tight mb-3">
              {bill.title}
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-mono ${STATUS_COLORS[bill.status] || ''}`}>
                {bill.status}
              </span>
              <span className={`text-xs font-mono ${IMPACT_COLORS[bill.impactLevel] || ''}`}>
                {bill.impactLevel} Impact
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-800/60 my-6" />

          {/* Summary */}
          <section className="mb-6">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Summary</h3>
            <p className="text-sm text-slate-300 font-body leading-relaxed">{bill.summary}</p>
          </section>

          {/* Last Action */}
          <section className="mb-6">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Last Action</h3>
            <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40">
              <p className="text-sm text-slate-300 font-body">{bill.lastAction}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">{formatDate(bill.lastActionDate)}</p>
            </div>
          </section>

          {/* Sponsors */}
          {bill.sponsors.length > 0 && (
            <section className="mb-6">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Sponsors ({bill.sponsors.length})
                {bill.cosponsors > 0 && <span className="text-slate-600"> + {bill.cosponsors} cosponsors</span>}
              </h3>
              <div className="space-y-1">
                {bill.sponsors.map((s, i) => (
                  <div key={i} className="text-sm text-slate-300 font-body">{s}</div>
                ))}
              </div>
            </section>
          )}

          {/* Committees */}
          {bill.committees.length > 0 && (
            <section className="mb-6">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Committees</h3>
              <div className="space-y-1">
                {bill.committees.map((c, i) => (
                  <div key={i} className="text-sm text-slate-300 font-body">{c}</div>
                ))}
              </div>
            </section>
          )}

          {/* Sectors */}
          <section className="mb-6">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Sectors</h3>
            <div className="flex flex-wrap gap-1.5">
              {bill.sectors.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-xs font-mono text-slate-400">
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section className="mb-6">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {bill.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400/80">
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* Dates */}
          <section className="mb-8">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Timeline</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40">
                <p className="text-[10px] font-mono text-slate-600 uppercase">Introduced</p>
                <p className="text-sm text-slate-300 font-mono mt-0.5">{formatDate(bill.introduced)}</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40">
                <p className="text-[10px] font-mono text-slate-600 uppercase">Last Action</p>
                <p className="text-sm text-slate-300 font-mono mt-0.5">{formatDate(bill.lastActionDate)}</p>
              </div>
            </div>
          </section>

          {/* Link to source */}
          <a
            href={bill.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                       bg-amber-500/10 border border-amber-500/30 text-amber-400
                       text-sm font-mono hover:bg-amber-500/20 transition-colors"
          >
            View on Congress.gov
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
