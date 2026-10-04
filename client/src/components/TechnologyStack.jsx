import React from 'react';
import { Layers, Server, Code, Layout, Cpu, HardDrive, ShieldCheck } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function TechnologyStack({ data, title = "Technology Stack Fingerprinting" }) {
  if (!data) return null;

  const techCards = [
    { label: 'Web Server', value: data.webServer || 'Nginx / HTTP Engine', icon: Server, highlight: true },
    { label: 'Programming Language', value: data.programmingLanguage || 'Modern ECMAScript / WebAssembly', icon: Code, highlight: true },
    { label: 'CMS & Platform', value: data.cms || 'Custom / Headless', icon: Layout },
    { label: 'Web Framework', value: data.framework || 'Modern Web Stack', icon: Cpu },
    { label: 'Hosting Infrastructure', value: data.hostingProvider || 'Enterprise Cloud', icon: HardDrive }
  ];

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">Full software architecture, programming language and server stack</p>
          </div>
        </div>

        <RiskBadge status={data.status || 'AVAILABLE DATA'} size="xs" />
      </div>

      {/* Technology Stack Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mb-5">
        {techCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-3.5 rounded-xl border transition-all ${
                card.highlight
                  ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1 font-medium">
                <Icon className={`w-3.5 h-3.5 ${card.highlight ? 'text-blue-600' : 'text-slate-600'}`} />
                <span>{card.label}</span>
              </div>
              <div className="text-sm font-semibold font-mono text-slate-900 truncate" title={card.value}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* JavaScript Libraries */}
      {data.javascriptLibraries && data.javascriptLibraries.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-2 font-medium">
            <Cpu className="w-3.5 h-3.5 text-teal-safe" />
            <span>IDENTIFIED JAVASCRIPT LIBRARIES & CLIENT RUNTIMES</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.javascriptLibraries.map((lib, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-xs font-mono text-teal-800 font-semibold"
              >
                {typeof lib === 'string' ? lib : (lib?.name || JSON.stringify(lib))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Headers Inspection */}
      {data.securityHeaders && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-3 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>BROWSER DEFENSE HEADERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
              <span className="text-slate-600">HSTS</span>
              <span className={data.securityHeaders.strictTransportSecurity?.includes('Missing') ? 'text-amber-600 font-semibold' : 'text-teal-700 font-semibold'}>
                {data.securityHeaders.strictTransportSecurity?.includes('Missing') ? 'Missing' : 'Enforced'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
              <span className="text-slate-600">CSP Header</span>
              <span className={data.securityHeaders.contentSecurityPolicy?.includes('Missing') ? 'text-amber-600 font-semibold' : 'text-teal-700 font-semibold'}>
                {data.securityHeaders.contentSecurityPolicy?.includes('Missing') ? 'Missing' : 'Present'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
              <span className="text-slate-600">X-Frame-Options</span>
              <span className={data.securityHeaders.xFrameOptions?.includes('Missing') ? 'text-amber-600 font-semibold' : 'text-teal-700 font-semibold'}>
                {data.securityHeaders.xFrameOptions?.includes('Missing') ? 'Missing' : 'Protected'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
              <span className="text-slate-600">X-Content-Type</span>
              <span className={data.securityHeaders.xContentTypeOptions?.includes('Missing') ? 'text-slate-400 font-semibold' : 'text-teal-700 font-semibold'}>
                {data.securityHeaders.xContentTypeOptions?.includes('Missing') ? 'Missing' : 'nosniff'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
              <span className="text-slate-600">Referrer Policy</span>
              <span className="text-teal-700 font-semibold truncate" title={data.securityHeaders.referrerPolicy}>
                {data.securityHeaders.referrerPolicy || 'Default'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
