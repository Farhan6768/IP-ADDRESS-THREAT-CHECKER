import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PieChart as PieIcon, ShieldCheck, AlertTriangle, ShieldAlert, ShieldX, TrendingUp } from 'lucide-react';

/**
 * Custom modern tooltip with count and combination percentage
 */
const CustomTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const val = Number(item.value) || 0;
    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs font-sans min-w-[190px]">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.payload?.color || item.color }}
          />
          <span className="font-bold text-slate-900">{item.name}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Host Count:</span>
            <span className="font-mono font-bold text-slate-900">{val} {val === 1 ? 'target' : 'targets'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Distribution Share:</span>
            <span className="font-mono font-bold text-emerald-700">{pct}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Executive Risk Distribution Donut Chart with Combination %
 */
export function RiskDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center text-slate-400 text-xs font-sans bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
        <PieIcon className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-slate-700 font-semibold text-sm">No Risk Distribution Telemetry</p>
        <p className="text-slate-400 text-xs mt-1">Audit URL or IP targets to categorize threat tiers and posture breakdown.</p>
      </div>
    );
  }

  // Calculate total targets audited
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  // Enrich data with exact combination percentage
  const enrichedData = data.map(item => {
    const val = Number(item.value) || 0;
    const pct = total > 0 ? (val / total) * 100 : 0;
    const pctFormatted = pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1);
    return {
      ...item,
      percentage: pct,
      percentageFormatted: `${pctFormatted}%`
    };
  });

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
      {/* Left Column: Donut Chart with Centered Total Metric */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
        <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enrichedData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="#FFFFFF"
              >
                {enrichedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Central Donut Total Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
              {total}
            </span>
            <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {total === 1 ? 'Target' : 'Targets'}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-sans font-medium text-slate-600 mt-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Live Consensus Breakdown</span>
        </div>
      </div>

      {/* Right Column: Detailed Breakdown with Combination Percentages & Progress Bars */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400">
          <span>Threat Tier Classification</span>
          <span>Combination % / Volume</span>
        </div>

        {enrichedData.map((item, idx) => (
          <div 
            key={idx} 
            className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 font-sans">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span 
                  className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border shadow-2xs"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}40`,
                    color: item.color
                  }}
                >
                  {item.percentageFormatted}
                </span>
                <span className="text-xs font-mono text-slate-500 font-medium min-w-[55px] text-right">
                  {item.value} {item.value === 1 ? 'target' : 'targets'}
                </span>
              </div>
            </div>

            {/* Visual Proportional Progress Bar */}
            <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
