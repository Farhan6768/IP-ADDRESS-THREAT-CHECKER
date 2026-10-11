import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  PieChart as PieIcon,
  RefreshCw,
  Trash2,
  ArrowRight,
  Globe,
  Compass
} from 'lucide-react';
import ScanHistory from '../components/ScanHistory';
import { RiskDistributionChart } from '../components/ThreatChart';
import { scanApi } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    cleanTargets: 0,
    highRiskTargets: 0
  });
  const [charts, setCharts] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Load genuine stats and recent scans
  const fetchDashboardData = async () => {
    try {
      setIsLoadingStats(true);
      const res = await scanApi.getDashboardStats();
      if (res.stats) setStats(res.stats);
      if (res.charts) setCharts(res.charts);
      if (res.recentScans) setRecentScans(res.recentScans);
    } catch (err) {
      console.warn('Dashboard stats load error:', err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Delete individual scan
  const handleDeleteScan = async (id) => {
    try {
      await scanApi.deleteScan(id);
      setRecentScans(prev => prev.filter(s => s.id !== id));
      addToast('Scan record removed from history', 'info');
      fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to delete record', 'error');
    }
  };

  // Clear all historical scan data
  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all historical scan records and reset dashboard telemetry?')) {
      return;
    }

    try {
      setIsClearing(true);
      await scanApi.clearAllHistory();
      setStats({
        totalScans: 0,
        threatsDetected: 0,
        cleanTargets: 0,
        highRiskTargets: 0
      });
      setCharts({
        trend: [],
        riskDistribution: [],
        categories: []
      });
      setRecentScans([]);
      addToast('All scan records and dashboard data cleared successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to clear dashboard data', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 shadow-xs">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-900">
              Security Operations Center (SOC)
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isLoadingStats}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh telemetry metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 text-xs font-medium border border-red-200/80 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Clear all dashboard scan data"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>{isClearing ? 'Clearing...' : 'Clear All Data'}</span>
            </button>
          )}

          <Link
            to="/url-scanner"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Launch URL Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>


      {/* SOC Statistics 4-Card Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="cyber-card p-5 border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider block mb-1">TOTAL SCANS</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {stats.totalScans}
            </div>
            <span className="text-[11px] font-sans text-slate-400 mt-1 block">Live telemetry feeds</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Clean Targets */}
        <div className="cyber-card p-5 border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider block mb-1">CLEAN TARGETS</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-700">
              {stats.cleanTargets}
            </div>
            <span className="text-[11px] font-sans text-slate-400 mt-1 block">Verified safe hosts</span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Threats Detected */}
        <div className="cyber-card p-5 border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider block mb-1">THREATS DETECTED</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-red-600">
              {stats.threatsDetected}
            </div>
            <span className="text-[11px] font-sans text-slate-400 mt-1 block">Flagged suspicious</span>
          </div>
          <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* High Risk Targets */}
        <div className="cyber-card p-5 border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider block mb-1">HIGH RISK TARGETS</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-red-600">
              {stats.highRiskTargets}
            </div>
            <span className="text-[11px] font-sans text-slate-400 mt-1 block">Critical blocklist matches</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Cybersecurity Charts Section */}
      <section>
        {/* Risk Distribution */}
        <div className="cyber-card p-6 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">Risk Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Global Targets</span>
          </div>
          <RiskDistributionChart data={charts?.riskDistribution} />
        </div>
      </section>

      {/* Recent Scans Table */}
      <section>
        <ScanHistory
          scans={recentScans}
          onDelete={handleDeleteScan}
          onRescan={(target) => navigate(`/url-scanner?scan=${encodeURIComponent(target)}`)}
          isLoading={isLoadingStats}
        />
      </section>
    </div>
  );
}
