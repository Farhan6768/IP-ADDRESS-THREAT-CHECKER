import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Menu, 
  X, 
  LayoutDashboard,
  Globe, 
  History, 
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'URL Scanner', path: '/url-scanner', icon: Globe },
    { name: 'Threat Reports', path: '/history', icon: History }
  ];

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    let target = quickInput.trim();
    target = target.replace(/^[a-zA-Z]?https?:\/\//i, (match) => {
      return match.toLowerCase().includes('https') ? 'https://' : 'http://';
    });
    if (target) {
      navigate(`/url-scanner?scan=${encodeURIComponent(target)}`);
      setQuickInput('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-17">
          {/* Brand Logo & Platform Title */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-rose-100/80 border border-red-200/80 group-hover:border-red-500 group-hover:shadow-xs transition-all">
                <Shield className="w-5 h-5 text-red-600 transition-transform group-hover:scale-105" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors uppercase whitespace-nowrap">
                  IP ADDRESS THREAT CHECKER
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                  SOC v1.0
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-slate-500'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header: Quick Scanner Input & System Status */}
          <div className="flex items-center gap-3.5">
            {/* Quick search input */}
            <form onSubmit={handleQuickSubmit} className="hidden xl:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Quick scan (URL or IP)..."
                className="pl-9 pr-14 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 w-64 focus:w-80 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
              />
              <span className="absolute right-2 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-200/60 rounded border border-slate-300 pointer-events-none">
                ↵ Enter
              </span>
            </form>

            {/* Live SOC Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-sans border bg-emerald-50/80 border-emerald-200/80 text-emerald-800 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-semibold tracking-wide">SOC LIVE</span>
              <span className="text-emerald-300">|</span>
              <span className="text-emerald-700 font-medium text-[10px]">SSRF PROTECTED</span>
            </div>

            {/* Primary Action Button: Launch Scanner */}
            <Link
              to="/url-scanner"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          {/* Mobile Quick Search */}
          <form onSubmit={handleQuickSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick scan (URL or IP)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-primary"
            />
          </form>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Status Strip */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold text-[11px]">SOC Telemetry Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SSRF Defense Enabled</span>
          </div>
        </div>
      )}
    </header>
  );
}
