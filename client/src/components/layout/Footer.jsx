import React from 'react';
import { Link } from 'react-router-dom';

import oldmanLogo from '../../assets/oldman_logo.png';

export default function Footer() {

  return (
    <footer className="relative bg-[#f5efe6] border-t border-[#e5d8c5] overflow-hidden">

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(184,147,95,0.10),transparent_55%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>

            <div className="flex items-center gap-4 mb-6">

              <img
                src={oldmanLogo}
                alt="OLDMAN"
                className="w-14 h-14 object-contain"
              />

              <div>

                <p className="text-[10px] uppercase tracking-[4px] text-[#8a6c46] mb-1">
                  Classic Style
                </p>

                <h2 className="text-3xl font-semibold tracking-[6px] text-[#1f1a14]">
                  OLDMAN
                </h2>

              </div>

            </div>

            <p className="text-[#7a6040] leading-8">
              Thương hiệu thời trang nam mang phong cách
              cổ điển hiện đại dành cho quý ông lịch lãm.
            </p>

          </div>

          {/* LINKS */}
          <div>

            <h3 className="text-[#1f1a14] text-lg tracking-[3px] uppercase mb-6">
              Liên Kết
            </h3>

            <ul className="space-y-4">

              <li>
                <Link
                  to="/"
                  className="text-[#7a6040] hover:text-[#b8935f] transition"
                >
                  Trang chủ
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className="text-[#7a6040] hover:text-[#b8935f] transition"
                >
                  Sản phẩm
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-[#7a6040] hover:text-[#b8935f] transition"
                >
                  Về chúng tôi
                </Link>
              </li>

            </ul>

          </div>

          {/* SUPPORT */}
          <div>

            <h3 className="text-[#1f1a14] text-lg tracking-[3px] uppercase mb-6">
              Hỗ Trợ
            </h3>

            <ul className="space-y-4">

              <li className="text-[#7a6040]">
                Chính sách bảo mật
              </li>

              <li className="text-[#7a6040]">
                Điều khoản sử dụng
              </li>

              <li className="text-[#7a6040]">
                Chính sách đổi trả
              </li>

            </ul>

          </div>

          {/* CONTACT */}
          <div>

            <h3 className="text-[#1f1a14] text-lg tracking-[3px] uppercase mb-6">
              Liên Hệ
            </h3>

            <ul className="space-y-4 text-[#7a6040] leading-7">

              <li>
                Hotline: 1900 1986
              </li>

              <li>
                Email: support@oldman.com
              </li>

              <li>
                136 P. Triều Khúc, Triều Khúc, Thanh Liệt, Hà Nội
              </li>

            </ul>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-16 pt-8 border-t border-[#e5d8c5] flex flex-col md:flex-row items-center justify-between gap-5">

          <p className="text-[#9a8467] text-sm tracking-[2px] uppercase">
            © {new Date().getFullYear()} OLDMAN • Classic Style • Timeless Man
          </p>

          <div className="flex items-center gap-6 text-sm">

            <span className="text-[#8a6c46]">
              Designed for Gentlemen
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}