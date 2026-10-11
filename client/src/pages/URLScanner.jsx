import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Lock, 
  FileSpreadsheet, 
  Download, 
  ExternalLink,
  ShieldAlert,
  Printer,
  RefreshCw,
  AlertOctagon,
  FileText,
  Server,
  Compass
} from 'lucide-react';
import ThreatScore from '../components/ThreatScore';
import IPInformation from '../components/IPInformation';
import GeoLocation from '../components/GeoLocation';
import DomainInformation from '../components/DomainInformation';
import WhoisInformation from '../components/WhoisInformation';
import DNSRecords from '../components/DNSRecords';
import SSLInformation from '../components/SSLInformation';
import RedirectChain from '../components/RedirectChain';
import TechnologyStack from '../components/TechnologyStack';
import WebsiteErrors from '../components/WebsiteErrors';
import RiskBadge from '../components/RiskBadge';
import LoadingScanner from '../components/LoadingScanner';
import ErrorState from '../components/ErrorState';
import { scanApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatDateTime } from '../utils/formatters';
import { exportThreatReportToExcel } from '../utils/excelExport';
import { exportThreatReportToPdf } from '../utils/pdfExport';

export default function URLScanner() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRescanning, setIsRescanning] = useState(false);

  // Auto-scan if ?scan=... or ?url=... is in query params
  useEffect(() => {
    const targetParam = searchParams.get('scan') || searchParams.get('url');
    if (targetParam && !isLoading && (!scanResult || scanResult.target !== targetParam)) {
      setUrlInput(targetParam);
      handleScanUrl(null, targetParam);
    }
  }, [searchParams]);

  const handleScanUrl = async (e, customUrl = null) => {
    if (e) e.preventDefault();
    let targetUrl = (customUrl || urlInput).trim();

    // Auto-heal accidental copy-paste typo (e.g. 'vhttps://' or 'vhttp://')
    targetUrl = targetUrl.replace(/^[a-zA-Z]?https?:\/\//i, (match) => {
      return match.toLowerCase().includes('https') ? 'https://' : 'http://';
    });
    setUrlInput(targetUrl);

    if (!targetUrl) {
      addToast('Please enter an IP address, domain or website URL', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await scanApi.performScan(targetUrl);
      if (res.success && res.data) {
        setScanResult(res.data);
        addToast(`URL analysis completed for ${targetUrl}`, 'success');
      } else {
        throw new Error(res.message || 'Scan failed');
      }
    } catch (err) {
      setError(err.message || 'Unable to scan target URL.');
      addToast(err.message || 'URL Scan failed', 'error');
    } finally {
      setIsLoading(false);
      setIsRescanning(false);
    }
  };

  const handleRescan = () => {
    if (!scanResult?.target) return;
    setIsRescanning(true);
    handleScanUrl(null, scanResult.target);
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
      console.warn('Direct PDF export error, fallback to browser print:', err);
      window.print();
    }
  };

  const isHighRisk = scanResult && (
    scanResult.riskLevel === 'CRITICAL' || 
    scanResult.riskLevel === 'HIGH' || 
    (scanResult.threatScore > 50)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 shadow-xs">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-900">
              Website, Domain & IP Threat Scanner
            </h1>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="cyber-card p-4 sm:p-5 border border-slate-200/90 shadow-xs no-print">
        <form onSubmit={handleScanUrl} className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter IP address, website URL or domain (e.g. 185.220.101.5, 150.129.131.190, https://github.com)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white transition-all shadow-xs hover:shadow disabled:opacity-50 cursor-pointer flex-shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Target...</span>
              </>
            ) : (
              <>
                <span>Analyze Target</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-6">
          <LoadingScanner target={urlInput} />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="py-4">
          <ErrorState
            title="URL Audit Failed"
            message={error}
            onRetry={() => handleScanUrl()}
            onReset={() => setError(null)}
          />
        </div>
      )}

      {/* Complete Dossier Results - Full parity with Dashboard scan */}
      {scanResult && !isLoading && (
        <div className="space-y-6">
          {/* Target Header & Action Ribbon */}
          <section className="cyber-card p-6 border border-slate-200/90 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-sans text-slate-500 uppercase tracking-wider font-bold">
                    SECURITY AUDIT DOSSIER
                  </span>
                  <RiskBadge status={scanResult.riskLevel} size="xs" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-950 tracking-tight break-all">
                  {scanResult.target}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={handleRescan}
                  disabled={isRescanning}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
                  <span>{isRescanning ? 'Rescanning...' : 'Rescan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                  title="Download Excel Spreadsheet (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                  title="Download Security Dossier PDF (.pdf)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF (.pdf)</span>
                </button>

                <Link
                  to={`/report/${scanResult.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <span>Full Permadossier</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </Link>
              </div>
            </div>

            {/* Target Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] font-sans font-semibold uppercase tracking-wider">RESOLVED HOSTNAME</span>
                <span className="text-slate-900 font-mono font-semibold text-xs truncate block mt-1" title={scanResult.hostname}>
                  {scanResult.hostname || scanResult.target}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] font-sans font-semibold uppercase tracking-wider">ROUTED IP ADDRESS</span>
                <span className="text-slate-900 font-mono font-semibold text-xs truncate block mt-1">
                  {scanResult.ipIntelligence?.ip || 'Direct Target'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] font-sans font-semibold uppercase tracking-wider">ASN / PROVIDER</span>
                <span className="text-slate-900 font-mono font-semibold text-xs truncate block mt-1" title={scanResult.ipIntelligence?.isp}>
                  {scanResult.ipIntelligence?.asn || scanResult.ipIntelligence?.isp || 'Cloud Network'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] font-sans font-semibold uppercase tracking-wider">GEO LOCATION</span>
                <span className="text-slate-900 font-mono font-semibold text-xs truncate block mt-1">
                  {scanResult.geoLocation?.city ? `${scanResult.geoLocation.city}, ${scanResult.geoLocation.country}` : 'Global Transit'}
                </span>
              </div>
            </div>
          </section>


          {/* Threat Score Card */}
          <section>
            <ThreatScore
              score={scanResult.threatScore}
              riskLevel={scanResult.riskLevel}
              confidence={scanResult.confidence}
              detectionsCount={scanResult.detectionsCount}
              lastChecked={scanResult.lastChecked}
              targetType={scanResult.targetType}
            />
          </section>


          {/* IP Intelligence & Geolocation (Real Map) */}
          <section className="grid grid-cols-1 gap-6">
            {scanResult.ipIntelligence && scanResult.ipIntelligence.status !== 'NOT AVAILABLE' && (
              <IPInformation data={scanResult.ipIntelligence} />
            )}

            {scanResult.geoLocation && scanResult.geoLocation.status !== 'NOT AVAILABLE' && (
              <GeoLocation data={scanResult.geoLocation} />
            )}
          </section>

          {/* Domain Intelligence & WHOIS */}
          <section className="space-y-6">
            {scanResult.domainIntelligence && scanResult.domainIntelligence.status !== 'NOT AVAILABLE' && (
              <DomainInformation data={scanResult.domainIntelligence} />
            )}

            {scanResult.whoisInformation && scanResult.whoisInformation.statusType !== 'NOT AVAILABLE' && (
              <WhoisInformation data={scanResult.whoisInformation} />
            )}
          </section>

          {/* DNS Analysis */}
          {scanResult.dnsAnalysis && (
            <section>
              <DNSRecords data={scanResult.dnsAnalysis} />
            </section>
          )}

          {/* Security / SSL Certificate */}
          {scanResult.securitySsl && scanResult.securitySsl.status !== 'NOT CHECKED' && (
            <section>
              <SSLInformation data={scanResult.securitySsl} />
            </section>
          )}

          {/* HTTP Redirect Analysis */}
          {scanResult.redirectAnalysis && scanResult.redirectAnalysis.status !== 'NOT CHECKED' && (
            <section>
              <RedirectChain data={scanResult.redirectAnalysis} />
            </section>
          )}

          {/* Website Errors & Security Flaws Audit */}
          {scanResult.websiteErrors && (
            <section>
              <WebsiteErrors data={scanResult.websiteErrors} />
            </section>
          )}

          {/* Technology Stack */}
          {scanResult.technologyDetection && scanResult.technologyDetection.status !== 'NOT AVAILABLE' && (
            <section>
              <TechnologyStack data={scanResult.technologyDetection} />
            </section>
          )}

          {/* Security Recommendations & Remediation */}
          {scanResult.securityRecommendations && scanResult.securityRecommendations.length > 0 && (
            <section className="cyber-card p-6 border border-slate-200">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-200">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">
                    Security Recommendations & Remediation
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Prescriptive mitigation actions generated by security rules engine
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {scanResult.securityRecommendations.map((rec, idx) => {
                  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (rec.priority === 'CRITICAL' || rec.priority === 'HIGH') {
                    badgeColor = 'bg-red-50 text-red-700 border-red-200 font-semibold';
                  } else if (rec.priority === 'INFO') {
                    badgeColor = 'bg-teal-50 text-teal-700 border-teal-200 font-semibold';
                  }

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                            {rec.priority}
                          </span>
                          <h4 className="text-xs font-bold font-mono text-slate-900">
                            {rec.title}
                          </h4>
                        </div>
                        <p className="text-xs font-mono text-slate-700 leading-relaxed pt-1">
                          {rec.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
