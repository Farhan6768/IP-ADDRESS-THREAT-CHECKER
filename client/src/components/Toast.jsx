import React from 'react';
import { useToast } from '../hooks/useToast';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-panel';
        let bgClass = 'bg-navy';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (toast.type === 'success') {
          borderClass = 'border-teal-safe';
          Icon = CheckCircle2;
          iconColor = 'text-teal-safe';
        } else if (toast.type === 'error' || toast.type === 'critical') {
          borderClass = 'border-red-primary';
          Icon = AlertOctagon;
          iconColor = 'text-red-primary';
        } else if (toast.type === 'warning') {
          borderClass = 'border-blue-panel';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg cyber-card shadow-2xl border ${borderClass} transition-all duration-300 translate-y-0`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm text-slate-200">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-100 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
