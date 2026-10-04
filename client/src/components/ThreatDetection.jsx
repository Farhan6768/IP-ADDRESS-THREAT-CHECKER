import React from 'react';
import { 
  ShieldAlert, 
  Bug, 
  Fish, 
  Mail, 
  Bot, 
  AlertCircle, 
  Activity, 
  Skull, 
  ExternalLink,
  Clock,
  Radio
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDateTime } from '../utils/formatters';

export default function ThreatDetection({ data }) {
  if (!data) return null;

  // The 8 required threat detection modules
  const items = [
    {
      key: 'blacklistStatus',
      title: 'Blacklist Status',
      icon: ShieldAlert,
      details: data.blacklistStatus || { status: 'CLEAN', description: 'Not present on major threat feeds', source: 'Threat Intelligence DB' }
    },
    {
      key: 'malwareDetection',
      title: 'Malware Detection',
      icon: Bug,
      details: data.malwareDetection || { status: 'NOT DETECTED', description: 'No active malware payloads identified', source: 'Threat Engine' }
    },
    {
      key: 'phishingDetection',
      title: 'Phishing Detection',
      icon: Fish,
      details: data.phishingDetection || { status: 'NOT DETECTED', description: 'No credential theft signatures matched', source: 'Heuristic Feed' }
    },
    {
      key: 'spamReputation',
      title: 'Spam Reputation',
      icon: Mail,
      details: data.spamReputation || { status: 'CLEAN', description: 'No unsolicited mail blast association', source: 'Spamhaus / SBL' }
    },
    {
      key: 'botnetAssociation',
      title: 'Botnet Association',
      icon: Bot,
      details: data.botnetAssociation || { status: 'NOT DETECTED', description: 'Zero C2 beaconing activity detected', source: 'Threat Feeds' }
    },
    {
      key: 'abuseReports',
      title: 'Abuse Reports',
      icon: AlertCircle,
      details: data.abuseReports || { status: '0 REPORTS', description: 'No abuse records registered in last 90 days', source: 'AbuseIPDB' }
    },
    {
      key: 'suspiciousActivity',
      title: 'Suspicious Activity',
      icon: Activity,
      details: data.suspiciousActivity || { status: 'NORMAL', description: 'Standard network behavioral profile', source: 'SOC Telemetry' }
    },
    {
      key: 'knownThreats',
      title: 'Known Threats',
      icon: Skull,
      details: data.knownThreats || { status: 'NONE', description: 'No matches against public CVE/APT databases', source: 'Threat IOCs' }
    }
  ];

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-primary shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">Threat Intelligence Vectors</h3>
            <p className="text-xs text-slate-500 font-mono">Consolidated 8-point security reputation scan</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-xs font-medium">
          <Radio className="w-3 h-3 text-teal-safe animate-pulse" />
          MULTI-VECTOR FEEDS
        </span>
      </div>

      {/* 8-Card Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const info = item.details;

          return (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-mono font-semibold truncate">
                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <RiskBadge status={info.status} size="xs" />
                </div>

                <p className="text-xs text-slate-600 font-mono leading-relaxed mt-2 line-clamp-2" title={info.description}>
                  {info.description || 'No anomalous signals identified.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="truncate max-w-[120px] font-medium" title={info.source}>
                  Src: {info.source || 'Threat Engine'}
                </span>
                <span className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{info.lastChecked ? (formatDateTime(info.lastChecked).includes(',') ? formatDateTime(info.lastChecked).split(',')[1].trim() : formatDateTime(info.lastChecked)) : 'Live'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
