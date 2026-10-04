import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Filter, Eye, RefreshCw, Trash2, Server, Globe, Shield, ArrowUpDown } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDateTime, truncate } from '../utils/formatters';

export default function ScanHistory({
  scans = [],
  onDelete,
  onRescan,
  isLoading = false
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Filter items client-side
  const filtered = scans.filter((item) => {
    const matchesSearch = !search ||
      item.target?.toLowerCase().includes(search.toLowerCase()) ||
      item.targetType?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || item.targetType === typeFilter;
    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;

    return matchesSearch && matchesType && matchesRisk;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'IPv4':
      case 'IPv6':
        return <Server className="w-3.5 h-3.5 text-blue-panel" />;
      case 'URL':
        return <Globe className="w-3.5 h-3.5 text-teal-safe" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="cyber-card p-6 border border-slate-200">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">Threat Intelligence Log</h3>
            <p className="text-xs text-slate-500 font-mono">Historical scan registry ({filtered.length} targets)</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search targets or IPs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-primary focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-red-primary focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="IPv4">IPv4</option>
            <option value="IPv6">IPv6</option>
            <option value="DOMAIN">DOMAIN</option>
            <option value="URL">URL</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-red-primary focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="SAFE">Safe</option>
            <option value="LOW RISK">Low Risk</option>
            <option value="MEDIUM RISK">Medium Risk</option>
            <option value="HIGH RISK">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="py-3 px-4 font-semibold">Target Entity</th>
              <th className="py-3 px-4 font-semibold w-28">Type</th>
              <th className="py-3 px-4 font-semibold w-32">Threat Score</th>
              <th className="py-3 px-4 font-semibold w-36">Risk Status</th>
              <th className="py-3 px-4 font-semibold w-40">Scan Date</th>
              <th className="py-3 px-4 font-semibold w-36 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const score = item.threatScore !== undefined ? item.threatScore : 0;
                let scoreColor = 'text-teal-700';
                if (score >= 50) scoreColor = 'text-red-primary';
                else if (score >= 25) scoreColor = 'text-blue-700';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Target */}
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.targetType)}
                        <span className="truncate max-w-[200px] sm:max-w-xs" title={item.target}>
                          {item.target}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {item.targetType}
                      </span>
                    </td>

                    {/* Threat Score */}
                    <td className="py-3 px-4 font-bold">
                      <span className={`${scoreColor} text-sm`}>{score}</span>
                      <span className="text-slate-500 text-[11px]"> / 100</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <RiskBadge status={item.riskLevel || 'CLEAN'} size="xs" />
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateTime(item.timestamp)}
                    </td>

                    {/* Actions: View, Rescan, Delete */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View button */}
                        <button
                          onClick={() => navigate(`/report/${item.id}`)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                          title="View Threat Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Rescan button */}
                        {onRescan && (
                          <button
                            onClick={() => onRescan(item.target)}
                            className="p-1.5 rounded-md text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors cursor-pointer"
                            title="Rescan Target"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete button */}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-primary hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                  {isLoading ? 'Loading threat history records...' : 'No scan history matching the criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
