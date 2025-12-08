import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMenuAlt2,
} from 'react-icons/hi';
import { removeUser } from '../../redux/slices/userSlice';
import { removeAllItems } from '../../redux/slices/cartSlice';
import { removeCustomer } from '../../redux/slices/customerSlice';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    dispatch(removeUser());
    dispatch(removeAllItems());
    dispatch(removeCustomer());
    navigate('/auth');
  };

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-14
        bg-surface border-b border-border
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-60'}
        left-0
      `}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <HiOutlineMenuAlt2 className="w-6 h-6" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-text-primary">
              Restaurant POS
            </h1>
          </div>
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Qidirish... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-secondary border-0 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <HiOutlineSearch className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            title={theme === 'dark' ? 'Yorug tema' : 'Qorong`i tema'}
          >
            {theme === 'dark' ? (
              <HiOutlineSun className="w-5 h-5" />
            ) : (
              <HiOutlineMoon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors relative"
            >
              <HiOutlineBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-lg border border-border z-20 animate-fade-in">
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Bildirishnomalar</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 text-center text-text-secondary text-sm">
                      Yangi bildirishnomalar yo'q
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-sm">
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text-primary">
                  {userData.name || 'User'}
                </p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20 animate-fade-in">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium text-text-primary">{userData.name}</p>
                    <p className="text-sm text-text-secondary">{userData.email}</p>
                    <p className="text-xs text-text-muted capitalize mt-1">
                      {userData.role}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                    >
                      <HiOutlineCog className="w-5 h-5" />
                      Sozlamalar
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <HiOutlineLogout className="w-5 h-5" />
                      Chiqish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden absolute top-full left-0 right-0 p-3 bg-surface border-b border-border animate-slide-down">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Qidirish..."
              autoFocus
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-secondary border-0 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
