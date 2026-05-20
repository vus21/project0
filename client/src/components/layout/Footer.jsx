import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">FashionStore</h3>
            <p className="text-sm">Nền tảng thương mại điện tử chuyên cung cấp các sản phẩm thời trang chất lượng cao, bắt kịp xu hướng.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-500">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-primary-500">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary-500">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-500">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-primary-500">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-primary-500">Chính sách đổi trả</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li>Hotline: 1900 1000</li>
              <li>Email: support@fashionstore.com</li>
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} FashionStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
