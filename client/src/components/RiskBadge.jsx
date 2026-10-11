import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, Database, HelpCircle } from 'lucide-react';

export default function RiskBadge({ status, size = 'sm', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Database;

  if (['SAFE', 'CLEAN', 'VALID', 'NOT DETECTED', 'HEALTHY'].includes(normalized)) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    Icon = ShieldCheck;
  } else if (['LOW RISK', 'LOW', 'ELEVATED', '0 REPORTS'].includes(normalized)) {
    badgeColor = 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
    Icon = ShieldAlert;
  } else if (['MEDIUM RISK', 'WARNING', 'SUSPICIOUS'].includes(normalized)) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    Icon = AlertTriangle;
  } else if (['HIGH RISK', 'CRITICAL', 'BLACKLISTED', 'THREAT DETECTED', 'EXPIRED', 'KNOWN THREAT VECTOR', 'ASSOCIATED', 'WALLET DRAINER'].includes(normalized)) {
    badgeColor = 'bg-red-50 text-red-700 border-red-200 font-bold';
    Icon = ShieldX;
  } else if (normalized === 'AVAILABLE DATA') {
    badgeColor = 'bg-teal-50 text-teal-700 border-teal-200 font-medium';
    Icon = Database;
  } else if (normalized === 'NOT AVAILABLE' || normalized === 'UNAVAILABLE') {
    badgeColor = 'bg-slate-100 text-slate-500 border-slate-200';
    Icon = HelpCircle;
  } else if (normalized === 'NOT CHECKED') {
    badgeColor = 'bg-slate-50 text-slate-400 border-slate-200';
    Icon = HelpCircle;
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold gap-2' 
    : size === 'xs'
    ? 'px-2 py-0.5 text-[11px] font-medium gap-1'
    : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border tracking-wide uppercase font-sans font-semibold ${badgeColor} ${sizeClasses} ${className}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{status}</span>
    </span>
  );
}
