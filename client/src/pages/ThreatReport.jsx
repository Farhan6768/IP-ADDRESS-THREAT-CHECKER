import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Share2, 
  Clock, 
  Download,
  AlertOctagon,
  Info,
  Server,
  Globe,
  FileSpreadsheet
} from 'lucide-react';
import ThreatScore from '../components/ThreatScore';
import IPInformation from '../components/IPInformation';
import DomainInformation from '../components/DomainInformation';
import ThreatDetection from '../components/ThreatDetection';
import DNSRecords from '../components/DNSRecords';
import SSLInformation from '../components/SSLInformation';
import WhoisInformation from '../components/WhoisInformation';
import GeoLocation from '../components/GeoLocation';
import RedirectChain from '../components/RedirectChain';
import TechnologyStack from '../components/TechnologyStack';
import WebsiteErrors from '../components/WebsiteErrors';
import RiskBadge from '../components/RiskBadge';
import ErrorState from '../components/ErrorState';
import { scanApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatDateTime } from '../utils/formatters';
import { exportThreatReportToExcel } from '../utils/excelExport';
import { exportThreatReportToPdf } from '../utils/pdfExport';

export default function ThreatReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRescanning, setIsRescanning] = useState(false);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await scanApi.getScanReport(id);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        throw new Error(res.message || 'Report not found');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve threat intelligence report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleExportPdf = () => {
    if (!report) return;
    try {
      exportThreatReportToPdf(report);
      addToast('Professional PDF security dossier downloaded successfully (.pdf)!', 'success');
    } catch (err) {
      console.warn('PDF export error, falling back to print:', err);
      window.print();
    }
  };

  const handleExportExcel = () => {
    if (!report) return;
    try {
      exportThreatReportToExcel(report);
      addToast('Full Threat Intelligence Dossier downloaded as Excel (.xlsx)!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to export Excel file.', 'error');
    }
  };

  const handleRescan = async () => {
    if (!report?.target) return;
    try {
      setIsRescanning(true);
      addToast(`Re-evaluating target ${report.target}...`, 'info');
      const res = await scanApi.performScan(report.target);
      if (res.success && res.data) {
        setReport(res.data);
        addToast('Threat analysis updated with fresh telemetry.', 'success');
        navigate(`/report/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      addToast(err.message || 'Rescan failed.', 'error');
    } finally {
      setIsRescanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-3 border-red-primary/30 border-t-red-primary rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold font-mono text-slate-900">Retrieving Threat Dossier...</h3>
        <p className="text-xs font-mono text-slate-500 mt-1">Decrypting stored telemetry parameters</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-12">
        <ErrorState
          title="Threat Report Unavailable"
          message={error || 'Report could not be retrieved.'}
          onRetry={fetchReport}
          onReset={() => navigate('/')}
        />
      </div>
    );
  }

  const isHighRisk = report.riskLevel === 'HIGH RISK' || report.riskLevel === 'CRITICAL';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Action Bar (No-Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-400 text-xs font-mono">/</span>
          <span className="text-xs font-mono text-slate-500 truncate max-w-xs">
            Report {report.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Rescan Button */}
          <button
            onClick={handleRescan}
            disabled={isRescanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin text-teal-safe' : ''}`} />
            <span>{isRescanning ? 'Scanning...' : 'Rescan Target'}</span>
          </button>

          {/* New Scan Button */}
          <Link
            to="/url-scanner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium shadow-xs transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>

          {/* Export Report Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-mono font-bold shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Excel (.xlsx)</span>
          </button>

          {/* Export Report PDF Button */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-primary hover:bg-red-hover text-white text-xs font-mono font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Header & Target Information */}
      <section className="cyber-card p-6 border border-slate-200 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                THREAT INTELLIGENCE DOSSIER
              </span>
              <RiskBadge status={report.riskLevel} size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-wide break-all">
              {report.target}
            </h1>
          </div>

          <div className="text-left md:text-right text-xs font-mono text-slate-500 space-y-1">
            <div>Generated: <span className="text-slate-800 font-semibold">{formatDateTime(report.timestamp)}</span></div>
            <div>Scan Latency: <span className="text-teal-700 font-semibold">{report.scanDuration || '0.85s'}</span></div>
            <div>Classification: <span className="text-blue-700 font-bold">{report.targetType}</span></div>
          </div>
        </div>

        {/* Target Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">RESOLVED HOSTNAME</span>
            <span className="text-slate-800 font-semibold truncate block mt-0.5" title={report.hostname}>
              {report.hostname || report.target}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">ROUTED IP ADDRESS</span>
            <span className="text-slate-800 font-semibold truncate block mt-0.5">
              {report.ipIntelligence?.ip || 'Direct'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">ASN / PROVIDER</span>
            <span className="text-slate-800 font-semibold truncate block mt-0.5" title={report.ipIntelligence?.isp}>
              {report.ipIntelligence?.asn || report.ipIntelligence?.isp || 'Cloud Network'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">GEO LOCATION</span>
            <span className="text-slate-800 font-semibold truncate block mt-0.5">
              {report.geoLocation?.city ? `${report.geoLocation.city}, ${report.geoLocation.country}` : 'Global Transit'}
            </span>
          </div>
        </div>
      </section>


      {/* Threat Score Card */}
      <section>
        <ThreatScore
          score={report.threatScore}
          riskLevel={report.riskLevel}
          confidence={report.confidence}
          detectionsCount={report.detectionsCount}
          lastChecked={report.lastChecked}
          targetType={report.targetType}
        />
      </section>

      {/* Threat Intelligence 8 Detection Cards */}
      {report.threatIntelligence && (
        <section>
          <ThreatDetection data={report.threatIntelligence} />
        </section>
      )}

      {/* IP Intelligence & Geolocation */}
      <section className="grid grid-cols-1 gap-6">
        {report.ipIntelligence && report.ipIntelligence.status !== 'NOT AVAILABLE' && (
          <IPInformation data={report.ipIntelligence} />
        )}

        {report.geoLocation && report.geoLocation.status !== 'NOT AVAILABLE' && (
          <GeoLocation data={report.geoLocation} />
        )}
      </section>

      {/* Domain Intelligence & WHOIS */}
      {(report.targetType === 'DOMAIN' || report.targetType === 'URL') && (
        <section className="space-y-6">
          {report.domainIntelligence && report.domainIntelligence.status !== 'NOT AVAILABLE' && (
            <DomainInformation data={report.domainIntelligence} />
          )}

          {report.whoisInformation && report.whoisInformation.statusType !== 'NOT AVAILABLE' && (
            <WhoisInformation data={report.whoisInformation} />
          )}
        </section>
      )}

      {/* DNS Analysis */}
      {report.dnsAnalysis && (
        <section>
          <DNSRecords data={report.dnsAnalysis} />
        </section>
      )}

      {/* Security / SSL Certificate */}
      {report.securitySsl && report.securitySsl.status !== 'NOT CHECKED' && (
        <section>
          <SSLInformation data={report.securitySsl} />
        </section>
      )}

      {/* Redirect Analysis */}
      {report.redirectAnalysis && report.redirectAnalysis.status !== 'NOT CHECKED' && (
        <section>
          <RedirectChain data={report.redirectAnalysis} />
        </section>
      )}

      {/* Website Errors & Security Flaws Audit */}
      {report.websiteErrors && (
        <section>
          <WebsiteErrors data={report.websiteErrors} />
        </section>
      )}

      {/* Technology Stack */}
      {report.technologyDetection && report.technologyDetection.status !== 'NOT AVAILABLE' && (
        <section>
          <TechnologyStack data={report.technologyDetection} />
        </section>
      )}

      {/* Security Recommendations */}
      {report.securityRecommendations && report.securityRecommendations.length > 0 && (
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
            {report.securityRecommendations.map((rec, idx) => {
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
  );
}
