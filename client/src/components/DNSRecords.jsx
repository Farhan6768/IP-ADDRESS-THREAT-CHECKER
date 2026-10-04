import React, { useState } from 'react';
import { Database, Filter, Copy, Check, Search, Network } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function DNSRecords({ data, title = "DNS Analysis" }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!data || !Array.isArray(data.records)) {
    return (
      <div className="cyber-card p-6 border border-navy-border">
        <h3 className="text-base font-bold font-mono text-white mb-2">{title}</h3>
        <p className="text-xs font-mono text-slate-400">No active DNS records available for this target.</p>
      </div>
    );
  }

  const records = data.records;
  const types = ['ALL', ...Array.from(new Set(records.map(r => r.type)))];

  const formatDnsValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.address || val.alias || val.target || val.value || val.nameserver || val.exchange || val.ip || JSON.stringify(val);
    }
    return String(val);
  };

  const filteredRecords = records.filter(r => {
    const valStr = formatDnsValue(r.value);
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesSearch = !searchQuery || 
      (r.type && String(r.type).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.host && String(r.host).toLowerCase().includes(searchQuery.toLowerCase())) ||
      valStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopy = (val, idx) => {
    navigator.clipboard.writeText(formatDnsValue(val));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Helper for badge color per record type in light mode
  const getTypeColor = (type) => {
    switch (type) {
      case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AAAA': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'MX': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TXT': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CNAME': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">
              Live zone resolution ({records.length} records verified)
            </p>
          </div>
        </div>

        <RiskBadge status={data.status || 'AVAILABLE DATA'} size="xs" />
      </div>

      {/* DNS Breakdown visualization chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Record Type filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer shadow-xs ${
                filterType === t
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t} {t !== 'ALL' && `(${records.filter(r => r.type === t).length})`}
            </button>
          ))}
        </div>

        {/* Search within records */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-panel shadow-xs"
          />
        </div>
      </div>

      {/* DNS Records Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="py-3 px-4 font-bold w-24">Type</th>
              <th className="py-3 px-4 font-bold w-40">Host</th>
              <th className="py-3 px-4 font-bold">Value</th>
              <th className="py-3 px-4 font-bold w-20 text-right">TTL</th>
              <th className="py-3 px-3 font-bold w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getTypeColor(rec.type)}`}>
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]" title={rec.host}>
                    {rec.host}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-mono font-medium break-all">
                    {formatDnsValue(rec.value)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-right">
                    {rec.ttl}s
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleCopy(rec.value, idx)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Copy DNS value"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-teal-safe" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 font-mono">
                  No records match the active criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
