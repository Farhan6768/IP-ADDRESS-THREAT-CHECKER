import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-red-primary selection:text-white">
      {/* Toast Notification Container */}
      <Toast />

      {/* Top Professional Header / Navbar */}
      <div className="no-print">
        <Navbar />
      </div>

      {/* Full-Width Main Screen Layout */}
      <main className="flex-1 w-full print:!pl-0 flex flex-col">
        <div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
