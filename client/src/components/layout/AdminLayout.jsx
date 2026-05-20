import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, ListTree, ShoppingBag, Users, Ticket, LogOut, Menu } from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
  { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { path: '/admin/inventory', icon: Package, label: 'Kho hàng' },
  { path: '/admin/categories', icon: ListTree, label: 'Danh mục' },
  { path: '/admin/users', icon: Users, label: 'Người dùng' },
  { path: '/admin/vouchers', icon: Ticket, label: 'Mã giảm giá' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-gray-950">
          <Link to="/">
            <span className="text-xl font-bold text-primary-500 hover:text-primary-400">Admin Panel</span>
          </Link>
        </div>
        <div className="p-4">
          <div className="mb-8 text-center text-gray-400 text-sm border-b border-gray-800 pb-4">
            Xin chào, <span className="text-white font-medium block mt-1">{user?.name}</span>
          </div>
          <nav className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3 text-red-500" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 h-16 bg-white shadow-sm lg:hidden border-b">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 rounded-md hover:bg-gray-100">
              <Menu size={24} />
            </button>
            <span className="ml-2 font-bold text-lg text-gray-800">Bảng điều khiển</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
