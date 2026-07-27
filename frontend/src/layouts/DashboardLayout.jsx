import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#475569] flex flex-col md:flex-row selection:bg-[#DC2626] selection:text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Dynamic Route Content Shell */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Dark Navy Footer (as specified in theme prompt) */}
        <Footer />
      </div>
    </div>
  );
};

export const ProtectedLayout = DashboardLayout;

export default DashboardLayout;
