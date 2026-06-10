import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  ClipboardDocumentListIcon, 
  Squares2X2Icon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: HomeIcon,
      end: true
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: ClipboardDocumentListIcon 
    },
    { 
      name: 'Menu Manager', 
      path: '/admin/menu', 
      icon: Squares2X2Icon 
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: Cog6ToothIcon 
    }
  ];

  return (
    <aside className="h-screen sticky top-0 bg-surface-lowest border-r border-outline-variant/30 flex flex-col justify-between py-lg px-sm md:px-md w-16 md:w-[280px] shrink-0 transition-all duration-200">
      <div className="flex flex-col gap-xl">
        {/* Brand/Header */}
        <NavLink to="/admin" end className="flex flex-col items-center md:items-start px-xs group">
          <span className="hidden md:block text-title-md font-extrabold text-primary-container tracking-tight group-hover:opacity-80 transition-opacity">
            SIZZLE & SNAP
          </span>
          <span className="block md:hidden text-title-md font-extrabold text-primary-container group-hover:opacity-80 transition-opacity">
            S&S
          </span>
          <span className="text-[10px] bg-primary-fixed text-on-primary-fixed font-bold uppercase tracking-wider px-sm py-0.5 rounded mt-xs">
            Admin
          </span>
        </NavLink>

        {/* Navigation links */}
        <nav className="flex flex-col gap-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) => 
                  `flex items-center gap-md p-md rounded-xl font-bold transition-all text-body-md justify-center md:justify-start ${
                    isActive 
                      ? 'bg-primary-container text-on-primary shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  }`
                }
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="hidden md:inline">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-md p-md rounded-xl font-bold transition-all text-body-md justify-center md:justify-start text-on-surface-variant hover:text-error hover:bg-error-container/20"
          title="Logout"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
