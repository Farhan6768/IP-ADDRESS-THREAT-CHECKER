import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, Loader2, Terminal, Radio } from 'lucide-react';

const SCAN_STEPS = [
  { label: 'Initializing scan...', delay: 400 },
  { label: 'Resolving target...', delay: 800 },
  { label: 'Checking DNS...', delay: 1400 },
  { label: 'Analyzing reputation...', delay: 2000 },
  { label: 'Checking SSL...', delay: 2600 },
  { label: 'Building threat report...', delay: 3200 }
];

export default function LoadingScanner({ target = 'target' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timers = SCAN_STEPS.map((step, idx) => {
      return setTimeout(() => {
        setCurrentStepIndex(idx);
      }, step.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const progressPercentage = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="cyber-card p-8 border border-slate-200 max-w-2xl mx-auto text-center relative overflow-hidden shadow-xl">
      {/* Radar sweep animation background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-80 h-80 rounded-full border border-teal-safe animate-ping" />
        <div className="absolute w-60 h-60 rounded-full border border-blue-panel" />
      </div>

      {/* Main scanner icon */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 border-2 border-red-primary/60 mb-6 shadow-md shadow-red-primary/10">
        <Shield className="w-10 h-10 text-red-primary animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-primary"></span>
        </span>
      </div>

      <h3 className="text-xl font-bold font-mono text-slate-900 tracking-wide">
        IP Address Threat Checker Engine
      </h3>
      <p className="text-sm font-mono text-slate-500 mt-1">
        Scanning: <span className="text-blue-700 font-semibold">{target}</span>
      </p>

      {/* Cyber Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 my-6 overflow-hidden border border-slate-200">
        <div
          className="bg-gradient-to-r from-blue-600 via-teal-safe to-red-primary h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Sequence Checklist */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-w-md mx-auto text-left">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 mb-2 border-b border-slate-200">
          <span className="flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-teal-700" />
            TELEMETRY DISPATCH
          </span>
          <span className="text-teal-700 font-bold">{progressPercentage}%</span>
        </div>

        <ul className="space-y-2">
          {SCAN_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <li
                key={step.label}
                className={`flex items-center gap-2.5 text-xs font-mono transition-colors ${
                  isCompleted
                    ? 'text-teal-700 font-medium'
                    : isCurrent
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-red-primary animate-spin flex-shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
                <span>{step.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[11px] font-mono text-slate-400 mt-4">
        Performing live DNS queries, TLS handshakes, ASN routing, and threat database correlation...
      </p>
    </div>
  );
}
