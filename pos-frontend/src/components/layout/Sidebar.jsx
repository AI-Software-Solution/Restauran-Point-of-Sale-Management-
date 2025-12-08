import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineShoppingCart,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { MdOutlineTableBar, MdOutdoorGrill, MdLayers } from 'react-icons/md';

const navItems = [
  {
    section: 'POS',
    items: [
      { id: 'floor', label: 'Floor Plan', icon: MdLayers, path: '/floor-plan' },
      { id: 'tables', label: 'Stollar', icon: MdOutlineTableBar, path: '/tables' },
      { id: 'orders', label: 'Buyurtmalar', icon: HiOutlineClipboardList, path: '/orders' },
      { id: 'pos', label: 'Kassa', icon: HiOutlineShoppingCart, path: '/menu' },
      { id: 'kitchen', label: 'Oshxona', icon: MdOutdoorGrill, path: '/kitchen' },
    ],
  },
  {
    section: 'Boshqaruv',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: HiOutlineHome, path: '/home' },
      { id: 'analytics', label: 'Analitika', icon: HiOutlineChartBar, path: '/analytics', adminOnly: true },
      { id: 'inventory', label: 'Ombor', icon: HiOutlineCube, path: '/inventory' },
      { id: 'admin', label: 'Admin Panel', icon: HiOutlineViewGrid, path: '/admin_panel', adminOnly: true },
    ],
  },
  {
    section: 'Tizim',
    items: [
      { id: 'settings', label: 'Sozlamalar', icon: HiOutlineCog, path: '/settings' },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const userData = useSelector((state) => state.user);
  const isAdmin = userData.role?.toLowerCase() === 'admin';

  const isActive = (path) => location.pathname === path;

  const filteredNavItems = navItems.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40
          bg-surface border-r border-border
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className={`
          h-14 flex items-center border-b border-border px-4
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-text-primary">POS</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`
              p-1.5 rounded-lg text-text-secondary hover:text-text-primary
              hover:bg-surface-secondary transition-colors
              ${collapsed ? 'hidden' : 'block'}
            `}
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {filteredNavItems.map((section, sectionIdx) => (
            <div key={section.section} className={sectionIdx > 0 ? 'mt-6' : ''}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${isActive(item.path)
                          ? 'bg-primary-500/10 text-primary-500 font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-primary-500' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="p-3 border-t border-border">
            <button
              onClick={onToggle}
              className="w-full p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <HiOutlineChevronRight className="w-5 h-5 mx-auto" />
            </button>
          </div>
        )}

        {/* User info */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-sm">
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {userData.name || 'User'}
                </p>
                <p className="text-xs text-text-secondary capitalize">
                  {userData.role || 'Staff'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {[
            { icon: MdLayers, path: '/floor-plan', label: 'Floor' },
            { icon: MdOutlineTableBar, path: '/tables', label: 'Stollar' },
            { icon: HiOutlineShoppingCart, path: '/menu', label: 'Kassa' },
            { icon: HiOutlineClipboardList, path: '/orders', label: 'Buyurtma' },
            { icon: HiOutlineCog, path: '/settings', label: 'Sozlama' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-colors
                ${isActive(item.path)
                  ? 'text-primary-500'
                  : 'text-text-secondary'
                }
              `}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
