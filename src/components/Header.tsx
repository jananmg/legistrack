import { useStore } from '../hooks/useStore';

export function Header() {
  const { lastUpdated, sources, error } = useStore();

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : null;

  return (
    <header className="pt-8 pb-6 border-b border-slate-800/60">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Logo / Title */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/80 to-amber-700/60 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-950">
                <path d="M3 2h10v2H3zm1 3h8v2H4zm2 3h4v2H6zm1 3h2v2H7z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-slate-100 tracking-tight">
              GridWatch
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-body max-w-lg">
            Monitoring U.S. infrastructure, utilities & telecom legislation
          </p>
        </div>

        {/* Status */}
        <div className="text-right text-xs font-mono text-slate-500 space-y-1">
          {formattedTime && (
            <p>
              Updated <span className="text-slate-400">{formattedTime}</span>
            </p>
          )}
          {sources.length > 0 && (
            <p>
              Sources: <span className="text-slate-400">{sources.join(' · ')}</span>
            </p>
          )}
          {error && (
            <p className="text-amber-500/80 max-w-xs truncate" title={error}>
              ⚠ {error}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
