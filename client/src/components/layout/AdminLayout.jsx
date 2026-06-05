import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingBag,
  Users,
  Ticket,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

const MENU_GROUPS = [
  {
    title: 'Hệ thống',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
      { path: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
    ]
  },
  {
    title: 'Hàng hóa',
    items: [
      { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
      { path: '/admin/inventory', icon: Package, label: 'Kho hàng' },
      { path: '/admin/categories', icon: ListTree, label: 'Danh mục' },
    ]
  },
  {
    title: 'Quản trị',
    items: [
      { path: '/admin/users', icon: Users, label: 'Người dùng' },
      { path: '/admin/vouchers', icon: Ticket, label: 'Mã giảm giá' },
    ]
  }
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Đơn hàng mới #4912 cần xử lý", time: "5 phút trước", unread: true },
    { id: 2, text: "Sản phẩm 'Áo thun Polo' sắp hết hàng (còn 2)", time: "2 giờ trước", unread: true },
    { id: 3, text: "Yêu cầu hoàn tiền từ người dùng vunguyen", time: "1 ngày trước", unread: false },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Toggle collapse sidebar and save to localStorage
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbMap = {
      admin: 'Tổng quan',
      orders: 'Đơn hàng',
      products: 'Sản phẩm',
      inventory: 'Kho hàng',
      categories: 'Danh mục',
      users: 'Người dùng',
      vouchers: 'Mã giảm giá',
    };

    const items = [
      { label: 'Admin', path: '/admin' }
    ];

    if (paths.length > 1) {
      const subPath = paths[1];
      if (breadcrumbMap[subPath]) {
        items.push({ label: breadcrumbMap[subPath], path: `/admin/${subPath}` });
      } else {
        items.push({ label: subPath, path: location.pathname });
      }
    }

    return items;
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-950 text-slate-300 border-r border-slate-900 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950 border-b border-slate-900">
          <Link to="/" className="flex items-center gap-2 font-bold text-white overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <ShieldCheck size={18} />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent transition-opacity duration-200">
                Admin <span className="text-primary-500">Panel</span>
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {MENU_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isSidebarCollapsed ? (
                <h5 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider transition-opacity duration-200">
                  {group.title}
                </h5>
              ) : (
                <div className="h-px bg-slate-900 my-4" />
              )}

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-primary-600 to-pink-500 text-white font-medium shadow-lg shadow-primary-600/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                      <Icon size={20} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />

                      {!isSidebarCollapsed ? (
                        <span className="ml-3 text-sm transition-opacity duration-200 truncate">{item.label}</span>
                      ) : (
                        /* Premium Tooltip for Collapsed Sidebar */
                        <div className="absolute left-full rounded-lg px-3 py-1.5 ml-3 bg-slate-900 text-white text-xs font-medium invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-800">
                          {item.label}
                        </div>
                      )}

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / User section */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-900">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
                  {userInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                  <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 shadow-sm z-30">

          {/* Header Left: Toggle & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-50 lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={handleToggleSidebar}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-50 hidden lg:block transition-colors"
              title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-1.5 text-sm font-medium">
              {getBreadcrumbs().map((bc, idx, arr) => (
                <React.Fragment key={bc.path}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  {idx === arr.length - 1 ? (
                    <span className="text-slate-800 font-semibold">{bc.label}</span>
                  ) : (
                    <Link to={bc.path} className="text-slate-400 hover:text-slate-600 transition-colors">
                      {bc.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Header Right: Actions, Notifications, Profile */}
          <div className="flex items-center gap-3">



            {/* Notifications Menu */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all ${isNotificationsOpen ? 'bg-slate-50 text-slate-800' : ''}`}
                title="Thông báo"
              >
                <div className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-primary-50/10' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs text-slate-700 ${n.unread ? 'font-semibold' : ''}`}>{n.text}</p>
                          {n.unread && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
                    <span className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">Xem tất cả thông báo</span>
                  </div>
                </div>
              )}
            </div>




          </div>
        </header>

        {/* Main Content Area Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 flex flex-col justify-between">
          <div className="w-full max-w-7xl mx-auto flex-1">
            <Outlet />
          </div>

          {/* Subtle footer */}

        </main>
      </div>
    </div>
  );
}
