import React from 'react';
import { Lock, ShieldCheck, ShieldAlert, Calendar, Key, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function SSLInformation({ data, title = "Security / SSL Certificate" }) {
  if (!data) return null;

  const isValid = data.status === 'VALID' || data.isValid === true;
  const isExpired = data.status === 'EXPIRED';

  // Highlight colors: #3B9797 for valid/safe, #BF092F for expired/invalid
  const statusColorClass = isValid
    ? 'text-teal-safe border-teal-safe/40 bg-teal-safe/10'
    : 'text-red-primary border-red-primary/40 bg-red-primary/10';

  return (
    <div className="cyber-card p-6 border border-slate-200">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${statusColorClass}`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">X.509 cryptographic certificate verification</p>
          </div>
        </div>

        <RiskBadge status={data.status || 'UNAVAILABLE'} size="xs" />
      </div>

      {/* Main SSL Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {/* SSL Status */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-mono text-slate-500 mb-1 flex items-center gap-1.5">
            {isValid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-safe" />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5 text-red-primary" />
            )}
            <span>SSL STATUS</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isValid ? 'bg-teal-safe' : 'bg-red-primary animate-ping'
              }`}
            />
            <span className={isValid ? 'text-teal-700 font-bold' : 'text-red-primary font-bold'}>
              {data.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Certificate Issuer */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-mono text-slate-500 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>CERTIFICATE ISSUER</span>
          </div>
          <div className="text-sm font-medium font-mono text-slate-800 truncate" title={data.certificateIssuer}>
            {data.certificateIssuer || 'Unavailable'}
          </div>
        </div>

        {/* TLS Version */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-mono text-slate-500 mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-teal-safe" />
            <span>TLS VERSION</span>
          </div>
          <div className="text-sm font-mono text-slate-900">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              {data.tlsVersion || 'TLSv1.3'}
            </span>
          </div>
        </div>

        {/* HTTPS Enforced Status */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-mono text-slate-500 mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>HTTPS STATUS</span>
          </div>
          <div className="text-sm font-medium font-mono text-slate-800 truncate">
            {data.httpsStatus || 'ACTIVE'}
          </div>
        </div>
      </div>

      {/* Validity Dates & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500">Valid From:</span>
          <p className="text-xs font-mono text-slate-800 mt-0.5">{formatDate(data.certificateValidFrom)}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500">Valid Until:</span>
          <p className="text-xs font-mono text-slate-800 mt-0.5 flex items-center justify-between">
            <span>{formatDate(data.certificateExpiry)}</span>
            {data.daysRemaining !== null && data.daysRemaining !== undefined && (
              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-semibold ${data.daysRemaining < 30 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                {data.daysRemaining > 0 ? `${data.daysRemaining} days left` : 'Expired'}
              </span>
            )}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-mono text-slate-500">Subject (CN):</span>
          <p className="text-xs font-mono text-slate-800 mt-0.5 truncate" title={data.certificateSubject}>
            {data.certificateSubject || 'Unknown'}
          </p>
        </div>
      </div>

      {/* SANs (Subject Alternative Names) */}
      {data.certificateSan && data.certificateSan.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-2 font-medium">Subject Alternative Names (SANs):</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {data.certificateSan.map((san, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700"
              >
                {typeof san === 'string' ? san : (san?.name || san?.dns || JSON.stringify(san))}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
