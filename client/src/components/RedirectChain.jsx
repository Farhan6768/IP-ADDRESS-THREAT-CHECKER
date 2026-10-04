import React from 'react';
import { GitCommit, ArrowDown, ExternalLink, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function RedirectChain({ data, title = "Redirect Analysis" }) {
  if (!data) return null;

  const chain = Array.isArray(data.redirectChain) ? data.redirectChain : [];
  const redirectCount = data.redirectCount !== undefined ? data.redirectCount : Math.max(0, chain.length - 1);
  const hasSuspicious = chain.some(h => h.isSuspicious);

  return (
    <div className="cyber-card p-6 border border-slate-200">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">
              HTTP 3xx traversal chain ({redirectCount} redirect{redirectCount === 1 ? '' : 's'})
            </p>
          </div>
        </div>

        <RiskBadge 
          status={hasSuspicious ? 'THREAT DETECTED' : (data.status || 'AVAILABLE DATA')} 
          size="xs" 
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Original Requested URL</span>
          <div className="text-xs font-mono text-slate-800 truncate" title={data.originalUrl}>
            {data.originalUrl || 'N/A'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Redirect Hop Count</span>
          <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <span>{redirectCount} Hop{redirectCount === 1 ? '' : 's'}</span>
            {redirectCount > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Multi-Hop
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Final Resolved Destination</span>
          <div className="text-xs font-mono text-teal-700 font-semibold truncate" title={data.finalUrl}>
            {data.finalUrl || data.originalUrl || 'N/A'}
          </div>
        </div>
      </div>

      {/* Visual Chain Flowchart */}
      <div className="space-y-3 relative">
        {chain.map((hop, idx) => {
          const isLast = idx === chain.length - 1;
          const isSuspicious = hop.isSuspicious;

          // Theme color: Highlight suspicious redirects with #BF092F
          const borderClass = isSuspicious
            ? 'border-red-300 bg-red-50/70 shadow-sm'
            : isLast
            ? 'border-teal-300 bg-teal-50/50 shadow-sm'
            : 'border-slate-200 bg-slate-50';

          return (
            <React.Fragment key={idx}>
              <div className={`p-3.5 rounded-lg border transition-all ${borderClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                      isSuspicious
                        ? 'bg-red-primary text-white'
                        : isLast
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {hop.step || idx + 1}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                      hop.statusCode >= 300 && hop.statusCode < 400
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : hop.statusCode >= 200 && hop.statusCode < 300
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {hop.statusCode || 200} {hop.statusText || 'OK'}
                    </span>
                  </div>

                  {isSuspicious && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-primary text-white">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      SUSPICIOUS REDIRECT
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono text-slate-800 break-all pl-9">
                  {hop.url}
                </div>

                {isSuspicious && hop.suspiciousReason && (
                  <div className="mt-2 text-[11px] font-mono text-red-700 pl-9 flex items-center gap-1.5 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-red-primary" />
                    <span>Risk: {hop.suspiciousReason}</span>
                  </div>
                )}
              </div>

              {!isLast && (
                <div className="flex justify-center my-1">
                  <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
