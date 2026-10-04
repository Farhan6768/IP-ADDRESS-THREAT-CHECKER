import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Wrench, 
  Search, 
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Bug
} from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function WebsiteErrors({ data, title = "Website Errors & Security Vulnerabilities Audit" }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  if (!data) return null;

  const issues = Array.isArray(data.issues) ? data.issues : [];
  const passedChecks = Array.isArray(data.passedChecks) ? data.passedChecks : [];

  // Filter issues based on active severity tab & search query
  const filteredIssues = issues.filter(item => {
    let matchesSeverity = true;
    if (filterSeverity === 'CRITICAL_HIGH') {
      matchesSeverity = item.severity === 'CRITICAL' || item.severity === 'HIGH';
    } else if (filterSeverity === 'MEDIUM_LOW') {
      matchesSeverity = item.severity === 'MEDIUM' || item.severity === 'LOW';
    } else if (filterSeverity !== 'ALL' && filterSeverity !== 'PASSED') {
      matchesSeverity = item.severity === filterSeverity;
    }

    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.impact?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500 text-white border-red-600 font-extrabold';
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Flame className="w-4 h-4 text-red-600 animate-pulse flex-shrink-0" />;
      case 'HIGH':
        return <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      case 'LOW':
        return <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />;
      default:
        return <Bug className="w-4 h-4 text-slate-500 flex-shrink-0" />;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500 text-white border-emerald-600';
      case 'B': return 'bg-blue-600 text-white border-blue-700';
      case 'C': return 'bg-amber-500 text-white border-amber-600';
      case 'D': return 'bg-orange-500 text-white border-orange-600';
      case 'F': return 'bg-red-600 text-white border-red-700 animate-pulse';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      {/* Header with Title and Grade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-primary shadow-xs">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
              {data.healthGrade && (
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold border ${getGradeColor(data.healthGrade)}`}>
                  GRADE {data.healthGrade}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Diagnostic inspection of HTTP errors, SSL weaknesses, missing security headers & misconfigurations
            </p>
          </div>
        </div>

        <RiskBadge 
          status={data.criticalCount > 0 ? 'CRITICAL RISK' : (data.highCount > 0 ? 'HIGH RISK' : (data.totalErrors > 0 ? 'VULNERABILITIES DETECTED' : 'CLEAN & SECURE'))} 
          size="xs" 
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Total Issues</span>
          <span className="text-lg font-bold font-mono text-slate-900">{data.totalErrors ?? 0}</span>
        </div>

        <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-center">
          <span className="text-[10px] font-mono text-red-600 block uppercase font-semibold">Critical Flaws</span>
          <span className="text-lg font-bold font-mono text-red-700">{data.criticalCount ?? 0}</span>
        </div>

        <div className="p-3 rounded-xl bg-red-50/40 border border-red-200 text-center">
          <span className="text-[10px] font-mono text-red-600 block uppercase font-semibold">High Severity</span>
          <span className="text-lg font-bold font-mono text-red-600">{data.highCount ?? 0}</span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
          <span className="text-[10px] font-mono text-amber-700 block uppercase font-semibold">Medium Warnings</span>
          <span className="text-lg font-bold font-mono text-amber-700">{data.mediumCount ?? 0}</span>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
          <span className="text-[10px] font-mono text-blue-700 block uppercase font-semibold">Low / Config</span>
          <span className="text-lg font-bold font-mono text-blue-700">{data.lowCount ?? 0}</span>
        </div>

        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
          <span className="text-[10px] font-mono text-teal-700 block uppercase font-semibold">Passed Checks</span>
          <span className="text-lg font-bold font-mono text-teal-700">{data.passedChecksCount ?? 0}</span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Errors ({issues.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('CRITICAL_HIGH')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filterSeverity === 'CRITICAL_HIGH'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            Critical & High ({(data.criticalCount || 0) + (data.highCount || 0)})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('MEDIUM_LOW')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filterSeverity === 'MEDIUM_LOW'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Medium & Low ({(data.mediumCount || 0) + (data.lowCount || 0)})
          </button>

          <button
            type="button"
            onClick={() => setFilterSeverity('PASSED')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
              filterSeverity === 'PASSED'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
          >
            Passed Defenses ({passedChecks.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search errors or impact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-red-primary focus:bg-white"
          />
        </div>
      </div>

      {/* List of Detected Website Errors & Flaws */}
      {filterSeverity !== 'PASSED' ? (
        filteredIssues.length > 0 ? (
          <div className="space-y-3">
            {filteredIssues.map((issue, idx) => {
              const itemKey = issue.id !== undefined ? issue.id : `issue-${idx}`;
              const isExpanded = expandedId === itemKey;
              const isCritical = issue.severity === 'CRITICAL' || issue.severity === 'HIGH';

              return (
                <div
                  key={itemKey}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {getSeverityIcon(issue.severity)}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityBadge(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-600 border border-slate-200 font-medium">
                            {issue.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                            {issue.title}
                          </h4>
                        </div>
                        <p className="text-xs font-mono text-slate-700 leading-relaxed mt-1">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : itemKey)}
                      className="self-end sm:self-auto flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-white border border-slate-200 transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                    >
                      <span>{isExpanded ? 'Less Details' : 'Impact & Fix'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Section with Impact & How to Fix */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-150">
                      {/* Security Impact */}
                      <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>POTENTIAL SECURITY IMPACT:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {issue.impact}
                        </p>
                      </div>

                      {/* Remediation Snippet */}
                      <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-200 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
                          <Wrench className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>HOW TO FIX & REMEDIATE:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-mono">
                          {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-teal-safe mx-auto mb-2" />
            <h4 className="text-sm font-bold font-mono text-emerald-900">Zero Critical Website Errors in This Category</h4>
            <p className="text-xs font-mono text-emerald-700 mt-1">
              All tested web transport and configuration parameters passed without detection of flaws.
            </p>
          </div>
        )
      ) : (
        /* Passed Defenses View */
        <div className="space-y-2.5">
          {passedChecks.length > 0 ? (
            passedChecks.map((chk, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-teal-50/60 border border-teal-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-safe flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-teal-900">{chk.title}</h4>
                  <p className="text-xs font-mono text-teal-800/80 mt-0.5">{chk.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono text-slate-500 py-4 text-center">No defensive checks passed yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
