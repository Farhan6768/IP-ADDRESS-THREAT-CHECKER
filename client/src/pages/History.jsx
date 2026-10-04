import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Search, RefreshCw, Trash2, ArrowUpDown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ScanHistory from '../components/ScanHistory';
import { scanApi } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScans = async () => {
    try {
      setIsLoading(true);
      const res = await scanApi.getScanHistory({ limit: 100 });
      if (res.data) {
        setScans(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load scan history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id) => {
    try {
      await scanApi.deleteScan(id);
      setScans(prev => prev.filter(s => s.id !== id));
      addToast('Scan record deleted from history', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete scan record', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all historical scan records?')) return;
    try {
      await scanApi.clearAllHistory();
      setScans([]);
      addToast('All scan records cleared successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to clear records', 'error');
    }
  };

  const handleRescan = (target) => {
    navigate(`/url-scanner?scan=${encodeURIComponent(target)}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-blue-50 border border-blue-200 text-blue-600">
              <HistoryIcon className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-wide">
              Threat Intelligence Audit Log
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {scans.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 text-xs font-mono border border-red-200 shadow-sm transition-colors cursor-pointer"
              title="Clear all recorded scan history"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={fetchScans}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200 shadow-sm transition-colors cursor-pointer w-fit"
            title="Refresh history registry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-safe' : ''}`} />
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <ScanHistory
        scans={scans}
        onDelete={handleDelete}
        onRescan={handleRescan}
        isLoading={isLoading}
      />
    </div>
  );
}
