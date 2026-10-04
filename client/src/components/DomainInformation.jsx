import React from 'react';
import { Globe, Calendar, Clock, Server, ShieldCheck, Tag } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function DomainInformation({ data, title = "Domain Intelligence" }) {
  if (!data) return null;

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">Registry lifecycle, age and DNS delegation</p>
          </div>
        </div>

        <RiskBadge status={data.status === 'NOT AVAILABLE' ? 'NOT AVAILABLE' : 'AVAILABLE DATA'} size="xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {/* Domain Name */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-medium mb-1">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>DOMAIN</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 truncate">
            {data.domain || 'N/A'}
          </div>
        </div>

        {/* Registrar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-safe" />
            <span>REGISTRAR</span>
          </div>
          <div className="text-sm font-semibold font-mono text-slate-900 truncate" title={data.registrar}>
            {data.registrar || 'Unavailable'}
          </div>
        </div>

        {/* Registration Date */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>REGISTERED ON</span>
          </div>
          <div className="text-sm font-semibold font-mono text-slate-900">
            {formatDate(data.registrationDate)}
          </div>
        </div>

        {/* Domain Age */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-teal-safe" />
            <span>DOMAIN AGE</span>
          </div>
          <div className="text-sm font-bold font-mono text-teal-safe truncate">
            {data.domainAge || 'Established'}
          </div>
        </div>
      </div>

      {/* Nameservers List */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="text-xs font-mono text-slate-500 font-semibold mb-2.5 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-blue-600" />
          <span>DELEGATED NAMESERVERS (NS)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.nameservers && data.nameservers.length > 0 ? (
            data.nameservers.map((ns, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-800 shadow-xs"
              >
                {typeof ns === 'string' ? ns : (ns?.host || ns?.ldhName || JSON.stringify(ns))}
              </span>
            ))
          ) : (
            <span className="text-xs font-mono text-slate-400">No delegated nameservers found</span>
          )}
        </div>
      </div>
    </div>
  );
}
