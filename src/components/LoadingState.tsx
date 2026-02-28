export function LoadingState() {
  return (
    <div className="py-12 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/30 border border-slate-800/30 rounded-xl px-5 py-4 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-slate-800 rounded" />
                <div className="h-4 w-20 bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
              <div className="h-3 w-full bg-slate-800/40 rounded" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-center text-xs font-mono text-slate-600 pt-4">
        Fetching legislation data…
      </p>
    </div>
  );
}
