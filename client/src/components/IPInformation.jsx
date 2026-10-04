import React, { useState } from 'react';
import { Server, Globe, MapPin, Clock, Wifi, Shield, Network, Building, Copy, Check } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function IPInformation({ data, title = "IP Intelligence" }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!data) return null;

  const copyToClipboard = (text, key) => {
    if (!text || text === 'Unknown') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fields = [
    { label: 'IP Address', value: data.ip, icon: Server, copyable: true, key: 'ip', highlight: true },
    { label: 'Reverse DNS (PTR)', value: data.reverseDns || 'None', icon: Network, copyable: true, key: 'rdns' },
    { label: 'Country', value: `${data.country || 'Unknown'} (${data.countryCode || 'GL'})`, icon: Globe },
    { label: 'City & Region', value: `${data.city || 'Unknown'}, ${data.region || 'Unknown'}`, icon: MapPin },
    { label: 'Timezone', value: data.timezone || 'UTC', icon: Clock },
    { label: 'Autonomous System (ASN)', value: data.asn || 'Unknown', icon: Shield, copyable: true, key: 'asn' },
    { label: 'Internet Service Provider (ISP)', value: data.isp || 'Unknown', icon: Wifi },
    { label: 'Organization', value: data.organization || data.org || 'Unknown', icon: Building },
    { label: 'Hosting Provider', value: data.hostingProvider || 'Unknown', icon: Server },
    { label: 'Connection Type', value: data.connectionType || 'Datacenter / Enterprise', icon: Network, badge: true }
  ];

  return (
    <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">BGP routing, IP location & network provider</p>
          </div>
        </div>

        <RiskBadge status={data.status || 'AVAILABLE DATA'} size="xs" />
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {fields.map((field) => {
          const Icon = field.icon;
          const isCopied = copiedKey === field.key;

          return (
            <div
              key={field.label}
              className={`p-3.5 rounded-xl border transition-all ${
                field.highlight
                  ? 'bg-blue-50/60 border-blue-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-medium">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{field.label}</span>
                </div>

                {field.copyable && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(field.value, field.key)}
                    className="text-slate-400 hover:text-slate-800 transition-colors p-1 cursor-pointer"
                    title="Copy value"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-teal-safe" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="text-sm font-mono font-semibold text-slate-900 truncate" title={field.value}>
                {field.badge ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    {field.value}
                  </span>
                ) : (
                  field.value || 'N/A'
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
