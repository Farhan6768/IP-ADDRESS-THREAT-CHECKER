import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ThreatScope ErrorBoundary caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-darker flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="cyber-card p-8 border border-red-primary/50 max-w-lg w-full text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-primary/10 border border-red-primary/40 mb-4">
              <AlertOctagon className="w-8 h-8 text-red-primary" />
            </div>

            <h2 className="text-xl font-bold font-mono text-white tracking-wide">
              Interface Telemetry Error
            </h2>

            <div className="bg-navy-darker rounded-lg p-3 my-4 border border-navy-borderSubtle text-left">
              <p className="text-xs font-mono text-slate-300 break-words">
                {this.state.error?.message || 'A UI component rendering error occurred.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-navy-darker hover:bg-navy-light text-slate-200 border border-navy-borderSubtle transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-red-primary hover:bg-red-hover text-white shadow-md shadow-red-primary/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Interface</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
