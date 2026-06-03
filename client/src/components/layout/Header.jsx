import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

import oldmanLogo from '../../assets/oldman_logo.png';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#f8f5ef]/95 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <button className="sm:hidden text-[#d4b483] hover:text-white transition">
              <Menu size={24} />
            </button>

            <Link
              to="/"
              className="flex items-center gap-4"
            >

              <img
                src={oldmanLogo}
                alt="OLDMAN"
                className="w-16 h-16 object-contain"
              />

              <div className="hidden sm:block">

                <p className="text-[10px] uppercase tracking-[4px] text-[#8a6c46] mb-1">
                  Classic Style
                </p>

                <h1 className="text-2xl font-semibold tracking-[6px] text-[#1f1a14]">
                  OLDMAN
                </h1>

              </div>

            </Link>

          </div>

          {/* NAV */}
          <nav className="hidden lg:flex items-center gap-10">

            <Link
              to="/"
              className="text-[#d8c09b] hover:text-[#1f1a14] transition tracking-[2px] text-sm uppercase"
            >
              Trang chủ
            </Link>

            <Link
              to="/products"
              className="text-[#d8c09b] hover:text-[#1f1a14] transition tracking-[2px] text-sm uppercase"
            >
              Sản phẩm
            </Link>

            <Link
              to="/products?category=ao-thun"
              className="text-[#d8c09b] hover:text-[#1f1a14] transition tracking-[2px] text-sm uppercase"
            >
              Áo thun
            </Link>

            <Link
              to="/products?category=ao-khoac"
              className="text-[#d8c09b] hover:text-[#1f1a14] transition tracking-[2px] text-sm uppercase"
            >
              Áo khoác
            </Link>

          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-5">

            {/* SEARCH */}
            <div className="hidden md:block relative">

              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="
                  w-60
                  pl-11
                  pr-4
                  py-2.5
                  rounded-full
                  bg-[#0f0f0f]
                  border
                  border-[#e5d8c5]
                  text-[#1f1a14]
                  placeholder:text-[#a08d78]
                  focus:outline-none
                  focus:border-[#b8935f]
                  transition
                "
              />

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a08d78]"
                size={17}
              />

            </div>

            {/* WISHLIST */}
            <Link
              to="/wishlist"
              className="relative text-[#7b6753] hover:text-[#1f1a14] transition"
            >
              <Heart size={22} />
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              className="relative text-[#7b6753] hover:text-[#1f1a14] transition"
            >

              <ShoppingCart size={22} />

              {summary.itemCount > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2
                    min-w-[20px]
                    h-5
                    px-1
                    rounded-full
                    bg-[#b8935f]
                    text-black
                    text-[11px]
                    font-bold
                    flex
                    items-center
                    justify-center
                  "
                >
                  {summary.itemCount}
                </span>
              )}

            </Link>

            {/* USER */}
            {isAuthenticated ? (

              <div className="relative group h-20 flex items-center">

                <button className="flex items-center gap-2 text-[#7b6753] hover:text-[#1f1a14] transition">
                  <User size={22} />

                  <span className="hidden md:block text-sm tracking-[1px]">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown */}
                <div
                  className="
                    absolute
                    right-0
                    top-20
                    w-64
                    rounded-2xl
                    border
                    border-[#e5d8c5]
                    bg-white
                    shadow-[0_10px_40px_rgba(0,0,0,0.5)]
                    overflow-hidden
                    opacity-0
                    invisible
                    group-hover:opacity-100
                    group-hover:visible
                    transition-all
                    duration-200
                  "
                >

                  <div className="px-5 py-4 border-b border-[#1f1f1f]">

                    <p className="text-[#7f6b4c] text-xs uppercase tracking-[3px] mb-1">
                      Xin chào
                    </p>

                    <p className="text-[#1f1a14] font-medium truncate">
                      {user?.name}
                    </p>

                  </div>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-5 py-3 text-[#5e4a36] hover:bg-[#161616] transition"
                    >
                      Quản trị Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="block px-5 py-3 text-[#5e4a36] hover:bg-[#161616] transition"
                  >
                    Tài khoản của tôi
                  </Link>

                  <Link
                    to="/profile/orders"
                    className="block px-5 py-3 text-[#5e4a36] hover:bg-[#161616] transition"
                  >
                    Đơn mua
                  </Link>

                  <button
                    onClick={logout}
                    className="
                      w-full
                      text-left
                      px-5
                      py-3
                      text-[#d27b7b]
                      hover:bg-[#161616]
                      transition
                    "
                  >
                    Đăng xuất
                  </button>

                </div>

              </div>

            ) : (

              <Link
                to="/login"
                className="
                  px-5
                  py-2.5
                  rounded-full
                  border
                  border-[#b8935f]
                  text-[#1f1a14]
                  hover:bg-[#b8935f]
                  hover:text-black
                  transition-all
                  duration-300
                  tracking-[1px]
                  text-sm
                "
              >
                Đăng nhập
              </Link>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}