import React from 'react';
import { AlertOctagon, RefreshCw, ArrowLeft, ShieldAlert, WifiOff, Clock, ShieldX } from 'lucide-react';

export default function ErrorState({
  title = 'Scan Failed',
  message = 'Unable to complete the scan. Please verify the target and try again.',
  errorType = 'generic',
  onRetry = null,
  onReset = null
}) {
  let Icon = AlertOctagon;
  let iconColor = 'text-red-primary';

  if (errorType.includes('timeout')) {
    Icon = Clock;
    iconColor = 'text-amber-400';
  } else if (errorType.includes('network') || errorType.includes('offline')) {
    Icon = WifiOff;
    iconColor = 'text-red-primary';
  } else if (errorType.includes('ssrf') || errorType.includes('policy')) {
    Icon = ShieldX;
    iconColor = 'text-red-primary';
  } else if (errorType.includes('limit')) {
    Icon = ShieldAlert;
    iconColor = 'text-amber-400';
  }

  return (
    <div className="cyber-card p-8 border border-red-200 max-w-xl mx-auto text-center shadow-xl relative overflow-hidden">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>

      <h3 className="text-xl font-bold font-mono text-slate-900 tracking-wide">
        {title}
      </h3>

      <div className="bg-red-50 rounded-lg p-4 my-4 border border-red-200 text-left">
        <p className="text-xs font-mono text-red-800 leading-relaxed">
          {message}
        </p>
      </div>

      <p className="text-xs text-slate-500 mb-6 font-mono">
        Please ensure the target hostname or IP address is publicly accessible and entered correctly.
      </p>

      <div className="flex items-center justify-center gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold font-mono bg-red-primary hover:bg-red-hover text-white shadow-lg shadow-red-primary/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        )}
      </div>
    </div>
  );
}
