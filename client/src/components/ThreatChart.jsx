import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

/**
 * Custom light tooltip matching ThreatScope theme
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs font-mono min-w-[170px]">
        {label && (
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
            <span className="text-slate-900 font-extrabold uppercase tracking-wider">{label}</span>
            <span className="text-[10px] text-slate-400 font-mono">SOC Sensor</span>
          </div>
        )}
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-slate-600 truncate max-w-[130px]">{entry.name}</span>
              </div>
              <span className="text-slate-900 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Risk Distribution Donut Chart
 */
export function RiskDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-mono bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
        <PieIcon className="w-6 h-6 text-slate-300 mb-2" />
        <p className="text-slate-600 font-semibold">No Risk Distribution</p>
        <p className="text-slate-400 text-[11px] mt-1">Scan targets to categorize threat tiers.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-600">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Detection Categories Horizontal Bar Chart
 */
export function CategoriesBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-mono bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
        <BarChart2 className="w-6 h-6 text-slate-300 mb-2" />
        <p className="text-slate-600 font-semibold">No Threat Signatures Recorded</p>
        <p className="text-slate-400 text-[11px] mt-1">Malicious categories will appear when suspicious vectors are detected.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 45, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis
            type="category"
            dataKey="category"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color || '#BF092F'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
