import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  FileSpreadsheet,
} from 'lucide-react';
import { useState } from 'react';
import Calculator from './Calculator';

const navigation = [
  {
    section: 'Main',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/sales/new', label: 'New Sale', icon: PlusCircle },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: FolderOpen },
    ],
  },
  {
    section: 'Transactions',
    items: [
      { to: '/sales', label: 'Sales History', icon: ShoppingCart },
      { to: '/reports', label: 'Reports / Export', icon: FileSpreadsheet },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/products') return 'Products';
    if (path === '/categories') return 'Categories';
    if (path === '/sales') return 'Sales History';
    if (path === '/sales/new') return 'New Sale';
    if (path === '/reports') return 'Reports & Export';
    if (path === '/settings') return 'Settings';
    return 'A&D Hardware';
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.svg" alt="A&D Hardware" />
          </div>
          <div className="sidebar-brand">
            <h2>A&D Hardware</h2>
            <span>Inventory System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <h4>{user?.fullName || user?.username}</h4>
              <span>{user?.role}</span>
            </div>
            <button
              className="btn-icon"
              onClick={logout}
              title="Logout"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button
              className="header-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Calculator Bubble */}
      <Calculator />
    </div>
  );
}
