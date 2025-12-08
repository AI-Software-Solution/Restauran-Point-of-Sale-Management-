import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AppShell = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Header */}
      <Header
        onMenuClick={toggleMobileMenu}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`
          min-h-screen pt-14 pb-20 lg:pb-0
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}
        `}
      >
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleMobileMenu}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-surface z-50 animate-slide-in-left">
            <Sidebar collapsed={false} onToggle={toggleMobileMenu} />
          </div>
        </>
      )}
    </div>
  );
};

export default AppShell;
