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
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 border border-red-200 group-hover:border-red-primary group-hover:bg-red-100/50 transition-all shadow-xs">
                <Shield className="w-5 h-5 text-red-primary transition-transform group-hover:scale-105" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-safe ring-2 ring-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold font-mono tracking-wider text-slate-900 group-hover:text-red-primary transition-colors">
                    IP ADDRESS THREAT CHECKER
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                    SOC v1.0
                  </span>
                </div>
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
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
                className="pl-9 pr-14 py-2 text-xs font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 w-64 focus:w-80 focus:bg-white focus:outline-none focus:border-red-primary focus:ring-1 focus:ring-red-primary transition-all shadow-xs"
              />
              <span className="absolute right-2 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-200/60 rounded border border-slate-300 pointer-events-none">
                ↵ Enter
              </span>
            </form>

            {/* Live SOC Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border bg-emerald-50 border-emerald-200/80 text-emerald-800 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-semibold tracking-wide">SOC LIVE</span>
              <span className="text-emerald-300">|</span>
              <span className="text-emerald-600 font-medium text-[10px]">SSRF PROTECTED</span>
            </div>

            {/* Primary Action Button: Launch Scanner */}
            <Link
              to="/url-scanner"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-primary hover:bg-red-hover text-white text-xs font-mono font-bold shadow-sm shadow-red-primary/20 transition-all cursor-pointer"
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
