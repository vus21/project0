import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center">
            <button className="sm:hidden p-2 text-gray-600">
              <Menu size={24} />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center ml-2 sm:ml-0">
              <span className="text-2xl font-bold text-primary-600">FashionStore</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex space-x-8">
            <Link to="/" className="text-gray-900 hover:text-primary-600 font-medium">Trang chủ</Link>
            <Link to="/products" className="text-gray-500 hover:text-primary-600 font-medium">Sản phẩm</Link>
            <Link to="/products?category=ao-thun" className="text-gray-500 hover:text-primary-600 font-medium">Áo thun</Link>
            <Link to="/products?category=ao-khoac" className="text-gray-500 hover:text-primary-600 font-medium">Áo khoác</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block relative">
              <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50" />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <Link to="/profile/wishlist" className="text-gray-600 hover:text-primary-600 relative">
              <Heart size={24} />
            </Link>

            <Link to="/cart" className="text-gray-600 hover:text-primary-600 relative">
              <ShoppingCart size={24} />
              {summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {summary.itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group cursor-pointer h-16 flex items-center">
                <div className="flex items-center space-x-1 text-gray-600 hover:text-primary-600">
                  <User size={24} />
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-16 w-48 bg-white rounded-md shadow-xl hidden group-hover:block border">
                  <div className="px-4 py-2 border-b text-sm font-medium text-gray-900 truncate bg-gray-50 rounded-t-md">
                    Hi, {user?.name}
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Quản trị Admin</Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tài khoản của tôi</Link>
                  <Link to="/profile/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Đơn mua</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
