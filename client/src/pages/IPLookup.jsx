import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Search, Globe, Shield, Activity, ArrowRight, Zap, CheckCircle2, FileSpreadsheet, Printer } from 'lucide-react';
import IPInformation from '../components/IPInformation';
import GeoLocation from '../components/GeoLocation';
import ThreatDetection from '../components/ThreatDetection';
import ThreatScore from '../components/ThreatScore';
import LoadingScanner from '../components/LoadingScanner';
import ErrorState from '../components/ErrorState';
import { scanApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { exportThreatReportToExcel } from '../utils/excelExport';
import { exportThreatReportToPdf } from '../utils/pdfExport';

export default function IPLookup() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ipInput, setIpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleLookup = async (e, customIp = null) => {
    if (e) e.preventDefault();
    const targetIp = (customIp || ipInput).trim();

    if (!targetIp) {
      addToast('Please enter an IPv4 or IPv6 address', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await scanApi.performScan(targetIp);
      if (res.success && res.data) {
        setScanResult(res.data);
        addToast(`Intelligence retrieved for IP ${targetIp}`, 'success');
      } else {
        throw new Error(res.message || 'Lookup failed');
      }
    } catch (err) {
      setError(err.message || 'Unable to complete IP lookup.');
      addToast(err.message || 'IP lookup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickIp = (sample) => {
    setIpInput(sample);
    handleLookup(null, sample);
  };

  const handleExportExcel = () => {
    if (!scanResult) return;
    try {
      exportThreatReportToExcel(scanResult);
      addToast('Excel security dossier downloaded successfully (.xlsx)!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to export Excel file.', 'error');
    }
  };

  const handleExportPdf = () => {
    if (!scanResult) return;
    try {
      exportThreatReportToPdf(scanResult);
      addToast('Professional PDF security dossier downloaded successfully (.pdf)!', 'success');
    } catch (err) {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Server className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-wide">
              Dedicated IP Intelligence & Geolocation
            </h1>
          </div>
        </div>

        {scanResult && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="Download full analysis as Excel Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-primary hover:bg-red-hover text-white text-xs font-mono font-semibold shadow-sm transition-all cursor-pointer"
              title="Download publication-grade Security Dossier PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
        <form onSubmit={handleLookup} className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter IPv4 or IPv6 address (e.g. 8.8.8.8, 150.129.131.190, 185.220.101.5)..."
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-red-primary focus:bg-white focus:ring-1 focus:ring-red-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !ipInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold font-mono bg-red-primary hover:bg-red-hover text-white transition-all shadow-md shadow-red-primary/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Querying IP...</span>
              </>
            ) : (
              <>
                <span>Lookup IP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
          <span>Sample Targets:</span>
          <button
            type="button"
            onClick={() => handleQuickIp('8.8.8.8')}
            className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
          >
            🛡️ 8.8.8.8 (Google DNS)
          </button>
          <button
            type="button"
            onClick={() => handleQuickIp('150.129.131.190')}
            className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
          >
            🌐 150.129.131.190 (Enterprise ISP)
          </button>
          <button
            type="button"
            onClick={() => handleQuickIp('1.1.1.1')}
            className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            ⚡ 1.1.1.1 (Cloudflare)
          </button>
          <button
            type="button"
            onClick={() => handleQuickIp('185.220.101.5')}
            className="px-2.5 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
          >
            🚨 185.220.101.5 (Tor Exit)
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-6">
          <LoadingScanner target={ipInput} />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="py-4">
          <ErrorState
            title="IP Lookup Interrupted"
            message={error}
            onRetry={() => handleLookup()}
            onReset={() => setError(null)}
          />
        </div>
      )}

      {/* Results view */}
      {scanResult && !isLoading && (
        <div className="space-y-6">
          <ThreatScore
            score={scanResult.threatScore}
            riskLevel={scanResult.riskLevel}
            confidence={scanResult.confidence}
            detectionsCount={scanResult.detectionsCount}
            lastChecked={scanResult.lastChecked}
            targetType={scanResult.targetType}
          />

          <div className="grid grid-cols-1 gap-6">
            <IPInformation data={scanResult.ipIntelligence} />
            <GeoLocation data={scanResult.geoLocation} />
          </div>

          <ThreatDetection data={scanResult.threatIntelligence} />
        </div>
      )}
    </div>
  );
}
