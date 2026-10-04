import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Shield, Calendar, Server, Lock, UserCheck } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function WhoisInformation({ data, title = "WHOIS & Registry Record" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="cyber-card p-6 border border-slate-200">
      {/* Header with expand toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">ICANN RDAP / WHOIS registry registration telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge status={data.statusType || 'AVAILABLE DATA'} size="xs" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono border border-slate-300 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Record'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary Row (Always visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Registrar</span>
          <p className="text-sm font-semibold font-mono text-slate-900 truncate" title={data.registrar}>
            {data.registrar || 'Unavailable'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Creation Date</span>
          <p className="text-sm font-mono text-slate-800">
            {formatDate(data.createdDate)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Expiry Date</span>
          <p className="text-sm font-mono text-slate-800">
            {formatDate(data.expiryDate)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-500 block mb-1">Privacy Protection</span>
          <p className="text-sm font-semibold font-mono text-teal-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>GDPR Redacted</span>
          </p>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Flags */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500 block mb-2 font-medium">Registry Domain Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {data.status && Array.isArray(data.status) ? (
                  data.status.map((st, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {typeof st === 'string' ? st : (st?.status || JSON.stringify(st))}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-slate-600">clientTransferProhibited</span>
                )}
              </div>
            </div>

            {/* Registrant / Privacy details */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500 block mb-2 font-medium">Registrant Information:</span>
              <div className="text-xs font-mono text-slate-700 space-y-1">
                <p>Organization: <span className="text-slate-900 font-medium">{data.registrant?.organization || 'REDACTED FOR PRIVACY'}</span></p>
                <p>Country: <span className="text-slate-900 font-medium">{data.registrant?.country || 'REDACTED'}</span></p>
                <p>Abuse Contact: <span className="text-blue-600 font-medium">{data.registrant?.email || 'Contact registrar abuse desk'}</span></p>
              </div>
            </div>
          </div>

          {/* Nameservers */}
          {data.nameservers && data.nameservers.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500 block mb-1.5 font-medium">Authoritative Nameservers:</span>
              <div className="flex flex-wrap gap-2">
                {data.nameservers.map((ns, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white text-xs font-mono text-slate-700 border border-slate-300">
                    {typeof ns === 'string' ? ns : (ns?.host || ns?.ldhName || JSON.stringify(ns))}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] font-mono text-slate-500 italic">
            * Source: {data.rawSource || 'ICANN RDAP Protocol (RFC 7482)'}. Personal identifying records are protected in compliance with ICANN Temporary Specification & GDPR.
          </p>
        </div>
      )}
    </div>
  );
}
