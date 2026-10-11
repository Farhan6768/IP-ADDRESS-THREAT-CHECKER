import React from 'react';
import { Shield, Activity, Target, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDateTime } from '../utils/formatters';

export default function ThreatScore({
  score = 0,
  riskLevel = 'SAFE',
  confidence = '95%',
  detectionsCount = 0,
  lastChecked = null,
  targetType = 'TARGET'
}) {
  // Theme color mapping strictly adhering to:
  // Safe: #3B9797
  // Warning: #16476A
  // High/Critical: #BF092F
  const isClean = score === 0;

  let strokeColor = '#3B9797';
  let glowColor = 'rgba(59, 151, 151, 0.4)';
  let statusText = 'VERIFIED SAFE';

  if (score >= 75) {
    strokeColor = '#BF092F';
    glowColor = 'rgba(191, 9, 47, 0.6)';
    statusText = 'CRITICAL THREAT';
  } else if (score >= 50) {
    strokeColor = '#BF092F';
    glowColor = 'rgba(191, 9, 47, 0.5)';
    statusText = 'HIGH RISK';
  } else if (score >= 25) {
    strokeColor = '#16476A';
    glowColor = 'rgba(22, 71, 106, 0.5)';
    statusText = 'ELEVATED RISK';
  } else if (score > 0) {
    strokeColor = '#3B9797';
    glowColor = 'rgba(59, 151, 151, 0.35)';
    statusText = 'LOW RISK';
  }

  // SVG Circular math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // When clean (0), display full safe circle; when threat > 0, display proportional threat arc
  const strokeDashoffset = isClean 
    ? 0 
    : circumference - (Math.max(score, 5) / 100) * circumference;

  return (
    <div className="cyber-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-xs relative overflow-hidden">
      {/* Subtle accent glow in top right */}
      <div 
        className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-15 transition-all duration-700"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Radial Circle Gauge */}
        <div className="flex flex-col items-center justify-center relative flex-shrink-0">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Outer Decorative Track */}
              <circle
                cx="80"
                cy="80"
                r="74"
                stroke="#E2E8F0"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="transparent"
                opacity="0.6"
              />

              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="11"
                stroke="#F1F5F9"
                fill="transparent"
              />

              {/* Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease'
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-sans uppercase tracking-widest text-slate-500 font-bold">
                Threat Score
              </span>
              <div className="flex items-baseline my-0.5">
                <span 
                  className="text-4xl font-extrabold font-mono tracking-tight"
                  style={{ color: isClean ? '#0D9488' : (score >= 50 ? '#BF092F' : '#0F172A') }}
                >
                  {score}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">/100</span>
              </div>
              <span 
                className="text-[10px] font-sans px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider"
                style={{ 
                  color: isClean ? '#047857' : (score >= 50 ? '#B91C1C' : '#334155'),
                  backgroundColor: isClean ? '#ECFDF5' : (score >= 50 ? '#FEF2F2' : '#F1F5F9'),
                  border: `1px solid ${isClean ? '#A7F3D0' : (score >= 50 ? '#FECACA' : '#E2E8F0')}`
                }}
              >
                {statusText}
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-sans text-slate-500 font-medium">
              {isClean ? '🛡️ 100% Clean Security Posture' : `⚠️ Threat Severity: ${riskLevel}`}
            </span>
          </div>
        </div>

        {/* Intelligence Metrics Panel */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-sans text-slate-500 uppercase tracking-wider font-semibold">Calculated Security Stance</p>
              <h3 className="text-xl font-bold font-sans text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                Status:
                <RiskBadge status={riskLevel} size="lg" />
              </h3>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-sans text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Last Checked
              </span>
              <p className="text-xs text-slate-700 font-mono mt-0.5 font-medium">
                {lastChecked ? formatDateTime(lastChecked) : 'Just now'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4">
            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 transition-all">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-sans mb-1">
                <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-slate-600">CONFIDENCE</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{confidence}</div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">Signal Consensus</div>
            </div>

            <div className={`rounded-xl p-3.5 border transition-all ${
              detectionsCount > 0 
                ? 'bg-rose-50/60 border-rose-200/90' 
                : 'bg-emerald-50/60 border-emerald-200/90'
            }`}>
              <div className="flex items-center gap-2 text-xs font-sans mb-1">
                <div className={`p-1 rounded-md ${detectionsCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {detectionsCount > 0 ? (
                    <AlertOctagon className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className={`font-semibold text-[11px] tracking-wider uppercase ${detectionsCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  DETECTIONS
                </span>
              </div>
              <div className={`text-lg font-bold font-mono mt-1 ${detectionsCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {detectionsCount} Flag{detectionsCount === 1 ? '' : 's'}
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                {detectionsCount > 0 ? 'Threat Signatures' : 'Zero Anomalies'}
              </div>
            </div>

            <div className={`rounded-xl p-3.5 border transition-all col-span-2 sm:col-span-1 ${
              isClean 
                ? 'bg-emerald-50/60 border-emerald-200/90' 
                : 'bg-rose-50/60 border-rose-200/90'
            }`}>
              <div className="flex items-center gap-2 text-xs font-sans mb-1">
                <div className={`p-1 rounded-md ${isClean ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className={`font-semibold text-[11px] tracking-wider uppercase ${isClean ? 'text-emerald-700' : 'text-rose-700'}`}>
                  INTEGRITY
                </span>
              </div>
              <div className={`text-lg font-bold font-mono mt-1 ${isClean ? 'text-emerald-700' : 'text-red-600'}`}>
                {isClean ? 'HEALTHY' : 'RISK DETECTED'}
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                {isClean ? 'Passed Validation' : 'Review Signals'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
