/**
 * ThreatScope formatting and color palette helpers
 * Strictly adheres to:
 * Dark Navy: #132440
 * Blue: #16476A
 * Primary Red: #BF092F
 * Teal: #3B9797
 */

export function getThreatColor(score) {
  if (score === null || score === undefined) return '#94A3B8';
  if (score < 25) return '#3B9797'; // Safe (Teal)
  if (score < 50) return '#16476A'; // Warning (Blue)
  return '#BF092F'; // High / Critical (Primary Red)
}

export function getRiskLevelClass(riskLevel) {
  const level = (riskLevel || '').toUpperCase();
  switch (level) {
    case 'SAFE':
    case 'CLEAN':
    case 'VALID':
    case 'NOT DETECTED':
      return {
        bg: 'bg-teal-safe/15',
        text: 'text-teal-safe',
        border: 'border-teal-safe/30',
        badge: 'cyber-badge-safe'
      };
    case 'LOW RISK':
    case 'WARNING':
    case 'MEDIUM RISK':
      return {
        bg: 'bg-blue-panel/30',
        text: 'text-sky-300',
        border: 'border-blue-panel/60',
        badge: 'cyber-badge-warning'
      };
    case 'HIGH RISK':
    case 'CRITICAL':
    case 'BLACKLISTED':
    case 'EXPIRED':
    case 'THREAT DETECTED':
      return {
        bg: 'bg-red-primary/15',
        text: 'text-red-400',
        border: 'border-red-primary/40',
        badge: 'cyber-badge-threat'
      };
    default:
      return {
        bg: 'bg-slate-800/40',
        text: 'text-slate-300',
        border: 'border-slate-700/50',
        badge: 'cyber-badge-neutral'
      };
  }
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Unavailable') return 'Unavailable';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function truncate(str, max = 32) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}
