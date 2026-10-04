import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import URLScanner from './pages/URLScanner';
import ThreatReport from './pages/ThreatReport';
import HistoryPage from './pages/History';
import IPLookup from './pages/IPLookup';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="url-scanner" element={<URLScanner />} />
              <Route path="ip-lookup" element={<IPLookup />} />
              <Route path="report/:id" element={<ThreatReport />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}
